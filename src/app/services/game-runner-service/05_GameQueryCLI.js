const readline = require('readline');
const connectMongo = require('./db-connect/dbConnect-mongo.js');
const GamesActive = require('./db-connect/game.active.model.js');
const GamesLive = require('./db-connect/game.live.model.js');
const GamesArchive = require('./db-connect/game.archive.model.js');
const Users = require('./db-connect/user.model.js'); // Import your user model

const quizService = require("./db-connect/quizService.js")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Connect to MongoDB
async function connectToDatabase() {
  await connectMongo();
}

// Show live games with player count
async function showLiveGames() {
  try {
    const liveGames = await GamesLive.find({}); // Fetch all live games

    if (liveGames.length === 0) {
      console.log("No live games found.");
      return;
    }

    console.log("Live Games:");
    liveGames.forEach(game => {
      const playerCount = game.players.length; // Get the player count from the players array
      console.log(`Game Pin: ${game.gamePin}, Status: ${game.gameStatus}, Current Status: ${game.currentStatus}, Game Name: ${game.title}, Game ID: ${game._id}, Quiz ID: ${game.quizId}, Player Count: ${playerCount}`);
    });
  } catch (error) {
    console.error("Error retrieving live games:", error);
  }
}


// Show active games
async function showActiveGames() {
  const activeGames = await GamesActive.find({});
  console.log("Active Games:");
  activeGames.forEach(game => {
    console.log(`Game Pin: ${game.gamePin}, Status: ${game.gameStatus},  currStatus: ${game.currentStatus} ,GameName: ${game.title} , GameId: ${game._id}, QuizId: ${game.quizId}`);
  });
}

// Show archived games
async function showArchivedGames() {
  const archivedGames = await GamesArchive.find({});
  console.log("Archived Games:");
  archivedGames.forEach(game => {
    console.log(`Game Pin: ${game.gamePin}, Status: ${game.gameStatus}`);
  });
}

// Start a game with a given gamePin
async function startGameWithPin(gamePin) {
  const now = new Date();

  // Find the game by the given gamePin
  const game = await GamesLive.findOne({ gamePin });

  if (!game) {
    console.log(`No game found with pin: ${gamePin}`);
    return;
  }

  // Check if the game is already started or running
  if (game.currentStatus === "running") {
    console.log(`Game with pin: ${gamePin} is already running.`);
    return;
  }

  // Update the game status to 'running' and set the start time
  game.currentStatus = "running";
  game.startedTime = now;

  try {
    await game.save();
    console.log(`Game with pin: ${gamePin} has started.`);
  } catch (error) {
    console.error(`Error starting the game with pin: ${gamePin}`, error);
  }
}


// Show awaiting start games
async function showAwaitingStartGames() {
  const now = new Date();
  const awaitingStartGames = await GamesLive.find({
    //startDate: { $gte: now },
    gameStatus: "live",
    $or: [
      { currentStatus: { $exists: false } }, // currentStatus is undefined
      { currentStatus: "pending" }           // currentStatus is set to 'pending'
    ]
  });
  console.log("Awaiting Start Games:");
  awaitingStartGames.forEach(game => {
    console.log(`Game Pin: ${game.gamePin}, Start Date: ${game.startDate}`);
  });
}


// Pause a game with a given gamePin
async function pauseGameWithPin(gamePin) {
  // Find the game by the given gamePin
  const game = await GamesLive.findOne({ gamePin });

  if (!game) {
    console.log(`No game found with pin: ${gamePin}`);
    return;
  }

  // Check if the game is already paused
  if (game.currentStatus === "paused") {
    console.log(`Game with pin: ${gamePin} is already paused.`);
    return;
  }

  // Check if the game is running
  if (game.currentStatus !== "running") {
    console.log(`Game with pin: ${gamePin} is not running, so it cannot be paused.`);
    return;
  }

  // Update the game status to 'paused'
  game.currentStatus = "paused";

  try {
    await game.save();
    console.log(`Game with pin: ${gamePin} has been paused.`);
  } catch (error) {
    console.error(`Error pausing the game with pin: ${gamePin}`, error);
  }
}


// Resume a game with a given gamePin
async function resumeGameWithPin(gamePin) {
  // Find the game by the given gamePin
  const game = await GamesLive.findOne({ gamePin });

  if (!game) {
    console.log(`No game found with pin: ${gamePin}`);
    return;
  }

  // Check if the game is already running
  if (game.currentStatus === "running") {
    console.log(`Game with pin: ${gamePin} is already running.`);
    return;
  }

  // Check if the game is paused
  if (game.currentStatus !== "paused") {
    console.log(`Game with pin: ${gamePin} is not paused, so it cannot be resumed.`);
    return;
  }

  // Update the game status to 'running'
  game.currentStatus = "running";

  try {
    await game.save();
    console.log(`Game with pin: ${gamePin} has been resumed.`);
  } catch (error) {
    console.error(`Error resuming the game with pin: ${gamePin}`, error);
  }
}


