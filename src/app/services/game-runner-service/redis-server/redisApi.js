//const redisClient = require('./redisClient');

const createRedisApi = (redisClient) => ({


   initializeLeaderboard : async (gamePin) => {
    await redisClient.del(`game:${gamePin}:scores`); // Delete the key to ensure it's empty
  },

//redisClient.zincrby(key, increment, member)
incrementPlayerScore: async (gamePin, playerId, score) => {
  try {
    const key = `game:${gamePin}:scores`;
    const type = await redisClient.type(key);

    if (type !== 'none' && type !== 'zset') {
      console.error(`Key ${key} has the wrong type: ${type}. Resetting...`);
      await redisClient.del(key); // Reset the key if it has the wrong type
    }

    await redisClient.zincrby(key, score, playerId); // Increment score
  } catch (err) {
    console.error(`Error incrementing score for player ${playerId} in game ${gamePin}:`, err);
    throw err;
  }
},


  getLeaderboard: async (gamePin) => {
    const leaderboard = await redisClient.zrevrange(`game:${gamePin}:scores`, 0, -1, 'WITHSCORES');
    return leaderboard.reduce((acc, _, idx) => {
      if (idx % 2 === 0) acc.push({ playerId: leaderboard[idx], score: leaderboard[idx + 1] });
      return acc;
    }, []);
  },

  resetLeaderboard: async (gamePin) => {
    await redisClient.del(`leaderboard:${gamePin}`);
  },

  checkRedisConnection: async () => {
    const result = await redisClient.ping();
    return result === 'PONG';
  },

  storeQuestionsInRedis: async (gamePin, questions) => {
    const redisKey = `quiz:${gamePin}:questions`;
    await redisClient.set(redisKey, JSON.stringify(questions));
    redisClient.expire(redisKey, 3600);
  },

  savePlayerScore: async (gamePin, playerId, score) => {
    await redisClient.hset(`game:${gamePin}:scores`, playerId, score);
  },

  getPlayerScores: async (gamePin) => {
    return await redisClient.hGetAll(`game:${gamePin}:scores`);
  },

  /**
 * Get the top 10 players from the leaderboard.
 * @param {string} gamePin - The unique identifier for the game room.
 * @returns {Promise<Array>} - Resolves with an array of the top 10 players and their scores.
 */
  getTop10Players: async (gamePin) => {
    try {
      // Fetch the top 10 players from the sorted set
      const leaderboard = await redisClient.zrevrange(`leaderboard:${gamePin}`, 0, 9, 'WITHSCORES');

      // Format the leaderboard into an array of objects
      const formattedLeaderboard = [];
      for (let i = 0; i < leaderboard.length; i += 2) {
        formattedLeaderboard.push({
          playerId: leaderboard[i],
          score: parseFloat(leaderboard[i + 1]),
        });
      }

      return formattedLeaderboard;
    } catch (err) {
      console.error(`Error fetching top 10 players for game ${gamePin}:`, err);
      throw err;
    }
  },

  sendQuestionsToPlayers: async (gamePin, socket) => {
    try {
      const redisKey = `quiz:${gamePin}:questions`;
      const data = await redisClient.get(redisKey);
      if (!data) throw new Error('No questions found');

      const questions = JSON.parse(data);
      let currentIndex = 0;

      const sendNextQuestion = () => {
        if (currentIndex >= questions.length) {
          socket.to(`game_${gamePin}`).emit('QUIZ_COMPLETED');
          return;
        }

        const question = questions[currentIndex];
        socket.to(`game_${gamePin}`).emit('NEW_QUESTION', question);

        setTimeout(() => {
          currentIndex++;
          sendNextQuestion();
        }, question.timeLimit * 1000);
      };

      sendNextQuestion();
    } catch (err) {
      socket.emit('error', 'Failed to send questions to players');
      console.error(err);
    }
  },

  resetScores: async (gamePin) => {
    try {
      // Delete the sorted set for the game's scores
      await redisClient.del(`game:${gamePin}:scores`);
      console.log(`Scores for game ${gamePin} have been reset.`);
    } catch (err) {
      console.error(`Error resetting scores for game ${gamePin}:`, err);
      throw err;
    }
  },

  getPlayerScore: async (gamePin, playerId) => {
    try {
      const score = await redisClient.zscore(`game:${gamePin}:scores`, playerId);
      console.log("getPlayerScore:",score,playerId)
      return score !== null ? parseFloat(score) : null; // Return `null` if the player doesn't exist
    } catch (err) {
      console.error(`Error fetching score for player ${playerId} in game ${gamePin}:`, err);
      throw err;
    }
  },
// Save leaderboard in a cache
 cacheLeaderboard : async (gamePin, leaderboardData) => {
  const cacheKey = `cached:leaderboard:${gamePin}`;
  await redisClient.set(cacheKey, JSON.stringify(leaderboardData));
  // Set expiration if needed (e.g., 5 minutes)
  redisClient.expire(cacheKey, 300);
},

// Fetch leaderboard from cache
 getLeaderboardFromCache: async (gamePin) => {
  const cacheKey = `cached:leaderboard:${gamePin}`;
  const cachedData = await redisClient.get(cacheKey);
  return cachedData ? JSON.parse(cachedData) : null;
},

 getLeaderboard2 : async (gamePin) => {
  let leaderboard = await getLeaderboardFromCache(gamePin);

  if (!leaderboard) {
    leaderboard = await redisClient.zrevrange(`game:${gamePin}:scores`, 0, 9, 'WITHSCORES');
    // Process and cache the leaderboard
    const formattedLeaderboard = leaderboard.reduce((acc, _, idx) => {
      if (idx % 2 === 0) {
        acc.push({
          playerId: leaderboard[idx],
          score: leaderboard[idx + 1]
        });
      }
      return acc;
    }, []);
    // Cache the leaderboard data
    await cacheLeaderboard(gamePin, formattedLeaderboard);
  }

  return leaderboard;
}




});

module.exports = createRedisApi;
