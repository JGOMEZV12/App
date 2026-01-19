import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import i18n from '../i18n';
import { Search, Filter, AlertTriangle, Calendar } from 'lucide-react-native';

const InventoryScreen = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState('');
  const { userData } = useAuth();

  useEffect(() => {
    if (!userData?.branchId) return;

    const q = query(
      collection(db, 'inventory'),
      where('branchId', '==', userData.branchId),
      orderBy('expiryDate', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const inventoryList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(inventoryList);
      setFilteredItems(inventoryList);
    });

    return () => unsubscribe();
  }, [userData]);

  useEffect(() => {
    const filtered = items.filter(item =>
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.barcode.includes(search)
    );
    setFilteredItems(filtered);
  }, [search, items]);

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = expiryDate.toDate();
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { label: 'EXPIRED', color: '#fa6238' };
    if (diffDays <= 5) return { label: 'EXPIRING SOON', color: '#fa6238' };
    return { label: 'OK', color: '#0bda5b' };
  };

  const renderItem = ({ item }) => {
    const status = getExpiryStatus(item.expiryDate);
    return (
      <View style={styles.card}>
        <View style={styles.cardMain}>
          <View>
            <Text style={styles.productName}>{item.productName}</Text>
            <Text style={styles.barcodeText}>SKU: {item.barcode} | Qty: {item.quantity}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Calendar size={14} color="#888" />
          <Text style={styles.expiryText}>
            {i18n.t('expiry_date')}: {item.expiryDate.toDate().toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Search color="#888" size={20} style={{ marginLeft: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101922', padding: 15 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#192633', borderRadius: 10, marginBottom: 20, padding: 5 },
  searchInput: { flex: 1, color: '#fff', padding: 10 },
  card: { backgroundColor: '#192633', borderRadius: 12, padding: 15, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#137fec' },
  cardMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  productName: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  barcodeText: { color: '#888', fontSize: 12, marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 12, borderTopWidth: 1, borderTopColor: '#253441', paddingTop: 10 },
  expiryText: { color: '#888', fontSize: 12, marginLeft: 6 },
});

export default InventoryScreen;
