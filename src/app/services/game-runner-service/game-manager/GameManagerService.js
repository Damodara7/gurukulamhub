const Redis = require('ioredis');
const { io } = require('socket.io-client'); // Ensure you're using socket.io-client

class GameManager {
  runningProcess = null;

  setRunningProcess(proc) {
    this.runningProcess = proc;
  }

   getGameRoomKey = (gameRoomId) => {
    return `gameRoom:${gameRoomId}`;
  }

  constructor(socket) {
    if (!GameManager.instance) {
      this.games = []; // Stores multiple games
      this.socket = socket;
      console.log("GameManager:Instance:Created");
      GameManager.instance = this; // Store the singleton instance
    }
    return GameManager.instance; // Return the singleton instance
  }

  findGameIndex(gamePin) {
    return this.games.findIndex(game => game.gamePin === gamePin);
  }

  // Add or start a new game
  startGame(gamePin, questions) {
    const gameIndex = this.findGameIndex(gamePin);

    if (gameIndex === -1) {
      // Add the game to the list if it doesn't already exist
      this.games.push({
        gamePin,
        questions,
        currentQuestionIndex: 0,
        status: 'live', // Indicate that the game is live
        isPaused: false,
        questionInterval: null,
      });
      console.log(`Game with pin ${gamePin} started. gameCount:`,this.games.length);
     // this.sendNextQuestion(gamePin,questions);
      this.startQuizWithDelay(gamePin,questions)
    }
    else {
      console.log("Game count now:",this.games.length)
      console.log("Removing  previous game..");
      this.stopGame(gamePin);
      console.log("Game count now:",this.games.length)
      console.log("Starting game now..")
      this.startGame(gamePin,questions);
    }
  }

  // Function to initiate the quiz
 startQuizWithDelay = (gamePin,questions) => {
  // Wait for 10 seconds before starting the quiz
  console.log("Game Starts in 10 Seconds..")
  const gameRoomKey = this.getGameRoomKey(gamePin)
  this.socket.emit('ROOM:GAME_STARTING',gameRoomKey,"GAME_STARTING:"+Date.now());
  setTimeout(() => {
    this.sendNextQuestion(gamePin,questions)  // Call the sendNextQuestion function after the delay
  }, 13000); // 13,000 milliseconds = 11 seconds initial delay...
}

  // Pause a running game
  pauseGame(gamePin) {
    const gameIndex = this.findGameIndex(gamePin);
    if (gameIndex !== -1) {
      this.games[gameIndex].isPaused = true;
      clearTimeout(this.games[gameIndex].questionInterval);
      console.log(`Game with pin ${gamePin} paused.`);
    } else {
      console.error(`Game with pin ${gamePin} not found.`);
    }
  }

  // Resume a paused game
  resumeGame(gamePin) {
    const gameIndex = this.findGameIndex(gamePin);
    if (gameIndex !== -1 && this.games[gameIndex].isPaused) {
      this.games[gameIndex].isPaused = false;
      this.sendNextQuestion(gamePin);
      console.log(`Game with pin ${gamePin} resumed.`);
    } else {
      console.error(`Game with pin ${gamePin} is not paused or not found.`);
    }
  }
  // Sends the next question to the game room
  sendNextQuestion(gamePin,questions) {
    const gameIndex = this.findGameIndex(gamePin);
    if (gameIndex !== -1 && !this.games[gameIndex].isPaused) {
      const game = this.games[gameIndex];
      const { questions, currentQuestionIndex } = game;
      const gameRoomName = this.getGameRoomKey(gamePin)
      if (currentQuestionIndex < questions.length ) {
        const timerInterval = questions[currentQuestionIndex].timerSeconds ?
        questions[currentQuestionIndex].timerSeconds : 10000;

        // Ensure io is defined and connected properly
        if (this.socket) {
          console.log("Sending Question.",currentQuestionIndex)
          this.socket.emit('ROOM:SEND_QUESTION',
            gameRoomName,
            questions[currentQuestionIndex],
            currentQuestionIndex,
            Date.now()
          );

          console.log( "GameManagerService: Sending test chat message directly...");
           var request = { "from":"GameManagerService",
            "message":"Test Chat Message:" } ;
           this.socket.emit('ROOM:CHAT',
              gameRoomName,
                  request
            )
        } else {
          console.error('Socket.io is not initialized.');
        }

        game.currentQuestionIndex++;
        game.questionInterval = setTimeout(() => this.sendNextQuestion(gamePin,questions), timerInterval); // seconds interval
      } else {
        clearTimeout(game.questionInterval);
        console.log(`Game with pin ${gamePin} has completed all questions.`);
        if (this.socket) {
          console.log("All Questions completed..")
          this.socket.emit('ROOM:GAME_COMPLETED',
            gameRoomName,"GAME_OVER");
          this.stopGame(gamePin)
        } else {
          console.error('Socket.io is not initialized.');
        }
      }
    }
  }

