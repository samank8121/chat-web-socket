export type MessageType = {
  room: string;
  message: string;
  user: string;
  status: 'sent' | 'received';
};

export type BulkMessageType = {
  content?: MessageType;
  error: string | null;
};