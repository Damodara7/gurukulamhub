import connectMongo from '@/utils/dbConnect-mongo'
import Game from './game.model'
import mongoose from 'mongoose'
import User from '@/app/models/user.model'
import Quiz from '../quiz/quiz.model'
import SponsorshipModel from '../sponsorship/sponsorship.model'
import QuestionsModel from '../question/question.model'
import * as gameScheduler from './game.scheduler'
import { ROLES_LOOKUP } from '@/configs/roles-lookup'
import Player from '@/app/api/player/player.model'

export const getOne = async (filter = {}) => {
  await connectMongo()
  try {
    if (filter._id && !mongoose.Types.ObjectId.isValid(filter._id)) {
      return {
        status: 'error',
        result: null,
        message: 'Invalid game ID format'
      }
    }

    const game = await Game.findOne({ ...filter, isDeleted: false })
      .populate('quiz')
      .populate('createdBy', 'email firstName lastName roles')
      .populate('forwardingAdmin', 'email firstName lastName roles')
      .populate('rewards.sponsors.sponsorshipId')
      .lean()

    if (!game) {
      return {
        status: 'error',
        result: null,
        message: 'Game not found'
      }
    }

    // Add registeredUsers and participatedUsers from Player model
    const [registeredUsers, participatedUsers, questions] = await Promise.all([
      Player.find({ game: game._id, status: { $in: ['registered', 'participated', 'completed'] } }).lean(),
      Player.find({ game: game._id, status: { $in: ['participated', 'completed'] } }).lean(),
      QuestionsModel.find({ quizId: game.quiz._id || game.quiz, languageCode: game.quiz.language?.code })
        .sort({ createdAt: 1 })
        .lean()
    ])
    game.registeredUsers = registeredUsers || []
    game.participatedUsers = participatedUsers || []
    game.questions = questions || []

    return {
      status: 'success',
      result: game,
      message: 'Game retrieved successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve game'
    }
  }
}

export const getAll = async (filter = {}) => {
  await connectMongo()
  try {
    const games = await Game.find({ ...filter, isDeleted: false })
      .populate('quiz')
      .populate('createdBy', 'email firstName lastName roles')
      .populate('forwardingAdmin', 'email firstName lastName roles')
      .populate('rewards.sponsors.sponsorshipId')
      .sort({ createdAt: -1 })
      .lean()

    // For each game, add registeredUsers, participatedUsers, and questions from Player and QuestionsModel
    const gameIds = games.map(g => g._id)
    const allPlayers = await Player.find({ game: { $in: gameIds } }).lean()
    const playersByGame = {}
    for (const player of allPlayers) {
      const gid = player.game.toString()
      if (!playersByGame[gid]) playersByGame[gid] = { registered: [], participated: [] }
      if (['registered', 'participated', 'completed'].includes(player.status))
        playersByGame[gid].registered.push(player)
      if (['participated', 'completed'].includes(player.status)) playersByGame[gid].participated.push(player)
    }
    // Fetch questions for all games in parallel
    await Promise.all(
      games.map(async game => {
        const gid = game._id.toString()
        game.registeredUsers = playersByGame[gid]?.registered || []
        game.participatedUsers = playersByGame[gid]?.participated || []
        game.questions = await QuestionsModel.find({
          quizId: game.quiz._id || game.quiz,
          languageCode: game.quiz.language?.code
        })
          .sort({ createdAt: 1 })
          .lean()
      })
    )

    return {
      status: 'success',
      result: games,
      message: `Found ${games.length} games`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve games'
    }
  }
}

export const getAllPublic = async (filter = {}) => {
  await connectMongo()
  try {
    const games = await Game.find({
      ...filter,
      isDeleted: false,
      status: { $in: ['approved', 'lobby', 'live', 'completed', 'cancelled'] }
    })
      .populate('quiz')
      .populate('createdBy', 'email firstName lastName')
      .populate('forwardingAdmin', 'email firstName lastName roles')
      .populate('rewards.sponsors.sponsorshipId')
      .sort({ createdAt: -1 })
      .lean()

    // For each game, add registeredUsers, participatedUsers, and questions
    const gameIds = games.map(g => g._id)
    const allPlayers = await Player.find({ game: { $in: gameIds } }).lean()
    const playersByGame = {}
    for (const player of allPlayers) {
      const gid = player.game.toString()
      if (!playersByGame[gid]) playersByGame[gid] = { registered: [], participated: [] }
      if (['registered', 'participated', 'completed'].includes(player.status))
        playersByGame[gid].registered.push(player)
      if (['participated', 'completed'].includes(player.status)) playersByGame[gid].participated.push(player)
    }
    await Promise.all(
      games.map(async game => {
        const gid = game._id.toString()
        game.registeredUsers = playersByGame[gid]?.registered || []
        game.participatedUsers = playersByGame[gid]?.participated || []
        game.questions = await QuestionsModel.find({
          quizId: game.quiz._id || game.quiz,
          languageCode: game.quiz.language?.code
        })
          .sort({ createdAt: 1 })
          .lean()
      })
    )

    return {
      status: 'success',
      result: games,
      message: `Found ${games.length} games`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve games'
    }
  }
}