// List paused games
async function listPausedGames() {
  const pausedGames = await GamesLive.find({ gameStatus: 'live', currentStatus: 'paused' });
  console.log("Paused Games:");
  pausedGames.forEach(game => {
    console.log(`Game Pin: ${game.gamePin}`);
  });
}

// Stop a game with a given gamePin (without archiving)
async function stopGameWithPin(pin) {
  // Find the game in the live collection by gamePin
  const game = await GamesLive.findOne({ gamePin: pin });

  if (!game) {
    console.log(`No live game found with pin: ${pin}`);
    return;
  }

  // Update the game status to 'stopped'
  game.currentStatus = 'stopped';
  game.completedTime = new Date(); // Record the exact time the game was stopped


  try {
    // Save the status update
    await game.save();
    console.log(`Game ${pin} has been stopped.`);
  } catch (error) {
    console.error(`Error stopping the game with pin: ${pin}`, error);
  }
}

// Archive a game with a given gamePin (after stopping)
async function archiveGameWithPin(pin) {
  // Find the stopped game in the live collection by gamePin
  const game = await GamesLive.findOne({ gamePin: pin, currentStatus: 'stopped' });

  if (!game) {
    console.log(`No stopped game found with pin: ${pin}`);
    return;
  }

  try {
    // Update the status to 'archive'
    const gameClone = game.toObject(); // Convert mongoose document to plain JS object
    gameClone.gameStatus = 'archive'; // Set the status to archive

    // Move the game to the archive collection
    const archivedGame = new GamesArchive(gameClone);
    await archivedGame.save();

    // Delete the game from the live collection
    await GamesLive.deleteOne({ _id: game._id });

    console.log(`Game ${pin} has been archived.`);
  } catch (error) {
    console.error(`Error archiving the game with pin: ${pin}`, error);
  }
}

// Check if a gamePin is valid and the game is joinable
async function isGameJoinable(gamePin) {
  try {
    // Find the game in the live collection with 'live' status and not stopped
    const game = await GamesLive.findOne({
      gamePin: gamePin,
      gameStatus: 'live',
      currentStatus: { $ne: 'stopped' } // Check that currentStatus is not 'stopped'
    });

    if (!game) {
      console.log(`Game with pin ${gamePin} is not available for joining.`);
      return {
        joinable: false,
        details: null // No details available
      };
    }

    // Derive playerCount from the length of the players array
    const playerCount = game.players ? game.players.length : 0; // Ensure players array exists

    // Construct the result object with game details
    const result = {
      joinable: true,
      details: {
        gameName: game.title, // Assuming the game document has a field 'gameName'
        currentStatus: game.currentStatus,
        startedTime: game.startedTime, // Assuming the game document has a field 'startedTime'
        playerCount: playerCount, // Derived from players array
        playerLimit: game.playerLimit // Assuming the game document has a field 'playerLimit'
      }
    };

    // Game found and joinable
    console.log(`Game with pin ${gamePin} is joinable.`);
    return result;
  } catch (error) {
    console.error(`Error checking game pin ${gamePin}:`, error);
    return {
      joinable: false,
      details: null // Return null details on error
    };
  }
}

// Join a game with gamePin and playerId (email)
async function joinGame(gamePin, playerId) {
  try {
    // Validate the playerId (email) in the user table
    const user = await Users.findOne({ email: playerId, isVerified: true, isActive: true });

    if (!user) {
      console.log(`Player ID ${playerId} is not verified or active.`);
      return { success: false, message: 'Player ID is not verified or active.' };
    }

    // Find the game in the live collection
    const game = await GamesLive.findOne({ gamePin: gamePin, gameStatus: 'live', currentStatus: { $ne: 'stopped' } });

    if (!game) {
      console.log(`Game with pin ${gamePin} is not available for joining.`);
      return { success: false, message: 'Games are not available.' };
    }

    console.log("Players..", game.players)
    // Check if the player is already in the game
    const playerExists = game.players.some(player => player.playerId === playerId);
    if (playerExists) {
      console.log(`Player ${playerId} is already in the game.`);
      return { success: false, message: 'Player is already in the game.' };
    }

    // Create a player object to add to the players array
    const newPlayer = {
      // _id: playerId, // If you want to use the email as _id
      playerId: playerId // Assuming you want to store the email as playerId as well
    };

    // Add the player to the players array
    game.players.push(newPlayer);
    await game.save(); // Save the updated game document


    console.log(`Player ${playerId} joined game ${gamePin} successfully.`);
    return { success: true, message: 'Player joined the game successfully.', gameDetails: game };
  } catch (error) {
    console.error(`Error joining game with pin ${gamePin}:`, error);
    return { success: false, message: 'An error occurred while joining the game.' };
  }
}


