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
import { broadcastLeaderboard } from '../ws/leaderboard/[gameId]/publishers'
import { broadcastGamesList } from '../ws/games/publishers'
import { broadcastGameDetails } from '../ws/games/[gameId]/publishers'
import { broadcastSponsorGamesList } from '../ws/sponsor-games/publishers'
import UserProfile from '@/app/api/profile/profile.model'
import { profileMatchesGameLocation, restrictedLocationHint } from '@/utils/gameLocationAccess'
import Group from '@/app/api/group/group.model'
import {
  createGameCreatedNotification,
  createGameRegisteredNotification,
  createGameCompletedNotificationsForParticipatedUsers,
  createGameMissedNotificationsForRegisteredUsers,
  createGameCancelledNotificationsForRegisteredUsers,
  createGameAccessRemovedNotification,
  createGameDeletedNotification,
  createGameSponsorshipRequestNotification
} from '../notifications/notification.helpers.js'

// Helper to enrich a single game with registeredUsers, participatedUsers, and questions
async function enrichGameWithDetails(game) {
  if (!game) return game
  const [registeredUsers, participatedUsers, questions] = await Promise.all([
    Player.find({ game: game._id, status: { $in: ['registered', 'participated', 'completed'] } })
      .lean()
      .populate({
        path: 'user',
        populate: { path: 'profile' }
      }),
    Player.find({ game: game._id, status: { $in: ['participated', 'completed'] } })
      .lean()
      .populate({
        path: 'user',
        populate: { path: 'profile' }
      }),
    QuestionsModel.find({ quizId: game.quiz._id || game.quiz, languageCode: game.quiz.language?.code })
      .sort({ createdAt: 1 })
      .lean()
  ])
  return {
    ...game,
    registeredUsers: registeredUsers || [],
    participatedUsers: participatedUsers || [],
    questions: questions || []
  }
}

// Helper to enrich an array of games
async function enrichGamesWithDetails(games) {
  return Promise.all((games || []).map(enrichGameWithDetails))
}

