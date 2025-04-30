const express = require('express');
const redis = require('redis');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
var cors = require('cors')
const app = express();
const httpServer = http.createServer(app);

// Redis Client
const redisClient = require('../redis-server/redisClient');

// Import IO Handlers
const gameRoomHandlers = require('./roomHandlers');

const server = http.createServer(app);

// Initialize game room handlers with Redis and Socket.IO
gameRoomHandlers(io, redisClient);

// Start server
const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

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

// Connect to Redis
redisClient.connect().then(async () => {
  console.log('Connected to Redis');

  // Adding data to leaderboard
  await addToSortedSet("leaderboard", 100, "user1")
  await addToSortedSet("leaderboard", 90, "user2")
  await addToSortedSet("leaderboard", 95, "user3")

  // Increment the score of 'user1' by 50
  await incrScoreInSortedSet('leaderboard', 50, 'user1');

  scanSortedSet("leaderboard");
  getSortedSetInReverseOrder('leaderboard');


}).catch((error) => {
  console.error('Error connecting to Redis:', error);
});

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000"
  }
});
let liveQuizzes = {};  // Temporary in-memory structure to store quiz data (for simplicity)
const liveGames = new Array();
liveQuizzes['venkat'] = {
  questions: [
    { question: "Capital of France?", options: ["Paris", "London", "Rome", "Berlin"], answer: "Paris" },
    { question: "Largest ocean?", options: ["Atlantic", "Pacific", "Indian", "Arctic"], answer: "Pacific" },
    // Add more questions as needed
  ],
  activeQuestionIndex: -1,
  quizStarted: false,
  timeLimit: 10000  // 10 seconds per question
};

app.use(cors())

// Create a new game
app.get('/create-game', async (req, res) => {
  const quizId = uuidv4();  // Generate unique quiz ID
  liveQuizzes[quizId] = {
    questions: [
      { question: "Capital of France?", options: ["Paris", "London", "Rome", "Berlin"], answer: "Paris" },
      { question: "Largest ocean?", options: ["Atlantic", "Pacific", "Indian", "Arctic"], answer: "Pacific" },
      // Add more questions as needed
    ],
    activeQuestionIndex: -1,
    quizStarted: false,
    timeLimit: 10000  // 10 seconds per question
  };
  console.log("Created new quiz with", quizId, liveQuizzes)

  res.status(200).send({ quizId });
});



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


// Join a quiz room

