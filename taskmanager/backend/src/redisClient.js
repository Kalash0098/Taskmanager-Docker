const redis = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const client = redis.createClient({ url: redisUrl });

client.on('error', (err) => console.error('[Redis] Error:', err.message));
client.on('connect', () => console.log(`[Redis] Connected: ${redisUrl}`));

async function initRedis() {
  await client.connect();
}

module.exports = { client, initRedis };
