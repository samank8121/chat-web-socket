export type MessageType = {
  //room: string;
  message: string;
  user: string;
  status: 'sent' | 'received';
};

export type BulkMessageType = {
  contents?: MessageType[];
  room: string;
  error?: string | null;
};