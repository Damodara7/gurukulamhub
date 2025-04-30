const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

//global vars...
let server; //http server
let io; // socket server
let app; //express app

let { redisClient } = require('../redis-server/redisClient'); //redis client
const gameRoomHandlers = require('./roomHandlers');

async function startServer(port = 4000) {
  await new Promise((resolve, reject) => {
    app = express();
    const server = http.createServer(app);

    // Setup Socket Server
    io = new Server(server, {
      cors: {
        origin: "http://localhost:3000", // Adjust this accordingly this should be your web server....
      }
    });

    // Start the server
    const PORT = process.env.PORT || port;
    server.listen(PORT, (err) => {
      if (err) {
        reject(err); // Reject the promise if there's an error
      } else {
        console.log(`WebSocket / Express Server running on port ${PORT}`);
        resolve({ server, io }); // Resolve the promise with the server and io instance
      }
    });

    // Handle any server errors
    server.on('error', (err) => {
      reject(err); // Reject on server error
    });
  });
}

// Function to check if the Redis client is connected
const checkRedisConnection = () => {
  if (redisClient.status === 'ready') {
    console.log('Redis client is connected and ready to use.');
    return true;
  } else if (redisClient.status === 'connect') {
    console.log('Redis client is connecting.');
  } else if (redisClient.status === 'end') {
    console.log('Redis client has been closed.');
  } else if (redisClient.status === 'reconnecting') {
    console.log('Redis client is reconnecting.');
  } else {
    console.log('Unknown Redis client status:', redisClient.status);
  }
};


const registerGameHandlers = async () => {
  // Connect to Redis
  if (checkRedisConnection()) {
    console.log('Connected to Redis');
    // Adding data to leaderboard
    await addToSortedSet("leaderboard", 100, "user1")
    await addToSortedSet("leaderboard", 90, "user2")
    await addToSortedSet("leaderboard", 95, "user3")
    // Increment the score of 'user1' by 50
    await incrScoreInSortedSet('leaderboard', 50, 'user1');
    scanSortedSet("leaderboard");
    getSortedSetInReverseOrder('leaderboard');
  }
  // Initialize game room handlers with Redis and Socket.IO
  gameRoomHandlers(io, redisClient);
}

// Function to get all member IDs in a specific room
const getMembersInQuizGameRoom = (quizGameRoomName) => {
  const room = io.sockets.adapter.rooms.get(quizGameRoomName);

  if (room) {
    // room is a Set object containing all the socket IDs in the room
    const memberIds = Array.from(room); // Convert the Set to an array
    return memberIds;
  } else {
    return []; // Return an empty array if no one is in the room
  }
};

function registerUtilRoutes() {
  app.get('/ping', (req, res) => {
    res.json({ message: 'Hello from the GurukulhHub Express/Socket backend!' });
  });

  app.get('/', (req, res) => {
    res.json({ message: 'Hello from the GurukulhHub Express/Socket backend!' });
  });
}

async function scanSortedSet(sortedSetName) {
  try {
    // Get the async iterator for the sorted set
    const iterator = redisClient.zScanIterator(sortedSetName);
    console.log("scanning .", sortedSetName)

    // Iterate over the items asynchronously
    for await (const item of iterator) {
      //console.log("item",item)
      const member = item.value;  // member
      const score = item.score;   // score
      console.log(`Member: ${member}, Score: ${score}`);
    }
  } catch (err) {
    console.error('Error scanning sorted set:', err);
  }
}

async function getSortedSetInReverseOrder(sortedSetName) {
  try {
    const elements = await redisClient.zRangeWithScores(sortedSetName, 0, -1, { REV: true, WITHSCORES: true });
    console.log("elements", elements)
    return elements;
  } catch (err) {
    console.error('Error fetching sorted set in reverse order:', err);
  }
}

async function addToSortedSet(sortedSetName, score, value) {
  try {
    redisClient.zAdd(sortedSetName, [{ score: score, value: value }]).then(() => {
      console.log('Stored score successfully for', value)
    })
  } catch (err) {
    console.error('Error fetching sorted set in reverse order:', err);
  }
}

