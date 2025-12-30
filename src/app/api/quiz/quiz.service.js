import connectMongo from '@/utils/dbConnect-mongo'
import Quiz from './quiz.model.js'
import QuestionModel from '../question/question.model.js'
import * as QuestionService from '../question/question.service.js'
import { quizCreateRequestDtoSchema, validateQuizQuestions } from './quiz.validator.js'
import mongoose from 'mongoose'
import * as ApiResponseUtils from '@/utils/apiResponses'
import {
  createQuizApprovedNotification,
  createQuizRejectedNotification,
  createQuizPendingApprovalNotification,
  createQuizPublishedNotification
} from '../notifications/notification.helpers.js'
import User from '@/app/models/user.model.js'
import { ROLES_LOOKUP } from '@/configs/roles-lookup.js'

const Artifact = 'Quiz'
const ArtifactModel = Quiz
const CreateRequestDtoSchema = quizCreateRequestDtoSchema

export async function createRootDocument() {
  // Assuming you have a string representation of the ObjectId
  const stringObjectId = '369369369369369369369369' // Replace with your actual ObjectId
  // Convert the string to an ObjectId
  const objectId = new mongoose.Types.ObjectId(stringObjectId)
  const rootDocument = new ArtifactModel({
    id: 'AUM',
    title: 'AUM',
    tags: ['root']
    // other fields
  })

  rootDocument
    .save()
    .then(() => console.log('Root Document Saved successfully'))
    .catch(err => {
      console.error('Error savign root document', err)
    })
}

// **Add Artifact**
export async function add(addRequestData) {
  //await createRootDocument();

  try {
    await CreateRequestDtoSchema.validate(addRequestData, { abortEarly: false })
  } catch (err) {
    console.error(err)
    // return {status:'error', result: null, message: err.message, statusCode: 500}
    return { status: 'error', result: null, message: err.message, statusCode: 422 }
  }

  //{id,name, details, owner, createdBy, privacy, parentContextId, parentType, tags, status}) {
  await connectMongo()
  try {
    const newArtifact = new ArtifactModel({ ...addRequestData })
    await newArtifact.save()
    console.log(`${Artifact}` + ' added successfully!')

    // If quiz is submitted for approval (approvalState is 'pending'), notify admins
    if (newArtifact.approvalState === 'pending') {
      try {
        console.log('[Quiz Service] Quiz created with pending state, finding admins...')
        // Find all admin users (SUPER_ADMIN, ADMIN, or QUIZ_REVIEWER roles)
        // These are the roles that can approve/reject quizzes
        const adminUsers = await User.find({
          $and: [
            {
              $or: [
                { roles: { $in: [ROLES_LOOKUP.SUPER_ADMIN, ROLES_LOOKUP.ADMIN, 'QUIZ_REVIEWER'] } },
                { isAdmin: true }
              ]
            },
            {
              $or: [{ isActive: true }, { isActive: { $exists: false } }]
            }
          ]
        })
          .select('_id email roles isAdmin isActive')
          .lean()

        console.log('[Quiz Service] Found admin users:', adminUsers?.length || 0)
        if (adminUsers && adminUsers.length > 0) {
          console.log(
            '[Quiz Service] Admin users:',
            adminUsers.map(u => ({ id: u._id, email: u.email, roles: u.roles }))
          )
          const adminUserIds = adminUsers.map(admin => admin._id)
          const notificationResult = await createQuizPendingApprovalNotification(adminUserIds, {
            _id: newArtifact._id,
            id: newArtifact.id,
            title: newArtifact.title,
            createdBy: newArtifact.createdBy || newArtifact.owner,
            thumbnail: newArtifact.thumbnail
          })
          console.log(
            `[Quiz Service] Created pending approval notifications for ${adminUserIds.length} admins`,
            notificationResult
          )
        } else {
          console.warn('[Quiz Service] No admin users found to notify')
        }
      } catch (notificationError) {
        console.error('[Quiz Service] Error creating quiz pending approval notifications:', notificationError)
        console.error('[Quiz Service] Error stack:', notificationError.stack)
        // Don't fail quiz creation if notification creation fails
      }
    }

    // const allArtifacts = await getAllEvenDeleted()
    return { status: 'success', result: newArtifact, message: `${Artifact}` + ' Added Successfully', statusCode: 201 }
  } catch (err) {
    console.error('Error adding' + `${Artifact}`, err)
    return { status: 'error', result: null, message: err.message, statusCode: 500 }
  }
}

