import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import createSocket from './utils/socket';
import SocketEvents, { ME } from './utils/constant';
import { getUser, useUserStore } from './lib/store/user';

type MessageType = {
  message: string;
  user: string;
  status: 'sent' | 'recieved';
};

function Home() {
  const [room, setRoom] = useState('');
  const [messageSent, setMessageSent] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [joinedRoom, setJoinedRoom] = useState('');
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const hasHydrated = useUserStore((s) => s.hasHydrated);
  const navigate = useNavigate();
  useEffect(() => {
    if (!hasHydrated) return;

    const user = getUser();
    if (user === null || user.token === '') {
      navigate('/signin');
      return;
    }

    const initializeSocket = async () => {
      try {
        const socket = await createSocket();
        setSocket(socket);
      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };

    initializeSocket();
    return () => {
      if (socket) {
        socket.disconnect(); // Assuming your socket has a disconnect method
        setSocket(null);
      }
    };
  }, [hasHydrated, navigate]);

  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEvents.RECEIVE_MESSAGE, (data: MessageType) => {
      console.log('Message received:', data);
      setMessages([
        ...messages,
        { message: data.message, user: data.user, status: 'recieved' },
      ]);
    });
    if (lastMessageRef && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    return () => {
      socket.off(SocketEvents.RECEIVE_MESSAGE);
    };
  }, [messages, socket, lastMessageRef]);

  const joinRoom = () => {
    if (room !== '') {
      socket.emit(SocketEvents.JOIN_ROOM, room, (data: string) => {
        setJoinedRoom(data);
      });
    }
  };

  const sendMessage = () => {
    setMessages([
      ...messages,
      { message: messageSent, user: ME, status: 'sent' },
    ]);
    socket.emit(SocketEvents.SEND_MESSAGE, { messageSent, room });
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
            <div
              key={index}
              ref={index === messages.length - 1 ? lastMessageRef : null}
            >
              <span>{`${m.user}: `}</span>
              <span>{m.message}</span>
              <br />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
