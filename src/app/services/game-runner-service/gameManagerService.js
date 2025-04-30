//const { setInterval } = require('timers');
const connectMongo = require('./db-connect/dbConnect-mongo')
const mongoose = require('mongoose');
const { setInterval } = require('timers/promises');
const actualGameManagerService = require("./game-manager/GameManagerService")
// Socket.IO Server URL
let socket;
let db;

// Game Manager Schema
const gameManagerSchema = new mongoose.Schema({
  pid: Number,
  serverIp: String,
  gameManagerId: Number,
  lastAlive: { type: Date, default: Date.now }
});



const GameManagerModel = mongoose.models.GameManager || mongoose.model('GameManager', gameManagerSchema);

// Function to check if a Game Manager is already running
const isGameManagerRunning = async () => {
  const runningManager = await GameManagerModel.findOne({});
  return runningManager;
};

// Function to create or update Game Manager
const createOrUpdateGameManager = async (pid, serverIp) => {
  await connectMongo();
  const existingManager = await isGameManagerRunning();
  if (existingManager) {
    console.log('Another game manager is already running.');
    return existingManager;
  } else {
    const gameManagerId = await getNextGameManagerId();
    const newManager = new GameManagerModel({ pid, serverIp, gameManagerId });
    await newManager.save();
    console.log('Game manager started:', newManager);
    return newManager;
  }
};

// Atomic increment for Game Manager ID
const getNextGameManagerId = async () => {
  const counter = await GameManagerModel.countDocuments();
  return counter + 1;
};


// Function to send alive signal to the socket server
const sendAliveSignal = () => {
  if (socket) {
    socket.emit('alive', {
      message: 'Game Manager is alive',
      timestamp: new Date()
    });
  }
};


// Function to persist the alive status to MongoDB
const persistAliveStatus = async (manager) => {
  try {
    manager.lastAlive = new Date();
    await manager.save();
    console.log('Status persisted to MongoDB:', manager);
  } catch (error) {
    console.error('Error persisting alive status to MongoDB:', error);
  }
};

// Main function to manage the game
async function startGameManager() {
  const pid = process.pid;
  const serverIp = '127.0.0.1'; // Replace with actual server IP if needed
 // const gameManagerStatusDoc = await createOrUpdateGameManager(pid, serverIp);

  // setInterval(async () => {
  //   //sendAliveSignal();
  //   await persistAliveStatus(gameManagerStatusDoc);
  // }, 25000);
  console.log("All Games",actualGameManagerService.getAllGames());
}

// Start the game manager
startGameManager().catch(console.error);