// **Update Artifact**

export async function updateById(id, updateData) {
  await connectMongo()

  try {
    // Get the quiz before update to check if approvalState is changing
    const oldQuiz = await ArtifactModel.findById(id).lean()

    const updatedArtifact = await ArtifactModel.findByIdAndUpdate(id, updateData, { new: true }) // Return updated document
    if (!updatedArtifact) {
      console.error(`${Artifact}` + 'not found for update.')
      return { status: 'error', result: null, message: `${Artifact}` + 'not found for update.', statusCode: 404 }
    }

    // Check if approvalState changed
    if (updateData.approvalState && oldQuiz && oldQuiz.approvalState !== updateData.approvalState) {
      try {
        // If quiz is submitted for approval (changed to 'pending'), notify admins
        if (updateData.approvalState === 'pending' && oldQuiz.approvalState !== 'pending') {
          console.log('[Quiz Service] Quiz state changed to pending, finding admins...')
          console.log('[Quiz Service] Old state:', oldQuiz.approvalState, 'New state:', updateData.approvalState)
          // Find all admin users (SUPER_ADMIN, ADMIN, or QUIZ_REVIEWER roles)
          // These are the roles that can approve/reject quizzes
          const adminUsers = await User.find({
            $and: [
              {
                $or: [
                  { roles: { $in: [ROLES_LOOKUP.SUPER_ADMIN, ROLES_LOOKUP.ADMIN, 'QUIZ_REVIEWER'] } },
                  { isAdmin: true }
                ]
              },
              {
                $or: [{ isActive: true }, { isActive: { $exists: false } }]
              }
            ]
          })
            .select('_id email roles isAdmin isActive')
            .lean()

          console.log('[Quiz Service] Found admin users:', adminUsers?.length || 0)
          if (adminUsers && adminUsers.length > 0) {
            console.log(
              '[Quiz Service] Admin users:',
              adminUsers.map(u => ({ id: u._id, email: u.email, roles: u.roles }))
            )
            const adminUserIds = adminUsers.map(admin => admin._id)
            const notificationResult = await createQuizPendingApprovalNotification(adminUserIds, {
              _id: updatedArtifact._id,
              id: updatedArtifact.id,
              title: updatedArtifact.title,
              createdBy: updatedArtifact.createdBy || updatedArtifact.owner,
              thumbnail: updatedArtifact.thumbnail
            })
            console.log(
              `[Quiz Service] Created pending approval notifications for ${adminUserIds.length} admins`,
              notificationResult
            )
          } else {
            console.warn('[Quiz Service] No admin users found to notify')
          }
        }

        // If quiz is approved or rejected, notify the quiz owner
        if (updateData.approvalState === 'approved' || updateData.approvalState === 'rejected') {
          // Get the quiz owner's user ID
          const ownerUser = await User.findOne({ email: updatedArtifact.owner || updatedArtifact.createdBy })

          if (ownerUser) {
            if (updateData.approvalState === 'approved') {
              // Create approved notification
              await createQuizApprovedNotification(ownerUser._id, {
                _id: updatedArtifact._id,
                id: updatedArtifact.id,
                title: updatedArtifact.title,
                approvedBy: updateData.approvedBy || 'Admin',
                thumbnail: updatedArtifact.thumbnail
              })
            } else if (updateData.approvalState === 'rejected') {
              // Create rejected notification
              await createQuizRejectedNotification(ownerUser._id, {
                _id: updatedArtifact._id,
                id: updatedArtifact.id,
                title: updatedArtifact.title,
                approvedBy: updateData.approvedBy || 'Admin',
                rejectedBy: updateData.approvedBy || 'Admin',
                remarks: updatedArtifact.remarks || [],
                thumbnail: updatedArtifact.thumbnail
              })
            }
          }
        }

        // If quiz is published, notify all active users (only for PUBLIC quizzes)
        if (updateData.approvalState === 'published' && oldQuiz.approvalState !== 'published') {
          console.log('[Quiz Service] ===== QUIZ PUBLISHED NOTIFICATION START =====')
          console.log('[Quiz Service] Quiz published:', {
            quizId: updatedArtifact._id,
            quizTitle: updatedArtifact.title,
            privacy: updatedArtifact.privacy,
            oldState: oldQuiz.approvalState,
            newState: updateData.approvalState
          })

          // Only notify for PUBLIC quizzes
          if (updatedArtifact.privacy === 'PUBLIC') {
            try {
              // Get all active users
              const allActiveUsers = await User.find({
                isActive: true,
                isVerified: true
              })
                .select('_id')
                .lean()

              const allActiveUserIds = allActiveUsers.map(user => user._id.toString())
              console.log(`[Quiz Service] Found ${allActiveUserIds.length} active users`)

              // Find users who already have QUIZ_PUBLISHED notification for this quiz
              const Notification = mongoose.model('notifications')
              const existingNotifications = await Notification.find({
                type: 'QUIZ_PUBLISHED',
                'relatedEntity.entityType': 'quiz',
                'relatedEntity.entityId': updatedArtifact._id.toString()
              })
                .select('userId')
                .lean()

              const usersWithExistingNotifications = existingNotifications.map(n => n.userId.toString())
              console.log(
                `[Quiz Service] Found ${usersWithExistingNotifications.length} users who already have notifications`
              )

              // Exclude users who already have notifications
              const usersToNotify = allActiveUserIds.filter(userId => !usersWithExistingNotifications.includes(userId))

              console.log('[Quiz Service] Users to notify:', {
                totalActive: allActiveUserIds.length,
                alreadyHaveNotification: usersWithExistingNotifications.length,
                toNotify: usersToNotify.length
              })

              // Send notifications to all users who don't already have one
              if (usersToNotify.length > 0) {
                const notificationResult = await createQuizPublishedNotification(usersToNotify, {
                  _id: updatedArtifact._id,
                  id: updatedArtifact.id,
                  title: updatedArtifact.title,
                  syllabus: updatedArtifact.syllabus,
                  details: updatedArtifact.details,
                  publishedBy: updateData.approvedBy || updatedArtifact.owner || 'Admin',
                  thumbnail: updatedArtifact.thumbnail
                })
                console.log(
                  `[Quiz Service] ✅ Sent published notifications to ${usersToNotify.length} users:`,
                  notificationResult
                )
              } else {
                console.log('[Quiz Service] ⏭️ All users already have notifications for this quiz')
              }
            } catch (publishNotificationError) {
              console.error('[Quiz Service] ❌❌❌ ERROR in quiz published notification ❌❌❌')
              console.error('[Quiz Service] Error message:', publishNotificationError.message)
              console.error('[Quiz Service] Error stack:', publishNotificationError.stack)
              // Don't fail the update if notification creation fails
            }
          } else {
            console.log('[Quiz Service] ⏭️ Quiz is PRIVATE, skipping public notifications')
          }
          console.log('[Quiz Service] ===== QUIZ PUBLISHED NOTIFICATION COMPLETE =====')
        }
      } catch (notificationError) {
        console.error('Error creating quiz notification:', notificationError)
        // Don't fail the update if notification creation fails
      }
    }

    // const allArtifacts = await getAllEvenDeleted()
    // if(allAds)
    return {
      status: 'success',
      result: updatedArtifact,
      message: `${Artifact}` + 'Updated Successfully',
      statusCode: 200
    }
  } catch (err) {
    console.error('Error updating `${Artifact}`:', err)
    return { status: 'error', result: null, message: err.message, statusCode: 500 }
  }
}

