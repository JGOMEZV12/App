import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../config/firebase';
import i18n from '../i18n';
import { Picker } from '@react-native-picker/picker';

const CreateUserScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    const querySnapshot = await getDocs(collection(db, 'branches'));
    const branchList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBranches(branchList);
    if (branchList.length > 0) setSelectedBranch(branchList[0].id);
  };

  const handleCreateUser = async () => {
    if (!email || !password || !name || !selectedBranch) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    Alert.alert(
      'Notice',
      'Due to Firebase client security, creating a user will log you out and log the new user in. In a production environment, this would be handled via a Cloud Function.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Proceed', onPress: async () => {
          try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role,
        branchId: selectedBranch,
        createdAt: new Date(),
      });

            Alert.alert('Success', 'User created successfully. You are now logged in as the new user.');
            setEmail('');
            setPassword('');
            setName('');
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        }}
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create New User</Text>
      <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <Text style={styles.label}>Role</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={role} onValueChange={(itemValue) => setRole(itemValue)} style={styles.picker}>
          <Picker.Item label="User" value="user" />
          <Picker.Item label="Admin" value="admin" />
        </Picker>
      </View>

      <Text style={styles.label}>Branch</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={selectedBranch} onValueChange={(itemValue) => setSelectedBranch(itemValue)} style={styles.picker}>
          {branches.map(branch => (
            <Picker.Item key={branch.id} label={branch.name} value={branch.id} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCreateUser}>
        <Text style={styles.buttonText}>Create User</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  input: { backgroundColor: '#192633', color: '#fff', padding: 15, borderRadius: 8, marginBottom: 15 },
  label: { color: '#ccc', marginBottom: 5, marginLeft: 5 },
  pickerContainer: { backgroundColor: '#192633', borderRadius: 8, marginBottom: 15 },
  picker: { color: '#fff' },
  button: { backgroundColor: '#137fec', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default CreateUserScreen;
