import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SocketEvents, { ME } from '@/lib/constant';
import createSocket, { socketErrorHandler } from '@/lib/socket';
import { useUserStore } from '@/lib/store/user';
import type { BulkMessageType, MessageType } from '@/types/message';
import type { SocketError } from '@/types/socket-error';
import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { SendHorizonal } from 'lucide-react';
import { toast } from 'sonner';

const Home = () => {
  const [room, setRoom] = useState('');
  const [messageSent, setMessageSent] = useState('');
  const [joined, setJoined] = useState(false);
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
      setMessages([
        ...messages,
        { message: data.message, user: data.user, status: 'received' },
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
    if (room !== '') {
      socket?.emit(SocketEvents.JOIN_ROOM, room, (data: BulkMessageType) => {
        if (data.room) {
          setJoined(true);
          setMessages(
            data.contents
              ? data.contents.map((msg) => {
                  let user = ME;
                  if (msg && msg.user) {
                    user = msg.user === currentUser?.email ? ME : msg.user;
                  }
                  return {
                    message: msg?.message || '',
                    user,
                    status: 'received',
                  };
                })
              : []
          );
        }
      });
    } else toast('Fill the room field');
  };

  const sendMessage = () => {
    setMessages([
      ...messages,
      { message: messageSent, user: ME, status: 'sent' },
    ]);
    socket?.emit(SocketEvents.SEND_MESSAGE, { messageSent, room });
    setMessageSent('');
  };
  const resetRoom = () => {
    setRoom('');
    setMessageSent('');
    setJoined(false);
    setMessages([]);
  };
  const leftRoom = () => {
    socket?.emit(SocketEvents.LEAVE_ROOM, room, (success: boolean | null) => {
      if (success) {
        resetRoom();
      }
    });
  };
  return (
    <div className='flex flex-col h-screen gap-4 w-full py-4'>
      <div className='flex gap-2 w-full'>
        <Input
          placeholder='Room'
          value={room}
          onChange={(event) => {
            setRoom(event.target.value);
          }}
          disabled={joined}
        />
        {!joined && <Button onClick={joinRoom}> Join Room</Button>}
        {joined && <Button onClick={leftRoom}> Left Room</Button>}
      </div>
      <div className='p-1 border-2 border-gray-300 rounded-2xl w-full min-h-5/7'>
        <div className='p-4 overflow-y-auto border-none w-full h-full dark:custom-scrollbar custom-scrollbar'>
          {messages.length === 0 && <h2 className='text-gray-500'>Messages</h2>}
          {messages.map((m, index) => {
            return (
              <div
                key={index}
                ref={index === messages.length - 1 ? lastMessageRef : null}
              >
                <div className='my-2 p-2 border-1 rounded-xl'>
                  <span className='font-bold italic text-green-700 dark:text-green-400'>{`${m.user}: `}</span>
                  <span>{m.message}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className='flex gap-2 w-full'>
        <Input
          placeholder='Message'
          value={messageSent}
          onChange={(event) => {
            setMessageSent(event.target.value);
          }}
        />
        <Button onClick={sendMessage}>
          <SendHorizonal />
        </Button>
      </div>
    </div>
  );
};

export default Home;
