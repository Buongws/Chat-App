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

const roomUsers = {}; // Global variable to track room users

// Function to restore room users from Redis
const restoreRoomUsersFromRedis = async () => {
  const keys = await redisClient.keys('room:*');
  for (const key of keys) {
    const roomId = key.replace('room:', '');
    const users = await redisClient.lrange(key, 0, -1);
    roomUsers[roomId] = users.map((user) => JSON.parse(user));
  }
  console.log('Restored room users from Redis:', roomUsers);
};

// Restore room users before handling any socket connections
restoreRoomUsersFromRedis().then(() => {
  console.log('Room users restored successfully');
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

io.on('connection', (socket) => {
  const updateAllRooms = async () => {
    for (const roomId in roomUsers) {
      const activeUsers = [];

      // Duyệt qua từng user trong room
      for (const user of roomUsers[roomId]) {
        const socket = io.sockets.sockets.get(user.socketId);
        if (socket && socket.connected) {
          activeUsers.push(user); // User vẫn đang kết nối
        } else {
          // Xóa user khỏi Redis nếu socket không còn kết nối
          await redisClient.lrem(`room:${roomId}`, 0, JSON.stringify(user));
          console.log(
            `Removed inactive user ${user.userId} from room ${roomId}`
          );
        }
      }

      // Cập nhật danh sách user hoạt động trong bộ nhớ cục bộ
      roomUsers[roomId] = activeUsers;

      // Phát danh sách user đã cập nhật đến tất cả client
      io.emit('channel-users', { roomId, users: activeUsers });
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
        const storedUser = roomUsers[existingRoom].find(
          (u) => u.userId === userId
        );
        if (storedUser) {
          roomUsers[existingRoom] = roomUsers[existingRoom].filter(
            (user) => user.userId !== userId
          );
          await redisClient.lrem(
            `room:${existingRoom}`,
            0,
            JSON.stringify(storedUser)
          );
          console.log(`Removed user ${userId} from room ${existingRoom}`);
        }
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

  socket.on('new-user-joined', ({ roomId }) => {
    socket.to(roomId).emit('new-peer', { socketId: socket.id });
  });

  socket.on('user-video-toggled', ({ roomId, isVideoOn }) => {
    console.log(`User ${socket.id} toggled video: ${isVideoOn}`);

    // Phát sự kiện tới tất cả người dùng trong phòng, bao gồm cả người gửi
    io.in(roomId).emit('user-video-toggled', {
      userId: socket.id,
      isVideoOn,
    });

    if (isVideoOn) {
      socket.to(roomId).emit('new-peer', {
        socketId: socket.id,
      });
    }
  });
  // Handle ICE candidate
  socket.on('ice-candidate', ({ candidate, roomId, targetSocketId }) => {
    io.to(targetSocketId).emit('ice-candidate', {
      candidate,
      senderId: socket.id,
    });
    console.log(
      `Forwarded ICE candidate from ${socket.id} to ${targetSocketId}`
    );
  });

  // Handle SDP offer
  socket.on('offer', ({ offer, roomId, targetSocketId }) => {
    io.to(targetSocketId).emit('offer', {
      offer,
      senderId: socket.id,
    });
    console.log(`Forwarded offer from ${socket.id} to ${targetSocketId}`);
  });

  // Handle SDP answer
  socket.on('answer', ({ answer, roomId, targetSocketId }) => {
    io.to(targetSocketId).emit('answer', {
      answer,
      senderId: socket.id,
    });
    console.log(`Forwarded answer from ${socket.id} to ${targetSocketId}`);
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
      io.in(roomId).emit('user-left-room', {
        userId,
        socketId: socket.id,
      });

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

          io.in(roomId).emit('user-left-room', {
            userId: user.userId,
            socketId: socket.id,
          });

          console.log(`User ${user.userId} disconnected from room: ${roomId}`);
        }
      }
      updateAllRooms();
    }
  });
});
