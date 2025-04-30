// redisClient.js
const Redis = require('ioredis');
// Create a new Redis client using environment variables for flexibility
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost', // Redis server host
  port: process.env.REDIS_PORT || 6379,        // Redis server port
  password: process.env.REDIS_PASSWORD || undefined, // Optional Redis password
});

redisClient.on('connect', () => {
  console.log("RedisClient: Connected...")
})
redisClient.on('error', (err) => console.log('Redis Client Error', err));


// Example: Setting a key-value pair in Redis
// redisClient.set('key', 'venkatparsi', (err, reply) => {
//   if (err) {
//     console.error('Error setting key:', err);
//   } else {
//     console.log('RedisClient:Test Key set value as (venkatparsi) successful:', reply);
//   }
// });

// // Example: Retrieving the value for a key
// redisClient.get('key', (err, result) => {
//   if (err) {
//     console.error('Error getting key:', err);
//   } else {
//     console.log('RedisClient:Test Key value:', result);
//   }
// });


module.exports = {
  redisClient
};
