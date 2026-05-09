import { createClient } from 'redis';

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT || 6379),
  },
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', err => {
  console.error('Redis error', err);
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Redis connected');
  }
}

async function getRedis(key: string): Promise<string | null> {
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error('Redis GET error', error);
    return null;
  }
}

async function setRedis(
  key: string,
  value: string,
  ttlSeconds?: number,
): Promise<void> {
  try {
    if (ttlSeconds) {
      await redisClient.set(key, value, { EX: ttlSeconds });
    } else {
      await redisClient.set(key, value);
    }
  } catch (error) {
    console.error('Redis SET error', error);
  }
}

async function deleteRedis(key: string): Promise<number> {
  try {
    return await redisClient.del(key);
  } catch (error) {
    console.error('Redis DEL error', error);
    return 0;
  }
}

export { redisClient, connectRedis, getRedis, setRedis, deleteRedis };
export default redisClient;