async function incrScoreInSortedSet(sortedSetName, score, value) {
  try {
    redisClient.zIncrBy(sortedSetName, score, value);
    console.log('Incremented score successfully for', value)
  } catch (err) {
    console.error('Error Incrementing score for:', value, err);
  }
}

// Utility function to reset the quiz
const resetQuiz = async (quizId) => {
  const quiz = liveQuizzes[quizId];

  if (!quiz) return;

  // Reset the quiz state
  quiz.activeQuestionIndex = -1;
  quiz.quizStarted = false;

  // Clear leaderboard in Redis
  await redisClient.del(`quiz:${quizId}:leaderboard`);

  // Clear player data in Redis
  const participants = await io.in(quizId).allSockets();
  for (let participant of participants) {
    const userKey = `quiz:${quizId}:user:${participant}`;
    await redisClient.del(userKey);
  }

  console.log(`Quiz ${quizId} has been reset and is ready to be restarted.`);
};

// Generate a 6-digit numeric PIN
function generateNumericPin() {
  const pin = Math.floor(100000 + Math.random() * 900000);  // Generates a random 6-digit number
  return pin.toString();  // Convert to string if necessary
}

// Generate a UUID and take only the first part as the PIN
function generateUuidPin() {
  const uuid = uuidv4();
  const pin = uuid.toString().slice(0, 6);  // Use the first part of the UUID as the PIN
  return pin;
}


// Utility function to send the next question
const sendNextQuestion = async (quizId, roomId, username) => {
  console.log("inside next question.. sending now....", quizId)
  const quiz = liveQuizzes[quizId];
  quiz.activeQuestionIndex++;
  console.log("quiz active question", quiz.activeQuestionIndex)

  if (quiz.activeQuestionIndex < quiz.questions.length) {
    const nextQuestion = quiz.questions[quiz.activeQuestionIndex];

    // Start a timer for each participant
    for (let participant of await io.in(roomId).fetchSockets()) {
      const userKey = `quiz:${quizId}:user:${username}:socket:${socket.id}`;
      console.log("Setting ", userKey)
      await redisClient.hSet(userKey, 'startTime', new Date().getTime());
    }

    console.log("emitting new question...", nextQuestion)
    io.to(roomId).emit('newQuestion', nextQuestion);

    // Set a timeout to automatically move to the next question after the time limit
    setTimeout(() => {
      handleTimeout(quizId, roomId);
    }, quiz.timeLimit);
  } else {
    const leaderboard = await getLeaderboard(roomId);
    io.to(roomId).emit('quizFinished', leaderboard);
  }
};

// Utility function to handle the timeout
const handleTimeout = async (quizId, roomId) => {
  const quiz = liveQuizzes[quizId];

  // Mark users who didn't answer in time
  for (let participant of await io.in(roomId).fetchSockets()) {
    const userKey = `quiz:${quizId}:user:${username}:socket:${socket.id}`;
    const startTime = await redisClient.hGet(userKey, 'startTime');
    const currentTime = new Date().getTime();

    if (currentTime - startTime >= quiz.timeLimit) {
      console.log(`User ${participant} timed out on question ${quiz.activeQuestionIndex}`);

      // Optional: Penalize the player by subtracting points or adjusting their score
      await redisClient.hIncrBy(userKey, 'score', -10);  // Example penalty for timeout
    }
  }

  // Move to the next question
  sendNextQuestion(quizId, roomId);
};

// Utility function to calculate points based on time taken
const calculatePoints = (timeTaken) => {
  if (timeTaken < 5000) return 100;
  if (timeTaken < 10000) return 50;
  return 20;
};

// Utility function to get leaderboard
const getLeaderboard = async (quizId) => {
  return getSortedSetInReverseOrder(quizId);
};

function stopServer() {
  return new Promise((resolve, reject) => {
    if (server) {
      server.close((err) => {
        if (err) {
          return reject(err);
        }
        console.log('WebSocket server stopped');
        resolve(true);
      });
    } else {
      resolve(false);
    }
  });
}

function isServerRunning() {
  return !!server;
}

module.exports = {
  startServer,
  stopServer,
  isServerRunning,
  registerUtilRoutes,
  registerGameHandlers
}
