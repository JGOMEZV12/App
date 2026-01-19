import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import i18n from '../i18n';
import { Plus, UserPlus, FileUp } from 'lucide-react-native';

const SuperAdminDashboard = ({ navigation }) => {
  const [branches, setBranches] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    const querySnapshot = await getDocs(collection(db, 'branches'));
    const branchList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setBranches(branchList);
  };

  const handleAddBranch = async () => {
    if (!newBranchName) return;
    try {
      await addDoc(collection(db, 'branches'), { name: newBranchName, createdAt: new Date() });
      setNewBranchName('');
      setModalVisible(false);
      fetchBranches();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.adminActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('CreateUser')}>
          <UserPlus color="#fff" size={20} />
          <Text style={styles.actionText}>Create User</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ImportExcel')}>
          <FileUp color="#fff" size={20} />
          <Text style={styles.actionText}>Import Excel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('branch')}s</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Plus color="#137fec" size={24} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={branches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.branchName}>{item.name}</Text>
          </View>
        )}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Branch</Text>
            <TextInput
              style={styles.input}
              placeholder="Branch Name"
              value={newBranchName}
              onChangeText={setNewBranchName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.buttonText}>{i18n.t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddBranch} style={styles.saveButton}>
                <Text style={styles.buttonText}>{i18n.t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922', padding: 20 },
  adminActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30, gap: 10 },
  actionButton: { flex: 1, backgroundColor: '#137fec', padding: 15, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
  actionText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  card: { backgroundColor: '#192633', padding: 15, borderRadius: 10, marginBottom: 10 },
  branchName: { color: '#fff', fontSize: 18 },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.7)', padding: 20 },
  modalContent: { backgroundColor: '#192633', padding: 20, borderRadius: 15 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  input: { backgroundColor: '#101922', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelButton: { backgroundColor: '#333', padding: 12, borderRadius: 8, flex: 0.48, alignItems: 'center' },
  saveButton: { backgroundColor: '#137fec', padding: 12, borderRadius: 8, flex: 0.48, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default SuperAdminDashboard;
