import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import { tokenStorage } from './api';

const SOCKET_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000');

let socket: Socket | null = null;

export const getSocket = async (): Promise<Socket> => {
  if (socket && socket.connected) {
    return socket;
  }

  const token = await tokenStorage.get('access_token');

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: {
      token: token ? `Bearer ${token}` : '',
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
