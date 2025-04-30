const LiveGameModel = require('./game.live.model')
const connectMongo = require('../db-connect/dbConnect-mongo.js')
var ArtifactModel = LiveGameModel;

const addPlayerToGame = async (gamePin, playerData) => {
  try {
    await connectMongo();
    const game = await LiveGameModel.findOne({ gamePin });
    if (!game) {
      return {
        status: "error",
        message: "No Game found with the given pin",
        result: {}
      }
    }

    // Check if the player is already in the game to avoid duplicates
    const playerExists = game.players.some(player => player.playerId === playerData.playerId);
    if (playerExists) {
      return {
        status: "success",
        message: "Player is already in the game.",
        result: {},
      };
    }

    game.players.push(playerData); // Add new player to the players array
    await game.save(); // Save the updated game document
    console.log('Player added to game:', game);
    return {
      status: "success",
      message: "Game updated with player",
      result: {}
    }
  } catch (error) {
    console.error('Error adding player:', error);
    return {
      status: "error",
      message: error,
      result: {}
    }
  }
};


// **Get Artifact By gamePin**
async function getByGamePin(reqBody) {
  const { gamePin } = reqBody;
  var Artifact = "LiveGame"
  console.log("GamePin", gamePin)
  var artifactResult = {}
  await connectMongo()
  try {
    artifactResult = await ArtifactModel.findOne({
      gamePin
      // ...queryParams
    })
    if (!artifactResult) {
      console.log(`No ${Artifact} found.`)
      let finalResult = {
        status: 'error',
        result: {},
        message: `No game exist with given gamePin`
      }
      return finalResult
    } else {
      let finalResult = {
        status: 'success',
        result: artifactResult,
        message: `${Artifact}(${gamePin}) retrieved Successfully`
      }
      return finalResult
    }
  } catch (err) {
    console.error(`Error getting live Game:`, err)
    return {
      status: "error",
      result: {},
      message: "Error getting live game "
    }
  }
}



// **Update Artifact for given gamePin**

async function updateWithGamePin(gamePin, updateData) {
  var Artifact = "LiveGame"
  await connectMongo()
  try {
    // Find and update the document using gamePin
    const updatedArtifact = await ArtifactModel.findOneAndUpdate(
      { gamePin },         // Query to find the document by gamePin
      { $set: updateData }, // Set the updated fields
      { new: true }         // Option to return the updated document
    );

    if (!updatedArtifact) {
      console.error(`${Artifact}` + 'not found for update.')
      return { status: 'error', result: null, message: `${Artifact}` + 'not found for update.' }
    }
    return { status: 'success', result: updatedArtifact, message: `${Artifact}` + ' updarted Successfully' }

  } catch (err) {
    console.error('Error updating `${Artifact}`:', err)
    //return ApiResponseUtils.sendErrorResponse(err.message)
  }
}

module.exports = { addPlayerToGame, getByGamePin, updateWithGamePin }
