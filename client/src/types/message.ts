export type MessageType = {
  message: string;
  user: string;
  status: 'sent' | 'received';
};