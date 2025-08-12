import connectMongo from '@/utils/dbConnect-mongo'
import Quiz from './quiz.model.js'
import QuestionModel from '../question/question.model.js'
import * as QuestionService from '../question/question.service.js'
import { quizCreateRequestDtoSchema, validateQuizQuestions } from './quiz.validator.js'
import mongoose from 'mongoose'
import * as ApiResponseUtils from '@/utils/apiResponses'

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
    const updatedArtifact = await ArtifactModel.findByIdAndUpdate(id, updateData, { new: true }) // Return updated document
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
    let updatedArtifact = await ArtifactModel.findOneAndUpdate({ _id: id, approvalState: 'draft'}, updateData)

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
    console.error('Error getting `${Artifact}`:', err)
    return { status: 'error', result: null, message: err.message, statusCode: 500 }
  }
}