async function awardGamePointsToUser({ player, game, userIdOverride = null }) {
  if (!player || !game) return

  const questionsCount = Number(game?.questionsCount || 0)
  const pointsWeightage = Number(game?.pointsWeightage || 1)
  const totalPossiblePoints = Number(game?.totalPoints || questionsCount * pointsWeightage || 0)
  const earnedAt = new Date()
  const userId = userIdOverride || player.user

  player.awardedGamePoints = totalPossiblePoints
  player.pointsAwardedAt = earnedAt
  await player.save()

  await User.updateOne(
    { _id: userId },
    {
      $pull: { gamePointHistory: { game: game._id } }
    }
  )

  await User.updateOne(
    { _id: userId },
    {
      $push: {
        gamePointHistory: {
          game: game._id,
          pointsEarned: totalPossiblePoints,
          pointsWeightage,
          questionsCount,
          totalPossiblePoints,
          earnedAt
        }
      }
    }
  )
}

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
      .populate({
        path: 'groupId',
        populate: {
          path: 'members',
          populate: {
            path: 'profile'
          }
        }
      })
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

    const enrichedGame = await enrichGameWithDetails(game)

    return {
      status: 'success',
      result: enrichedGame,
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
      .populate('groupId')
      .populate('createdBy', 'email firstName lastName roles')
      .populate('forwardingAdmin', 'email firstName lastName roles')
      .populate('rewards.sponsors.sponsorshipId')
      .sort({ createdAt: -1 })
      .lean()

    const enrichedGames = await enrichGamesWithDetails(games)

    return {
      status: 'success',
      result: enrichedGames,
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
      .populate('groupId')
      .populate('createdBy', 'email firstName lastName')
      .populate('forwardingAdmin', 'email firstName lastName roles')
      .populate('rewards.sponsors.sponsorshipId')
      .sort({ createdAt: -1 })
      .lean()

    const enrichedGames = await enrichGamesWithDetails(games)

    return {
      status: 'success',
      result: enrichedGames,
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
      .populate('groupId')
      .populate('createdBy', 'email firstName lastName roles')
      .populate('forwardingAdmin', 'email firstName lastName roles')
      .populate('rewards.sponsors.sponsorshipId')
      .sort({ startTime: -1 })
      .lean()

    const enrichedGames = await enrichGamesWithDetails(games)

    return {
      status: 'success',
      result: enrichedGames,
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

export const getAllByGroupId = async (groupId, filter = {}) => {
  await connectMongo()
  try {
    if (!groupId) {
      return {
        status: 'error',
        result: null,
        message: 'Valid group ID is required'
      }
    }

    const games = await Game.find({ groupId: groupId, isDeleted: false, ...filter })
      .populate('quiz')
      .populate('groupId')
      .populate('createdBy', 'email firstName lastName roles')
      .populate('forwardingAdmin', 'email firstName lastName roles')
      .populate('rewards.sponsors.sponsorshipId')
      .sort({ startTime: -1 })
      .lean()

    const enrichedGames = await enrichGamesWithDetails(games)

    return {
      status: 'success',
      result: enrichedGames,
      message: `Found ${games.length} games for group ${groupId}`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to retrieve games by group ID'
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
    console.log('gameData', gameData)

    // Fetch the quiz to get language code
    const quiz = await Quiz.findById(gameData?.quiz).lean()
    const quizId = quiz._id
    const languageCode = quiz.language.code
    // Fetch all questions for this quiz and language
    const questions = await QuestionsModel.find({ quizId, languageCode }).lean()
    // Adding questions count field to gameData
    gameData.questionsCount = questions?.length
    gameData.pointsWeightage = Number(gameData?.pointsWeightage || 1)
    gameData.totalPoints = Number(gameData.questionsCount || 0) * gameData.pointsWeightage

    // If live mode, calculate duration from questions
    if (gameData.gameMode === 'live') {
      // Sum timerSeconds from data field
      gameData.duration = questions?.reduce((sum, q) => sum + (q?.data?.timerSeconds || 0), 0)
    }

    // Validate required fields
    const requiredFields = ['title', 'pin', 'quiz', 'createdBy']

    // Only require startTime if status is not awaiting_sponsorship or sponsored
    if (gameData.status !== 'awaiting_sponsorship' && gameData.status !== 'sponsored') {
      requiredFields.push('startTime')
    }

    // Only require duration for self-paced games that are not awaiting sponsorship or sponsored
    if (
      gameData.gameMode === 'self-paced' &&
      gameData.status !== 'awaiting_sponsorship' &&
      gameData.status !== 'sponsored'
    ) {
      requiredFields.push('duration')
    }

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
    const newGame = new Game({
      ...gameData,
      groupId: gameData.groupId || null
    })
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

    const savedGame = await newGame.save({ validateBeforeSave: false })

    // Update sponsorships
    await updateSponsorshipsForGame(savedGame)

    // Check if game should transition from awaiting_sponsorship to sponsored
    if (savedGame.status === 'awaiting_sponsorship' && savedGame.rewards && savedGame.rewards.length > 0) {
      const allRewardsFullySponsored = savedGame.rewards.every(reward => {
        if (!reward.sponsors || reward.sponsors.length === 0) {
          return false // No sponsors means not fully sponsored
        }

        const totalSponsored = reward.sponsors.reduce((sum, sponsor) => {
          const allocated = parseFloat(sponsor.rewardDetails?.allocated || sponsor.allocated || 0)
          return sum + (isNaN(allocated) ? 0 : allocated)
        }, 0)

        const totalNeeded = parseFloat(reward.rewardValuePerWinner || 0)
        return totalSponsored >= totalNeeded
      })

      if (allRewardsFullySponsored) {
        savedGame.status = 'sponsored'
        await savedGame.save({ validateBeforeSave: false })
        console.log(`Game ${savedGame._id} transitioned from awaiting_sponsorship to sponsored`)
      }
    }

    // If the user is ADMIN - Then Schedule game scheduleres(on approval)
    if (user?.roles?.includes('ADMIN')) {
      gameScheduler.onGameApproved(savedGame._id)
    }

    // Broadcast games list update (non-blocking)
    ;(async () => {
      try {
        await broadcastGamesUpdate()
        // Also broadcast admin games update for awaiting_sponsorship and sponsored games
        if (gameData.status === 'awaiting_sponsorship' || gameData.status === 'sponsored') {
          await broadcastAdminGamesUpdate()
        }
      } catch (broadcastError) {
        console.error('Error broadcasting games update:', broadcastError)
      }
    })()

    // ✅ NON-BLOCKING: Create notifications for eligible users when game is created
    // Skip notifications for sponsorship-related games (awaiting_sponsorship or sponsored)
    if (savedGame.status !== 'awaiting_sponsorship' && savedGame.status !== 'sponsored') {
      // Fire and forget - don't await, let it run in background
      ;(async () => {
        try {
          let eligibleUserIds = []

          // If game has a group, notify all members of that group
          if (savedGame.groupId) {
            const group = await Group.findById(savedGame.groupId).populate('members').lean()
            if (group && group.members) {
              eligibleUserIds = group.members.map(member => member._id || member)
            }
          } else {
            // If no group, notify all active users (game is public)
            const allActiveUsers = await User.find({
              isActive: true,
              isVerified: true
            })
              .select('_id')
              .lean()

            if (allActiveUsers && allActiveUsers.length > 0) {
              eligibleUserIds = allActiveUsers.map(user => user._id)
              console.log(`Game created without group - notifying ${eligibleUserIds.length} active users`)
            }
          }

          // Create notifications for eligible users
          if (eligibleUserIds.length > 0) {
            // Get group name if game has a group
            let groupName = null
            if (savedGame.groupId) {
              const group = await Group.findById(savedGame.groupId).select('groupName').lean()
              groupName = group?.groupName || null
            }

            await createGameCreatedNotification(eligibleUserIds, {
              _id: savedGame._id,
              title: savedGame.title,
              groupName: groupName,
              createdBy: savedGame.creatorEmail,
              registrationDeadline: savedGame.registrationEndTime || savedGame.endTime,
              maxParticipants: savedGame.maxPlayers,
              thumbnailPoster: savedGame.thumbnailPoster || savedGame.thumbnailUrl,
              quiz: savedGame.quiz
            })
            console.log(
              `[Game Service] ✅ Sent game created notifications to ${eligibleUserIds.length} user(s) in background`
            )
          }
        } catch (notificationError) {
          console.error('[Game Service] ❌ Error creating game notifications:', notificationError)
          // Don't fail the game creation if notification creation fails
        }
      })()
    } else {
      // For sponsorship-related games, notify all active users that this game needs sponsors
      ;(async () => {
        try {
          const allActiveUsers = await User.find({
            isActive: true,
            isVerified: true
          })
            .select('_id')
            .lean()

          const eligibleUserIds = allActiveUsers && allActiveUsers.length > 0 ? allActiveUsers.map(u => u._id) : []

          if (eligibleUserIds.length > 0) {
            await createGameSponsorshipRequestNotification(eligibleUserIds, {
              _id: savedGame._id,
              title: savedGame.title,
              createdBy: savedGame.creatorEmail,
              registrationDeadline: savedGame.registrationEndTime || savedGame.endTime,
              maxParticipants: savedGame.maxPlayers,
              thumbnailPoster: savedGame.thumbnailPoster || savedGame.thumbnailUrl,
              quiz: savedGame.quiz
            })
            console.log(
              `[Game Service] ✅ Sent sponsorship-request notifications to ${eligibleUserIds.length} active user(s) for game ${savedGame._id}`
            )
          } else {
            console.log(
              `[Game Service] ⏭️ No active users found to notify for sponsorship request of game ${savedGame._id}`
            )
          }
        } catch (err) {
          console.error('[Game Service] ❌ Error creating sponsorship-request notifications:', err)
        }
      })()
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

    console.log('updateData', updateData)

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
    updateData.pointsWeightage = Number(updateData?.pointsWeightage || existingGame?.pointsWeightage || 1)
    updateData.totalPoints = Number(updateData.questionsCount || 0) * updateData.pointsWeightage

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

    // *** CRITICAL: Store old groupId BEFORE any updates are applied ***
    console.log('[Game Service] ===== GROUP CHANGE DETECTION START =====')
    const oldGroupId = existingGame.groupId
      ? existingGame.groupId.toString
        ? existingGame.groupId.toString()
        : String(existingGame.groupId)
      : null
    console.log('[Game Service] Step 1 - Captured OLD groupId from existingGame:', {
      oldGroupId,
      oldGroupIdType: typeof oldGroupId,
      existingGameGroupId: existingGame.groupId,
      existingGameGroupIdType: typeof existingGame.groupId
    })

    // Determine new groupId from updateData (handle undefined, null, ObjectId, and string)
    let newGroupId = oldGroupId
    if (updateData.groupId !== undefined) {
      console.log('[Game Service] Step 2 - Processing updateData.groupId:', {
        updateDataGroupId: updateData.groupId,
        updateDataGroupIdType: typeof updateData.groupId,
        isNull: updateData.groupId === null,
        isEmpty: updateData.groupId === '',
        isStringNull: updateData.groupId === 'null'
      })

      if (updateData.groupId === null || updateData.groupId === '' || updateData.groupId === 'null') {
        newGroupId = null
        console.log('[Game Service] Step 2.1 - New groupId set to NULL')
      } else {
        // Handle ObjectId, string, or object with _id property
        let groupIdValue = updateData.groupId
        if (groupIdValue && typeof groupIdValue === 'object' && groupIdValue._id) {
          console.log('[Game Service] Step 2.2 - Extracting _id from object:', groupIdValue._id)
          groupIdValue = groupIdValue._id
        }
        newGroupId = groupIdValue.toString ? groupIdValue.toString() : String(groupIdValue)
        console.log('[Game Service] Step 2.3 - Converted to string:', newGroupId)
      }
    } else {
      console.log('[Game Service] Step 2 - updateData.groupId is undefined, keeping oldGroupId')
    }

    console.log('[Game Service] Step 3 - Group comparison:', {
      oldGroupId,
      newGroupId,
      areEqual: oldGroupId === newGroupId,
      willProcessNotifications: oldGroupId !== newGroupId
    })
    console.log('[Game Service] ===== GROUP CHANGE DETECTION END =====')

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

    // ✅ Track if status is being changed TO 'cancelled' for notification (check BEFORE applying updates)
    const oldStatus = existingGame.status
    const isBeingCancelled = updateData.status === 'cancelled' && oldStatus !== 'cancelled'
    const cancellationReason =
      updateData.cancellationReason || existingGame.cancellationReason || 'Game has been cancelled'

    // Apply updates to the existing game document
    Object.keys(updateData).forEach(key => {
      // Special handling for groupId to ensure it's properly set
      if (key === 'groupId' && updateData[key] !== undefined) {
        console.log('[Game Service] Applying groupId update to existingGame:', {
          key,
          updateValue: updateData[key],
          updateValueType: typeof updateData[key]
        })
        if (updateData[key] === null || updateData[key] === '' || updateData[key] === 'null') {
          existingGame[key] = null
        } else {
          // Handle ObjectId, string, or object with _id property
          let groupIdValue = updateData[key]
          if (groupIdValue && typeof groupIdValue === 'object' && groupIdValue._id) {
            groupIdValue = groupIdValue._id
          }
          // Convert to ObjectId if it's a string
          if (typeof groupIdValue === 'string' && mongoose.Types.ObjectId.isValid(groupIdValue)) {
            existingGame[key] = new mongoose.Types.ObjectId(groupIdValue)
          } else if (groupIdValue && groupIdValue.toString) {
            existingGame[key] = groupIdValue
          } else {
            existingGame[key] = groupIdValue
          }
        }
        console.log('[Game Service] After applying groupId, existingGame.groupId:', existingGame[key])
      } else {
        existingGame[key] = updateData[key]
      }
      // Handle un-cancelling a cancelled game (if game WAS cancelled and is being un-cancelled)
      if (key === 'status' && oldStatus === 'cancelled' && updateData[key] !== 'cancelled') {
        existingGame.cancellationReason = undefined
        // For admin case (approving)
        if (user?.roles?.includes(ROLES_LOOKUP.ADMIN)) {
          existingGame.status = 'approved'
          existingGame.approvedBy = updateData.updatedBy
          existingGame.approverEmail = updateData.updaterEmail
          existingGame.approvedAt = new Date()
        }
        // For non-admin case (reverting cancellation)
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
    const updatedGame = await existingGame.save({ validateBeforeSave: false })

    // ✅ NON-BLOCKING: Send "game cancelled" notifications if game was manually cancelled via updateOne
    if (isBeingCancelled && updatedGame.status === 'cancelled') {
      ;(async () => {
        try {
          await createGameCancelledNotificationsForRegisteredUsers(gameId.toString(), {
            _id: updatedGame._id || gameId,
            title: updatedGame.title,
            cancellationReason: cancellationReason,
            thumbnailPoster: updatedGame.thumbnailPoster || updatedGame.thumbnailUrl,
            quiz: updatedGame.quiz
          })
          console.log(`[Game Service] ✅ Sent game cancelled notifications for manually cancelled game ${gameId}`)
        } catch (notificationError) {
          console.error(
            `[Game Service] ❌ Error sending game cancelled notifications for manually cancelled game ${gameId}:`,
            notificationError
          )
        }
      })()
    }

    // Handle group change notifications
    console.log('[Game Service] ===== NOTIFICATION PROCESSING START =====')
    console.log('[Game Service] Checking if group changed:', {
      oldGroupId,
      newGroupId,
      areEqual: oldGroupId === newGroupId,
      willProcess: oldGroupId !== newGroupId
    })

    if (oldGroupId !== newGroupId) {
      console.log('[Game Service] ✅ Group changed detected! Processing notifications...')
      try {
        let oldGroupMemberIds = []
        let newGroupMemberIds = []

        // Get old group members if old group exists
        if (oldGroupId) {
          console.log('[Game Service] Step 4.1 - Fetching old group:', oldGroupId)
          const oldGroup = await Group.findById(oldGroupId).populate('members').lean()
          console.log('[Game Service] Step 4.1 - Old group query result:', {
            found: !!oldGroup,
            hasMembers: !!(oldGroup && oldGroup.members),
            memberCount: oldGroup?.members?.length || 0
          })

          if (oldGroup && oldGroup.members) {
            oldGroupMemberIds = oldGroup.members.map(member => (member._id || member).toString())
            console.log(
              `[Game Service] Step 4.1 - Old group has ${oldGroupMemberIds.length} members:`,
              oldGroupMemberIds
            )
          } else {
            console.log(`[Game Service] Step 4.1 - ❌ Old group not found or has no members: ${oldGroupId}`)
          }
        } else {
          console.log('[Game Service] Step 4.1 - Old groupId is null, skipping')
        }

        // Handle different scenarios
        if (newGroupId === null) {
          // SCENARIO: Game becomes PUBLIC (groupId removed)
          console.log('[Game Service] Step 4.2 - Game is becoming PUBLIC (groupId removed)')

          // Get all active users
          const allActiveUsers = await User.find({
            isActive: true,
            isVerified: true
          })
            .select('_id')
            .lean()

          const allActiveUserIds = allActiveUsers.map(user => user._id.toString())
          console.log(`[Game Service] Step 4.2 - Found ${allActiveUserIds.length} active users`)

          // Find users who already have GAME_CREATED notification for this game
          const Notification = mongoose.model('notifications')
          const existingNotifications = await Notification.find({
            type: 'GAME_CREATED',
            'relatedEntity.entityType': 'game',
            'relatedEntity.entityId': updatedGame._id.toString()
          })
            .select('userId')
            .lean()

          const usersWithExistingNotifications = existingNotifications.map(n => n.userId.toString())
          console.log(
            `[Game Service] Step 4.2 - Found ${usersWithExistingNotifications.length} users who already have notifications`
          )

          // Exclude users who already have notifications
          const usersToAdd = allActiveUserIds.filter(userId => !usersWithExistingNotifications.includes(userId))

          console.log('[Game Service] Step 4.2 - Users to notify (excluding those with existing notifications):', {
            count: usersToAdd.length,
            userIds: usersToAdd
          })

          // Don't send removal notifications - old group members can still play (game is now public)
          console.log(
            '[Game Service] Step 4.2 - ⏭️ Skipping removal notifications (game is now public, old group members can still play)'
          )

          // Send welcome notifications to all users who don't already have one
          if (usersToAdd.length > 0) {
            console.log('[Game Service] Step 5.2 - Sending public game notifications...')
            const addResult = await createGameCreatedNotification(usersToAdd, {
              _id: updatedGame._id,
              title: updatedGame.title,
              groupName: null, // Game is now public, no group
              createdBy: updatedGame.creatorEmail,
              registrationDeadline: updatedGame.registrationEndTime || updatedGame.endTime,
              maxParticipants: updatedGame.maxPlayers,
              thumbnailPoster: updatedGame.thumbnailPoster || updatedGame.thumbnailUrl,
              quiz: updatedGame.quiz
            })
            console.log(`[Game Service] Step 5.2 - ✅ Public game notification result:`, addResult)
          } else {
            console.log('[Game Service] Step 5.2 - ⏭️ All users already have notifications, skipping')
          }
        } else {
          // SCENARIO: Group changed from one to another
          console.log('[Game Service] Step 4.2 - Group changed from one to another')

          // Get new group members if new group exists
          console.log('[Game Service] Step 4.2 - Fetching new group:', newGroupId)
          const newGroup = await Group.findById(newGroupId).populate('members').lean()
          console.log('[Game Service] Step 4.2 - New group query result:', {
            found: !!newGroup,
            hasMembers: !!(newGroup && newGroup.members),
            memberCount: newGroup?.members?.length || 0
          })

          if (newGroup && newGroup.members) {
            newGroupMemberIds = newGroup.members.map(member => (member._id || member).toString())
            console.log(
              `[Game Service] Step 4.2 - New group has ${newGroupMemberIds.length} members:`,
              newGroupMemberIds
            )
          } else {
            console.log(`[Game Service] Step 4.2 - ❌ New group not found or has no members: ${newGroupId}`)
          }

          // Find users who are ONLY in old group (need removal notification)
          console.log('[Game Service] Step 4.3 - Calculating users to remove...')
          const usersToRemove = oldGroupMemberIds.filter(userId => !newGroupMemberIds.includes(userId))
          console.log('[Game Service] Step 4.3 - Users to remove:', {
            count: usersToRemove.length,
            userIds: usersToRemove
          })

          // Find users who are ONLY in new group (need welcome notification)
          console.log('[Game Service] Step 4.4 - Calculating users to add...')
          const usersToAdd = newGroupMemberIds.filter(userId => !oldGroupMemberIds.includes(userId))
          console.log('[Game Service] Step 4.4 - Users to add:', {
            count: usersToAdd.length,
            userIds: usersToAdd
          })

          const usersInBoth = oldGroupMemberIds.filter(userId => newGroupMemberIds.includes(userId))
          console.log('[Game Service] Step 4.5 - Summary:', {
            usersToRemove: usersToRemove.length,
            usersToAdd: usersToAdd.length,
            usersInBoth: usersInBoth.length,
            usersInBothIds: usersInBoth
          })

          // Send removal notifications to users who lost access
          if (usersToRemove.length > 0) {
            console.log('[Game Service] Step 5.1 - Sending removal notifications...')

            // Get old group name for the notification message
            let oldGroupName = null
            if (oldGroupId) {
              const oldGroup = await Group.findById(oldGroupId).select('groupName').lean()
              oldGroupName = oldGroup?.groupName || null
            }

            console.log('[Game Service] Step 5.1 - Notification data:', {
              userIds: usersToRemove,
              gameId: updatedGame._id,
              gameTitle: updatedGame.title,
              oldGroupName: oldGroupName,
              updatedBy: updateData.updaterEmail || 'Admin'
            })

            const removeResult = await createGameAccessRemovedNotification(usersToRemove, {
              _id: updatedGame._id,
              title: updatedGame.title,
              groupName: oldGroupName,
              updatedBy: updateData.updaterEmail || 'Admin'
            })
            console.log(`[Game Service] Step 5.1 - ✅ Removal notification result:`, removeResult)
          } else {
            console.log('[Game Service] Step 5.1 - ⏭️ No users to remove, skipping removal notifications')
          }

          // Send welcome notifications to users who gained access (use GAME_CREATED notification)
          if (usersToAdd.length > 0) {
            console.log('[Game Service] Step 5.2 - Sending welcome notifications...')

            // Get new group name for the notification message
            let newGroupName = null
            if (newGroupId) {
              const newGroup = await Group.findById(newGroupId).select('groupName').lean()
              newGroupName = newGroup?.groupName || null
            }

            console.log('[Game Service] Step 5.2 - Notification data:', {
              userIds: usersToAdd,
              gameId: updatedGame._id,
              gameTitle: updatedGame.title,
              newGroupName: newGroupName,
              createdBy: updatedGame.creatorEmail,
              registrationDeadline: updatedGame.registrationEndTime || updatedGame.endTime,
              maxParticipants: updatedGame.maxPlayers
            })

            const addResult = await createGameCreatedNotification(usersToAdd, {
              _id: updatedGame._id,
              title: updatedGame.title,
              groupName: newGroupName,
              createdBy: updatedGame.creatorEmail,
              registrationDeadline: updatedGame.registrationEndTime || updatedGame.endTime,
              maxParticipants: updatedGame.maxPlayers,
              thumbnailPoster: updatedGame.thumbnailPoster || updatedGame.thumbnailUrl,
              quiz: updatedGame.quiz
            })
            console.log(`[Game Service] Step 5.2 - ✅ Welcome notification result:`, addResult)
          } else {
            console.log('[Game Service] Step 5.2 - ⏭️ No users to add, skipping welcome notifications')
          }
        }

        console.log('[Game Service] ===== NOTIFICATION PROCESSING COMPLETE =====')
      } catch (notificationError) {
        console.error('[Game Service] ❌❌❌ ERROR in notification processing ❌❌❌')
        console.error('[Game Service] Error message:', notificationError.message)
        console.error('[Game Service] Error stack:', notificationError.stack)
        console.error('[Game Service] Full error object:', notificationError)
        // Don't fail the game update if notification creation fails
      }
    } else {
      console.log('[Game Service] ⏭️ No group change detected (oldGroupId === newGroupId), skipping notifications')
      console.log('[Game Service] ===== NOTIFICATION PROCESSING SKIPPED =====')
    }

    // Update sponsorships
    await updateSponsorshipsForGame(updatedGame)

    // Check if game should transition from awaiting_sponsorship to sponsored
    if (updatedGame.status === 'awaiting_sponsorship' && updatedGame.rewards && updatedGame.rewards.length > 0) {
      const allRewardsFullySponsored = updatedGame.rewards.every(reward => {
        if (!reward.sponsors || reward.sponsors.length === 0) {
          return false // No sponsors means not fully sponsored
        }

        const totalSponsored = reward.sponsors.reduce((sum, sponsor) => {
          const allocated = parseFloat(sponsor.rewardDetails?.allocated || sponsor.allocated || 0)
          return sum + (isNaN(allocated) ? 0 : allocated)
        }, 0)

        const totalNeeded = parseFloat(reward.rewardValuePerWinner || 0)
        return totalSponsored >= totalNeeded
      })

      if (allRewardsFullySponsored) {
        updatedGame.status = 'sponsored'
        await updatedGame.save()
        console.log(`Game ${updatedGame._id} transitioned from awaiting_sponsorship to sponsored`)
      }
    }

    // Broadcast games list update
    broadcastGamesUpdate()

    // Also broadcast admin games update for awaiting_sponsorship and sponsored games
    if (updatedGame.status === 'awaiting_sponsorship' || updatedGame.status === 'sponsored') {
      await broadcastAdminGamesUpdate()
    }

    broadcastGameDetailsUpdates(gameId)

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
    // const deletedGame = await Game.deleteOne({ _id: gameId })

    // Delete all players for this game
    await Player.deleteMany({ game: gameId })

    // Revert sponsorships
    await revertSponsorshipsForGame(deletedGame)

    // Send notifications to users who had access to this game
    try {
      console.log('[Game Service] ===== GAME DELETION NOTIFICATION START =====')
      let usersToNotify = []

      // If game had a group, notify all members of that group
      if (existingGame.groupId) {
        const group = await Group.findById(existingGame.groupId).populate('members').lean()
        if (group && group.members) {
          usersToNotify = group.members.map(member => (member._id || member).toString())
          console.log(`[Game Service] Found ${usersToNotify.length} group members to notify`)
        }
      } else {
        // If no group, notify all users who have GAME_CREATED notification for this game
        const Notification = mongoose.model('notifications')
        const existingNotifications = await Notification.find({
          type: 'GAME_CREATED',
          'relatedEntity.entityType': 'game',
          'relatedEntity.entityId': gameId.toString()
        })
          .select('userId')
          .lean()

        usersToNotify = existingNotifications.map(n => n.userId.toString())
        console.log(`[Game Service] Found ${usersToNotify.length} users with game notifications to notify`)
      }

      // Send deletion notifications
      if (usersToNotify.length > 0) {
        const notificationResult = await createGameDeletedNotification(usersToNotify, {
          _id: deletedGame._id,
          title: deletedGame.title,
          deletedBy: user.email,
          deleterEmail: user.email,
          thumbnailPoster: deletedGame.thumbnailPoster || deletedGame.thumbnailUrl,
          quiz: deletedGame.quiz
        })
        console.log(
          `[Game Service] ✅ Sent deletion notifications to ${usersToNotify.length} users:`,
          notificationResult
        )
      } else {
        console.log('[Game Service] ⏭️ No users to notify for game deletion')
      }
      console.log('[Game Service] ===== GAME DELETION NOTIFICATION COMPLETE =====')
    } catch (notificationError) {
      console.error('[Game Service] Error sending game deletion notifications:', notificationError)
      // Don't fail the game deletion if notification creation fails
    }

    // Broadcast games list update
    broadcastGamesUpdate()
    broadcastGameDetailsUpdates(gameId)

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

    // Broadcast games list update
    broadcastGamesUpdate()
    broadcastGameDetailsUpdates(gameId)

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
    const user = await User.findOne({ email: userData?.email }).populate('profile')
    if (!user) {
      return {
        status: 'error',
        result: null,
        message: 'User with this email does not exist.'
      }
    }
    userData.id = user._id

    const profile = await UserProfile.findOne({ email: userData?.email }).lean()

    // Check if player already exists for this game
    let player = await Player.findOne({ game: gameId, email: userData?.email })
    if (player) {
      const game = await Game.findById(gameId).lean()
      const enrichedGame = await enrichGameWithDetails(game)
      return {
        status: 'success',
        result: enrichedGame,
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
    })
      .populate('groupId')
      .lean()
    if (!game) {
      return {
        status: 'error',
        result: null,
        message: 'Game not found or not joinable'
      }
    }

    // Enforce group membership if game is restricted to a group
    if (game.groupId && game.groupId._id) {
      const groupIdStr = (game.groupId._id || game.groupId).toString()
      const usergroupIds = (user.groupIds || []).map(g => g.toString())
      const isMember = usergroupIds.includes(groupIdStr)
      if (!isMember) {
        const grp = game.groupId
        const filters = []
        if (grp?.ageGroup?.min != null && grp?.ageGroup?.max != null)
          filters.push(`Age ${grp.ageGroup.min}-${grp.ageGroup.max}`)
        if (grp?.gender?.length) filters.push(`Gender: ${grp.gender.join(', ')}`)
        if (grp?.location) {
          const locParts = [grp.location.city, grp.location.region, grp.location.country].filter(Boolean)
          if (locParts.length) filters.push(`Location: ${locParts.join(', ')}`)
        }
        const filterText = filters.length ? ` Filters: ${filters.join(' | ')}` : ''
        return {
          status: 'error',
          result: null,
          message: `You are not allowed to register/join this game. This game is restricted to the group "${
            grp?.groupName || 'Private Group'
          }".${filterText}`
        }
      }
    }

    // Restriction mode is exclusive: group OR location.
    // If group is configured, only group membership is enforced.
    if (!(game.groupId && game.groupId._id) && !profileMatchesGameLocation(profile, game)) {
      const hint = restrictedLocationHint(game)
      return {
        status: 'error',
        result: null,
        message: hint
          ? `You are not allowed to register/join this game. Your profile address must match this game's location: ${hint}.`
          : "You are not allowed to register/join this game. Your profile address must match the game's configured location."
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

    const enrichedGame = await enrichGameWithDetails(game)

    // Broadcast updates (non-blocking)
    broadcastGameDetailsUpdates(gameId)
    const leaderboard = enrichedGame?.participatedUsers?.map(p => ({
      ...p,
      totalAnswerTime: p.answers?.reduce((sum, a) => sum + (a?.answerTime || 0), 0)
    }))
    broadcastLeaderboard(gameId, leaderboard)
    broadcastGamesUpdate()

    // ✅ NON-BLOCKING: Send registration notification to user (with push notification)
    // Fire and forget - don't await, let it run in background
    ;(async () => {
      try {
        await createGameRegisteredNotification(user._id, {
          _id: game._id,
          title: game.title,
          startTime: game.startTime,
          registrationEndTime: game.registrationEndTime,
          thumbnailPoster: game.thumbnailPoster || game.thumbnailUrl,
          quiz: game.quiz
        })
        console.log(`[Game Service] ✅ Sent game registered notification to user ${user._id} in background`)
      } catch (notificationError) {
        console.error('[Game Service] ❌ Error sending game registration notification:', notificationError)
        // Don't fail the registration if notification fails
      }
    })()

    return {
      status: 'success',
      result: enrichedGame,
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
      const game = await Game.findById(gameId).lean()
      const enrichedGame = await enrichGameWithDetails(game)
      return {
        status: 'success',
        result: enrichedGame,
        message: 'User already started or completed this game'
      }
    }
    // Update status to participated
    player.status = 'participated'
    player.joinedAt = new Date()
    await player.save()
    // Get questions and verify group restriction again (defense-in-depth)
    const gameDoc = await Game.findById(gameId).populate('quiz').populate('groupId')
    const game = gameDoc?.toObject?.() || gameDoc
    if (!game) {
      return {
        status: 'error',
        result: null,
        message: 'Game not found'
      }
    }

    const profile = await UserProfile.findOne({ email: userData?.email }).lean()

    if (game.groupId && game.groupId._id) {
      const groupIdStr = (game.groupId._id || game.groupId).toString()
      const usergroupIds = (user.groupIds || []).map(g => g.toString())
      const isMember = usergroupIds.includes(groupIdStr)
      if (!isMember) {
        const grp = game.groupId
        const filters = []
        if (grp?.ageGroup?.min != null && grp?.ageGroup?.max != null)
          filters.push(`Age ${grp.ageGroup.min}-${grp.ageGroup.max}`)
        if (grp?.gender?.length) filters.push(`Gender: ${grp.gender.join(', ')}`)
        if (grp?.location) {
          const locParts = [grp.location.city, grp.location.region, grp.location.country].filter(Boolean)
          if (locParts.length) filters.push(`Location: ${locParts.join(', ')}`)
        }
        const filterText = filters.length ? ` Filters: ${filters.join(' | ')}` : ''
        return {
          status: 'error',
          result: null,
          message: `You are not allowed to start this game. This game is restricted to the group "${
            grp?.groupName || 'Private Group'
          }".${filterText}`
        }
      }
    }

    // Restriction mode is exclusive: group OR location.
    // If group is configured, only group membership is enforced.
    if (!(game.groupId && game.groupId._id) && !profileMatchesGameLocation(profile, game)) {
      const hint = restrictedLocationHint(game)
      return {
        status: 'error',
        result: null,
        message: hint
          ? `You are not allowed to start this game. Your profile address must match this game's location: ${hint}.`
          : "You are not allowed to start this game. Your profile address must match the game's configured location."
      }
    }

    const enrichedGame = await enrichGameWithDetails(game)
    const leaderboard = enrichedGame?.participatedUsers?.map(p => ({
      ...p,
      totalAnswerTime: p.answers?.reduce((sum, a) => sum + (a?.answerTime || 0), 0)
    }))
    broadcastGameDetailsUpdates(gameId)
    broadcastLeaderboard(gameId, leaderboard)
    broadcastGamesUpdate()
    return {
      status: 'success',
      result: enrichedGame,
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
    // Find if answer already exists for this question
    const existingAnswerIndex = player.answers.findIndex(a => a.question.toString() === userAnswer.question.toString())

    const game = await Game.findById(gameId).lean()

    // Allow last answer submission after completed, only if not already answered and finish is true
    if (player.status === 'completed') {
      if (finish && existingAnswerIndex === -1 && game?.forwardType === 'admin') {
        // Allow one last answer submission
        const answerData = { ...userAnswer }
        let scoreDelta = answerData.marks || 0
        let fffPointsDelta = answerData.fffPoints || 0
        player.answers.push(answerData)
        player.score += scoreDelta
        player.fffPoints = (player.fffPoints || 0) + fffPointsDelta
        // No need to set completed/status again
        await player.save()
        // Fetch latest game, registeredUsers, and participatedUsers
        const [registeredUsers, participatedUsers] = await Promise.all([
          Player.find({ game: gameId, status: { $in: ['registered', 'participated', 'completed'] } }).lean(),
          Player.find({ game: gameId, status: { $in: ['participated', 'completed'] } }).lean()
        ])
        // Broadcast leaderboard update
        try {
          const players = await Player.find({ game: gameId, status: { $in: ['participated', 'completed'] } })
            .sort({ fffPoints: -1 })
            .lean()

            .populate({
              path: 'user',
              populate: {
                path: 'profile'
              }
            })
          const leaderboard = players.map(p => ({
            ...p,
            totalAnswerTime: p.answers?.reduce((sum, a) => sum + (a?.answerTime || 0), 0)
          }))
          broadcastLeaderboard(gameId, leaderboard)
          broadcastGameDetailsUpdates(gameId)
        } catch (e) {
          console.error('Failed to broadcast leaderboard:', e)
        }
        return {
          status: 'success',
          result: { ...game, registeredUsers, participatedUsers },
          message: 'Player progress updated successfully (after completion)'
        }
      } else {
        return {
          status: 'error',
          result: null,
          message: 'Player already completed the game.'
        }
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

    const wasJustCompleted = finish && player.status !== 'completed'

    if (finish) {
      player.completed = true
      player.status = 'completed'
      player.finishedAt = new Date()
      if (!player.registeredAt) {
        player.registeredAt = new Date()
      }
    }

    await player.save()

    if (wasJustCompleted) {
      await awardGamePointsToUser({ player, game })
    }

    // Fetch latest game, registeredUsers, and participatedUsers
    const [registeredUsers, participatedUsers] = await Promise.all([
      Player.find({ game: gameId, status: { $in: ['registered', 'participated', 'completed'] } })
        .lean()

        .populate({
          path: 'user',
          populate: {
            path: 'profile'
          }
        }),
      Player.find({ game: gameId, status: { $in: ['participated', 'completed'] } })
        .lean()

        .populate({
          path: 'user',
          populate: {
            path: 'profile'
          }
        })
    ])

    // Broadcast leaderboard update
    try {
      const players = await Player.find({ game: gameId, status: { $in: ['participated', 'completed'] } })
        .sort({ fffPoints: -1 })
        .lean()

        .populate({
          path: 'user',
          populate: {
            path: 'profile'
          }
        })
      const leaderboard = players.map(p => ({
        ...p,
        totalAnswerTime: p.answers?.reduce((sum, a) => sum + (a?.answerTime || 0), 0)
      }))
      broadcastLeaderboard(gameId, leaderboard)
      broadcastGameDetailsUpdates(gameId)
    } catch (e) {
      console.error('Failed to broadcast leaderboard:', e)
    }

    // Note: Game completed notifications are sent when the entire game completes (via scheduler or admin-forwarding)
    // No need to send individual notifications here to avoid duplicates

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

      .populate({
        path: 'user',
        populate: {
          path: 'profile'
        }
      })
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
export async function updateSponsorshipsForGame(game) {
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

    broadcastGameDetailsUpdates(gameId)

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

    // --- FFF Points Calculation for just-ended question ---
    // if (currentQuestionIndex >= 0) {
    //   const questionEndTime = new Date()
    //   const questionStartTime =
    //     game.liveQuestionIndex > 0 ? new Date(game.liveQuestionStartedAt) : new Date(game?.startTime)
    //   const questionDuration = new Date(questionEndTime).getTime() - new Date(questionStartTime).getTime()

    //   // Get the just-ended question's ID and max marks
    //   const quiz = await Quiz.findById(game.quiz).lean()
    //   const questions = await QuestionsModel.find({ quizId: quiz._id, languageCode: quiz.language?.code })
    //     .sort({ createdAt: 1 })
    //     .lean()
    //   const justEndedQuestion = questions[currentQuestionIndex]
    //   const maxMarks = justEndedQuestion?.data?.marks || 1
    //   const maxFFF = 1000

    //   // Get all players who participated
    //   const players = await Player.find({ game: gameId, status: { $in: ['participated', 'completed'] } })

    //   for (const player of players) {
    //     // Find the answer for the just-ended question
    //     const answer = player?.answers?.find(a => a.question.toString() === justEndedQuestion._id.toString())
    //     if (answer && answer.answerTime != null) {
    //       // Calculate fffPoints
    //       answer.fffPoints =
    //         answer.marks > 0 ? maxFFF * (1 - answer.answerTime / questionDuration) * (answer.marks / maxMarks) : 0
    //     }
    //     // Update player's total fffPoints
    //     player.fffPoints = player.answers.reduce((sum, a) => sum + (a.fffPoints || 0), 0)
    //     await player.save()
    //   }
    //   // Broadcast updated leaderboard
    //   const updatedPlayers = await Player.find({ game: gameId, status: { $in: ['participated', 'completed'] } }).lean()
    //   const leaderboard = updatedPlayers.map(p => ({
    //     ...p,
    //     totalAnswerTime: p.answers?.reduce((sum, a) => sum + (a?.answerTime || 0), 0)
    //   }))
    //   broadcastLeaderboard(gameId, leaderboard)
    // }
    // --- End FFF Points Calculation ---

    let message = ''
    if (currentQuestionIndex >= totalQuestions - 1) {
      // Last question, complete the game
      game.status = 'completed'
      game.liveQuestionIndex = totalQuestions - 1
      game.liveQuestionStartedAt = new Date()
      game.duration = (new Date().getTime() - new Date(game?.startTime).getTime()) / 1000
      await game.save()

      // ✅ CRITICAL: Identify participated users BEFORE updating player statuses
      // We need to know who actually participated vs who just registered
      const now = new Date()

      // Get all players BEFORE updating statuses to identify who participated vs who just registered
      const allPlayersBeforeUpdate = await Player.find({ game: gameId }).select('user status').lean()

      // Identify users who actually participated (status: 'participated' or 'completed')
      const participatedUserIds = [
        ...new Set(
          allPlayersBeforeUpdate
            .filter(p => p.status === 'participated' || p.status === 'completed')
            .map(p => p.user?.toString())
            .filter(Boolean)
        )
      ]

      // Identify users who only registered but didn't participate (status: 'registered')
      const registeredOnlyUserIds = [
        ...new Set(
          allPlayersBeforeUpdate
            .filter(p => p.status === 'registered')
            .map(p => p.user?.toString())
            .filter(Boolean)
        )
      ]

      console.log(
        `[Game Service] Admin-forwarded game ${gameId} completion - Participated: ${participatedUserIds.length}, Registered only: ${registeredOnlyUserIds.length}`
      )

      // Update player statuses:
      // - Participated users → 'completed'
      // - Registered-only users → keep as 'registered' (don't mark as completed - they missed it)
      if (participatedUserIds.length > 0) {
        await Player.updateMany(
          { game: gameId, user: { $in: participatedUserIds.map(id => new mongoose.Types.ObjectId(id)) } },
          { $set: { status: 'completed', completed: true, finishedAt: now } }
        )
        console.log(`[Game Service] ✅ Updated ${participatedUserIds.length} participated user(s) to completed status`)

        const completedPlayers = await Player.find({
          game: gameId,
          user: { $in: participatedUserIds.map(id => new mongoose.Types.ObjectId(id)) }
        })
        for (const player of completedPlayers) {
          await awardGamePointsToUser({ player, game, userIdOverride: player.user })
        }
      }

      // ✅ NON-BLOCKING: Send notifications in background (fire-and-forget)
      // Don't await - let them run in background so API response is immediate
      ;(async () => {
        try {
          // Send "game missed" notifications to registered but not participated users
          if (registeredOnlyUserIds.length > 0) {
            await createGameMissedNotificationsForRegisteredUsers(gameId.toString(), {
              _id: game._id || gameId,
              title: game.title,
              thumbnailPoster: game.thumbnailPoster || game.thumbnailUrl,
              quiz: game.quiz
            })
            console.log(
              `[Game Service] ✅ Sent game missed notifications to ${registeredOnlyUserIds.length} registered-only user(s)`
            )
          }

          // Send "game completed" notifications ONLY to users who actually participated
          if (participatedUserIds.length > 0) {
            const { createGameCompletedNotificationsForParticipatedUsers } = await import(
              '../notifications/notification.helpers.js'
            )

            await createGameCompletedNotificationsForParticipatedUsers(gameId.toString(), {
              _id: game._id || gameId,
              title: game.title,
              thumbnailPoster: game.thumbnailPoster || game.thumbnailUrl,
              quiz: game.quiz
            })
            console.log(
              `[Game Service] ✅ Sent game completed notifications to ${participatedUserIds.length} participated user(s)`
            )
          }
        } catch (notificationError) {
          console.error(
            `[Game Service] ❌ Error sending notifications for admin-forwarded game ${gameId}:`,
            notificationError
          )
          // Don't fail the game completion if notifications fail
        }
      })()

      message = `Game completed. ${participatedUserIds.length} participated user(s) marked as completed, ${registeredOnlyUserIds.length} registered-only user(s) kept as registered.`
    } else {
      // Increment liveQuestionIndex
      game.liveQuestionIndex = currentQuestionIndex + 1
      game.liveQuestionStartedAt = new Date()
      await game.save()
      message = 'Moved to next question.'
    }
    // Always return game with registeredPlayers, participatedUsers, and questions
    const resultGame = await getOne({ _id: game._id })

    broadcastGameDetailsUpdates(game._id, resultGame.result)

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

// Helper to broadcast updated games list
export async function broadcastGamesUpdate() {
  try {
    const allGamesRes = await getAllPublic()
    broadcastGamesList(allGamesRes.result)
  } catch (e) {
    console.error('Failed to broadcast games list:', e)
  }
}

export async function broadcastAdminGamesUpdate() {
  try {
    const allGamesRes = await getAll()
    broadcastGamesList(allGamesRes.result)

    // Also broadcast sponsor games list (games awaiting sponsorship)
    const sponsorGames = (allGamesRes.result || []).filter(game => game.status === 'awaiting_sponsorship')
    if (sponsorGames.length > 0) {
      broadcastSponsorGamesList(sponsorGames)
    }
  } catch (e) {
    console.error('Failed to broadcast admin games list:', e)
  }
}

export async function broadcastGameDetailsUpdates(gameId, updatedGame = null) {
  try {
    let game = updatedGame
    if (!game) {
      const gameRes = await getOne({ _id: gameId })
      game = gameRes.result
      broadcastGameDetails(gameId, game)
    } else {
      broadcastGameDetails(gameId, game)
    }

    // Also broadcast to sponsor games WebSocket if game is awaiting sponsorship
    if (game && game.status === 'awaiting_sponsorship') {
      const { broadcastSponsorGameDetails } = await import('../ws/sponsor-games/[gameId]/publishers')
      broadcastSponsorGameDetails(gameId, game)
    }
  } catch (e) {
    console.error('Failed to broadcast game details:', e)
  }
}

// Function to clean up orphaned groupId references in games
export const cleanupOrphanedGroupReferences = async () => {
  await connectMongo()
  try {
    // Find all games that have a groupId but the group doesn't exist or is deleted
    const gamesWithgroupId = await Game.find({
      groupId: { $exists: true, $ne: null },
      isDeleted: false
    }).populate('groupId')

    let cleanedCount = 0

    for (const game of gamesWithgroupId) {
      // Check if the group exists and is not deleted
      if (!game.groupId || game.groupId.isDeleted) {
        await Game.updateOne({ _id: game._id }, { $unset: { groupId: 1 } })
        cleanedCount++
        console.log(`Cleaned up orphaned groupId reference in game ${game._id}`)
      }
    }

    return {
      status: 'success',
      result: { cleanedCount },
      message: `Cleaned up ${cleanedCount} orphaned group references in games`
    }
  } catch (error) {
    return {
      status: 'error',
      result: null,
      message: error.message || 'Failed to cleanup orphaned group references'
    }
  }
}
