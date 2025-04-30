
const connectMongo = require('../db-connect/dbConnect-mongo.js')
const GamesActive = require('../db-connect/game.active.model.js');
const GamesLive = require('../db-connect/game.live.model.js');
const GamesArchive = require('../db-connect/game.archive.model.js');
const os = require('os-utils'); // For CPU and memory monitoring



async function gameSchedulerDaemon() {
  //console.log("Starting connect...")
  await connectMongo(); // Connect to the database
  const now = new Date();
  const isoString = now.toISOString();
  console.log("Running the gameSchedulerDaemon:", isoString);
  try {
    await moveGames();
  } catch (e) {
    console.log("error while moving games..");
  }
};

const moveGames = async () => {
  const now = new Date();
  // Calculate the time 5 minutes before now
  const fiveMinutesBeforeNow = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes in the future

  // Move games from active to live
  const gamesToLive = await GamesActive.find({ startDate: { $lte: fiveMinutesBeforeNow }, gameStatus: "active" });
  console.log("Games Awaiting live...", gamesToLive.length);
  for (const game of gamesToLive) {
    // Remove from active collection
    console.log("Deleting started.... from active collection.", game)
    try {
      await GamesActive.deleteOne({ _id: game._id });
      console.log("Deleted from active collection.")
    } catch (e) {
      console.log("Error deleting active record..");
      break;
    }
    // Add to live collection
    // Create a copy of the game object to modify before archiving
    const gameNewClone = {
      ...game.toObject(), // Converts mongoose document to plain JS object
      gameStatus: 'live', // Update status
      players:[]
    };

    console.log("Game to be cloned",gameNewClone)

    try {
      const gameLive = await new GamesLive(gameNewClone);
      await gameLive.save(); // Create in live collection
      //console.log("-----> Created in Live collection.")
      console.log(`Game ${game._id} moved to live.`);
    } catch (e) {
      console.log("Error moving to live document collection.",e);
      break;
    }

    // Check system resources before starting the game
    //os.cpuUsage((cpuPercentage) => {
     // const availableMemory = os.freememPercentage();

      //if (cpuPercentage < 0.8 && availableMemory > 0.2) { // Less than 80% CPU and 20% free memory
       // startGame(game);
      //} else {
      //  console.log('Not enough resources to start new game.');
      //}
    //});

  }

  // Updtate the expired games to completed...
  // Move games from live to archive
  await moveCompletedGamesToArchive();
};

async function moveCompletedGamesToArchive() {
  try {
    const now = new Date();

    //Find the live games..
    const LiveGames = await GamesLive.find({});
    console.log("Games in Live Status...", LiveGames.length)


    // Find games where endDateTime is less than the current time or status is 'completed'
    const completedOrExpiredGames = await GamesLive.find({
      $or: [
        { endDateTime: { $lte: now } },  // Games whose end date is in the past
        { gameStatus: 'completed' }       // Games already marked as completed
      ]
    });

    console.log("Games in Completed Status...", completedOrExpiredGames.length)

    for (const game of completedOrExpiredGames) {
      // Update the game status to 'completed'
      game.gameStatus = 'completed';
      await game.save();

      // Move the game to the gamesArchive collection
      const archivedGame = new GamesArchive(game.toObject()); // Copy game data
      await archivedGame.save();

      // Remove the game from the gamesLive collection
      await GamesLive.deleteOne({ _id: game._id });

      console.log(`Moved game ${game._id} to archive.`);
    }

    // console.log('All completed & expired games moved to archive.');
  } catch (error) {
    console.error('Error moving games to archive:', error);
  }
  console.log("------------------------------------------");
}


let schedulerIntervalId = null;  // To store the interval ID
let isSchedulerRunning = false;  // To track if the scheduler is running

// Function to start the scheduler
const startGameScheduler = async () => {
  if (isSchedulerRunning) {
    console.log('Scheduler is already running.');
    return { success: false, message: 'Scheduler is already running.' };
  }

  try {
    schedulerIntervalId = setInterval(gameSchedulerDaemon, 20000); // Runs every 1 minute
    isSchedulerRunning = true;
    console.log('Scheduler started successfully.');
    return { success: true, message: 'Scheduler started successfully.' };
  } catch (e) {
    console.log("Error while starting scheduler:", e);
    return { success: false, message: 'Error while starting scheduler.' };
  }
};

// Function to stop the scheduler
const stopGameScheduler = async() => {
  if (!isSchedulerRunning) {
    console.log('Scheduler is not running.');
    return { success: false, message: 'Scheduler is not running.' };
  }

  clearInterval(schedulerIntervalId);  // Stop the scheduler
  schedulerIntervalId = null;
  isSchedulerRunning = false;
  console.log('Scheduler stopped successfully.');
  return { success: true, message: 'Scheduler stopped successfully.' };
};

// Function to check if the scheduler is running
const isSchedulerActive = () => {
  return isSchedulerRunning;
};

// Example usage:
//startGameScheduler();   // To start the scheduler
//stopGameScheduler();    // To stop the scheduler
//console.log(isSchedulerActive());  // Check if the scheduler is running


// Run every minute
module.exports = {startGameScheduler, stopGameScheduler, isSchedulerActive}


