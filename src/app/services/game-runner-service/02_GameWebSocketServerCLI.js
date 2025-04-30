const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SERVER_LOG_FILE = path.join(__dirname, 'server.log');
const SERVER_PID_FILE = path.join(__dirname, 'server.pid');

// Start the server as a background process
function startServer() {
    if (!fs.existsSync(path.join(__dirname, 'gameWebSocketService.js'))) {
        console.error('Server file does not exist: gameWebSocketService.js');
        return;
    }

    const serverProcess = spawn('node', ['gameWebSocketService.js'], {
        detached: true,
        stdio: ['ignore', fs.openSync(SERVER_LOG_FILE, 'a'), fs.openSync(SERVER_LOG_FILE, 'a')] // Log output to file
    });

    serverProcess.unref(); // Allow the parent to exit while the server keeps running

    // Store the process ID (PID) to stop the server later
    fs.writeFileSync(SERVER_PID_FILE, serverProcess.pid.toString(), 'utf8');
    console.log(`Server started with PID ${serverProcess.pid}. Logs are stored in ${SERVER_LOG_FILE}`);

    // Set the process title
    process.title = `WebSocketServer-${serverProcess.pid}`;
    fs.appendFileSync(SERVER_LOG_FILE, `Server started with PID ${serverProcess.pid}. Use 'kill ${serverProcess.pid}' to stop it manually.\n`);
}

// Stop the server by killing the process
function stopServer() {
    if (fs.existsSync(SERVER_PID_FILE)) {
        const pid = fs.readFileSync(SERVER_PID_FILE, 'utf8');
        try {
            process.kill(pid, 'SIGTERM'); // Gracefully terminate the process
            fs.unlinkSync(SERVER_PID_FILE); // Remove the PID file
            console.log(`Server stopped (PID ${pid}).`);
        } catch (error) {
            console.error(`Failed to stop server: ${error.message}`);
        }
    } else {
        console.log('Server is not running.');
    }
}

// Check the status of the server
function checkServerStatus() {
    if (fs.existsSync(SERVER_PID_FILE)) {
        const pid = fs.readFileSync(SERVER_PID_FILE, 'utf8');
        try {
            process.kill(pid, 0); // Check if the process is still running
            console.log(`Server is running (PID ${pid}).`);
        } catch (error) {
            console.log('Server is not running.');
        }
    } else {
        console.log('Server is not running.');
    }
}

// Command-line interface
const action = process.argv[2];

switch (action) {
    case 'start':
        startServer();
        break;
    case 'stop':
        stopServer();
        break;
    case 'status':
        checkServerStatus();
        break;
    default:
        console.log('Usage: node 02_manageWebSocketServerCLI.js <start|stop|status>');
}
