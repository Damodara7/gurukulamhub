const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');


// File to store the PID of the game manager process
const pidFilePath = path.join(__dirname, 'gameManager.pid');
const logFilePath = path.join(__dirname, 'gameManager.log');

// Function to start the game manager
const startGameManager = () => {
  if (fs.existsSync(pidFilePath)) {
    console.log('Game Manager is already running. Use "stop" to stop the existing process first.');
    return;
  }

  const gameManagerProcess = spawn('node', ['gameManagerService.js'], {
    detached: true,
    stdio: ['ignore', fs.openSync(logFilePath, 'a'), fs.openSync(logFilePath, 'a')] // Log output to file
  });

  // Write the PID to a file for later use
  fs.writeFileSync(pidFilePath, gameManagerProcess.pid.toString(), 'utf8');
  gameManagerProcess.unref(); // Detach the process, so it continues running in the background
  console.log(`Game Manager started with PID: ${gameManagerProcess.pid}`);
};

// Function to stop the game manager
const stopGameManager = () => {
  if (!fs.existsSync(pidFilePath)) {
    console.log('No Game Manager is currently running.');
    return;
  }

  const pid = fs.readFileSync(pidFilePath, 'utf8');
  try {
    process.kill(pid, 'SIGTERM'); // Gracefully terminate the process
    fs.unlinkSync(pidFilePath); // Remove the PID file
    console.log(`Game Manager process with PID ${pid} stopped successfully.`);
  } catch (error) {
    if (error.code === 'ESRCH') {
      console.error(`Process with PID ${pid} does not exist.`);
    } else {
      console.error(`Failed to stop the Game Manager: ${error.message}`);
    }
  }
};

// Parse command-line arguments to determine whether to start or stop the game manager
const command = process.argv[2];

if (command === 'start') {
  startGameManager();
} else if (command === 'stop') {
  stopGameManager();
} else {
  console.log('Usage: node 03_gameManagerCLI.js [start|stop]');
}