  stopGame(gamePin) {
    const gameIndex = this.findGameIndex(gamePin);
    if (gameIndex !== -1) {
      clearTimeout(this.games[gameIndex].questionInterval);
      this.games.splice(gameIndex, 1); // Remove the game from the list
      console.log(`Game with pin ${gamePin} stopped.`);
    } else {
      console.error(`Game with pin ${gamePin} not found.`);
    }
  }

  // Remove a game by gamePin and gameId (or other unique identifier)
  removeGame(gamePin, gameId) {
    this.games = this.games.filter(game => !(game.gamePin === gamePin && game.id === gameId));
    console.log(`Game with pin ${gamePin} and ID ${gameId} removed.`);
  }


  // Add a new game
  addGame(game) {
    const existingLiveGame = this.getLiveGame(game.gamePin);
    if (existingLiveGame) {
      throw new Error(`A live game with pin ${game.gamePin} already exists.`);
    }
    this.games.push(game);
  }

  // Get all games with the same gamePin
  getGamesByPin(gamePin) {
    return this.games.filter(game => game.gamePin === gamePin);
  }

  // Get the live game by gamePin
  getLiveGame(gamePin) {
    return this.games.find(game => game.gamePin === gamePin && game.status === 'live');
  }

  // Update a game by gamePin and a unique identifier (e.g., gameId)
  updateGame(gamePin, gameId, updateData) {
    const game = this.games.find(g => g.gamePin === gamePin && g.id === gameId);
    if (game) {
      // Prevent multiple live games with the same pin
      if (updateData.status === 'live') {
        const existingLiveGame = this.getLiveGame(gamePin);
        if (existingLiveGame && existingLiveGame.id !== gameId) {
          throw new Error(`A live game with pin ${gamePin} already exists.`);
        }
      }
      Object.assign(game, updateData);
    } else {
      throw new Error(`Game with id ${gameId} not found.`);
    }
  }


  // Get all games (for debugging or admin view)
  getAllGames() {
    return this.games;
  }
}


// // Redis setup
// const redis = new Redis({
//   host: 'localhost', // Your Redis server host
//   port: 6379,        // Your Redis server port
// });

const subscriber = new Redis({
  host: 'localhost', // Your Redis server host
  port: 6379,        // Your Redis server port
});

const socketServerUrl = "http://localhost:4000"; // Replace with your socket server URL

const socket = io(socketServerUrl,
  { query: { connectionId:"GameManagerService" } }
);

socket.on('connect', () => {
  console.log('GameManagerService: Connected as client to socket server:', socket.id);
});

socket.on('disconnect', () => {
  console.log('GameManagerService: Disconnected from socket server');
});

//const publisher = redis; // Use the same Redis instance for publishing

subscriber.on('connect', (e) => {
  console.log("GameManagerService: connected to client to redis server.")
})

subscriber.on('error', (err) =>
  console.log('"GameManagerService: Redis Client Error', err));

// Subscribe to the Redis channel
subscriber.subscribe('game-channel', (err, count) => {
  if (err) {
    console.error('Failed to subscribe to Redis channel:', err);
  } else {
    console.log(`GameManagerService: Subscribed to ${count} (game-channel) channel(s).`);
  }
});

// Handle incoming messages
subscriber.on('message', (channel, message) => {
  console.log("GameManagerService: Current Process id is :",process.pid)
  console.log(`GameManagerService: RedisSubscriberClient(onMessage): Received message from ${channel}: ${message}`);
  let parsedMessage;
  try {
    parsedMessage = JSON.parse(message);
  } catch (error) {
    console.error('RedisSubscriberClient(onMessage): Failed to parse message as JSON:', error);
    return;
  }

  const { action, gamePin, data, senderId } = parsedMessage;
  console.log("SenderId:",senderId)
 // Redis client to send the

  switch (action) {
    case 'start':
      console.log("RedisSubscriberClient:invoking GameManager.startGame")
      gameManager.startGame(gamePin, data.questions);
      break;
    case 'pause':
      gameManager.pauseGame(gamePin);
      break;
    case 'resume':
      gameManager.resumeGame(gamePin);
      break;
    case 'stop':
      gameManager.stopGame(gamePin);
      break;
    default:
      console.log('Unknown action:', action);
  }
});

console.log("GameManagerService: Process pid is:",process.pid)

const gameManager = new GameManager(socket);
//Object.freeze(gameManager); // Prevent modification of the instance
module.exports = gameManager;