export const getAllByEmail = async (email, filter = {}) => {
  await connectMongo()
  try {
    if (!email) {
      return {
        status: 'error',
        result: null,
        message: 'Valid email address is required'
      }
    }

    const games = await Game.find({ creatorEmail: email, isDeleted: false, ...filter })
      .populate('quiz')
      .populate('createdBy', 'email firstName lastName roles')
      .populate('forwardingAdmin', 'email firstName lastName roles')
      .populate('rewards.sponsors.sponsorshipId')
      .sort({ startTime: -1 })
      .lean()

    // For each game, add registeredUsers, participatedUsers, and questions
    const gameIds = games.map(g => g._id)
    const allPlayers = await Player.find({ game: { $in: gameIds } }).lean()
    const playersByGame = {}
    for (const player of allPlayers) {
      const gid = player.game.toString()
      if (!playersByGame[gid]) playersByGame[gid] = { registered: [], participated: [] }
      if (['registered', 'participated', 'completed'].includes(player.status))
        playersByGame[gid].registered.push(player)
      if (['participated', 'completed'].includes(player.status)) playersByGame[gid].participated.push(player)
    }
    await Promise.all(
      games.map(async game => {
        const gid = game._id.toString()
        game.registeredUsers = playersByGame[gid]?.registered || []
        game.participatedUsers = playersByGame[gid]?.participated || []
        game.questions = await QuestionsModel.find({
          quizId: game.quiz._id || game.quiz,
          languageCode: game.quiz.language?.code
        })
          .sort({ createdAt: 1 })
          .lean()
      })
    )

    return {
      status: 'success',
      result: games,
      message: `Found ${games.length} games for ${email}`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve games by email'
    }
  }
}

export const addOne = async gameData => {
  await connectMongo()
  try {
    const user = await User.findOne({ email: gameData.creatorEmail })
    gameData.createdBy = user._id
    if (user?.roles?.includes('ADMIN')) {
      gameData.approvedBy = user._id
    }
    console.log('gameData Fort' , gameData.forwardType)

    // Fetch the quiz to get language code
    const quiz = await Quiz.findById(gameData?.quiz).lean()
    const quizId = quiz._id
    const languageCode = quiz.language.code
    // Fetch all questions for this quiz and language
    const questions = await QuestionsModel.find({ quizId, languageCode }).lean()
    // Adding questions count field to gameData
    gameData.questionsCount = questions?.length

    // If live mode, calculate duration from questions
    if (gameData.gameMode === 'live') {
      // Sum timerSeconds from data field
      gameData.duration = questions?.reduce((sum, q) => sum + (q?.data?.timerSeconds || 0), 0)
    }

    // Validate required fields
    const requiredFields = ['title', 'pin', 'quiz', 'startTime', 'createdBy']
    if (gameData.gameMode === 'self-paced') requiredFields.push('duration')
    const missingFields = requiredFields.filter(field => !gameData[field] && gameData[field] !== 0)

    if (missingFields.length > 0) {
      return {
        status: 'error',
        result: null,
        message: `Missing required fields: ${missingFields.join(', ')}`
      }
    }

    // Check for existing pin
    const existingGame = await Game.findOne({ pin: gameData.pin })
    if (existingGame) {
      return {
        status: 'error',
        result: null,
        message: 'Game pin must be unique'
      }
    }

    // Create new game instance
    const newGame = new Game({ ...gameData })
    // const newGame = new Game({
    //   title: gameData.title,
    //   pin: gameData.pin,
    //   quiz: gameData.quiz,
    //   description: gameData.description,
    //   location: gameData.location,
    //   startTime: gameData.startTime,
    //   duration: gameData.duration,
    //   gameMode: gameData.gameMode,
    //   forwardType: gameData.forwardType,
    //   promotionalVideoUrl: gameData.promotionalVideoUrl,
    //   thumbnailPoster: gameData.thumbnailPoster,
    //   requireRegistration: gameData.requireRegistration || false,
    //   registrationEndTime: gameData.registrationEndTime,
    //   maxPlayers: gameData.maxPlayers,
    //   status: gameData.status || 'created',
    //   rewards: gameData.rewards || [],
    //   tags: gameData.tags || [],
    //   createdBy: gameData.createdBy,
    //   creatorEmail: gameData.creatorEmail
    // });

    // Calculate total reward value if rewards are provided
    if (gameData.rewards?.length > 0) {
      newGame.totalRewardValue = gameData.rewards.reduce((total, reward) => {
        return total + reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
      }, 0)
    }

    // Validate and save the game
    const validationError = newGame.validateSync()
    if (validationError) {
      const errors = Object.values(validationError.errors).map(err => err.message)
      return {
        status: 'error',
        result: null,
        message: `Validation failed: ${errors.join(', ')}`
      }
    }

    const savedGame = await newGame.save()

    // Update sponsorships
    await updateSponsorshipsForGame(savedGame)

    // If the user is ADMIN - Then Schedule game scheduleres(on approval)
    if (user?.roles?.includes('ADMIN')) {
      gameScheduler.onGameApproved(savedGame._id)
    }

    return {
      status: 'success',
      result: savedGame,
      message: 'Game created successfully'
    }
  } catch (error) {
    // Handle duplicate key errors
    if (error.code === 11000) {
      return {
        status: 'error',
        result: null,
        message: 'Duplicate game pin detected'
      }
    }

    // Handle other errors
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to create game'
    }
  }
}

