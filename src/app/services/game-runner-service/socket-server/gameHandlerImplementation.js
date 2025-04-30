const liveGameModel = require('../db-connect/game.live.model');
// const LiveGamesService = require("../db-connect/gameService")
const connectMongo = require('../db-connect/dbConnect-mongo');
const GameService = require('../db-connect/gameService');
const QuizService = require("../db-connect/quizService");

const createRedisApi = require('../redis-server/redisApi');


// Event handlers using the socket
// module.exports = (socket, redisClient, io) => {
//   console.log("## io passed is ", io)

//   // 3. Send Question to Players
//   socket.on('sendQuestion', ({ gamePin, question }) => {
//     io.to(gamePin).emit('newQuestion', { question });
//     console.log(`Question sent to game ${gamePin}`);
//   });

//   // 4. Submit Answer and Update Score in Redis
//   socket.on('submitAnswer', async ({ playerId, gamePin, answer, correctAnswer, timeLimit }) => {
//     const now = Date.now();
//     const correct = answer === correctAnswer;
//     const timeTaken = now - timeLimit;
//     const score = correct ? Math.max(1000 - timeTaken, 0) : 0;

//     // Store score in Redis
//     redisClient.zincrby(`leaderboard:${gamePin}`, score, playerId, (err) => {
//       if (err) {
//         console.error('Redis error:', err);
//       }
//     });

//     io.to(gamePin).emit('answerReceived', { playerId, answer, score });
//     console.log(`Player ${playerId} submitted answer in game ${gamePin}`);
//   });

//   // 5. Get Leaderboard
//   socket.on('getLeaderboard', async ({ gamePin }) => {
//     redisClient.zrevrange(`leaderboard:${gamePin}`, 0, -1, 'WITHSCORES', (err, leaderboard) => {
//       if (err) {
//         console.error('Redis error:', err);
//         return;
//       }
//       const formattedLeaderboard = [];
//       for (let i = 0; i < leaderboard.length; i += 2) {
//         formattedLeaderboard.push({ playerId: leaderboard[i], score: leaderboard[i + 1] });
//       }
//       io.to(gamePin).emit('leaderboardUpdate', { leaderboard: formattedLeaderboard });
//     });
//   });

//   // 6. Chat Message Handling
//   socket.on('sendChatMessage', ({ gamePin, playerId, message }) => {
//     io.to(gamePin).emit('newChatMessage', { playerId, message });
//     console.log(`Player ${playerId} sent a chat message in game ${gamePin}`);
//   });

//   // 7. Send Notifications to Players
//   socket.on('sendNotification', ({ gamePin, notification }) => {
//     io.to(gamePin).emit('gameNotification', { notification });
//     console.log(`Notification sent to players in game ${gamePin}`);
//   });
// };

const getGameRooms = (io) => {
  const rooms = io.of("/").adapter.rooms; // Get the list of all rooms
  const sids = io.of("/").adapter.sids;   // Get the list of individual socket IDs

  const gameRooms = [];
  for (let [roomId, roomDetails] of rooms) {
    if (!sids.has(roomId)) { // Filter out the rooms that correspond to individual socket IDs
      gameRooms.push(roomId);
    }
  }

  console.log('Active game rooms:', gameRooms);
  return gameRooms;
};

const listPlayersInGameRoom = (io, gameRoomId) => {
  const room = io.of("/").adapter.rooms.get(gameRoomId); // Get the room details using the gameRoomId

  if (room) {
    const players = Array.from(room); // Convert the Set of socket IDs into an array
    console.log(`Players in room ${gameRoomId}:`, players);
    return players; // Returns an array of socket IDs in the room
  } else {
    console.log(`No players found in room ${gameRoomId}`);
    return [];
  }
};


const getGameRoomKey = (gameRoomId) => {
  return `gameRoom:${gameRoomId}`;
}

