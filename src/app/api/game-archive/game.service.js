import connectMongo from '@/utils/dbConnect-mongo'
import GamesArchive from './game.model.js'
import { gameCreateRequestDtoSchema } from './game.validator.js'
import * as ApiResponseUtils from '@/utils/apiResponses'

const Artifact = 'GamesArchive'
const ArtifactModel = GamesArchive
const CreateRequestDtoSchema = gameCreateRequestDtoSchema

// **Add Artifact**
export async function add(addRequestData) {

  try {
    await CreateRequestDtoSchema.validate(addRequestData, { abortEarly: false })
  } catch (err) {
    console.error(err)
    return ApiResponseUtils.sendErrorResponse(err.message)
  }

  //{id,name, details, owner, createdBy, privacy, parentContextId, parentType, tags, status}) {
  await connectMongo()
  try {
    const newArtifact = new ArtifactModel({ ...addRequestData })
    await newArtifact.save()
    console.log(`${Artifact}` + ' added successfully!')
    // const allArtifacts = await getAllEvenDeleted()
    return { status: 'success', result: newArtifact, message: `${Artifact}` + ' Added Successfully' }
  } catch (err) {
    console.error('Error adding' + `${Artifact}`, err)
    return ApiResponseUtils.sendErrorResponse(err.message)
  }
}

// **Update Artifact**

export async function update(id, updateData) {
  await connectMongo()

  try {
    const updatedArtifact = await ArtifactModel.findByIdAndUpdate(id, updateData, { new: true }) // Return updated document
    if (!updatedArtifact) {
      console.error(`${Artifact}` + 'not found for update.')
      return { status: 'error', result: null, message: `${Artifact}` + 'not found for update.' }
    }
    const allArtifacts = await getAllEvenDeleted()
    // if(allAds)
    return { status: 'success', result: allArtifacts.result, message: `${Artifact}` + ' Added Successfully' }
  } catch (err) {
    console.error('Error updating `${Artifact}`:', err)
    return ApiResponseUtils.sendErrorResponse(err.message)
  }
}

// **Soft Delete Artifact**
export async function softDelete(id) {
  await connectMongo()

  try {
    const updatedAd = await ArtifactModel.findByIdAndUpdate(id, { status: 'deleted' }) // Return updated document
    if (!updatedAd) {
      console.error('`${Artifact}` not found for deletion.')
      return { status: 'error', result: null, message: '`${Artifact}` not found for deletion.' }
    }
    const allAds = await getAll()
    // if(allAds)
    return { status: 'success', result: allAds.result, message: '`${Artifact}` Marked Deleted Successfully' }
  } catch (err) {
    console.error('Error deleting `${Artifact}`:', err)
    return ApiResponseUtils.sendErrorResponse(err.message)
  }
}

// **Delete Artifact**
export async function deleteArtifact(id) {
  await connectMongo()
  try {
    const result = await ArtifactModel.findByIdAndDelete(id)
    if (result) {
      console.log('`${Artifact}` deleted successfully!' + result._id)
      const allAds = await getAllEvenDeleted()
      // if(allAds)
      return { status: 'success', result: allAds.result, message: '`${Artifact}` Deleted Successfully' }
      // return   { status:"success", result:{}, message:"Quiz Deleted Successfully" };
    } else {
      return { status: 'error', result: {}, message: '`${Artifact}` Delete failed' }
    }
  } catch (err) {
    console.error('Error deleting `${Artifact}`:', err)
    return ApiResponseUtils.sendErrorResponse(err.message)
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
    return ApiResponseUtils.sendErrorResponse(err.message)
  }
}

// **Get Active Artifact**
export async function getActive() {
  await connectMongo()
  try {
    const today = new Date()

    const activeArtifacts = await ArtifactModel.find({
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
    return ApiResponseUtils.sendErrorResponse(err.message)
  }
}

export async function getActiveByEmail(email) {
  await connectMongo()
  try {
    const today = new Date()

    const activeArtifacts = await ArtifactModel.find({
      owner: email,
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
    return ApiResponseUtils.sendErrorResponse(err.message)
  }
}

// **Get All Artifacts**
export async function getAll() {
  await connectMongo()
  try {
    const allArtifacts = await ArtifactModel.find({ status: { $ne: 'deleted' } })
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
    return ApiResponseUtils.sendErrorResponse(err.message)
  }
}

export async function getAllByEmail(email) {
  await connectMongo()
  try {
    const allArtifacts = await ArtifactModel.find({ owner: email, status: { $ne: 'deleted' } })
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
    return ApiResponseUtils.sendErrorResponse(err.message)
  }
}

// **Get All Artifacts Even deleted **
export async function getAllEvenDeleted() {
  await connectMongo()
  try {
    const allArtifacts = await ArtifactModel.find({})
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
    return ApiResponseUtils.sendErrorResponse(err.message)
  }
}

export async function getAllEvenDeletedByEmail(email) {
  await connectMongo()
  try {
    const allArtifacts = await ArtifactModel.find({ owner: email })
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
    return ApiResponseUtils.sendErrorResponse(err.message)
  }
}