export const updateOne = async (gameId, updateData) => {
  await connectMongo()
  try {
    const user = await User.findOne({ email: updateData?.updaterEmail })
    if (!user) {
      return {
        status: 'error',
        result: null,
        message: 'User not found'
      }
    }
    updateData.updatedBy = user?._id

    // Find the existing game by ID
    const existingGame = await Game.findOne({ _id: gameId, isDeleted: false })
    if (!existingGame) {
      return {
        status: 'error',
        result: null,
        message: 'Game not found'
      }
    }

    const quiz = await Quiz.findById(updateData.quiz || existingGame.quiz).lean()
    const quizId = quiz._id
    const languageCode = quiz.language.code
    // Fetch all questions for this quiz and language
    const questions = await QuestionsModel.find({ quizId, languageCode }).lean()
    // Adding questions count field to gameData
    updateData.questionsCount = questions?.length

    // If live mode, calculate duration from questions
    if (updateData.gameMode === 'live') {
      // Sum timerSeconds from data field
      updateData.duration = questions.reduce((sum, q) => sum + (q.data?.timerSeconds || 0), 0)
    }

    // Check if pin is being updated to a non-unique value
    if (updateData.pin !== undefined && updateData.pin !== existingGame.pin) {
      const existingPinGame = await Game.findOne({ pin: updateData.pin })
      if (existingPinGame) {
        return {
          status: 'error',
          result: null,
          message: 'Game pin must be unique'
        }
      }
    }

    // Handle rewards update if present in updateData
    if (updateData.rewards !== undefined) {
      // Create a map of existing rewards by _id
      const existingRewardsMap = new Map(existingGame.rewards.map(reward => [reward._id.toString(), reward]))

      // Process each reward in the update data
      const updatedRewards = updateData.rewards.map(newReward => {
        // If reward has _id, it's an update
        if (newReward._id) {
          const existingReward = existingRewardsMap.get(newReward._id.toString())
          if (existingReward) {
            // Create a map of existing sponsors by _id
            const existingSponsorsMap = new Map(
              existingReward.sponsors.map(sponsor => [sponsor._id.toString(), sponsor])
            )

            // Process each sponsor in the new reward
            const updatedSponsors = newReward.sponsors.map(newSponsor => {
              // If sponsor has _id, it's an update
              if (newSponsor._id) {
                const existingSponsor = existingSponsorsMap.get(newSponsor._id.toString())
                if (existingSponsor) {
                  // Keep the existing _id and rewardSponsorshipId
                  return {
                    ...newSponsor,
                    _id: existingSponsor._id,
                    rewardSponsorshipId: existingSponsor.rewardSponsorshipId
                  }
                }
              }
              // If no _id or not found, it's a new sponsor
              return newSponsor
            })

            // Return updated reward with existing _id and updated sponsors
            return {
              ...newReward,
              _id: existingReward._id,
              sponsors: updatedSponsors
            }
          }
        }
        // If no _id or not found, it's a new reward
        return newReward
      })

      // Replace the rewards in updateData with the processed rewards
      updateData.rewards = updatedRewards
    }

    // Apply updates to the existing game document
    Object.keys(updateData).forEach(key => {
      existingGame[key] = updateData[key]
      if (key === 'status' && existingGame.status === 'cancelled') {
        existingGame.cancellationReason = undefined
        // For admin case (approving)
        if (user?.roles?.includes(ROLES_LOOKUP.ADMIN)) {
          existingGame.status = 'approved'
          existingGame.approvedBy = updateData.updatedBy
          existingGame.approverEmail = updateData.updaterEmail
          existingGame.approvedAt = new Date()
        }
        // For non-admin case (cancelling)
        else {
          existingGame.status = 'created'
          // Use $unset in the save operation
          existingGame.$unset = {
            cancellationReason: 1,
            approvedBy: 1,
            approverEmail: 1,
            approvedAt: 1
          }
        }
      }
    })

    // Recalculate total reward value if rewards are updated
    if (updateData.rewards !== undefined) {
      existingGame.totalRewardValue = updateData.rewards.reduce((total, reward) => {
        return total + reward.rewardValuePerWinner * reward.numberOfWinnersForThisPosition
      }, 0)
    }

    // Validate the updated game document
    const validationError = existingGame.validateSync()
    if (validationError) {
      const errors = Object.values(validationError.errors).map(err => err.message)
      return {
        status: 'error',
        result: null,
        message: `Validation failed: ${errors.join(', ')}`
      }
    }

    // Save the updated game
    const updatedGame = await existingGame.save()

    // Update sponsorships
    await updateSponsorshipsForGame(updatedGame)

    return {
      status: 'success',
      result: updatedGame,
      message: 'Game updated successfully'
    }
  } catch (error) {
    // Handle duplicate key errors (e.g., unique constraint violation)
    if (error.code === 11000) {
      return {
        status: 'error',
        result: null,
        message: 'Duplicate game pin detected'
      }
    }

    // Handle other potential errors
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to update game'
    }
  }
}