export async function saveQuiz(id, updateData) {
  try {
    await connectMongo()
    const foundArtifact = await ArtifactModel.findOne({ _id: id, approvalState: 'draft' }) // Return updated document
    if (!foundArtifact) {
      console.error(`${Artifact}` + 'not found for update.')
      return { status: 'error', result: null, message: `${Artifact}` + 'not found for update.', statusCode: 404 }
    }

    console.log('Quiz found')

    const quizQuestions = await QuestionModel.find({ quizId: id })

    console.log('Quiz questions found', quizQuestions)

    const validationResult = validateQuizQuestions(quizQuestions)
    if (!validationResult.isValid) {
      console.error('Validation errors:', validationResult.errors)
      // Return 422 Unprocessable Entity with the errors
      return {
        status: 'error',
        message: 'Quiz validation failed',
        statuCode: 422,
        result: { errors: validationResult.errors }
      }
    }

    // Update to saved if all questions are validated
    let updatedArtifact = await ArtifactModel.findOneAndUpdate({ _id: id, approvalState: 'draft' }, updateData)

    return {
      status: 'success',
      message: 'Quiz saved successfully',
      statuCode: 200,
      result: updatedArtifact
    }
  } catch (error) {
    return {
      status: 'error',
      message: error?.message || 'Saving quiz failed',
      result: null
    }
  }
}

