import connectMongo from '@/utils/dbConnect-mongo';
import EventUsers from './eventuser.model.js';
import * as ApiResponseUtils from '@/utils/apiResponses';

// **Add Event User**
export async function add(addRequestData) {
    await connectMongo();
    try {
        const newEventUser = new EventUsers({ ...addRequestData });
        await newEventUser.save();

        console.log('EventUser added successfully!');
        return { status: 'success', result: newEventUser, message: 'EventUser Added Successfully' };
    } catch (err) {
        console.error('Error adding EventUser:', err);
        return ApiResponseUtils.sendErrorResponse(err.message);
    }
}

// **Get Event User By ID**
export async function getById(id) {
    await connectMongo();
    try {
        const eventUser = await EventUsers.findById(id);
        if (!eventUser) {
            return { status: 'error', message: 'EventUser not found' };
        }

        console.log('EventUser fetched successfully!');
        return { status: 'success', result: eventUser };
    } catch (err) {
        console.error('Error fetching EventUser by ID:', err);
        return ApiResponseUtils.sendErrorResponse(err.message);
    }
}

// **Get All Event Users**
export async function getAll() {
    await connectMongo();
    try {
        const eventUsers = await EventUsers.find();
        return { status: 'success', result: eventUsers };
    } catch (err) {
        console.error('Error fetching EventUsers:', err);
        return ApiResponseUtils.sendErrorResponse(err.message);
    }
}

// **Update Event User**
export async function update(id, updateRequestData) {
    await connectMongo();
    try {
        const updatedEventUser = await EventUsers.findByIdAndUpdate(id, updateRequestData, { new: true });
        if (!updatedEventUser) {
            return { status: 'error', message: 'EventUser not found' };
        }

        console.log('EventUser updated successfully!');
        return { status: 'success', result: updatedEventUser, message: 'EventUser Updated Successfully' };
    } catch (err) {
        console.error('Error updating EventUser:', err);
        return ApiResponseUtils.sendErrorResponse(err.message);
    }
}

// **Delete Event User**
export async function deleteEventUser(id) {
    await connectMongo();
    try {
        const deletedEventUser = await EventUsers.findByIdAndDelete(id);
        if (!deletedEventUser) {
            return { status: 'error', message: 'EventUser not found' };
        }

        console.log('EventUser deleted successfully!');
        return { status: 'success', result: deletedEventUser, message: 'EventUser Deleted Successfully' };
    } catch (err) {
        console.error('Error deleting EventUser:', err);
        return ApiResponseUtils.sendErrorResponse(err.message);
    }
}