io.on('connection', async (socket) => {
  console.log('A user connected:', socket.id);


  socket.on('showGames', ({ username, pin }) => {
    console.log("Inside show games...")

    if (pin && pin === 'ABC1947') {
      socket.emit('showAllGames', ({ games: Object.values(liveGames), "venkat": "parsi" }));
      console.log("pin matched and sent games to client...", ...liveGames)
    }
    else if (username) {
      socket.emit("error", { message: "Invalid pin || correct pin is required" })
    }
  });


  socket.on('createGame', ({ quizId, username, startTime }) => {
    const pin = generateUuidPin();
    const roomId = pin;  // Using the PIN as the room ID
    var gameStatus = 'init'
    //Store the game room
    liveGames[roomId] = { players: [], quizId, pin, owner: username, startTime, status: gameStatus };  // Store the game room
    //join ther room
    socket.join(roomId);
    console.log(`LiveGames Oject before emitting.`, liveGames);
    // Emit the gameCreated event with the liveGames data
    socket.emit('gameCreated', { pin: roomId, games: liveGames[roomId] });
    console.log(`Game room created with PIN: ${roomId}`, liveGames);
  });


  socket.on('startGame', ({ pinOrRoomId, quizId, username }) => {
    const roomId = pinOrRoomId;  // Using the PIN as the room ID
    var gameStatus = 'started'
    var game = liveGames[roomId];
    if(!game) {
      console.log("cant start game for invalid game pin...");
      return;
    }
    if (game?.owner === username) {
      game.startTime = new Date().getTime();
      game.status = gameStatus;
      game.quizId = quizId;
    } else {
      console.log("Game starting failed. (You are not the owner of the game)");
      socket.emit('error', { message: "you are not owner of game to start it" })
    }
    console.log(`Game room Started with PIN: ${roomId}`);
    socket.emit('gameStarted', { pin: roomId, game });

    //async ({ quizId }) => {
      console.log("Start game...", roomId, liveGames)

      if (liveGames[roomId] && liveGames[roomId].status==='started') {
       // liveQuizzes[quizId].quizStarted = true;
        console.log("Sending next question....", quizId)
        sendNextQuestion(quizId,roomId,username);

      }
    //}

  });



  // Join a game using a PIN
  socket.on('joinGame', ({ pin, username }) => {
    const roomId = pin;
    if (roomId && liveGames[roomId]) {
      socket.join(roomId);
      // Check if an object with the same `id` already exists
      const exists = liveGames[roomId].players.some(obj => obj.id === socket.id);

      if (!exists) {
        liveGames[roomId].players.push({ id: socket.id, username });
        socket.emit('joinedGame', { success: true, pin: roomId, message: "joined now" });
      }
      else {
        socket.emit('joinedGame', { success: true, pin: roomId, message: "already joined" });

      }
      console.log(`${socket.id} joined game with PIN: ${roomId}`);
    } else {
      socket.emit('joinedGame', { success: false, message: 'Invalid PIN' });
    }
  });

  // Event to remove a game room
  socket.on('removeGame', ({ pin, username }) => {
    console.log("Livegames", liveGames, pin, liveGames[pin])
    if (liveGames[pin]) {
      // Notify all clients in the room
      io.to(pin).emit('gameRemoved', { message: 'The game has been removed' });

      // Optionally disconnect all clients in the room
      io.to(pin).socketsLeave(pin);

      // Remove the game room data
      delete liveGames[pin];
      console.log(`Game room with PIN: ${pin} removed`);
    } else {
      socket.emit('removeGameError', { message: 'Invalid PIN' });
    }
  });

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    console.log("Disconnect execution....user disconnected", socket.id)
    for (let pin in liveGames) {
      let room = liveGames[pin];
      const index = liveGames[pin].players.findIndex(obj => obj.id === socket.id);
      if (index > -1) {
        room.players.splice(index, 1);
        console.log("Removed player  ...", socket.id, room.players)
      }
      else {
        try{
        socket.emit('disconnect', { success: true, pin: socket.id, message: " user is already removed" });
        }catch(e){
          console.log("Error ovvured while disconnecingl");
          return;
        }
      }
      // Optionally, remove the room if no players are left
      if (room.players.length === 0) {
        delete liveGames[pin];
        console.log(`Game room with PIN: ${pin} removed due to inactivity`);
      }
    }
  });

  // socket.on('disconnect',
  //   async ({ username }) => {
  //     console.log('A user disconnected:', socket.id);

  //     for (let quizId in liveQuizzes) {
  //       const userKey = `quiz:${quizId}:user:${username}:socket:${socket.id}`;
  //       await redisClient.del(userKey);  // Cleanup Redis on disconnect
  //     }
  //   });


  socket.on('joinQuiz',
    async ({ quizId, username }) => {
      console.log("Joining quiz (quizId)...", quizId, username, liveQuizzes)
      if (liveQuizzes[quizId]) {
        socket.join(quizId);

        // Store player's data in Redis
        const userKey = `quiz:${quizId}:user:${username}:socket:${socket.id}`;
        console.log(userKey, username)
        if (username && userKey) {
          await redisClient.hSet(userKey, 'username', username, 'score', 0, 'totalTime', 0);
          socket.emit('joinedQuiz', { success: true, quizId });
        }
        else {
          console.log("Error: Havent got the param username for joinQuiz.")
        }
      } else {
        socket.emit('joinedQuiz', { success: false, message: 'Quiz not found' });
      }
    });

  socket.on('resetQuiz',
    async ({ quizId }) => {
      console.log("resetting the quiz...", quizId);

      // Reset the quiz state
      await resetQuiz(quizId);

      // Start the quiz again
      io.to(quizId).emit('quizRestarted');
      //sendNextQuestion(quizId);  // Start from the first question again
    });

  socket.on('startQuiz',
    async ({ quizId }) => {
      console.log("Start quiz...", quizId, liveQuizzes)

      if (liveQuizzes[quizId] && !liveQuizzes[quizId].quizStarted) {
        liveQuizzes[quizId].quizStarted = true;
        console.log("Sending next question....", quizId)
        sendNextQuestion(quizId);
      }
    });

  socket.on('submitAnswer',
    async ({ quizId, answer }) => {
      const quiz = liveQuizzes[quizId];
      if (!quiz) return;

      const userKey = `quiz:${quizId}:user:${username}:socket:${socket.id}`;
      console.log("Userkey:", userKey)
      const questionIndex = liveQuizzes[quizId].activeQuestionIndex;
      const currentQuestion = liveQuizzes[quizId].questions[questionIndex];

      const timeTaken = new Date().getTime() - (await redisClient.hGet(userKey, 'startTime'));

      console.log("TimeTaken:", timeTaken, quiz.timeLimit)
      // // Check if the player answered within the time limit
      // if (timeTaken > quiz.timeLimit) {
      //   console.log('Timeout: Answer too late');
      //   return;  // The answer came too late, no points awarded
      // }

      // Check if the answer is correct
      const isCorrect = currentQuestion.answer === answer;

      if (isCorrect) {
        const score = calculatePoints(timeTaken);
        await redisClient.hIncrBy(userKey, 'score', score);
        await redisClient.hIncrBy(userKey, 'totalTime', timeTaken);

        // Update leaderboard (sorted by score)
        const username = await redisClient.hGet(userKey, 'username');
        const newScore = await redisClient.hGet(userKey, 'score');
        console.log("username,newScore", username, newScore);

        addToSortedSet(`quiz:${quizId}:leaderboard`, newScore, username)
        console.log("answer is correct updated leader board... ", isCorrect);
      }
      else {
        console.log("answer is wrong.. ", isCorrect);
      }
      // Emit leaderboard update to all users in the room
      const leaderboard = await getLeaderboard(`quiz:${quizId}:leaderboard`);
      console.log("Leader board", leaderboard);
      io.to(quizId).emit('scoreUpdate', leaderboard);


    });



  socket.on('ackRequest', (arg1, arg2, callback) => {
    console.log(arg1); // { foo: 'bar' }
    console.log(arg2); // 'baz'
    callback({
      status: 'ok',
      message: " good man"
    });
  });


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

});


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
const sendNextQuestion = async (quizId, roomId,username) => {
  console.log("inside next question.. sending now....",quizId)
  const quiz = liveQuizzes[quizId];
  quiz.activeQuestionIndex++;
  console.log("quiz acrtive question",quiz.activeQuestionIndex)

  if (quiz.activeQuestionIndex < quiz.questions.length) {
    const nextQuestion = quiz.questions[quiz.activeQuestionIndex];

    // Start a timer for each participant
    for (let participant of await io.in(roomId).fetchSockets()) {
      const userKey = `quiz:${quizId}:user:${username}:socket:${socket.id}`;
      console.log("Setting ", userKey)
      await redisClient.hSet(userKey, 'startTime', new Date().getTime());
    }

    console.log("emitting new quesrtion...", nextQuestion)

    io.to(roomId).emit('newQuestion', nextQuestion);

    // Set a timeout to automatically move to the next question after the time limit
    setTimeout(() => {
      handleTimeout(quizId,roomId);
    }, quiz.timeLimit);
  } else {
    const leaderboard = await getLeaderboard(roomId);
    io.to(roomId).emit('quizFinished', leaderboard);
  }
};

// Utility function to handle the timeout
const handleTimeout = async (quizId,roomId) => {
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
  sendNextQuestion(quizId,roomId);
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


app.get('/ping', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});



httpServer.listen(4001, () => {
  console.log('Backend server listening on port 4001');
});
