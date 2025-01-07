import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import io from 'socket.io-client';

const socket = io('http://localhost:3001/chat');

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

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages([...messages, { message: data.message, status: 'recieved' }]);
    });
    if (lastMessageRef && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
      <h1> Messages:</h1>
      <div>{joinedRoom}</div>
      <div className='message-container firefox-scroll'>
        {messages.map((m, index) => {
          return (
            <div ref={index === messages.length - 1 ? lastMessageRef : null}>
              <span key={index}>{`${m.status}: `}</span>
              <span key={index}>{m.message}</span>
              <br />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
