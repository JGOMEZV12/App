import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    // alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export async function scheduleExpiryNotification(productName, expiryDate) {
  const fiveDaysBefore = new Date(expiryDate);
  fiveDaysBefore.setDate(fiveDaysBefore.getDate() - 5);

  const today = new Date();

  if (fiveDaysBefore > today) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Expiring Soon! ⚠️",
        body: `${productName} will expire in 5 days.`,
        data: { productName },
      },
      trigger: fiveDaysBefore,
    });
  }

  if (expiryDate > today) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Expired Today! 🚨",
        body: `${productName} expires today.`,
        data: { productName },
      },
      trigger: expiryDate,
    });
  }
}
