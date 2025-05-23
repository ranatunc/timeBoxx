import { Platform } from 'react-native';

export const API_URL =
  Platform.OS === 'ios'
    ? 'http://localhost:3000'
    : 'http://10.0.2.2:3000'; // Android için bu IP host PC’yi gösterir


