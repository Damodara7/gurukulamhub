const fs = require('fs');
const path = require('path');
const connectMongo = require('../db-connect/dbConnect-mongo.js');
const GamesActive = require('../db-connect/game.active.model.js');
const GamesLive = require('../db-connect/game.live.model.js');
const GamesArchive = require('../db-connect/game.archive.model.js');

SCHEDULER_LOG_FILE = path.join(__dirname, 'scheduler.log');
SCHEDULER_PID_FILE = path.join(__dirname, 'scheduler.pid');

class GameScheduler {
  static instance = null;
  SCHEDULER_LOG_FILE = path.join(__dirname, 'scheduler.log');
  SCHEDULER_PID_FILE = path.join(__dirname, 'scheduler.pid');
  schedulerIntervalId = null;
  isSchedulerRunning = false;

  constructor() {
    if (GameScheduler.instance) {
      return GameScheduler.instance;
    }
    GameScheduler.instance = this;
  }

  async gameSchedulerDaemon() {
    await connectMongo();
    const now = new Date();
    const isoString = now.toISOString();
    console.log(`Running the gameSchedulerDaemon at ${isoString}`);
    fs.appendFileSync(this.SCHEDULER_LOG_FILE, `Running the gameSchedulerDaemon at ${isoString}\n`);

    try {
      await this.moveGames();
    } catch (e) {
      console.error('Error while moving games:', e);
      fs.appendFileSync(this.SCHEDULER_LOG_FILE, `Error while moving games: ${e}\n`);
    }
  }

  moveGames = async () => {
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
        players: []
      };

      console.log("Game to be cloned", gameNewClone)

      try {
        const gameLive = await new GamesLive(gameNewClone);
        await gameLive.save(); // Create in live collection
        //console.log("-----> Created in Live collection.")
        console.log(`Game ${game._id} moved to live.`);
      } catch (e) {
        console.log("Error moving to live document collection.", e);
        break;
      }

    }

    // Update the expired games to completed...
    // Move games from live to archive
    await this.moveCompletedGamesToArchive();
  };

  moveCompletedGamesToArchive = async () => {
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

  async startGameScheduler() {
    if (this.isSchedulerRunning) {
      console.log('Scheduler is already running.');
      return { success: false, message: 'Scheduler is already running.' };
    }

    try {
      this.schedulerIntervalId = setInterval(() => this.gameSchedulerDaemon(), 20000); // Runs every 20 seconds
      this.isSchedulerRunning = true;
      console.log('Scheduler started successfully.');
      fs.appendFileSync(this.SCHEDULER_LOG_FILE, 'Scheduler started successfully.\n');

      // Write PID to file
      const pid = process.pid;
      fs.writeFileSync(this.SCHEDULER_PID_FILE, pid.toString(), 'utf8');
      console.log(`Scheduler PID: ${pid}`);

      // process.on('message', (message) => {
      //   if (message === 'stop') {
      //     console.log('Received stop command. Stopping the game scheduler...');
      //     this.stopGameScheduler().then(() => {
      //       console.log('After Stopping in GameScheduler: Game scheduler stopped.');
      //       //process.exit(0); // Exit the process
      //     }).catch(err => {
      //       console.error('Error stopping game scheduler:', err);
      //      // process.exit(1); // Exit with an error
      //     });
      //   }
      // });

      //return { success: true, message: 'Scheduler started successfully.' };
      return this.instance;
    } catch (e) {
      console.log('Error while starting scheduler:', e);
      fs.appendFileSync(this.SCHEDULER_LOG_FILE, `Error while starting scheduler: ${e}\n`);
      return { success: false, message: 'Error while starting scheduler.' };
    }
  }

  async stopGameScheduler() {
    if (!this.isSchedulerRunning) {
      console.log('Inside GameScheduler: Scheduler is not running.');
      return { success: false, message: 'Scheduler is not running.' };
    }

    clearInterval(this.schedulerIntervalId);
    this.schedulerIntervalId = null;
    this.isSchedulerRunning = false;
    fs.unlinkSync(this.SCHEDULER_PID_FILE); // Remove the PID file
    console.log('Scheduler stopped successfully.');
    fs.appendFileSync(this.SCHEDULER_LOG_FILE, 'Scheduler stopped successfully.\n');
    return { success: true, message: 'Scheduler stopped successfully.' };
  }

  // isSchedulerActive() {
  //   return this.isSchedulerRunning;
  // }

  isSchedulerActive() {
    try {
      if (fs.existsSync(this.SCHEDULER_PID_FILE)) {
        const pid = parseInt(fs.readFileSync(this.SCHEDULER_PID_FILE, 'utf8'), 10);
        // Check if the process is still running
        try {
          process.kill(pid, 0); // Sending signal 0 checks if the process exists
          return true; // If no error is thrown, the process is running
        } catch (e) {
          // Process does not exist
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking scheduler status:', error);
      return false;
    }
  }

}


// (async () => {
//   const GameSchedulerInstance = new GameScheduler();
//   console.log("** Starting Game Scheduler **");
//   await GameSchedulerInstance.startGameScheduler();
//   console.log("* Started...");
// })();

module.exports = new GameScheduler();

