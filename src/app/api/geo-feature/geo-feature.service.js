import connectMongo from '@/utils/dbConnect-mongo';
import GeoFeature from './geo-feature.model.js'; // Import your Feature model
import { validateFeatureCreateRequestDto, validateFeatureUpdateRequestDto } from './geo-feature.validator.js'; // Import your DTO schema
import * as ApiResponseUtils from '@/utils/apiResponses';

// **Add Feature**
export async function add({ data }) {
    try {
        // Validate the request body
        await validateFeatureCreateRequestDto(data, { abortEarly: false });
    } catch (err) {
        console.error(err);
        return { status: 'error', message: err.message, result: null };
    }

    await connectMongo();
    try {
        // Create and save the new Feature
        const newFeature = new GeoFeature({ ...data });
        await newFeature.save();

        console.log('Feature added successfully!');
        return { status: 'success', result: newFeature, message: 'Feature Added Successfully' };
    } catch (err) {
        console.error('Error adding Feature:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Get Feature By ID**
export async function getById({ id }) {
    await connectMongo();
    try {
        const feature = await GeoFeature.findById(id);
        if (!feature) {
            return { status: 'error', message: 'Feature not found', result: null };
        }

        console.log('Feature fetched successfully!');
        return { status: 'success', result: feature };
    } catch (err) {
        console.error('Error fetching Feature by ID:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Get All Features**
export async function getAll() {
    await connectMongo();
    try {
        const features = await GeoFeature.find().sort({ createdAt: -1 }); // Sort by createdAt descending
        return { status: 'success', result: features, message: 'Features fetched successfully' };
    } catch (err) {
        console.error('Error fetching Features:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Update Feature**
export async function updateOne({ id, data }) {
    // Validate the request body
    try {
        validateFeatureUpdateRequestDto(data);
    } catch (err) {
        console.error(err);
        return { status: 'error', message: err.message, result: null };
    }

    await connectMongo();
    try {
        const updatedFeature = await GeoFeature.findByIdAndUpdate(id, data, { new: true });
        if (!updatedFeature) {
            return { status: 'error', message: 'Feature not found', result: null };
        }

        console.log('Feature updated successfully!');
        return { status: 'success', result: updatedFeature, message: 'Feature Updated Successfully' };
    } catch (err) {
        console.error('Error updating Feature:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Delete Feature**
export async function deleteOne({ id }) {
    await connectMongo();
    try {
        const deletedFeature = await GeoFeature.findByIdAndDelete(id);
        if (!deletedFeature) {
            return { status: 'error', message: 'Feature not found', result: null };
        }

        console.log('Feature deleted successfully!');
        return { status: 'success', result: deletedFeature, message: 'Feature Deleted Successfully' };
    } catch (err) {
        console.error('Error deleting Feature:', err);
        return { status: 'error', message: err.message, result: null };
    }
}
