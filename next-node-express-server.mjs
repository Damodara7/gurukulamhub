// server.js
import express  from 'express';
import next  from 'next';
import  session  from 'express-session';
import RedisStore  from 'connect-redis';
import redis from  'redis';
import { parse } from 'url';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
//console.log("Connedct redis",ConnectRedis)
//const RedisStore = new ConnectRedis(session);

// Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Handle connection errors
redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

app.prepare().then(() => {
  const server = express();

  // Configure session middleware with Redis
  server.use(
    session({
      //store : RedisStore,
      store:  new RedisStore({ client: redisClient }),
      secret: process.env.NEXTAUTH_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );

  // Next.js request handler
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