export async function update(id, updateData) {
  await connectMongo()

  try {
    const updatedArtifact = await ArtifactModel.findOneAndUpdate(
      { id }, // Query to find the document by id
      { $set: updateData }, // The data you want to update
      { new: true } // Return the updated document
    )

    if (!updatedArtifact) {
      console.error(`${Artifact}` + 'not found for update.')
      return { status: 'error', result: null, message: `${Artifact}` + 'not found for update.', statusCode: 404 }
    }
    // const allArtifacts = await getAllEvenDeleted()
    // if(allAds)
    return {
      status: 'success',
      result: updatedArtifact,
      message: `${Artifact}` + 'Updated Successfully',
      statusCode: 200
    }
  } catch (err) {
    console.error('Error updating `${Artifact}`:', err)
    return { status: 'error', result: null, message: err.message, statusCode: 500 }
  }
}

// **Soft Delete Artifact**
export async function softDelete(id) {
  await connectMongo()

  try {
    // Step 1: Soft delete the artifact by updating the status to 'deleted'
    const updatedAd = await ArtifactModel.findByIdAndUpdate(id, { status: 'deleted' }, { new: true }) // Ensure the new document is returned
    if (!updatedAd) {
      console.error(`${Artifact} not found for deletion.`)
      return { status: 'error', result: null, message: `${Artifact} not found for deletion.`, statusCode: 404 }
    }

    // Step 2: Soft delete all associated questions by updating their status to 'deleted'
    await QuestionModel.updateMany({ quizId: id }, { status: 'deleted' })

    // Fetch the updated list of artifacts (or ads)
    const allAds = await getAll()

    return {
      status: 'success',
      result: allAds.result,
      message: `${Artifact} and associated questions marked as deleted successfully`,
      statusCode: 200
    }
  } catch (err) {
    console.error(`Error soft deleting ${Artifact}:`, err)
    return { status: 'error', result: null, message: err.message, statusCode: 500 }
  }
}

// **Delete Artifact**
export async function deleteArtifact(id) {
  await connectMongo()
  try {
    // Step 1: Delete the artifact (quiz)
    const result = await ArtifactModel.findByIdAndDelete(id)

    if (result) {
      // Step 2: Delete the questions associated with the quizId
      await QuestionModel.deleteMany({ quizId: id })

      console.log(`Artifact and associated questions deleted successfully: ${result._id}`)

      // Fetch the updated list of artifacts
      const allArtifacts = await getAllEvenDeleted()

      return {
        status: 'success',
        result: allArtifacts.result,
        message: `${Artifact} Deleted Successfully`,
        statusCode: 200
      }
    } else {
      return {
        status: 'error',
        result: {},
        message: `${Artifact} Delete failed`,
        statusCode: 404
      }
    }
  } catch (err) {
    console.error(`Error deleting ${Artifact}:`, err)
    return { status: 'error', result: null, message: err.message, statusCode: 500 }
  }
}

// Service to delete quizzes and associated questions by IDs
export async function deleteQuizzesAndQuestions(ids) {
  try {
    // Step 1: Delete the artifacts (quizzes)
    const result = await ArtifactModel.deleteMany({ _id: { $in: ids } })

    if (result.deletedCount > 0) {
      // Step 2: Delete the associated questions for each quiz
      await QuestionModel.deleteMany({ quizId: { $in: ids } })

      console.log(`Quizzes and associated questions deleted successfully for IDs: ${ids.join(', ')}`)

      // Return the result of deleted quizzes
      return {
        status: 'success',
        deletedCount: result.deletedCount,
        result: null,
        message: `Deleted ${result.deletedCount} quiz${result.deletedCount > 1 ? 'zes' : ''} successfully`,
        statusCode: 200
      }
    } else {
      return {
        status: 'error',
        result: null,
        message: 'Failed to delete quizzes.',
        statusCode: 404
      }
    }
  } catch (error) {
    console.error('Error deleting quizzes and questions:', error)
    throw new Error(error.message) // Throw the error for the calling function to handle
  }
}

