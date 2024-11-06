// // init.redis.js
// import redis from 'redis';
// import dotenv from 'dotenv';

// dotenv.config();

// let redisClient;

// // Initialize Redis connection
// export const initRedis = () => {
//   redisClient = redis.createClient({
//     host: process.env.REDIS_HOST || 'localhost',
//     port: process.env.REDIS_PORT || 6379,
//   });

//   redisClient.on('connect', () => {
//     console.log('Connected to Redis');
//   });

//   redisClient.on('error', (err) => {
//     console.error('Redis connection error:', err);
//   });

//   return redisClient;
// };

// // Get Redis client
// export const getRedis = () => {
//   if (!redisClient) {
//     throw new Error('Redis client is not initialized. Call initRedis first.');
//   }
//   return redisClient;
// };

// // Close Redis connection
// export const closeRedis = () => {
//   if (redisClient) {
//     redisClient.quit();
//     console.log('Redis connection closed');
//   }
// };
