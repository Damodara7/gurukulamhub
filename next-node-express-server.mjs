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

// Create Redis client (only if REDIS_URL is available)
let redisClient = null;
let sessionStore = null;

if (process.env.REDIS_URL && process.env.REDIS_URL !== 'redis://localhost:6379') {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL
  });

  // Handle connection errors
  redisClient.on('error', (err) => {
    console.error('Redis error:', err);
  });

  sessionStore = new RedisStore({ client: redisClient });
} else {
  console.log('Redis not configured, using memory store for sessions');
}

app.prepare().then(() => {
  const server = express();

  // Configure session middleware with Redis or memory store
  server.use(
    session({
      store: sessionStore, // Will be null if Redis not available, using memory store
      secret: process.env.NEXTAUTH_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );

  // Next.js request handler
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const port = process.env.PORT || 3000;
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on port ${port}`);
  });
});
