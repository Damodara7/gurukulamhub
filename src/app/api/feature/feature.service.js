import connectMongo from '@/utils/dbConnect-mongo'
import Feature from './feature.model.js' // Import your Feature model
import { validateFeatureCreateRequestDto, validateFeatureUpdateRequestDto } from './feature.validator.js' // Import your DTO schema

// **Add Feature**
export async function add({ data }) {
  try {
    // Validate the request body
    await validateFeatureCreateRequestDto(data, { abortEarly: false })
  } catch (err) {
    console.error(err)
    return { status: 'error', message: err.message, result: null }
  }

  await connectMongo()
  try {
    // Create and save the new Feature
    // Explicitly set isDeleted to false so it appears in the database
    const newFeature = new Feature({
      ...data,
      isDeleted: false
    })
    await newFeature.save()

    console.log('Feature added successfully!')
    return { status: 'success', result: newFeature, message: 'Feature Added Successfully' }
  } catch (err) {
    console.error('Error adding Feature:', err)
    return { status: 'error', message: err.message, result: null }
  }
}

// **Get Feature By ID**
export async function getById({ id }) {
  await connectMongo()
  try {
    const feature = await Feature.findOne({ _id: id, isDeleted: false })
    if (!feature) {
      return { status: 'error', message: 'Feature not found', result: null }
    }

    console.log('Feature fetched successfully!')
    return { status: 'success', result: feature }
  } catch (err) {
    console.error('Error fetching Feature by ID:', err)
    return { status: 'error', message: err.message, result: null }
  }
}

// **Get All Features**
export async function getAll() {
  await connectMongo()
  try {
    const features = await Feature.find({ isDeleted: false }).sort({ createdAt: -1 }) // Sort by createdAt descending
    return { status: 'success', result: features, message: 'Features fetched successfully' }
  } catch (err) {
    console.error('Error fetching Features:', err)
    return { status: 'error', message: err.message, result: null }
  }
}

// **Update Feature**
export async function updateOne({ id, data }) {
  // Validate the request body
  try {
    validateFeatureUpdateRequestDto(data)
  } catch (err) {
    console.error(err)
    return { status: 'error', message: err.message, result: null }
  }

  await connectMongo()
  try {
    const existingFeature = await Feature.findOne({ _id: id, isDeleted: false })
    if (!existingFeature) {
      return { status: 'error', message: 'Feature not found or already deleted', result: null }
    }

    const updatedFeature = await Feature.findByIdAndUpdate(id, data, { new: true })
    if (!updatedFeature) {
      return { status: 'error', message: 'Feature not found', result: null }
    }

    console.log('Feature updated successfully!')
    return { status: 'success', result: updatedFeature, message: 'Feature Updated Successfully' }
  } catch (err) {
    console.error('Error updating Feature:', err)
    return { status: 'error', message: err.message, result: null }
  }
}

// **Delete Feature**
export async function deleteOne({ id, email }) {
  await connectMongo()
  try {
    // Find the existing feature by ID and ensure it's not already deleted
    const existingFeature = await Feature.findOne({ _id: id, isDeleted: false })
    if (!existingFeature) {
      return { status: 'error', message: 'Feature not found or already deleted', result: null }
    }

    // Perform soft delete with audit fields
    existingFeature.isDeleted = true
    existingFeature.deletedAt = new Date()
    if (email) {
      existingFeature.deletedBy = email
      existingFeature.deleterEmail = email
    }

    // Save the updated feature
    const deletedFeature = await existingFeature.save()
    if (!deletedFeature) {
      return { status: 'error', message: 'Feature not found', result: null }
    }

    console.log('Feature soft deleted successfully!')
    return { status: 'success', result: deletedFeature, message: 'Feature soft deleted successfully' }
  } catch (err) {
    console.error('Error deleting Feature:', err)
    return { status: 'error', message: err.message, result: null }
  }
}
