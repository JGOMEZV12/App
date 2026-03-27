import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebase';
import { FileUp } from 'lucide-react-native';
import i18n from '../i18n';

const ExcelImportScreen = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      });

      if (!result.canceled) {
        processExcel(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const processExcel = async (uri) => {
    setLoading(true);
    setProgress(0);
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const workbook = XLSX.read(base64, { type: 'base64' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON using Column Letters as keys
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });
      setTotal(data.length);

      let batch = writeBatch(db);
      let count = 0;
      let pendingOps = 0;

      for (let i = 0; i < data.length; i++) {
        const row = data[i];

        // Skip header row if it contains "Código" or "Barcode"
        const cellA = String(row.A || '').toLowerCase();
        if (cellA.includes('código') || cellA.includes('barcode')) continue;

        // Ensure at least Column A (Barcode) is present
        if (row.A) {
          const barcode = String(row.A).trim();
          if (!barcode) continue;

          let internalRef = '';
          let name = '';

          // Logic to handle 2 or 3 columns:
          // If C is present: A=Barcode, B=InternalRef, C=Name
          // If only B is present: A=Barcode, B=Name
          if (row.C) {
            internalRef = String(row.B || '').trim();
            name = String(row.C).trim();
          } else if (row.B) {
            name = String(row.B).trim();
          }

          if (name) {
            const productRef = doc(db, 'products', barcode);
            batch.set(productRef, {
              barcode: barcode,
              internalRef: internalRef,
              name: name,
              updatedAt: new Date()
            });
            count++;
            pendingOps++;

            // Update progress based on actual count
            if (count % 50 === 0) setProgress(count);

            // Firestore batch limit is 500. Using smaller batches for better feedback.
            if (pendingOps >= 100) {
              await batch.commit();
              batch = writeBatch(db);
              pendingOps = 0;
              // Yield the JS thread briefly to allow UI to update
              await new Promise(resolve => setTimeout(resolve, 0));
            }
          }
        }
      }

      if (pendingOps > 0) {
        await batch.commit();
      }
      setProgress(data.length);
      Alert.alert('Success', `Imported ${count} products successfully.`);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to process Excel file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t('import_excel')}</Text>
      <Text style={styles.description}>
        Upload an Excel file:{"\n"}
        Format 1: Col A: Barcode | Col B: Internal Ref | Col C: Name{"\n"}
        Format 2: Col A: Barcode | Col B: Name{"\n"}
        (Headers are automatically skipped)
      </Text>

      <TouchableOpacity style={styles.uploadCard} onPress={pickDocument} disabled={loading}>
        {loading ? (
          <View style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#137fec" />
            <Text style={styles.progressText}>
              Processing: {progress} / {total}
            </Text>
          </View>
        ) : (
          <>
            <FileUp size={48} color="#137fec" />
            <Text style={styles.uploadText}>Select Excel File</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922', padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 10 },
  description: { color: '#ccc', textAlign: 'center', marginBottom: 30 },
  uploadCard: {
    backgroundColor: '#192633',
    borderWidth: 2,
    borderColor: '#137fec',
    borderStyle: 'dashed',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: { color: '#137fec', marginTop: 15, fontWeight: 'bold', fontSize: 16 },
  progressText: { color: '#fff', marginTop: 15, fontSize: 14, fontWeight: 'bold' },
});

export default ExcelImportScreen;
