import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { Send } from 'lucide-react-native';

const ChatDetailScreen = ({ route }) => {
  const { chatId, title, type } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user, userData } = useAuth();
  const flatListRef = useRef();

  useEffect(() => {
    const collectionPath = type === 'group' ? `groups/${chatId}/messages` : `chats/${chatId}/messages`;
    const q = query(
      collection(db, collectionPath),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [chatId, type]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const text = newMessage;
    setNewMessage('');

    try {
      const collectionPath = type === 'group' ? `groups/${chatId}/messages` : `chats/${chatId}/messages`;
      await addDoc(collection(db, collectionPath), {
        text,
        senderId: user.uid,
        senderName: userData?.name || 'Unknown',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        onContentSizeChange={() => flatListRef.current.scrollToEnd()}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.senderId === user.uid ? styles.myMessage : styles.otherMessage
          ]}>
            {type === 'group' && item.senderId !== user.uid && (
              <Text style={styles.senderName}>{item.senderName}</Text>
            )}
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 15 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Send color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 15, marginBottom: 10 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#137fec', borderBottomRightRadius: 2 },
  otherMessage: { alignSelf: 'flex-start', backgroundColor: '#192633', borderBottomLeftRadius: 2 },
  senderName: { color: '#137fec', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  messageText: { color: '#fff', fontSize: 15 },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#192633', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#101922', color: '#fff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 25, marginRight: 10 },
  sendButton: { backgroundColor: '#137fec', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
});

export default ChatDetailScreen;
