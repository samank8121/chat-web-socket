import { io } from 'socket.io-client';
import { getUser } from '../lib/store/user';

const createSocket = async () => {
  if (!process.env.REACT_APP_API_URL || !process.env.REACT_APP_SOCKET_URL) {
    throw new Error('API_URL and SOCKET_URL must be defined');
  }
  const user = getUser();

  const socket = io(process.env.REACT_APP_SOCKET_URL, {
    //query: { token: token.access_token }, // Pass token in query
    auth: { token: user?.token }, // Pass token in auth object
    // extraHeaders: { Authorization: `Bearer your_jwt_token` }, // Pass token in headers
  });
  return socket;
};
type SocketError = {
  message: string;
  code?: string;
  status?: string;
};
export const socketErrorHandler = (error: SocketError) => {
  if (error && error.code) {
    if (error.code === 'INVALID_TOKEN' || error.code === 'NO_TOKEN_PROVIDED') {
      window.location.href = '/signin';
    }
  } else if (error && error.message) {
    console.error('Socket error:', error.message);
    alert(`Error: ${error.message}`);
  }
};

export default createSocket;
