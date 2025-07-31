import { io } from 'socket.io-client';
import { getUser, resetUser } from '@/lib/store/user';
import type { SocketError } from '@/types/socket-error';
import { toast } from 'sonner';

const createSocket = async () => {
  if (
    !import.meta.env.VITE_APP_API_URL ||
    !import.meta.env.VITE_APP_SOCKET_URL
  ) {
    throw new Error('API_URL and SOCKET_URL must be defined');
  }
  const user = getUser();

  const socket = io(import.meta.env.VITE_APP_SOCKET_URL, {
    //query: { token: token.access_token }, // Pass token in query
    auth: { token: user?.token }, // Pass token in auth object
    // extraHeaders: { Authorization: `Bearer your_jwt_token` }, // Pass token in headers
  });
  return socket;
};

export const socketErrorHandler = (error: SocketError) => {
  if (error && error.code) {
    if (error.code === 'INVALID_TOKEN' || error.code === 'NO_TOKEN_PROVIDED') {
      resetUser();
      window.location.href = '/signin';
    }
  } else if (error && error.message) {
    console.error('Socket error:', error.message);
    toast(`Error: ${error.message}`);
  }
};

export default createSocket;
