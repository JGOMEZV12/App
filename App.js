import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LayoutDashboard, Package, ScanBarcode, MessageCircle, Settings, FileSpreadsheet } from 'lucide-react-native';

import LoginScreen from './src/screens/LoginScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import ChatDetailScreen from './src/screens/ChatDetailScreen';
import ExcelImportScreen from './src/screens/ExcelImportScreen';
import SuperAdminDashboard from './src/screens/SuperAdminDashboard';
import CreateUserScreen from './src/screens/CreateUserScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const InventoryStack = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: { backgroundColor: '#192633' },
    headerTintColor: '#fff',
    headerTitleStyle: { fontWeight: 'bold' }
  }}>
    <Stack.Screen name="InventoryList" component={InventoryScreen} options={{ title: 'Inventory' }} />
    <Stack.Screen name="Scanner" component={ScannerScreen} options={{ title: 'Scan Product' }} />
  </Stack.Navigator>
);

const ChatStack = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: { backgroundColor: '#192633' },
    headerTintColor: '#fff'
  }}>
    <Stack.Screen name="ChatList" component={ChatListScreen} options={{ title: 'Messages' }} />
    <Stack.Screen name="ChatDetail" component={ChatDetailScreen} options={({ route }) => ({ title: route.params.title })} />
  </Stack.Navigator>
);

const AdminStack = () => (
  <Stack.Navigator screenOptions={{
    headerStyle: { backgroundColor: '#192633' },
    headerTintColor: '#fff'
  }}>
    <Stack.Screen name="AdminHome" component={SuperAdminDashboard} options={{ title: 'Admin Dashboard' }} />
    <Stack.Screen name="CreateUser" component={CreateUserScreen} options={{ title: 'Create User' }} />
    <Stack.Screen name="ImportExcel" component={ExcelImportScreen} options={{ title: 'Import Products' }} />
  </Stack.Navigator>
);

const MainTabs = () => {
  const { userData } = useAuth();
  return (
    <Tab.Navigator screenOptions={{
      tabBarStyle: { backgroundColor: '#192633', borderTopWidth: 0 },
      tabBarActiveTintColor: '#137fec',
      tabBarInactiveTintColor: '#888',
      headerStyle: { backgroundColor: '#192633' },
      headerTintColor: '#fff',
    }}>
      <Tab.Screen name="InventoryTab" component={InventoryStack} options={{
        headerShown: false,
        tabBarLabel: 'Inventory',
        tabBarIcon: ({ color, size }) => <Package color={color} size={size} />
      }} />
      <Tab.Screen name="ScannerTab" component={ScannerScreen} options={{
        tabBarLabel: 'Scan',
        tabBarIcon: ({ color, size }) => <ScanBarcode color={color} size={size} />
      }} />
      <Tab.Screen name="ChatTab" component={ChatStack} options={{
        headerShown: false,
        tabBarLabel: 'Chat',
        tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />
      }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{
        tabBarLabel: 'Ajustes',
        tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />
      }} />
      {userData?.role === 'admin' && (
        <Tab.Screen name="AdminTab" component={AdminStack} options={{
          headerShown: false,
          tabBarLabel: 'Admin',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />
        }} />
      )}
    </Tab.Navigator>
  );
};

const Navigation = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
