const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis error:', err));
client.on('connect', () => console.log('Connected to Redis'));

client.connect();

// Wrapper for set with TTL
client.setEx = async (key, ttl, value) => {
  await client.set(key, value, { EX: ttl });
};

module.exports = client;