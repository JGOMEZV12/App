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
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      const workbook = XLSX.read(base64, { type: 'base64' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON using Column Letters as keys
      // The image shows headers in Row 1, and data starts in Row 2.
      // However, to be safe, we read the whole sheet and skip only if it's the header.
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 'A' });

      const batch = writeBatch(db);
      let count = 0;

      for (const row of data) {
        // Skip header row if it contains the word "Código"
        if (String(row.A).includes('Código')) continue;

        // A: Código de barras, B: Referencia interna, C: Nombre
        if (row.A && row.C) {
          // Normalizamos el código de barras eliminando espacios si los hay
          const barcode = String(row.A).trim();
          const productRef = doc(db, 'products', barcode);

          batch.set(productRef, {
            barcode: barcode,
            internalRef: String(row.B || '').trim(),
            name: String(row.C).trim(),
            updatedAt: new Date()
          });
          count++;

          // Firestore batch limit is 500. For simplicity in this tool,
          // we'll assume the list is reasonable or commit every 400.
          if (count % 400 === 0) {
            await batch.commit();
          }
        }
      }

      await batch.commit();
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
        Col A: Barcode | Col B: Internal Ref | Col C: Name{"\n"}
        (Import starts from the first row)
      </Text>

      <TouchableOpacity style={styles.uploadCard} onPress={pickDocument} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="large" color="#137fec" />
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
});

export default ExcelImportScreen;