// Start the menu interface
main().catch(console.error);


// Display menu
function displayMenu() {
  console.log(`
  Menu:
  1) Show live games
  2) Show active games
  3) Show archived games
  4) Show awaiting to start games
  5) Start a game with game pin
  6) Pause a game with game pin
  7) Resume a game with game pin
  8) List paused games
  9) Stop a game with game pin
  10) Archive a Game
  11) Check Joinable GamePin
  12) Join Game with GamePin and PlayerId
  13) Get Quiz Details by _id
  14) Get Quiz Details by quizId
  15) Get Questions by quizId and lang
  16) Get All Questions by QuizId.
  17) Get All Questions by QuizId group by primaryQid.
  18) Get All Primary Questions by QuizId.
  19) Get All Questions including Primary Questions by group by primaryQId.

  `);
}

// Main function to handle user input
async function main() {
  await connectToDatabase();

  while (true) {
    displayMenu();
    const answer = await new Promise(resolve => rl.question('Select an option: ', resolve));

    switch (answer) {
      case '1':
        await showLiveGames();
        break;
      case '2':
        await showActiveGames();
        break;
      case '3':
        await showArchivedGames();
        break;
      case '4':
        await showAwaitingStartGames();
        break;
      case '5':
        const pinToStart = await new Promise(resolve => rl.question('Enter game pin to start: ', resolve));
        await startGameWithPin(pinToStart);
        break;
      case '6':
        const pinToPause = await new Promise(resolve => rl.question('Enter game pin to pause: ', resolve));
        await pauseGameWithPin(pinToPause);
        break;
      case '7':
        const pinToResume = await new Promise(resolve => rl.question('Enter game pin to resume: ', resolve));
        await resumeGameWithPin(pinToResume);
        break;
      case '8':
        await listPausedGames();
        break;
      case '9':
        const pinToStop = await new Promise(resolve => rl.question('Enter game pin to stop: ', resolve));
        await stopGameWithPin(pinToStop);
        break;
      case '10':
        const pinToArchive = await new Promise(resolve => rl.question('Enter game pin to archive: ', resolve));
        await archiveGameWithPin(pinToArchive)
        break;
      case '11':
        const pinToCheck = await new Promise(resolve => rl.question('Enter game pin to check joinable: ', resolve));
        var result = await isGameJoinable(pinToCheck)
        console.log("Result:", result)
        break;
      case '12':
        const quizId2 = await new Promise(resolve => rl.question('Enter game pin to join: ', resolve));
        const playerId = await new Promise(resolve => rl.question('Enter Player Email to join: ', resolve));
        var result = await joinGame(quizId2, playerId)
        console.log("Result:", result)
        break;
      case '13':
        var quizId = await new Promise(resolve => rl.question('Enter quiz _id: ', resolve));
        var result = await quizService.getQuizDetailsById(quizId);
        console.log("Result:", result)
        break;
      case '14':
        var quizId = await new Promise(resolve => rl.question('Enter quiz quizId: ', resolve));
        var result = await quizService.getQuizDetailsByQuizId(quizId);
        console.log("Result:", result)
        break;
      case '15':
        quizId = await new Promise(resolve => rl.question('Enter quiz id: ', resolve));
        var langCode = await new Promise(resolve => rl.question('Enter Language code: ', resolve));
        var result = await quizService.getQuestionsByQuizIdAndLanguageCode(quizId, langCode);
        console.log("Result:", result)
        break;
      case '16':
        quizId = await new Promise(resolve => rl.question('Enter quiz id: ', resolve));
        var result = await quizService.getAllQuestionsByQuizId(quizId);
        console.log("Result:", result)
        break;
      case '17':
        quizId = await new Promise(resolve => rl.question('Enter quiz id:', resolve))
        var result = await quizService.getGroupedQuestionsByQuizIdAndLanguageCode(quizId);
        //console.log("Result:", result)
        console.log("Result:", JSON.stringify(result));
        break;
      case '18':
        quizId = await new Promise(resolve => rl.question('Enter quiz id:', resolve))
        var result = await quizService.getPrimaryQuestionsByQuizId(quizId);
        //console.log("Result:", result)
        console.log("Result:", JSON.stringify(result));
        break;
      case '19':
        quizId = await new Promise(resolve => rl.question('Enter quiz id:', resolve))
        var result = await quizService.getPrimaryQuestionsAndGroupedQuestions(quizId)
        console.log("Result",result);
        console.log("Result:", JSON.stringify(result));
        break;
      case '21':
        console.log('Exiting...');
        rl.close();
        return;
      default:
        console.log('Invalid option. Please try again.');
    }
  }
}


