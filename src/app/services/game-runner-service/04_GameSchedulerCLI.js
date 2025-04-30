const readline = require('readline');
const connectMongo = require('./db-connect/dbConnect-mongo.js');
const GameScheduler = require('./game-scheduler/GameSchedulerDaemonService.js');

const { spawn, fork } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCHEDULER_SCRIPT = path.join(__dirname, 'schedulerDaemon.js');
const SCHEDULER_LOG_FILE = path.join(__dirname, 'scheduler.log');
const SCHEDULER_PID_FILE = path.join(__dirname, 'scheduler.pid');
var schedulerProcess = null;
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Connect to MongoDB
async function connectToDatabase() {
  try {
    await connectMongo();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error); 
    process.exit(1); // Exit if unable to connect
  }
}

// Start the scheduler process and log the output
function startScheduler() {

  if (GameScheduler.isSchedulerActive()) {
    console.log(`Scheduler is already running with PID: ${fs.readFileSync(SCHEDULER_PID_FILE, 'utf8')}`);
    return;
  }

  const out = fs.openSync(SCHEDULER_LOG_FILE, 'a');
  const err = fs.openSync(SCHEDULER_LOG_FILE, 'a');

  schedulerProcess = fork('gameSchedulerService', [], { // Replace with your scheduler file
    detached: true,
    stdio: ['ignore',
      fs.openSync(SCHEDULER_LOG_FILE, 'a'),
      fs.openSync(SCHEDULER_LOG_FILE, 'a'),
      'ipc'] // Log output to file
  });

  schedulerProcess.unref(); // Allow the parent to exit while the scheduler keeps running

  // Store the process ID (PID) to stop the scheduler later
  console.log(`Scheduler started with PID ${schedulerProcess.pid}. Logs are stored in ${SCHEDULER_LOG_FILE}`);

}

// Stop the scheduler by killing the process
const stopScheduler = async () => {

  if (schedulerProcess) {
    await schedulerProcess.send('stop'); // Send stop command to the scheduler
    console.log('Stop command sent to the scheduler.');
  } else {
    console.log("schedulerProcess is null, not sending stop message.");
  }


  if (fs.existsSync(SCHEDULER_PID_FILE)) {
    const pid = fs.readFileSync(SCHEDULER_PID_FILE, 'utf8');
    try {
      process.kill(pid, 'SIGTERM'); // Gracefully terminate the process
      fs.unlinkSync(SCHEDULER_PID_FILE); // Remove the PID file
      console.log(`Scheduler stopped (PID ${pid}).`);
      console.log(`Scheduler Service Status.`, GameScheduler.isSchedulerActive());

    } catch (error) {
      console.error(`Failed to stop scheduler: ${error.message}`);
    }
  } else {
    console.log('Scheduler is not running.');
  }
}

// Check the status of the scheduler
function checkSchedulerStatus() {
  if (fs.existsSync(SCHEDULER_PID_FILE)) {
    const pid = fs.readFileSync(SCHEDULER_PID_FILE, 'utf8');
    try {
      process.kill(pid, 0); // Check if the process is still running
      console.log(`Scheduler process is running (PID ${pid}).`);
      console.log(`Scheduler Service Status.`, GameScheduler.isSchedulerActive());

      return true;
    } catch (error) {
      console.log('Scheduler is not running.');
      fs.unlinkSync(SCHEDULER_PID_FILE); // Clean up stale PID file
      return false;
    }
  } else {
    console.log('Scheduler is not running.');
    return false;
  }
}

// Update status in MongoDB
async function updateSchedulerStatus() {
  const isActive = checkSchedulerStatus();
  const status = isActive ? 'alive' : 'inactive';

  // Update the status in MongoDB here
  // Assuming you have a model to update, replace `SchedulerModel` with your actual model
  //await SchedulerModel.updateOne({ /* your criteria */ }, { status }); // Adjust criteria as necessary
}

// Start the menu interface
main().catch(console.error);

// Display menu
function displayMenu() {
  console.log(`
  Menu:
  1) Start Scheduler
  2) Stop Scheduler
  3) Show Scheduler Status
  4) Exit
  `);
}

// Main function to handle user input
async function main() {
  await connectToDatabase();

  // Update status every 2 minutes
  setInterval(async () => {
    await updateSchedulerStatus();
  }, 120000); // 120000 milliseconds = 2 minutes

  while (true) {
    displayMenu();
    const answer = await new Promise(resolve => rl.question('Select an option: ', resolve));

    switch (answer) {
      case '1':
        startScheduler();
        break;
      case '2':
        //if(schedulerProcess) childProcess.stdin.write('stop\n');
        stopScheduler();
        break;
      case '3':
        checkSchedulerStatus();
        break;
      case '4':
        console.log('Exiting...');
        rl.close();
        return;
      default:
        console.log('Invalid option. Please try again.');
    }
  }
}
