import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import i18n from '../i18n';
import { LogOut, User, MapPin, Shield } from 'lucide-react-native';

const SettingsScreen = () => {
  const { userData } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      i18n.t('logout'),
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, salir', onPress: () => signOut(auth) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userData?.name?.[0] || 'U'}</Text>
        </View>
        <Text style={styles.userName}>{userData?.name || 'Usuario'}</Text>
        <Text style={styles.userEmail}>{userData?.email}</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Shield size={20} color="#137fec" />
          <Text style={styles.infoText}>Rol: {userData?.role === 'admin' ? 'Administrador' : 'Usuario'}</Text>
        </View>
        <View style={styles.infoRow}>
          <MapPin size={20} color="#137fec" />
          <Text style={styles.infoText}>Sucursal: {userData?.branchId || 'No asignada'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color="#fa6238" />
        <Text style={styles.logoutText}>{i18n.t('logout')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922', padding: 20 },
  profileCard: { alignItems: 'center', marginBottom: 30, backgroundColor: '#192633', padding: 20, borderRadius: 15 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#137fec', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  userName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  userEmail: { color: '#888', fontSize: 14, marginTop: 5 },
  infoSection: { backgroundColor: '#192633', borderRadius: 15, padding: 15, marginBottom: 30 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  infoText: { color: '#fff', marginLeft: 15, fontSize: 16 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fa623820', padding: 15, borderRadius: 12, borderLineWidth: 1, borderColor: '#fa6238' },
  logoutText: { color: '#fa6238', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
});

export default SettingsScreen;
