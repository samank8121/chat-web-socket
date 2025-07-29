import { io } from 'socket.io-client';

const createSocket = async () => {
  const token = await fetch('http://localhost:3001/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: 'saman.k2@gmail.com', password: '123456' }), // Replace with actual logic to get token
  }).then((response) => {
    return response.json();
  });
  console.log('Token:', token);
  if (!token) {
    throw new Error('No token found');
  }

  const socket = io('http://localhost:3001/chat', {
    //query: { token: token.access_token }, // Pass token in query
    // OR
    auth: { token: token.access_token }, // Pass token in auth object
    // OR
    // extraHeaders: { Authorization: `Bearer your_jwt_token` }, // Pass token in headers
  });
  return socket;
};

export default createSocket;
