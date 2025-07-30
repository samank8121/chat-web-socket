const corsConfig = {
  origin: [process.env.CLIENT_URL!, 'https://admin.socket.io'],
  credentials: true,
};

export default corsConfig;