const addPlayerDataToRedisGameRoom = async (redisClient, gameRoomId, playerId, playerData) => {

  // Use a pipeline to batch Redis operations
  const pipeline = redisClient.pipeline();
  // Store player data in a hash
  pipeline.hset(gameRoomId, playerId, playerData.trim());
  await pipeline.exec(); // Execute the pipeline
  console.log(`addPlayerDataToRedisGameRoom: Player ${playerId} added to game room ${gameRoomId}`);
};

const getPlayerDataFromRedisGameRoom = async (redisClient, gameRoomId, playerId) => {
  //const playerKey = `gameRoom:${gameRoomId}:players`;

  // Use HGET to retrieve the player data by playerId
  const playerData = await redisClient.hget(gameRoomId, playerId);

  if (playerData) {
    console.log("getPlayerDataFromRedisGameRoom:Retrieving from redis :is ->", playerData, "<-")
    return playerData; // Convert JSON string back to object
  } else {
    console.log("getPlayerDataFromRedisGameRoom:player data...-->", playerData, "<--")
    return null; // Return null if no player found
  }
};


const listPlayersInRedisGameRoom = async (redisClient,gameRoomId) => {
 // const playerKey = getGameRoomKey(gameRoomId)

  // Use a pipeline to retrieve players
  const pipeline = redisClient.pipeline();
  pipeline.hgetall(gameRoomId); // Get all players for the game room

  const results = await pipeline.exec(); // Execute the pipeline

  // Extract the player data from the results
  console.log("listPlayersInRedisGameRoom",results)
  const players = results[0][1]; // results[0] is the response for the hgetall command

  if (players) {
    // Convert the hash to an array of player objects
    return Object.entries(players).map(([email, playerData]) => ({
      email,
      playerData, // Convert JSON string back to object
    }));
  } else {
    return []; // Return an empty array if no players found
  }
};
// Function to send a message to a specific socket ID
const sendChatMessageToSocketId = (io, socketId, from, message) => {
  // Check if the socketId is valid
  if (io.sockets.sockets.has(socketId)) {
    // Send the message to the specified socket ID
    io.to(socketId).emit('chat', { from, message });
    console.log("sent message...")
  } else {
    console.error('Socket ID not found:', socketId);
  }
};

// Function to send a message to a specific socket ID
const sendChatMessageToPlayerId = async (io, redisClient, gamePin, playerId, from, message) => {
  var gameRoomKey = getGameRoomKey(gamePin);
  var socketId = await getPlayerDataByEmail(
    redisClient, gameRoomKey, playerId);

  console.log("Retrieved socketid for email", socketId)
  // Check if the socketId is valid
  if (io.sockets.sockets.has(socketId)) {
    // Send the message to the specified socket ID
    io.to(socketId).emit('chat', { from, message });
    console.log("sent message...")
  } else {
    console.error('Socket ID not found:', socketId);
  }
};

// Function to send a message to a specific room
const sendMessageToRoom = (io, roomId, from, message) => {
  var gameRoomKey = getGameRoomKey(roomId)
  // console.log("Sending to room",gameRoomKey)
  io.to(gameRoomKey).emit('chat', { from, message });
};

