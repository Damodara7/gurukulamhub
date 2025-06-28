// Not using these now. We are using game.service.js for these operations

import connectMongo from '@/utils/dbConnect-mongo'
import Player from './player.model'
import User from '@/app/models/user.model'
import Game from '@/app/api/game/game.model'
import mongoose from 'mongoose'

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
    let player = await Player.findOne({ game: gameId, user: user._id })
    if (player) {
      return {
        status: 'success',
        result: player,
        message: player.status === 'registered' ? 'User is already registered for this game' : 'User already started/participated in this game'
      }
    }

    // Check if game exists and is joinable
    const game = await Game.findOne({ _id: gameId, status: { $in: ['approved', 'lobby', 'live'] }, isDeleted: false })
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

    return {
      status: 'success',
      result: player,
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

    let player = await Player.findOne({ game: gameId, user: user._id })
    if (!player) {
      return {
        status: 'error',
        result: null,
        message: 'User is not registered for this game'
      }
    }
    if (player.status === 'participated' || player.status === 'completed') {
      return {
        status: 'success',
        result: player,
        message: 'User already started or completed this game'
      }
    }
    // Update status to participated
    player.status = 'participated'
    player.joinedAt = new Date()
    await player.save()
    return {
      status: 'success',
      result: player,
      message: 'User started participated in game'
    }
  } catch (error) {
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
    if (player.status !== 'participated') {
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

    return {
      status: 'success',
      result: player,
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

export const getPlayersForGame = async gameId => {
  await connectMongo()
  try {
    const players = await Player.find({ game: gameId }).lean()
    return {
      status: 'success',
      result: players,
      message: `Found ${players.length} players for game ${gameId}`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to fetch players'
    }
  }
}

export const getPlayerByEmail = async (email) => {
  await connectMongo()
  try {
    const player = await Player.findOne({ email }).lean()
    if (!player) {
      return {
        status: 'error',
        result: null,
        message: 'Player not found'
      }
    }
    return {
      status: 'success',
      result: player,
      message: 'Player fetched'
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to fetch player'
    }
  }
}

