import connectMongo from '@/utils/dbConnect-mongo'
import GeoFeature from './geo-feature.model.js' // Import your Feature model
import { validateFeatureCreateRequestDto, validateFeatureUpdateRequestDto } from './geo-feature.validator.js' // Import your DTO schema

// **Add Geo Feature**
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
    // Create and save the new Geo Feature
    const newGeoFeature = new GeoFeature({
      ...data,
      isDeleted: false
    })
    await newGeoFeature.save()

    console.log('Geo Feature added successfully!')
    return { status: 'success', result: newGeoFeature, message: 'Geo Feature Added Successfully' }
  } catch (err) {
    console.error('Error adding Geo Feature:', err)
    return { status: 'error', message: err.message, result: null }
  }
}

// **Get Geo Feature By ID**
export async function getById({ id }) {
  await connectMongo()
  try {
    const geoFeature = await GeoFeature.findById({ _id: id, isDeleted: false })
    if (!geoFeature) {
      return { status: 'error', message: 'Geo Feature not found', result: null }
    }

    console.log('Geo Feature fetched successfully!')
    return { status: 'success', result: geoFeature }
  } catch (err) {
    console.error('Error fetching Geo Feature by ID:', err)
    return { status: 'error', message: err.message, result: null }
  }
}

// **Get All Geo Features**
export async function getAll() {
  await connectMongo()
  try {
    const features = await GeoFeature.find({ isDeleted: false }).sort({ createdAt: -1 }) // Sort by createdAt descending
    return { status: 'success', result: features, message: 'Geo Features fetched successfully' }
  } catch (err) {
    console.error('Error fetching Geo Features:', err)
    return { status: 'error', message: err.message, result: null }
  }
}

// **Update Geo Feature**
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
    const existingGeoFeature = await GeoFeature.findOne({ _id: id, isDeleted: false })
    if (!existingGeoFeature) {
      return { status: 'error', message: 'Geo Feature not found or already deleted', result: null }
    }

    const updatedGeoFeature = await GeoFeature.findByIdAndUpdate(id, data, { new: true })
    if (!updatedGeoFeature) {
      return { status: 'error', message: 'Geo Feature not found', result: null }
    }

    console.log('Geo Feature updated successfully!')
    return { status: 'success', result: updatedGeoFeature, message: 'Geo Feature Updated Successfully' }
  } catch (err) {
    console.error('Error updating Geo Feature:', err)
    return { status: 'error', message: err.message, result: null }
  }
}

// **Delete Geo Feature**
export async function deleteOne({ id, email }) {
  await connectMongo()
  try {
    const existingGeoFeature = await GeoFeature.findOne({ _id: id, isDeleted: false })
    if (!existingGeoFeature) {
      return { status: 'error', message: 'Geo Feature not found or already deleted', result: null }
    }

    existingGeoFeature.isDeleted = true
    existingGeoFeature.deletedAt = new Date()
    if (email) {
      existingGeoFeature.deletedBy = email
      existingGeoFeature.deleterEmail = email
    }

    const deletedGeoFeature = await existingGeoFeature.save()
    if (!deletedGeoFeature) {
      return { status: 'error', message: 'Geo Feature not found', result: null }
    }

    console.log('Geo Feature soft deleted successfully!')
    return { status: 'success', result: deletedGeoFeature, message: 'Geo Feature soft deleted successfully' }
  } catch (err) {
    console.error('Error deleting Geo Feature:', err)
    return { status: 'error', message: err.message, result: null }
  }
}