export const deleteOne = async (gameId, { email }) => {
  await connectMongo()
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return {
        status: 'error',
        result: null,
        message: 'User not found!'
      }
    }
    // Find the existing game by ID and ensure it's not already deleted
    const existingGame = await Game.findOne({ _id: gameId, isDeleted: false })

    if (!existingGame) {
      return {
        status: 'error',
        result: null,
        message: 'Game not found or already deleted'
      }
    }

    // Perform soft delete with audit fields
    existingGame.isDeleted = true
    existingGame.deletedAt = new Date()
    existingGame.deletedBy = user._id // Assuming user object has _id
    existingGame.deleterEmail = user.email // More natural than "deletorEmail"

    // Save the updated game
    const deletedGame = await existingGame.save()

    // Delete all players for this game
    await Player.deleteMany({ game: gameId })

    // Revert sponsorships
    await revertSponsorshipsForGame(deletedGame)

    return {
      status: 'success',
      result: deletedGame,
      message: 'Game soft deleted successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to delete game'
    }
  }
}

export const approveGame = async (gameId, updateData) => {
  await connectMongo()
  try {
    // Find the existing game by ID
    const existingGame = await Game.findById(gameId)
    if (!existingGame) {
      return {
        status: 'error',
        result: null,
        message: 'Game not found'
      }
    }

    // Check if pin is being updated to a non-unique value
    if (updateData.pin !== undefined && updateData.pin !== existingGame.pin) {
      const existingPinGame = await Game.findOne({ pin: updateData.pin })
      if (existingPinGame) {
        return {
          status: 'error',
          result: null,
          message: 'Game pin must be unique'
        }
      }
    }

    const user = await User.findOne({ email: updateData.approverEmail })
    updateData.approvedBy = user._id
    updateData.approvedAt = new Date()

    // Apply updates to the existing game document
    Object.keys(updateData).forEach(key => {
      existingGame[key] = updateData[key]
    })

    // Validate the updated game document
    const validationError = existingGame.validateSync()
    if (validationError) {
      const errors = Object.values(validationError.errors).map(err => err.message)
      return {
        status: 'error',
        result: null,
        message: `Validation failed: ${errors.join(', ')}`
      }
    }

    // Save the updated game
    const updatedGame = await existingGame.save()

    // Scheduler - fire and forget (but log errors if they occur)
    gameScheduler.onGameApproved(gameId).catch(err => {
      console.error(`Failed to schedule (approved) game ${gameId}:`, err)
      // Optional: Log to an error tracking service (Sentry, etc.)
    })

    // Update sponsorships
    await updateSponsorshipsForGame(updatedGame)

    return {
      status: 'success',
      result: updatedGame,
      message: 'Game updated successfully'
    }
  } catch (error) {
    // Handle duplicate key errors (e.g., unique constraint violation)
    if (error.code === 11000) {
      return {
        status: 'error',
        result: null,
        message: 'Duplicate game pin detected'
      }
    }

    // Handle other potential errors
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to update game'
    }
  }
}

