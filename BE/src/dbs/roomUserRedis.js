import express from 'express';
import { getRedis, initRedis } from './init.redis.js';

const router = express.Router();

initRedis();
const redisClient = getRedis();

// Route to get all rooms and their users from Redis
router.get('/', async (req, res) => {
  try {
    // Get all room keys
    const roomKeys = await redisClient.keys('room:*');
    const roomsData = {};

    // Fetch users for each room
    for (const roomKey of roomKeys) {
      const users = await redisClient.lrange(roomKey, 0, -1);
      roomsData[roomKey] = users
        .map((user) => {
          try {
            return JSON.parse(user); // Parse each user JSON string
          } catch (err) {
            console.error(`Failed to parse user data for ${roomKey}:`, err);
            return null; // Handle any parsing errors
          }
        })
        .filter(Boolean); // Filter out any null entries due to parse errors
    }

    res.json({
      success: true,
      data: roomsData,
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms from Redis',
    });
  }
});

export default router;
