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
import userRoute from './src/user/user.route.js';
import messageRoute from './src/message/message.route.js';
import errorHandler from './src/middlewares/error.middleware.js';

const app = express();
app.use(cors());
dotenv.config();

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
  console.log('User connected:', socket.id);

  const updateAllRooms = () => {
    for (const room in roomUsers) {
      io.emit('channel-users', { roomId: room, users: roomUsers[room] });
    }
  };

  // Join a voice channel room
  socket.on('join-room', ({ roomId, userId, userName, avatar }) => {
    // Remove the user from any previous room they were in
    for (const room in roomUsers) {
      if (room !== roomId) {
        roomUsers[room] = roomUsers[room].filter(
          (user) => user.userId !== userId
        );
      }
    }

    if (!roomUsers[roomId]) {
      roomUsers[roomId] = [];
    }

    // Add the user to the new room
    const userExists = roomUsers[roomId].some((user) => user.userId === userId);
    if (!userExists) {
      roomUsers[roomId].push({
        userId,
        name: userName,
        avatar,
        socketId: socket.id,
      });
    }
    // Join the new room
    socket.join(roomId);

    // Emit updated user lists for all rooms
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
  socket.on('leave-room', ({ roomId, userId }) => {
    if (roomUsers[roomId]) {
      // Remove the user from the room
      roomUsers[roomId] = roomUsers[roomId].filter(
        (user) => user.userId !== userId
      );
      socket.leave(roomId);

      updateAllRooms();

      console.log(`${userId} left room: ${roomId}`);
    }
  });

  socket.on('get-room-users', async ({ roomId }) => {
    const users = await redis.get(`room:${roomId}`);
    socket.emit('room-users-data', { roomId, users: JSON.parse(users) });
  });

  socket.on('disconnect', () => {
    for (const roomId in roomUsers) {
      roomUsers[roomId] = roomUsers[roomId].filter(
        (user) => user.socketId !== socket.id
      );
    }
    updateAllRooms();
    console.log('User disconnected:', socket.id);
  });
});