// ********** Player Related Services - START ***********
export const joinGame = async (gameId, userData) => {
  await connectMongo()
  try {
    const user = await User.findOne({ email: userData?.email })
    if (!user) {
      return {
        status: 'error',
        result: null,
        message: 'User with this email does not exist.'
      }
    }
    userData.id = user._id

    // Check if player already exists for this game
    let player = await Player.findOne({ game: gameId, email: userData?.email })
    if (player) {
      // Fetch latest registered and participated users
      const [registeredUsers, participatedUsers] = await Promise.all([
        Player.find({ game: gameId, status: { $in: ['registered','participated', 'completed'] } }).lean(),
        Player.find({ game: gameId, status: { $in: ['participated', 'completed'] } }).lean()
      ])
      const game = await Game.findById(gameId).lean()
      return {
        status: 'success',
        result: { ...game, registeredUsers, participatedUsers },
        message:
          player.status === 'registered'
            ? 'User is already registered for this game'
            : 'User already started/participated in this game'
      }
    }

    // Check if game exists and is joinable
    const game = await Game.findOne({
      _id: gameId,
      status: { $in: ['approved', 'lobby', 'live'] },
      isDeleted: false
    }).lean()
    if (!game) {
      return {
        status: 'error',
        result: null,
        message: 'Game not found or not joinable'
      }
    }

    // Create new player document with status 'registered'
    player = new Player({
      user: user._id,
      game: gameId,
      email: user.email,
      registeredAt: new Date(),
      score: 0,
      fffPoints: 0,
      answers: [],
      completed: false,
      status: 'registered',
      joinedAt: null
    })
    await player.save()

    // Fetch latest registered and participated users after registration
    const [registeredUsers, participatedUsers] = await Promise.all([
      Player.find({ game: gameId, status: { $in: ['registered','participated', 'completed'] } }).lean(),
      Player.find({ game: gameId, status: { $in: ['participated', 'completed'] } }).lean()
    ])
    return {
      status: 'success',
      result: { ...game, registeredUsers, participatedUsers },
      message: 'Successfully registered for game'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to join game'
    }
  }
}

export const startGame = async (gameId, userData) => {
  await connectMongo()
  try {
    const user = await User.findOne({ email: userData?.email })
    if (!user) {
      return {
        status: 'error',
        result: null,
        message: 'User with this email does not exist.'
      }
    }
    userData.id = user._id

    let player = await Player.findOne({ game: gameId, email: userData?.email })
    if (!player) {
      return {
        status: 'error',
        result: null,
        message: 'User is not registered for this game'
      }
    }
    if (player.status === 'participated' || player.status === 'completed') {
      // Fetch latest registered and participated users
      const [registeredUsers, participatedUsers] = await Promise.all([
        Player.find({ game: gameId, status: { $in: ['registered','participated', 'completed'] } }).lean(),
        Player.find({ game: gameId, status: { $in: ['participated', 'completed'] } }).lean()
      ])
      const game = await Game.findById(gameId).lean()
      const questions = await QuestionsModel.find({ quizId: game.quiz, languageCode: game.quiz.language?.code }).lean()
      return {
        status: 'success',
        result: { ...game, questions, registeredUsers, participatedUsers },
        message: 'User already started or completed this game'
      }
    }
    // Update status to participated
    player.status = 'participated'
    player.joinedAt = new Date()
    await player.save()
    // Get questions
    const game = await Game.findById(gameId).populate('quiz').lean()
    const quizId = game.quiz._id
    const languageCode = game.quiz.language.code
    const questions = await QuestionsModel.find({ quizId, languageCode }).lean()
    // Fetch latest registered and participated users after participation
    const [registeredUsers, participatedUsers] = await Promise.all([
      Player.find({ game: gameId, status: { $in: ['registered','participated', 'completed'] } }).lean(),
      Player.find({ game: gameId, status: { $in: ['participated', 'completed'] } }).lean()
    ])
    return {
      status: 'success',
      result: { ...game, questions, registeredUsers, participatedUsers },
      message: 'User started participated in game'
    }
  } catch (error) {
    console.log('error starting game: ', error)
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to start game'
    }
  }
}

