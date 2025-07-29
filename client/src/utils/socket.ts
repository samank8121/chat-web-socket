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

export default createSocket;
