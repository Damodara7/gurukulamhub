import connectMongo from '@/utils/dbConnect-mongo'
import Game from './game.model'
import mongoose from 'mongoose'
import User from '@/app/models/user.model'
import Quiz from '../quiz/quiz.model'
import QuestionsModel from '../question/question.model'

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

    const game = await Game.findOne({ ...filter })
      .populate('quiz')
      .populate('createdBy', 'email firstName lastName')
      .lean()

    if (!game) {
      return {
        status: 'error',
        result: null,
        message: 'Game not found'
      }
    }

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
    const games = await Game.find(filter)
      .populate('quiz')
      .populate('createdBy', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .lean()

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

export const getAllByEmail = async email => {
  await connectMongo()
  try {
    if (!email || !validator.isEmail(email)) {
      return {
        status: 'error',
        result: null,
        message: 'Valid email address is required'
      }
    }

    const games = await Game.find({ creatorEmail: email })
      .populate('quiz')
      .populate('createdBy', 'email firstName lastName')
      .sort({ startTime: -1 })
      .lean()

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
    console.log({ gameData })
    // Validate required fields
    const requiredFields = ['title', 'pin', 'quiz', 'startTime', 'duration', 'createdBy']
    const missingFields = requiredFields.filter(field => !gameData[field])

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

    // Apply updates to the existing game document
    Object.keys(updateData).forEach(key => {
      existingGame[key] = updateData[key]
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

    // Validate input
    if (!userData?.id || !userData?.email) {
      return {
        status: 'error',
        result: null,
        message: 'Missing user ID or email'
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

    // Check game status
    const allowedStatuses = ['reg_open', 'lobby', 'live']
    if (!allowedStatuses.includes(game.status)) {
      return {
        status: 'error',
        result: null,
        message: 'Game is not currently accepting participants'
      }
    }

    // Check registration requirements
    if (game.requireRegistration || !game.requireRegistration) {
      //   if (game.registrationEndTime && new Date() > game.registrationEndTime) {
      //     return {
      //       status: 'error',
      //       result: null,
      //       message: 'Registration period has ended'
      //     }
      //   }

      // Add to registered users if not already registered
      const isRegistered = game.registeredUsers.some(u => u.user.toString() === userData.id.toString())

      if (!isRegistered) {
        game.registeredUsers.push({
          user: userData.id,
          email: userData.email,
          registeredAt: new Date()
        })

        await game.save()

        return {
          status: 'success',
          result: game,
          message: 'Successfully registered for game'
        }
      } else {
        return {
          status: 'success',
          result: game,
          message: 'User is already registered for this game'
        }
      }
    }

    // If no registration required, just return success
    return {
      status: 'success',
      result: game,
      message: 'No registration required for this game'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to join game'
    }
  }
}

export const updatePlayerProgress = async (gameId, { user, userAnswer, finish }) => {
  await connectMongo()
  try {
    const game = await Game.findById(gameId)
    if (!game) {
      return {
        status: 'error',
        result: null,
        message: 'Game not found'
      }
    }

    // Find player in participated users by user ID
    const player = game.participatedUsers.find(
      p =>
        // p.user.toString() === user.id.toString() &&
        p.email === user.email
    )

    if (!player) {
      return {
        status: 'error',
        result: null,
        message: 'Player not found in game'
      }
    }

    // Prepare answer data
    const answerData = {
      ...userAnswer
      // question: userAnswer.questionId,
      // answer: userAnswer.answer,
      // marks: userAnswer.marks,
      // hintMarks: userAnswer.hintMarks,
      // hintUsed: userAnswer.hintUsed,
      // skipped: userAnswer.skipped
      // answerTime: userAnswer.answerTime
      // answeredAt: userAnswer.answeredAt
    }

    // Check if answer already exists for this question
    const existingAnswerIndex = player.answers.findIndex(a => a.questions === userAnswer.question)

    if (existingAnswerIndex > -1) {
      // Update existing answer
      const existingAnswer = player.answers[existingAnswerIndex]
      player.score -= existingAnswer.marks // Remove old marks
      player.answers[existingAnswerIndex] = answerData
      // console.error('Question already answered!')
      // return {status: 'error', message: 'Question already answered', result: null}
    } else {
      // Add new answer
      player.answers.push(answerData)
    }

    // Update total score
    player.score += answerData.marks

    // Handle game completion
    if (finish) {
      player.completed = true
      player.finishedAt = new Date()

      // Optional: Calculate total time taken
      if (!player.joinedAt) player.joinedAt = new Date()
      const timeTaken = Math.floor((player.finishedAt - player.joinedAt) / 1000)
      // You can store timeTaken if needed
    }

    // Validate and save changes
    await game.validate()
    await game.save()

    return {
      status: 'success',
      result: game,
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

export const startGame = async (gameId, userData) => {
  await connectMongo()
  try {
    const game = await Game.findById(gameId)
      .populate('registeredUsers.user')
      .populate('participatedUsers.user')
      .populate('quiz')
      .lean() // Add .lean() to get plain JavaScript object

    if (!game) {
      return {
        status: 'error',
        result: null,
        message: 'Game not found'
      }
    }

    const user = await User.findOne({ email: userData?.email })
    if (!user) {
      return {
        status: 'error',
        result: null,
        message: 'User not found'
      }
    }
    userData.id = user._id

    // Check if user is registered
    const isUserRegistered = game.registeredUsers.some(ru => ru.user._id.toString() === userData.id.toString())

    if (!isUserRegistered) {
      return {
        status: 'error',
        result: null,
        message: 'User is not registered for this game'
      }
    }

    // Check if user is already participating
    const isAlreadyParticipating = game.participatedUsers?.some(pu => pu.user._id.toString() === userData.id.toString())

    // Add current user to participatedUsers if not already there
    if (!isAlreadyParticipating) {
      game.participatedUsers.push({
        user: userData.id,
        email: userData.email || '',
        joinedAt: new Date(),
        score: 0,
        completed: false,
        finishedAt: null
      })

      // Need to use the model to save since we used lean()
      await Game.updateOne(
        { _id: gameId },
        { $push: { participatedUsers: game.participatedUsers[game.participatedUsers.length - 1] } }
      )
    }

    // Get questions
    const quizId = game.quiz._id
    const languageCode = game.quiz.language.code
    const questions = await QuestionsModel.find({
      quizId: quizId,
      languageCode: languageCode
    }).lean()

    // Create clean response object
    const response = {
      ...game,
      questions
    }

    return {
      status: 'success',
      result: response,
      message: 'Game started successfully and user added to participants'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to start game'
    }
  }
}

export const getLeaderboard = async gameId => {
  try {
    const game = await Game.findById(gameId)
    if (!game) {
      return { status: 'success', result: null, message: 'Game not found' }
    }

    const leaderboard = game.participatedUsers
      // .filter(p => p.completed)
      .map(p => ({
        _id: p._id,
        email: p.email,
        score: p.score,
        totalTime: p.answers.reduce((sum, a) => sum + a.answerTime, 0),
        accuracy: (p.answers.filter(a => a.marks > 0).length / p.answers.length) * 100
      }))
      .sort((a, b) => b.score - a.score || a.totalTime - b.totalTime)

    return { status: 'success', result: leaderboard, message: 'Game not found' }
  } catch (error) {
    return { status: 'success', result: null, message: error.message }
  }
}