export const updatePlayerProgress = async (gameId, { user, userAnswer, finish }) => {
  await connectMongo()
  try {
    // Find player by game and user
    const player = await Player.findOne({ game: gameId, email: user.email })
    if (!player) {
      return {
        status: 'error',
        result: null,
        message: 'Player not found in game'
      }
    }
    if (player.status === 'completed') {
      return {
        status: 'error',
        result: null,
        message: 'Player already completed the game.'
      }
    }
    if (player.status === 'registered') {
      return {
        status: 'error',
        result: null,
        message: 'Player has not started the game yet'
      }
    }
    // Prepare answer data
    const answerData = { ...userAnswer }
    // Find if answer already exists for this question
    const existingAnswerIndex = player.answers.findIndex(a => a.question.toString() === userAnswer.question.toString())

    let scoreDelta = 0
    let fffPointsDelta = 0
    if (existingAnswerIndex > -1) {
      // Update existing answer
      const existingAnswer = player.answers[existingAnswerIndex]
      scoreDelta = (answerData.marks || 0) - (existingAnswer.marks || 0)
      fffPointsDelta = (answerData.fffPoints || 0) - (existingAnswer.fffPoints || 0)
      player.answers[existingAnswerIndex] = answerData
    } else {
      // Add new answer
      scoreDelta = answerData.marks || 0
      fffPointsDelta = answerData.fffPoints || 0
      player.answers.push(answerData)
    }
    player.score += scoreDelta
    player.fffPoints = (player.fffPoints || 0) + fffPointsDelta

    if (finish) {
      player.completed = true
      player.status = 'completed'
      player.finishedAt = new Date()
      if (!player.registeredAt) {
        player.registeredAt = new Date()
      }
    }

    await player.save()

    // Fetch latest game, registeredUsers, and participatedUsers
    const game = await Game.findById(gameId).lean()
    const [registeredUsers, participatedUsers] = await Promise.all([
      Player.find({ game: gameId, status: { $in: ['registered','participated', 'completed'] } }).lean(),
      Player.find({ game: gameId, status: { $in: ['participated', 'completed'] } }).lean()
    ])

    return {
      status: 'success',
      result: { ...game, registeredUsers, participatedUsers },
      message: 'Player progress updated successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to update player progress'
    }
  }
}

export const getLeaderboard = async gameId => {
  await connectMongo()
  try {
    const players = await Player.find({ game: gameId, status: { $in: ['participated', 'completed'] } })
      .sort({ fffPoints: -1 })
      .lean()
    // Add totalAnswerTime for each player
    const leaderboard = players.map(p => ({
      ...p,
      totalAnswerTime: p.answers?.reduce((sum, a) => sum + (a?.answerTime || 0), 0)
    }))
    return {
      status: 'success',
      result: leaderboard,
      message: 'Leaderboard fetched successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to fetch leaderboard'
    }
  }
}
// ********** Player Related Services - END ***********

