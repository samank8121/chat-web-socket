import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    socket.on('receive_message', (data) => {
      setMessages([...messages, { message: data.message, status: 'recieved' }]);
    });   
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
  };
  return (
    <div className='App'>
      <input
        placeholder='Room'
        onChange={(event) => {
          setRoom(event.target.value);
        }}
      />
      <button onClick={joinRoom}> Join Room</button>
      <input
        placeholder='Message'
        onChange={(event) => {
          setMessageSent(event.target.value);
        }}
      />
      <button onClick={sendMessage}> Send Message</button>
      <h1> Messages:</h1>
      <div>{joinedRoom}</div>
      <div>
        {messages.map((m, index) => {
          return (
            <>
              <span key={index}>{`${m.status}: `}</span>
              <span key={index}>{m.message}</span>
              <br/>
            </>
          );
        })}
      </div>
    </div>
  );
}

export default App;
