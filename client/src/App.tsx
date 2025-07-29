import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import createSocket from './utils/socket';

type MessageType = {
  message: string;
  status: 'sent' | 'recieved';
};

function App() {
  const [room, setRoom] = useState('');
  const [messageSent, setMessageSent] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [joinedRoom, setJoinedRoom] = useState('');
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [socket, setSocket] = useState<any>(null);
  useEffect(() => {
    const initializeSocket = async () => {
      const socket = await createSocket();
      setSocket(socket);
    };
    initializeSocket().catch((error) => {
      console.error('Error initializing socket:', error);
    });
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('receive_message', (data: MessageType) => {
      setMessages([...messages, { message: data.message, status: 'recieved' }]);
    });
    if (lastMessageRef && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, socket, lastMessageRef]);

  const joinRoom = () => {
    if (room !== '') {
      socket.emit('join_room', room, (data: string) => {
        setJoinedRoom(data);
      });
    }
  };

  const sendMessage = () => {
    setMessages([...messages, { message: messageSent, status: 'sent' }]);
    socket.emit('send_message', { messageSent, room });
    setMessageSent('');
  };
  return (
    <div className='app '>
      <input
        placeholder='Room'
        onChange={(event) => {
          setRoom(event.target.value);
        }}
      />
      <button onClick={joinRoom}> Join Room</button>
      <input
        placeholder='Message'
        value={messageSent}
        onChange={(event) => {
          setMessageSent(event.target.value);
        }}
      />
      <button onClick={sendMessage}> Send Message</button>
      <h2>{joinedRoom}</h2>
      <h2> Messages:</h2>
      <div className='message-container firefox-scroll'>
        {messages.map((m, index) => {
          return (
            <div key={index} ref={index === messages.length - 1 ? lastMessageRef : null}>
              <span>{`${m.status}: `}</span>
              <span>{m.message}</span>
              <br />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