// ********************* Helper Functions *******************
// Helper function to update sponsorships
async function updateSponsorshipsForGame(game) {
  try {
    if (!game.rewards || game.rewards.length === 0) return

    const sponsorshipUpdates = []

    // First pass: Collect all reward sponsorships
    for (const reward of game.rewards) {
      for (const sponsor of reward.sponsors) {
        const { sponsorshipId, rewardDetails, _id } = sponsor
        if (!sponsorshipId) continue

        // Safely parse allocated value
        const allocated = parseFloat(sponsor.rewardDetails?.allocated || sponsor.allocated || 0)
        if (isNaN(allocated)) {
          console.error(`Invalid allocation value for sponsor ${_id}`)
          continue
        }

        const rewardType = rewardDetails?.rewardType
        if (!rewardType) {
          console.error(`Missing rewardType for sponsor ${_id}`)
          continue
        }

        const existingUpdate = sponsorshipUpdates.find(u => u.sponsorshipId.toString() === sponsorshipId.toString())

        if (existingUpdate) {
          existingUpdate.rewardSponsorships.push({
            allocated,
            rewardSponsorshipId: _id,
            rewardType,
            rewardId: reward._id
          })
        } else {
          sponsorshipUpdates.push({
            sponsorshipId,
            rewardType,
            rewardSponsorships: [
              {
                allocated,
                rewardSponsorshipId: _id,
                rewardType,
                rewardId: reward._id
              }
            ]
          })
        }
      }
    }

    // Second pass: Update each sponsorship
    for (const update of sponsorshipUpdates) {
      const { sponsorshipId, rewardType, rewardSponsorships } = update

      const sponsorship = await SponsorshipModel.findById(sponsorshipId)
      if (!sponsorship) {
        console.warn(`Sponsorship not found: ${sponsorshipId}`)
        continue
      }

      // Find existing game sponsorship
      const existingSponsoredIndex = sponsorship.sponsored.findIndex(s => s.game.toString() === game._id.toString())
      const existingGameSponsorship = existingSponsoredIndex >= 0 ? sponsorship.sponsored[existingSponsoredIndex] : null

      // Create a map of existing reward sponsorships by rewardSponsorshipId
      const existingRewardSponsorshipsMap = existingGameSponsorship
        ? new Map(existingGameSponsorship.rewardSponsorships.map(rs => [rs.rewardSponsorshipId, rs]))
        : new Map()

      // Calculate the difference in allocation
      let totalAllocationDifference = 0
      const processedRewardSponsorshipIds = new Set()

      // Process new reward sponsorships and calculate differences
      for (const newRs of rewardSponsorships) {
        const existingRs = existingRewardSponsorshipsMap.get(newRs.rewardSponsorshipId)
        const newAllocated = parseFloat(newRs.allocated)

        if (existingRs) {
          // Calculate difference between new and old allocation
          const oldAllocated = parseFloat(existingRs.allocated)
          totalAllocationDifference += oldAllocated - newAllocated
        } else {
          // New reward sponsorship
          totalAllocationDifference -= newAllocated
        }

        processedRewardSponsorshipIds.add(newRs.rewardSponsorshipId)
      }

      // Add back allocations for removed reward sponsorships
      if (existingGameSponsorship) {
        for (const existingRs of existingGameSponsorship.rewardSponsorships) {
          if (!processedRewardSponsorshipIds.has(existingRs.rewardSponsorshipId)) {
            totalAllocationDifference += parseFloat(existingRs.allocated)
          }
        }
      }

      // Update available amount/items
      const isCash = rewardType === 'cash'
      const currentAvailable = isCash ? parseFloat(sponsorship.availableAmount) : parseInt(sponsorship.availableItems)

      if (isNaN(currentAvailable)) {
        throw new Error(`Invalid ${isCash ? 'availableAmount' : 'availableItems'} for sponsorship ${sponsorshipId}`)
      }

      const newAvailable = currentAvailable + totalAllocationDifference

      if (newAvailable < 0) {
        throw new Error(
          `Insufficient ${
            isCash ? 'funds' : 'items'
          } for sponsorship ${sponsorshipId}. Available after adjustment: ${newAvailable}`
        )
      }

      // Update the sponsorship
      if (isCash) {
        sponsorship.availableAmount = newAvailable
      } else {
        sponsorship.availableItems = newAvailable
      }

      // Update sponsored games array
      const updatedRewardSponsorships = rewardSponsorships.map(({ allocated, rewardSponsorshipId, rewardId }) => ({
        allocated: parseFloat(allocated),
        rewardSponsorshipId,
        rewardId
      }))

      if (existingSponsoredIndex >= 0) {
        existingGameSponsorship.rewardSponsorships = updatedRewardSponsorships
      } else {
        sponsorship.sponsored.push({
          game: game._id,
          rewardSponsorships: updatedRewardSponsorships
        })
      }

      await sponsorship.save()
    }
  } catch (error) {
    console.error('Error updating sponsorships:', error)
    throw error
  }
}

async function revertSponsorshipsForGame(game) {
  try {
    if (!game.rewards || game.rewards.length === 0) return

    // Group all reward-sponsor allocations by the main sponsorship ID
    const sponsorshipAllocations = new Map()

    for (const reward of game.rewards) {
      for (const sponsor of reward.sponsors) {
        const { sponsorshipId, rewardDetails } = sponsor
        if (!sponsorshipId) continue

        const sId = sponsorshipId.toString()
        const allocated = parseFloat(rewardDetails?.allocated || sponsor.allocated || 0)
        if (isNaN(allocated)) {
          console.error(`Invalid allocation value for sponsor in game ${game._id}`)
          continue
        }

        const sponsorship = await SponsorshipModel.findById(sId)
        const rewardType = rewardDetails?.rewardType || (sponsorship?.sponsorshipType === 'cash' ? 'cash' : 'items')

        if (!rewardType) {
          console.error(`Missing rewardType for sponsor in game ${game._id}`)
          continue
        }

        if (!sponsorshipAllocations.has(sId)) {
          sponsorshipAllocations.set(sId, [])
        }
        sponsorshipAllocations.get(sId).push({ allocated, rewardType })
      }
    }

    // Now, update each sponsorship
    for (const [sponsorshipId, allocations] of sponsorshipAllocations.entries()) {
      const sponsorship = await SponsorshipModel.findById(sponsorshipId)
      if (!sponsorship) {
        console.warn(`Sponsorship not found while reverting: ${sponsorshipId}`)
        continue
      }

      // Sum up the total reverted amounts/items
      let totalCashReverted = 0
      let totalItemsReverted = 0
      for (const { allocated, rewardType } of allocations) {
        if (rewardType === 'cash') {
          totalCashReverted += allocated
        } else {
          totalItemsReverted += allocated
        }
      }

      // Add back to available pool
      if (sponsorship.availableAmount !== null && sponsorship.availableAmount !== undefined) {
        sponsorship.availableAmount += totalCashReverted
      }
      if (sponsorship.availableItems !== null && sponsorship.availableItems !== undefined) {
        sponsorship.availableItems += totalItemsReverted
      }

      // Remove the game from the sponsored list
      const sponsoredGameIndex = sponsorship.sponsored.findIndex(s => s.game.toString() === game._id.toString())
      if (sponsoredGameIndex > -1) {
        sponsorship.sponsored.splice(sponsoredGameIndex, 1)
      }

      await sponsorship.save()
    }
  } catch (error) {
    console.error(`Error reverting sponsorships for game ${game._id}:`, error)
    throw error
  }
}