// Example handler for joining a game
const joinGame = async (socket, redisClient, io, { authorization, gamePin }) => {
  console.log("gameHandlerImplementation.joinGame:##### Joining game...", gamePin, " by ", authorization);
  var game = null;
  var errorMessage = null;
  try {
    await connectMongo();
    // Get the game by gamePin
    game = await GameService.getByGamePin({ gamePin });
    //console.log("Game found..", game)
  } catch (e) {
    console.log("Game not found.. error:", e)
    game = null;
    errorMessage = e;
  }
  if (!game) {
    socket.emit('error', 'Invalid Game Pin or Game not active or' + errorMessage);
    return;
  }
  else {
    console.log("gameHandlerImplementation.joinGame: Adding player to game....")
    //update the game with player...
    const result = await GameService.addPlayerToGame(gamePin, { playerId:authorization })
    console.log("gameHandlerImplementation.joinGame: Player added to live game", result)

    // Handle joining the game room
    const gameRoomKey = getGameRoomKey(gamePin)

    socket.join(gameRoomKey);
    console.log(`${authorization} joined game room ${gamePin}`);

    // Add player to Redis or a database
    // await redisClient.addPlayerToGame(gamePin, playerId);
    socket.emit('JOIN_SUCCESS', { authorization, gamePin });

    getGameRooms(io);
    listPlayersInGameRoom(io, gameRoomKey);
    //Sending player data - player data is socket.id
    await addPlayerDataToRedisGameRoom(redisClient, gameRoomKey, authorization, socket.id);
    var socketId = await getPlayerDataFromRedisGameRoom(redisClient, gameRoomKey, authorization);
    await sendChatMessageToSocketId(io, socketId, "system", "Welcome to the Game");

    var players = await listPlayersInRedisGameRoom(redisClient,gameRoomKey);

    console.log("gameHandlerImplementation.joinGame- list players in redis gameRoom ",players)
    //await sendChatMessageToPlayerId(io,redisClient,gamePin,playerId,"venkat","direct messaging..");
  }
};

const startGame = async (socket, redisClient, io, { authorization, gamePin }) => {
  console.log("GameSocketSerive:startGame:", gamePin, " by ", authorization);
  try {
    await connectMongo();
    // Get the game by gamePin
    var game = await GameService.getByGamePin({ gamePin });
    var quizQuestions;

    if (!game) {
      socket.emit('error', 'Invalid Game Pin or Game not active');
      return;
    }
    else {
      //  console.log("Game found..", game)
      // Update the game status to started
      var currentStatus = 'started';
      var startedTime = new Date();
      var result = await GameService.updateWithGamePin(gamePin,
        { currentStatus: "running", startedTime });

      if (!result) {
        socket.emit('error', 'Game not found or already started');
        console.log("Error while updating the game ", result)
        return;
      }
      else {
        console.log("Game updated.... ",game.result.quizId)
      }

      const quizDetails = await QuizService.getQuizDetailsById(game.result.quizId);
      //console.log("Quiz details of game...",quizDetails)

       quizQuestions = await QuizService.getQuestionsByQuizIdAndLanguageCode(game.result.quizId,quizDetails.result.primaryLanguageCode)
    }
    // Join the game room
    //console.log("Joining Game room... with questions ",quizQuestions);
    const gameRoomKey = getGameRoomKey(gamePin);
    socket.join(gameRoomKey); // Ensure the socket joins the game room
    // Emit the event to players in the room
    io.to(gameRoomKey).emit('action-response',
      { actionType: 'GAME_STARTED', message: "successfully started game" });

    socket.emit('action-response',
        { actionType: 'GAME_STARTED', message: "Successfully started the new game" });
    console.log(`Game ${gameRoomKey} started`);

    const redisApi = createRedisApi(redisClient);
    redisApi.resetScores(gamePin)

    getGameRooms(io)
    console.log("Sending info to start the game to redisClient on game-channel");
    var request = { action:"start", gamePin, data:{questions: quizQuestions.result} }
    sendMessageToGameChannel(redisClient,request);

  } catch (err) {
    console.error('Error starting game:', err);
    socket.emit('error', 'Error starting the game');
  }
};

// Function to send a message to a Redis channel
function sendMessageToGameChannel(redisClient,message) {
  const channelName = 'game-channel';
  const requestMessageJson = JSON.stringify(message)

  redisClient.publish(channelName, requestMessageJson, (err, reply) => {
    if (err) {
      console.error('Error publishing message:', err);
    } else {
      console.log(`Message sent to channel ${channelName}. Number of subscribers: ${reply}`);
    }
  });
}

