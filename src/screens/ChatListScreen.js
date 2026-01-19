import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { collection, query, where, getDocs, onSnapshot, addDoc, orderBy, or } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Users } from 'lucide-react-native';

const ChatListScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const { user, userData } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'), where('__name__', '!=', user.uid));
      const querySnapshot = await getDocs(q);
      setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const fetchGroups = () => {
      const q = query(collection(db, 'groups'));
      return onSnapshot(q, (snapshot) => {
        setGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    };

    fetchUsers();
    const unsubscribeGroups = fetchGroups();
    return () => unsubscribeGroups();
  }, [user.uid]);

  const startChat = (otherUser) => {
    navigation.navigate('ChatDetail', {
      chatId: [user.uid, otherUser.id].sort().join('_'),
      title: otherUser.name,
      type: 'direct'
    });
  };

  const startGroupChat = (group) => {
    navigation.navigate('ChatDetail', {
      chatId: group.id,
      title: group.name,
      type: 'group'
    });
  };

  const createGroup = async () => {
    const groupName = `Group ${groups.length + 1}`;
    await addDoc(collection(db, 'groups'), {
      name: groupName,
      createdAt: new Date(),
      createdBy: user.uid
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Groups</Text>
        <TouchableOpacity onPress={createGroup}>
          <Users color="#137fec" size={20} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userCard} onPress={() => startGroupChat(item)}>
            <View style={[styles.avatar, { backgroundColor: '#fa6238' }]}>
              <Users color="#fff" size={20} />
            </View>
            <View>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.branchName}>Group Chat</Text>
            </View>
          </TouchableOpacity>
        )}
        style={{ marginBottom: 20 }}
      />

      <Text style={styles.sectionTitle}>Direct Messages</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userCard} onPress={() => startChat(item)}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name[0]}</Text>
            </View>
            <View>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.branchName}>{item.branchId}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922', padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: '#888', fontSize: 14, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase' },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#192633', padding: 12, borderRadius: 12, marginBottom: 10 },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#137fec', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  userName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  branchName: { color: '#888', fontSize: 12 },
});

export default ChatListScreen;
