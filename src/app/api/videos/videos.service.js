import connectMongo from '@/utils/dbConnect-mongo';
import Videos from './videos.model.js';
import {
    validateVideoCreateRequestDto,
    validateVideoUpdateRequestDto,
} from './videos.validator.js'; // Import your DTO schema

// **Add Video**
export async function add({ data }) {
    try {
        // Validate the request body
        validateVideoCreateRequestDto(data);
    } catch (err) {
        console.error(err);
        return { status: 'error', message: err.message, result: null };
    }

    await connectMongo();
    try {
        const newVideo = new Videos({ ...data });
        await newVideo.save();

        console.log('Video added successfully!');
        return { status: 'success', result: newVideo, message: 'Video Added Successfully' };
    } catch (err) {
        console.error('Error adding video:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Get Video By ID**
export async function getById({ id }) {
    await connectMongo();
    try {
        const video = await Videos.findOne({ _id: id, isDeleted: false });
        if (!video) {
            return { status: 'error', message: 'Video not found', result: null };
        }

        console.log('Video fetched successfully!');
        return { status: 'success', result: video };
    } catch (err) {
        console.error('Error fetching video by ID:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Get Video By Query Params**
export async function getOneByQueryParams(queryParams = {}) {
    await connectMongo();
    try {
        const video = await Videos.findOne({ ...queryParams, isDeleted: false });
        if (!video) {
            return { status: 'error', message: 'Video not found', result: null };
        }
        console.log('Video fetched successfully!');
        return { status: 'success', result: video };
    } catch (err) {
        console.error('Error fetching video by query params:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Get All Videos**
export async function getAll() {
    await connectMongo();
    try {
        const videos = await Videos.find({ isDeleted: false }).sort({ createdAt: -1 });
        return { status: 'success', result: videos, message: 'Videos fetched successfully' };
    } catch (err) {
        console.error('Error fetching videos:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// Get All videos by query params
export async function getAllByQueryParams(queryParams = {}) {
    await connectMongo();
    try {
        const videos = await Videos.find({ ...queryParams, isDeleted: false }).sort({ createdAt: -1 });
        return { status: 'success', result: videos, message: 'Videos fetched successfully' };
    } catch (err) {
        console.error('Error fetching videos by query params:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Update Video**
export async function updateOne({ id, data }) {
    try {
        validateVideoUpdateRequestDto(data);
    } catch (err) {
        console.error(err);
        return { status: 'error', message: err.message, result: null };
    }

    await connectMongo();
    try {
        const updatedVideo = await Videos.findByIdAndUpdate(id, data, { new: true });
        if (!updatedVideo) {
            return { status: 'error', message: 'Video not found', result: null };
        }

        console.log('Video updated successfully!');
        return { status: 'success', result: updatedVideo, message: 'Video Updated Successfully' };
    } catch (err) {
        console.error('Error updating video:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Delete Video** (Soft Delete)
export async function deleteOne({ id }) {
    await connectMongo();
    try {
        const deletedVideo = await Videos.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if (!deletedVideo) {
            return { status: 'error', message: 'Video not found', result: null };
        }

        console.log('Video deleted successfully!');
        return { status: 'success', result: deletedVideo, message: 'Video Deleted Successfully' };
    } catch (err) {
        console.error('Error deleting video:', err);
        return { status: 'error', message: err.message, result: null };
    }
}
