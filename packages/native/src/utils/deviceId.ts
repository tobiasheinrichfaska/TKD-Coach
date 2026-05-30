import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = '@tkd_coach_device_id';

let cachedDeviceId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;

  let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = generateRandomId();
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  cachedDeviceId = deviceId;
  return deviceId;
}

function generateRandomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function generatePhonePrimedId(): Promise<string> {
  const deviceId = await getDeviceId();
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  return `${deviceId}_${timestamp}_${random}`;
}
