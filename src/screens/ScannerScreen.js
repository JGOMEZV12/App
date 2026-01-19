import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import i18n from '../i18n';
import { X, Check } from 'lucide-react-native';
import { scheduleExpiryNotification } from '../utils/notifications';

const ScannerScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [expiryDate, setExpiryDate] = useState('');
  const { userData } = useAuth();

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff', textAlign: 'center' }}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    const productRef = doc(db, 'products', data);
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      setProduct({ barcode: data, ...productSnap.data() });
    } else {
      setProduct({ barcode: data, name: 'Unknown Product' });
      Alert.alert('Unknown Barcode', 'This barcode is not in the database.');
    }
  };

  const handleSave = async () => {
    if (!expiryDate || !quantity) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const expiry = new Date(expiryDate);
      await addDoc(collection(db, 'inventory'), {
        barcode: product.barcode,
        productName: product.name,
        quantity: parseInt(quantity),
        expiryDate: expiry, // Simple date string parsing
        branchId: userData.branchId,
        addedBy: userData.name,
        addedAt: new Date(),
      });

      // Schedule notifications
      await scheduleExpiryNotification(product.name, expiry);

      Alert.alert('Success', 'Product added to inventory');
      setScanned(false);
      setProduct(null);
      setExpiryDate('');
      setQuantity('1');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {!scanned ? (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'upc_a', 'upc_e'],
          }}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.formContainer}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.productName}>{product?.name}</Text>
              <TouchableOpacity onPress={() => setScanned(false)}>
                <X color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.barcodeText}>SKU: {product?.barcode}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{i18n.t('quantity')}</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={quantity}
                onChangeText={setQuantity}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{i18n.t('expiry_date')} (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2025-12-31"
                placeholderTextColor="#666"
                value={expiryDate}
                onChangeText={setExpiryDate}
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Check color="#fff" style={{ marginRight: 10 }} />
              <Text style={styles.buttonText}>{i18n.t('save')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922' },
  formContainer: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#192633', borderRadius: 15, padding: 20, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  productName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  barcodeText: { color: '#888', marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  label: { color: '#ccc', marginBottom: 5 },
  input: { backgroundColor: '#101922', color: '#fff', padding: 12, borderRadius: 8 },
  saveButton: { backgroundColor: '#137fec', padding: 15, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  button: { backgroundColor: '#137fec', padding: 15, borderRadius: 8, marginTop: 20 },
});

export default ScannerScreen;
