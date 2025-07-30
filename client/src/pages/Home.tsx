import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import createSocket, { socketErrorHandler } from '@/utils/socket';
import SocketEvents, { ME } from '@/utils/constant';
import { getUser, useUserStore } from '@/lib/store/user';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button"

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
    socket.on(SocketEvents.ERROR, (error: any) => {
      socketErrorHandler(error);
    });
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
      socket.off(SocketEvents.ERROR);
      socket.off(SocketEvents.RECEIVE_MESSAGE);
    };
  }, [messages, socket, lastMessageRef]);

  const joinRoom = () => {
    console.log('Joining room:', room);
    if (room !== '') {
      console.log('Joining room(if):', room);
      socket.emit(SocketEvents.JOIN_ROOM, room, (data: string) => {
        console.log('Joining room(callback):', room);
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
    <div className='flex flex-col items-center justify-center h-screen'>
      <Input
        placeholder='Room'
        onChange={(event) => {
          setRoom(event.target.value);
        }}
      />
      <Button onClick={joinRoom}> Join Room</Button>
      <Input
        placeholder='Message'
        value={messageSent}
        onChange={(event) => {
          setMessageSent(event.target.value);
        }}
      />
      <Button onClick={sendMessage}> Send Message</Button>
      <h2>{joinedRoom}</h2>
      <h2> Messages:</h2>
      <div className='overflow-y-auto h-96 w-96 border-2 border-gray-300 p-4'>
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
