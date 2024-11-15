// init.redis.js
import Redis from 'ioredis';

let redisInstance = null;

export const initRedis = () => {
  if (!redisInstance) {
    redisInstance = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1', // địa chỉ host của Redis
      port: process.env.REDIS_PORT || 6379, // cổng Redis (mặc định là 6379)
      password: process.env.REDIS_PASSWORD || '', // mật khẩu nếu Redis của bạn cần
    });

    redisInstance.on('connect', () => {
      console.log('Connected to Redis successfully');
    });

    redisInstance.on('error', (err) => {
      console.error('Redis connection error:', err);
    });
  }

  return redisInstance;
};

export const getRedis = () => {
  if (!redisInstance) {
    console.error('Redis has not been initialized. Call initRedis first.');
    return null;
  }

  return redisInstance;
};

export const closeRedis = async () => {
  if (redisInstance) {
    await redisInstance.quit();
    console.log('Redis connection closed');
    redisInstance = null;
  }
};