// Translate Quiz Questions

export async function translateQuizQuestions({ quizId: _id, language }) {
  await connectMongo()
  try {
    const quiz = await ArtifactModel.findById(_id)
    if (!quiz) {
      console.error(`No Quiz found for id: ${_id}`)
      return { status: 'error', result: null, message: `No Quiz found for id: ${quizId}` }
    }

    const primaryQuestions = await QuestionModel.find({ quizId: quiz._id, isPrimary: true }).lean()

    const languageString = language.code + '|' + language.name
    const primaryLanguage = quiz.language // {code, name}

    const translateQuestionsReqArray = primaryQuestions.map(question => {
      const secondaryQuestionId = question.id.replace(
        `PQ_${primaryLanguage.name.toUpperCase()}`,
        `SQ_${language.name.toUpperCase()}`
      )

      return {
        id: secondaryQuestionId,
        quizId: question.quizId || quiz._id,
        language: languageString,
        languageCode: language.code,
        languageName: language.name,
        isPrimary: false,
        primaryQuestionId: question._id,
        templateId: question.templateId,
        createdBy: question.createdBy,
        data: question.data
      }
    })

    // Bulk insert translated questions
    // await QuestionModel.insertMany(translateQuestionsReqArray)
    const response = await QuestionService.addMany(translateQuestionsReqArray)
    if (response.status === 'success') {
      console.log('Translated questions added successfully')
      return {
        status: 'success',
        result: response.result,
        message: 'Translated questions added successfully'
      }
    } else {
      console.error('Failed to add translated questions:', response.message)
      return {
        status: 'error',
        result: null,
        message: 'Failed to add translated questions'
      }
    }
  } catch (error) {
    console.error('Error translating quiz questions:', error)
    return {
      status: 'error',
      result: null,
      message: error.message
    }
  }
}

// **Get Artifact By Id**
export async function getById(id, queryParams = {}) {
  console.log('Query params:', queryParams)
  console.log('Id :', id)
  await connectMongo()
  try {
    const artifact = await ArtifactModel.findOne({
      _id: id
      // ...queryParams
    })
    if (!artifact) {
      console.log(`No ${Artifact} found.`)
    } else {
      const finalResult = {
        status: 'success',
        result: artifact,
        message: `Quiz(${id}) retrieved Successfully`
      }
      return finalResult
    }
  } catch (err) {
    console.error(`Error getting active ${Artifact}:`, err)
    return { status: 'error', result: null, message: err.message, statusCode: 500 }
  }
}

// **Get Active Artifact**
export async function getActive(queryParams) {
  await connectMongo()
  try {
    const today = new Date()

    const activeArtifacts = await ArtifactModel.find({
      ...queryParams,
      status: 'active' //, endDate: { $gte: today }, // Filter for ads ending today or later
    })
    if (activeArtifacts.length === 0) {
      console.log('No active `${Artifact}` found.')
    } else {
      const finalResult = {
        status: 'success',
        result: activeArtifacts,
        message: `Quizs(${activeArtifacts.length}) retrieved Successfully`
      }
      return finalResult
    }
  } catch (err) {
    console.error('Error getting active `${Artifact}`:', err)
    return { status: 'error', result: null, message: err.message, statusCode: 500 }
  }
}

export async function getActiveByEmail(email, queryParams = {}) {
  await connectMongo()
  try {
    const today = new Date()

    const activeArtifacts = await ArtifactModel.find({
      owner: email,
      ...queryParams,
      status: 'active' //, endDate: { $gte: today }, // Filter for ads ending today or later
    })
    if (activeArtifacts.length === 0) {
      console.log('No active `${Artifact}` found.')
    } else {
      const finalResult = {
        status: 'success',
        result: activeArtifacts,
        message: `Quizs(${activeArtifacts.length}) retrieved Successfully`
      }
      return finalResult
    }
  } catch (err) {
    console.error('Error getting active `${Artifact}`:', err)
    return { status: 'error', result: null, message: err.message, statusCode: 500 }
  }
}

