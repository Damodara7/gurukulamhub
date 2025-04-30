const { exec } = require('child_process');
const os = require('os');
const readline = require('readline');
const { spawn } = require('child_process');


// Create a readline interface to interact with the user
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Display the menu of options
function displayMenu() {
  console.log('Select an option:');
  console.log('1. Start Redis');
  console.log('2. Stop Redis');
  console.log('3. Check Redis status');
  console.log('4. Exit');

  rl.question('Enter your choice (1-4): ', (choice) => {
    handleUserChoice(choice);
  });
}

// Handle the user's selection
function handleUserChoice(choice) {
  switch (choice) {
    case '1':
      startRedis();
      break;
    case '2':
      stopRedis();
      break;
    case '3':
      checkRedis();
      break;
    case '4':
      console.log('Exiting...');
      rl.close(); // Close the readline interface
      break;
    default:
      console.log('Invalid choice. Please enter a number between 1 and 4.');
      displayMenu(); // Show the menu again for valid input
  }
}

// Function to start Redis based on the platform
function startRedis() {
  const platform = os.platform();

  //
  //Check redis status
  //  redis-cli ping
  // ps aux | grep redis


  if (platform === 'win32') {
    // If the platform is Windows, use WSL to start Redis
    //const startRedis = spawn('wsl', ['redis-server', '--daemonize', 'yes']);

    // Pipe stdin for interaction if needed (useful for commands requiring password)
    //process.stdin.pipe(startRedis.stdin);

    // // Capture stdout data
    // startRedis.stdout.on('data', (data) => {
    //   console.log(`stdout: ${data}`);
    // });

    // // Capture stderr data (for any errors)
    // startRedis.stderr.on('data', (data) => {
    //   console.error(`stderr: ${data}`);
    // });

    // // Handle when the process exits
    // startRedis.on('close', (code) => {
    //   console.log(`Redis process exited with code ${code}`);
    //   displayMenu(); // Display the menu again after the process finishes
    // });

    exec('wsl redis-server --daemonize yes', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting Redis on WSL: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }

      console.log('Redis started successfully on WSL');
      console.log(`stdout: ${stdout}`);
      return;
    }).on('close', (code) => {
      console.log(`Process exited with code ${code}`);
      displayMenu();
    });

  } else if (platform === 'linux') {
    // If the platform is Linux, start Redis directly
    exec('sudo redis-server --daemonize yes', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error starting Redis on Linux: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }

      console.log('Redis started successfully on Linux');
      console.log(`stdout: ${stdout}`);
    });
  } else {
    console.log('Unsupported platform');
  }
}


// Function to stop Redis based on the platform
function stopRedis() {
  const platform = os.platform();

  if (platform === 'win32') {
    // If the platform is Windows (WSL), use Redis CLI in WSL to stop Redis
    exec('wsl redis-cli shutdown', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error stopping Redis on WSL: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }

      console.log('Redis stopped successfully on WSL');
    }).on('close', (code) => {
      console.log(`process exited with code ${code}`);
      displayMenu();
    });
  } else if (platform === 'linux') {
    // If the platform is Linux, stop Redis directly using Redis CLI
    exec('sudo redis-cli shutdown', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error stopping Redis on Linux: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }

      console.log('Redis stopped successfully on Linux');
      console.log(`stdout: ${stdout}`);
    });
  } else {
    console.log('Unsupported platform');
  }
}


// Function to check if Redis is running
function checkRedis() {
  const platform = os.platform();

  if (platform === 'win32') {
    // If the platform is Windows (WSL), check Redis status using Redis CLI in WSL
    exec('wsl redis-cli ping', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error checking Redis on WSL: ${error.message}`);
        return;
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }

      if (stdout.trim() === 'PONG') {
        console.log('Redis is up and running on WSL');
      } else {
        console.log('Redis is not running on WSL');
      }
    }).on('close', (code) => {
      console.log(`Process exited with code ${code}`);
      displayMenu();
    });
  } else if (platform === 'linux') {
    // If the platform is Linux, check Redis status using Redis CLI
    exec('redis-cli ping', (error, stdin, stdout, stderr) => {
      if (error) {
        console.error(`Error checking Redis on Linux: ${error.message}`);
        displayMenu();
      }

      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }

      //if (stdout.trim() === 'PONG') {
       // console.log('Redis is up and running on Linux');
       // stdin.write('your-password-here\n');
       // return

        //return
      //} else {
       // console.log('Redis is not running on Linux');
       // return
      //}
    }).on('close', (code) => {
      console.log(`Process exited with code ${code}`);
      displayMenu();
    });
  } else {
    console.log('Unsupported platform');
  }
}

//display the menu
displayMenu();
