import connectMongo from '@/utils/dbConnect-mongo';
import Alert from './alerts.model.js'; // Import your Alert model
import { validateAlertCreateRequestDto, validateAlertUpdateRequestDto } from './alerts.validator.js'; // Import your DTO schema

// **Add Alert**
export async function add({ data }) {
    try {
        // Validate the request body
        await validateAlertCreateRequestDto(data, { abortEarly: false });
    } catch (err) {
        console.error(err);
        return { status: 'error', message: err.message, result: null };
    }

    await connectMongo();
    try {

        // Create and save the new Alert
        const newAlert = new Alert({ ...data });
        await newAlert.save();

        console.log('Alert added successfully!');
        return { status: 'success', result: newAlert, message: 'Alert Added Successfully' };
    } catch (err) {
        console.error('Error adding Alert:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Get Alert By ID**
export async function getById({ id }) {
    await connectMongo();
    try {
        const alert = await Alert.findById(id).populate('videos'); // Populate videos field
        if (!alert) {
            return { status: 'error', message: 'Alert not found', result: null };
        }

        console.log('Alert fetched successfully!');
        return { status: 'success', result: alert };
    } catch (err) {
        console.error('Error fetching Alert by ID:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// Get by QueryParams
export async function getOneByQueryParams(queryParams = {}) {
    await connectMongo();
    try {
        const alert = await Alert.findOne({ ...queryParams }).populate('videos'); // Populate videos field
        if (!alert) {
            return { status: 'error', message: 'Alert not found', result: null };
        }
        console.log('Alert fetched successfully!');
        return { status: 'success', result: alert };
    } catch (err) {
        console.error('Error fetching Alert by Query Params:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Get All Alerts**
export async function getAll() {
    await connectMongo(); // Ensure MongoDB connection is established
    try {
        const alerts = await Alert.find({})
            .populate('videos') // Populate videos field
            .sort({ createdAt: -1 })
        return { status: 'success', result: alerts, message: 'Alerts fetched successfully' };
    } catch (err) {
        console.error('Error fetching Alerts:', err);
        return { status: 'error', message: err.message, result: null };
    }
}


// Get All by Query Params
export async function getAllByQueryParams(queryParams = {}) {
    await connectMongo();
    try {
        const alerts = await Alert.find({ ...queryParams }).sort({ priority: 1 }).populate('videos'); // Sort by priority ascending; Populate videos field
        return { status: 'success', result: alerts, message: 'Alerts fetched successfully' };
    } catch (err) {
        console.error('Error fetching Alerts:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Update Alert**
export async function updateOne({ id, data }) {
    // Validate the request body
    try {
        validateAlertUpdateRequestDto(data);
    } catch (err) {
        console.error(err);
        return { status: 'error', message: err.message, result: null };
    }

    await connectMongo();
    try {
        const updatedAlert = await Alert.findByIdAndUpdate(id, data, { new: true });
        if (!updatedAlert) {
            return { status: 'error', message: 'Alert not found', result: null };
        }

        console.log('Alert updated successfully!');
        return { status: 'success', result: updatedAlert, message: 'Alert Updated Successfully' };
    } catch (err) {
        console.error('Error updating Alert:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Update Multiple Alerts**
export async function updateManyByQueryParams({ queryParams, data }) {
    // Validate the request body
    try {
        validateAlertUpdateRequestDto(data);
    } catch (err) {
        console.error(err);
        return { status: 'error', message: err.message, result: null };
    }

    await connectMongo();
    try {
        const updatedAlerts = await Alert.updateMany(queryParams, data, { new: true });
        if (!updatedAlerts.matchedCount) {
            return { status: 'error', message: 'No matching alerts found', result: null };
        }

        console.log(`${updatedAlerts.modifiedCount} alerts updated successfully!`);
        return {
            status: 'success',
            result: updatedAlerts,
            message: `${updatedAlerts.modifiedCount} Alerts Updated Successfully`,
        };
    } catch (err) {
        console.error('Error updating Alerts:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Delete Alert**
export async function deleteOne({ id }) {
    await connectMongo();
    try {
        const deletedAlert = await Alert.findByIdAndDelete(id);
        if (!deletedAlert) {
            return { status: 'error', message: 'Alert not found', result: null };
        }

        console.log('Alert deleted successfully!');
        return { status: 'success', result: deletedAlert, message: 'Alert Deleted Successfully' };
    } catch (err) {
        console.error('Error deleting Alert:', err);
        return { status: 'error', message: err.message, result: null };
    }
}


// *********************  *********************
// export async function addGivenAlert({ email, alertType, priority }) {
//     await add({ data: { email: email, alertType: alertType, priority: priority, status: 'active', completionStatus: 'pending' } })
// }
// export async function activateAllAlertsOfUser({ email }) {
//     await updateManyByQueryParams({ queryParams: { email }, data: { status: 'active' } })
// }
