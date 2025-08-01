import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SocketEvents, { ME } from '@/lib/constant';
import createSocket, { socketErrorHandler } from '@/lib/socket';
import { useUserStore } from '@/lib/store/user';
import type { BulkMessageType, MessageType } from '@/types/message';
import type { SocketError } from '@/types/socket-error';
import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';

const Home = () => {
  const [room, setRoom] = useState('');
  const [messageSent, setMessageSent] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const currentUser = useUserStore((state) => state.user);

   useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on(SocketEvents.ERROR, (error: SocketError) => {
      socketErrorHandler(error);
    });
    socket.on(SocketEvents.RECEIVE_MESSAGE, (data: MessageType) => {
      console.log('Message received:', data);
      setMessages([
        ...messages,
        { message: data.message, user: data.user, room: data.room, status: 'received' },
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
      socket?.emit(SocketEvents.JOIN_ROOM, room, (data: BulkMessageType[]) => {
        console.log('Joining room(callback):', room);
        setMessages(data.map((msg) => {
          let user = ME;
          if (msg.content && msg.content.user) {
            user = msg.content.user === currentUser?.email ? ME : msg.content.user;
          }
          return {
            message: msg.content?.message || '',
            user,
            room: msg.content?.room || '',
            status: 'received',
          };
        }));
      });
    }
  };

  const sendMessage = () => {
    setMessages([
      ...messages,
      { message: messageSent, user: ME, room,status: 'sent' },
    ]);
    socket?.emit(SocketEvents.SEND_MESSAGE, { messageSent, room });
    setMessageSent('');
  };
  return (
    <div className='flex flex-col h-screen gap-4 w-full py-4'>
      <div className='flex gap-2 w-full'>
        <Input
          placeholder='Room'
          onChange={(event) => {
            setRoom(event.target.value);
          }}
        />
        <Button onClick={joinRoom}> Join Room</Button>
      </div>      
      <div className='p-4 overflow-y-auto border-2 border-gray-300 rounded-2xl w-full h-96'>        
        {messages.length === 0 && <h2 className='text-gray-500'>Messages</h2>}
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
      
      <div className='flex gap-2 w-full'>
        <Input
          placeholder='Message'
          value={messageSent}
          onChange={(event) => {
            setMessageSent(event.target.value);
          }}
        />
        <Button onClick={sendMessage}> Send Message</Button>
      </div>
      
    </div>
  );
};

export default Home;