export const setForwardingAdmin = async (gameId, user) => {
  await connectMongo()
  try {
    if (!user?.email) {
      return {
        status: 'error',
        result: null,
        message: 'User email is required'
      }
    }
    const adminUser = await User.findOne({ email: user.email })
    if (!adminUser) {
      return {
        status: 'error',
        result: null,
        message: 'Admin user not found'
      }
    }
    if (!adminUser?.roles?.includes('ADMIN')) {
      return {
        status: 'error',
        result: null,
        message: 'User does not have admin role'
      }
    }
    const game = await Game.findById(gameId)
    if (!game) {
      return {
        status: 'error',
        result: null,
        message: 'Game not found'
      }
    }
    game.forwardingAdmin = adminUser._id
    await game.save()
    return {
      status: 'success',
      result: game,
      message: 'Forwarding admin updated successfully'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to update forwarding admin'
    }
  }
}

export const forwardQuestion = async (gameId, user, currentQuestionIndex) => {
  await connectMongo()
  try {
    if (!user?.email) {
      return {
        status: 'error',
        result: null,
        message: 'User email is required'
      }
    }
    const adminUser = await User.findOne({ email: user.email })
    if (!adminUser) {
      return {
        status: 'error',
        result: null,
        message: 'User not found'
      }
    }
    const game = await Game.findById(gameId)
    if (!game) {
      return {
        status: 'error',
        result: null,
        message: 'Game not found'
      }
    }
    if (!game.forwardingAdmin || adminUser._id.toString() !== game.forwardingAdmin.toString()) {
      return {
        status: 'error',
        result: null,
        message: 'User is not the forwarding admin for this game'
      }
    }
    // Get total questions count
    const totalQuestions = game.questionsCount || 0
    if (typeof currentQuestionIndex !== 'number') {
      return {
        status: 'error',
        result: null,
        message: 'currentQuestionIndex is required and must be a number'
      }
    }
    let message = ''
    if (currentQuestionIndex >= totalQuestions - 1) {
      // Last question, complete the game
      game.status = 'completed'
      game.liveQuestionIndex = totalQuestions - 1
      await game.save()
      // Update all players
      const now = new Date()
      await Player.updateMany({ game: gameId }, { $set: { status: 'completed', completed: true, finishedAt: now } })
      message = 'Game completed and all players marked as completed.'
    } else {
      // Increment liveQuestionIndex
      game.liveQuestionIndex = currentQuestionIndex + 1
      await game.save()
      message = 'Moved to next question.'
    }
    // Always return game with registeredPlayers, participatedPlayers, and questions
    // const [registeredPlayers, participatedPlayers, questions] = await Promise.all([
    //   Player.find({ game: gameId, status: { $in: ['registered', 'participated', 'completed'] } }).lean(),
    //   Player.find({ game: gameId, status: { $in: ['participated', 'completed'] } }).lean(),
    //   QuestionsModel.find({ quizId: game.quiz, languageCode: game.quiz.language?.code }).lean()
    // ])
    // const resultGame = game.toObject()
    // resultGame.registeredPlayers = registeredPlayers
    // resultGame.participatedPlayers = participatedPlayers
    // resultGame.questions = questions
    // console.log(questions);
    const resultGame = await getOne({_id: game._id})
    return {
      status: 'success',
      result: resultGame.result,
      message
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to forward question'
    }
  }
}