// Function to send a message to a Redis channel
function sendMessageToSocketRoom(socket,{gamePin,message}) {
  //var request = { action:"start", gamePin, data:{questions: quizQuestions.result} }
  const requestMessageJson = JSON.stringify(message)
  const gameRoomKey = getGameRoomKey(gamePin)
  socket.to(gameRoomKey).emit(`${message.action}`, message.data);
}

const sendQuestion = (socket, { question, gamePin }) => {
  const gameRoomKey = getGameRoomKey(gamePin)
  socket.to(gameRoomKey).emit('NEW_QUESTION', question);
};

const receiveAnswer = async (socket,  redisClient, io,{
   playerId,
  score,
  timeTaken,
  gamePin }) => {
  // Calculate score and time taken for the player and store in Redis
  const redisApi = createRedisApi(redisClient);
  const calcScore = calculateScore(score,timeTaken);
  console.log("receiveAnswer:(score,calcScore)",score,calcScore)
  await redisApi.incrementPlayerScore(gamePin, playerId,calcScore );
  const latestScore = await fetchPlayerScore(redisClient,gamePin,playerId)
  await socket.emit('action-response',
     { message:{actionType:'ANSWER_RECEIVED',
       data:{playerId, latestScore }
     }});
  await sendLeaderboard(io,socket,redisClient,gamePin)
};

const fetchPlayerScore = async (redisClient,gamePin, playerId) => {
  try {
    const redisApi = createRedisApi(redisClient);
    const score = await redisApi.getPlayerScore(gamePin, playerId);
    if (score === null) {
      console.log(`Player ${playerId} does not exist in game ${gamePin}.`);
    } else {
      console.log(`Player ${playerId} has a score of ${score} in game ${gamePin}.`);
      return score;
    }
  } catch (err) {
    console.error('fetchPlayerScore:Error fetching player score:', err);
  }
};

const sendLeaderboard = async (io,socket,redisClient,gamePin) => {
  try {
    const redisApi = createRedisApi(redisClient);
    const leaderboard = await redisApi.getLeaderboard(gamePin);
    if (leaderboard === null) {
      console.log(`Leaderboard does not exist for game ${gamePin}.`);
    } else {
      console.log(`Leaderboard  has  scores for game ${gamePin}.`);
      //socket.emit('LEADERBOARD_UPDATE', leaderboard);
      const gameRoomKey = getGameRoomKey(gamePin)
      // Emit the event to players in the room
      io.to(gameRoomKey).emit('LEADERBOARD_UPDATE', leaderboard);
     // return score;
    }
  } catch (err) {
    console.error('fetchPlayerScore:Error fetching player score:', err);
  }
 // const leaderboard = await redisClient.getLeaderboard();
};

const receiveChatMessage = (socket, { playerId, message, gamePin }) => {
  const gameRoom = `game_${gamePin}`;
  socket.to(gameRoom).emit('NEW_CHAT_MESSAGE', { playerId, message });
};

const sendNotification = (socket, { message, gamePin }) => {
  const gameRoom = `game_${gamePin}`;
  socket.to(gameRoom).emit('NOTIFICATION', message);
};

// Utility to calculate score
const calculateScore = (score, timeTaken) => {
  if(score <=0) return 0;
  const timeWeight = 1000; // Adjust this weight based on the importance of time vs marks
  const timePenalty = Math.log(timeTaken + 1) / timeWeight;
  const totalScore = score - timePenalty; // Subtract time penalty from marks scored
  return totalScore;
};

module.exports = {
  joinGame,
  startGame,
  sendQuestion,
  receiveAnswer,
  sendLeaderboard,
  receiveChatMessage,
  sendNotification,
  listPlayersInGameRoom,
  getGameRooms,
  sendMessageToRoom
};

// const marks = 1;
// const timeTaken = 8000;  // in milliseconds
// const timeWeight = 1000;  // You can adjust this
// const timePenalty = Math.log(timeTaken + 1) / timeWeight;
// const totalScore = marks - timePenalty;