// **Get All Artifacts**
export async function getAll(queryParams) {
  await connectMongo()
  try {
    const allArtifacts = await ArtifactModel.find({ status: { $ne: 'deleted' }, ...queryParams })
    if (allArtifacts.length === 0) {
      console.log('No  `${Artifact}` found.')
      const finalResult = { status: 'success', result: {}, message: `No ${Artifact} Exists` }
      return finalResult
    } else {
      const finalResult = {
        status: 'success',
        result: allArtifacts,
        message: `${Artifact}(${allArtifacts.length} retrieved Successfully`
      }
      return finalResult
    }
  } catch (err) {
    console.error('Error getting active `${Artifact}`:', err)
    return { status: 'error', result: null, message: err.message, statusCode: 500 }
  }
}

export async function getAllByEmail(email, queryParams = {}) {
  await connectMongo()
  try {
    const allArtifacts = await ArtifactModel.find({ owner: email, status: { $ne: 'deleted' }, ...queryParams })
    if (allArtifacts.length === 0) {
      console.log('No  `${Artifact}` found.')
      const finalResult = { status: 'success', result: {}, message: `No ${Artifact} Exists` }
      return finalResult
    } else {
      const finalResult = {
        status: 'success',
        result: allArtifacts,
        message: `${Artifact}(${allArtifacts.length} retrieved Successfully`
      }
      return finalResult
    }
  } catch (err) {
    console.error('Error getting active `${Artifact}`:', err)
    return { status: 'error', result: null, message: err.message, statusCode: 500 }
  }
}

// **Get All Artifacts Even deleted **
export async function getAllEvenDeleted(queryParams = {}) {
  await connectMongo()
  try {
    const allArtifacts = await ArtifactModel.find({ ...queryParams })
    if (allArtifacts.length === 0) {
      console.log('No  `${Artifact}` found.')
      const finalResult = { status: 'success', result: {}, message: 'No `${Artifact} Exists' }
      return finalResult
    } else {
      console.log('All `${Artifact}s`', allArtifacts)
      const finalResult = {
        status: 'success',
        result: allArtifacts,
        message: `${Artifact}s(${allArtifacts.length}) retrieved Successfully`
      }
      return finalResult
    }
  } catch (err) {
    console.error('Error getting all `${Artifact}s`:', err)
    return { status: 'error', result: null, message: err.message, statusCode: 500 }
  }
}

export async function getAllEvenDeletedByEmail(email, queryParams = {}) {
  await connectMongo()
  try {
    const allArtifacts = await ArtifactModel.find({ owner: email, ...queryParams })
    if (allArtifacts.length === 0) {
      console.log('No  `${Artifact}` found.')
      const finalResult = { status: 'success', result: {}, message: 'No `${Artifact} Exists' }
      return finalResult
    } else {
      console.log('All `${Artifact}s`', allArtifacts)
      const finalResult = {
        status: 'success',
        result: allArtifacts,
        message: `${Artifact}s(${allArtifacts.length}) retrieved Successfully`
      }
      return finalResult
    }
  } catch (err) {
    console.error('Error getting all `${Artifact}s`:', err)
    return { status: 'error', result: null, message: err.message, statusCode: 500 }
  }
}

export async function getDocuments(queryParams) {
  await connectMongo()
  try {
    const allArtifacts = await ArtifactModel.find({ ...queryParams })
    if (allArtifacts.length === 0) {
      console.log(`No ${Artifact} found.`)
      const finalResult = { status: 'success', result: [], message: `No ${Artifact} Exists` }
      return finalResult
    } else {
      const finalResult = {
        status: 'success',
        result: allArtifacts,
        message: `${Artifact}(${allArtifacts.length} retrieved Successfully`
      }
      return finalResult
    }
  } catch (err) {
    console.error('Error getting `${Artifact}`:', err)
    return { status: 'error', result: null, message: err.message, statusCode: 500 }
  }
}
