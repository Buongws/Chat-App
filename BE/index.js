import express from 'express';
import connectDB from './config/mongoose.js';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';

import socketClusterServer from 'socketcluster-server';
import http from 'http';
import jwt from 'jsonwebtoken';
import url from 'url';
import swaggerSetup from './swagger.js';

import directMessageRoute from './src/directMessage/directMessage.route.js';
import serverRoute from './src/server/server.route.js';
import channelRoute from './src/channel/channel.route.js';
import roomUserRedis from './src/dbs/roomUserRedis.js';

import userRoute from './src/user/user.route.js';
import messageRoute from './src/message/message.route.js';
import errorHandler from './src/middlewares/error.middleware.js';
import { initRedis, getRedis } from './src/dbs/init.redis.js';

const app = express();
app.use(cors());
dotenv.config();

const redisClient = initRedis();

getRedis();

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true }));
connectDB();

let httpServer = http.createServer(app);
let agServer = socketClusterServer.attach(httpServer, {
  authKey: process.env.JWT_ACCESS_SECRET,
});

app.set('agServer', agServer);
//jwt socket, nhan jwt token tu client.
//user_id
const onlineUsers = [];

(async () => {
  // Handle new inbound sockets.
  for await (let { socket } of agServer.listener('connection')) {
    //get authToken from socket
    console.log('socket', socket.id);

    const upgradeReq = socket.request;
    const queryObject = url.parse(upgradeReq.url, true).query;
    const token = queryObject.authToken;
    if (token) {
      try {
        const user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        if (user) {
          socket.authToken = user;
          socket.setAuthToken(user);
          if (!onlineUsers.includes(user.userId)) {
            onlineUsers.push(user.userId);
          }
        }
      } catch (err) {
        console.log(err);
      }
    }
    setTimeout(() => {
      agServer.exchange.transmitPublish('onlineUsers', onlineUsers);
      console.log('onlineUsers1', onlineUsers);
    }, 1000);
  }
})();

(async () => {
  //disconnection
  for await (let { socket } of agServer.listener('disconnection')) {
    const user = socket.authToken;
    if (user) {
      const index = onlineUsers.indexOf(user.userId);
      if (index > -1) {
        onlineUsers.splice(index, 1);
      }
    }
    agServer.exchange.transmitPublish('onlineUsers', onlineUsers);
    console.log('onlineUsers2', onlineUsers);
  }
})();

app.use('/server', serverRoute);
app.use('/user', userRoute);
app.use('/channel', channelRoute);
app.use('/message', messageRoute);
app.use('/roomUser', roomUserRedis);
app.use('/directMessage', directMessageRoute);
swaggerSetup(app);
// error handler
app.use(errorHandler);

httpServer.listen(process.env.PORT, () => {
  console.log(`Server is running on localhost:${process.env.PORT}`);
});

import { Server } from 'socket.io';

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const roomUsers = {}; // Track users per room

io.on('connection', (socket) => {
  const updateAllRooms = async () => {
    for (const room in roomUsers) {
      const users = await redisClient.lrange(`room:${room}`, 0, -1);
      const parsedUsers = users.map((user) => JSON.parse(user));
      io.emit('channel-users', { roomId: room, users: parsedUsers });
    }
  };

  // Utility function to ensure Redis key is a list
  const ensureList = async (key) => {
    const keyType = await redisClient.type(key);
    if (keyType !== 'list') {
      await redisClient.del(key); // Delete the key to reset as a list
      console.log(
        `Key ${key} was deleted to reset as a list (was type: ${keyType})`
      );
    }
  };

  // Join a voice channel room
  socket.on('join-room', async ({ roomId, userId, userName, avatar }) => {
    console.log('userId have join the room', userId, 'In room', roomId);

    await ensureList(`room:${roomId}`);

    // Remove the user from any previous room they were in
    for (const existingRoom in roomUsers) {
      if (existingRoom !== roomId) {
        roomUsers[existingRoom] = roomUsers[existingRoom].filter(
          (user) => user.userId !== userId
        );
        await redisClient.lrem(
          `room:${existingRoom}`,
          0,
          JSON.stringify({ userId, userName, avatar })
        );
      }
    }

    if (!roomUsers[roomId]) {
      roomUsers[roomId] = [];
    }

    const userObj = { userId, name: userName, avatar, socketId: socket.id };

    const existingUsers = await redisClient.lrange(`room:${roomId}`, 0, -1);
    const isUserInRoom = existingUsers.some(
      (user) => JSON.parse(user).userId === userId
    );

    if (!isUserInRoom) {
      roomUsers[roomId].push(userObj);
      await redisClient.rpush(`room:${roomId}`, JSON.stringify(userObj)); // Store user as JSON
    }

    // Join the new room
    socket.join(roomId);

    updateAllRooms();
    console.log(`${userName} joined room: ${roomId}`);

    socket
      .to(roomId)
      .emit('new-peer', { userId, userName, avatar, socketId: socket.id });
  });

  // WebRTC signaling events
  socket.on('offer', ({ offer, roomId, targetSocketId }) => {
    io.to(targetSocketId).emit('offer', { offer, senderId: socket.id });
  });

  socket.on('answer', ({ answer, roomId, targetSocketId }) => {
    io.to(targetSocketId).emit('answer', { answer, senderId: socket.id });
  });

  socket.on('ice-candidate', ({ candidate, roomId, targetSocketId }) => {
    io.to(targetSocketId).emit('ice-candidate', {
      candidate,
      senderId: socket.id,
    });
  });
  // Leave a voice channel room
  socket.on('leave-room', async ({ roomId, userId }) => {
    if (roomUsers[roomId]) {
      await ensureList(`room:${roomId}`);

      // Retrieve the stored user object format
      const storedUser = roomUsers[roomId].find(
        (user) => user.userId === userId
      );

      if (storedUser) {
        roomUsers[roomId] = roomUsers[roomId].filter(
          (user) => user.userId !== userId
        );
        await redisClient.lrem(`room:${roomId}`, 0, JSON.stringify(storedUser)); // Remove exact stored format
      }

      socket.leave(roomId);

      updateAllRooms();
      console.log(`User ${userId} left room: ${roomId}`);
    }
  });

  socket.on('disconnect', async () => {
    const user = socket.authToken;
    if (user) {
      for (const roomId in roomUsers) {
        const storedUser = roomUsers[roomId].find(
          (u) => u.userId === user.userId
        );

        if (storedUser) {
          roomUsers[roomId] = roomUsers[roomId].filter(
            (u) => u.userId !== user.userId
          );
          await redisClient.lrem(
            `room:${roomId}`,
            0,
            JSON.stringify(storedUser)
          );
        }
      }
      updateAllRooms();
      console.log('User disconnected:', socket.id);
    }
  });
});
