import connectMongo from '@/utils/dbConnect-mongo';
import UserAlert from './user-alerts.model.js'; // Import your UserAlert model
import * as AlertService from '../alerts/alerts.service.js'
import { validateUserAlertCreateRequestDto, validateUserAlertUpdateRequestDto } from './user-alerts.validator.js'; // Import your DTO schema
import '../videos/videos.model.js'; // Import models of populating ref's
import '../alerts/alerts.model.js'; // Import models of populating ref's

// **Add User Alert**
export async function add({ data }) {
    try {
        // Validate the request body
        await validateUserAlertCreateRequestDto(data, { abortEarly: false });
    } catch (err) {
        console.error(err);
        return { status: 'error', message: err.message, result: null };
    }

    await connectMongo();
    try {
        const { email } = data;
        // Check if user alerts already exist for the provided email
        const existingUserAlert = await UserAlert.findOne({ email });
        if (existingUserAlert) {
            return { status: 'error', message: 'User alerts already exist for this email', result: null };
        }

        // Create and save the new UserAlert
        const newUserAlert = new UserAlert({ ...data });
        await newUserAlert.save();

        console.log('User Alert added successfully!');
        return { status: 'success', result: newUserAlert, message: 'User Alert Added Successfully' };
    } catch (err) {
        console.error('Error adding User Alert:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// Add all alerts from AlertsModel to alerts array of a user's userAlert document
export async function addAllAlertsToOneUser({ email }) {
    try {
        // Step 1: Fetch all alerts from the AlertService
        const alertsResponse = await AlertService.getAllByQueryParams();
        if (alertsResponse.status === 'success') {
            console.log('Alerts fetched successfully');
        } else {
            console.error('Error fetching alerts from AlertService:', alertsResponse.message);
            return { status: 'error', message: alertsResponse.message, result: null };
        }

        const allAlerts = alertsResponse?.result;
        if (!allAlerts || allAlerts.length === 0) {
            console.log('No alerts found in the AlertService.');
            return { status: 'success', result: null, message: 'No alerts found in the AlertService.' };
        }

        // Step 2: Find or create the user's userAlert document by email
        let userAlert = await UserAlert.findOne({ email });
        if (!userAlert) {
            console.log(`No userAlert found for email ${email}. Creating a new one.`);
            userAlert = new UserAlert({ email, alerts: [] });
        }

        // Step 3: Add all alerts to the user's alerts array, avoiding duplicates
        const alertIds = userAlert.alerts.map(item => item.alert.toString());
        const newAlerts = allAlerts.filter(alert => !alertIds.includes(alert._id.toString()));

        // Prepare new alerts to be added
        const alertsToAdd = newAlerts.map(alert => ({
            alert: alert._id,
            completionStatus: 'pending', // Default value
            status: alert.isActive ? 'active' : 'inactive', // Set based on alert.isActive
        }));

        // Update status of existing alerts to "active"
        userAlert.alerts = userAlert.alerts.map(existingAlert => {
            const matchingAlert = allAlerts.find(alert => alert._id.toString() === existingAlert.alert.toString());
            if (matchingAlert && matchingAlert.isActive) {
                return { ...existingAlert, status: 'active' }; // Update status to active
            }
            return existingAlert;
        });

        // Add new alerts to the user's alerts array
        userAlert.alerts.push(...alertsToAdd);

        // Save the updated or newly created userAlert document
        await userAlert.save();

        console.log(`${alertsToAdd.length} new alerts added to user ${email}.`);
        return {
            status: 'success',
            message: `${alertsToAdd.length} new alerts added to user ${email}.`,
            result: userAlert,
        };
    } catch (error) {
        console.error(error);
        return { status: 'error', message: error.message, result: null };
    }
}

// **Get User Alert By ID**
export async function getById({ id }) {
    await connectMongo();
    try {
        const userAlert = await UserAlert.findById(id)
            .populate({
                path: 'alerts.alert', // Populate the nested 'alert' field inside 'alerts'
                populate: {
                    path: 'videos', // Populate the 'videos' field inside the alert
                    model: 'videos' // Ensure that the 'videos' model is populated
                }
            });
        if (!userAlert) {
            return { status: 'error', message: 'User Alert not found', result: null };
        }

        console.log('User Alert fetched successfully!');
        return { status: 'success', result: userAlert };
    } catch (err) {
        console.error('Error fetching User Alert by ID:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// Get User Alert by QueryParams
export async function getOneByQueryParams(queryParams = {}) {
    await connectMongo();
    try {
        const userAlert = await UserAlert.findOne({ ...queryParams })
            .populate({
                path: 'alerts.alert', // Populate the nested 'alert' field inside 'alerts'
                populate: {
                    path: 'videos', // Populate the 'videos' field inside the alert
                    model: 'videos' // Ensure that the 'videos' model is populated
                }
            });
        if (!userAlert) {
            return { status: 'error', message: 'User Alert not found', result: null };
        }
        console.log('User Alert fetched successfully!');
        return { status: 'success', result: userAlert };
    } catch (err) {
        console.error('Error fetching User Alert by Query Params:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Get All User Alerts**
export async function getAll() {
    await connectMongo();
    try {
        const userAlerts = await UserAlert.find()
            .sort({ createdAt: -1 }) // Sort by createdAt descending
            .populate({
                path: 'alerts.alert', // Populate the nested 'alert' field inside 'alerts'
                populate: {
                    path: 'videos', // Populate the 'videos' field inside the alert
                    model: 'videos' // Ensure that the 'videos' model is populated
                }
            });
        return { status: 'success', result: userAlerts, message: 'User Alerts fetched successfully' };
    } catch (err) {
        console.error('Error fetching User Alerts:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// Get All by Query Params
export async function getAllByQueryParams(queryParams = {}) {
    await connectMongo();
    try {
        const userAlerts = await UserAlert.find({ ...queryParams }).sort({ createdAt: -1 })
            .populate({
                path: 'alerts.alert', // Populate the nested 'alert' field inside 'alerts'
                populate: {
                    path: 'videos', // Populate the 'videos' field inside the alert
                    model: 'videos' // Ensure that the 'videos' model is populated
                }
            });
        return { status: 'success', result: userAlerts, message: 'User Alerts fetched successfully' };
    } catch (err) {
        console.error('Error fetching User Alerts:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// **Update User Alert**
export async function updateOne({ email, data }) {
    // Validate the request body
    try {
        validateUserAlertUpdateRequestDto(data);
    } catch (err) {
        console.error(err);
        return { status: 'error', message: err.message, result: null };
    }

    await connectMongo();
    try {
        const updatedUserAlert = await UserAlert.findOneAndUpdate({ email }, data, { new: true });
        if (!updatedUserAlert) {
            return { status: 'error', message: 'User Alert not found', result: null };
        }

        console.log('User Alert updated successfully!');
        return { status: 'success', result: updatedUserAlert, message: 'User Alert Updated Successfully' };
    } catch (err) {
        console.error('Error updating User Alert:', err);
        return { status: 'error', message: err.message, result: null };
    }
}

// Update one alert inside alerts list of useralerts by alertId and email
export async function updateUserAlertByAlertId({ email, alertId, data }) {
    await connectMongo();
    try {
        // Build dynamic $set object to update fields within the matched alert
        const setFields = {};
        for (const [key, value] of Object.entries(data)) {
            setFields[`alerts.$.${key}`] = value; // Dynamically build the field path
        }

        const updatedUserAlert = await UserAlert.findOneAndUpdate(
            { email, 'alerts.alert': alertId }, // Match 'alerts.alert' with alertId
            { $set: setFields }, // Dynamically update fields
            { new: true } // Return the updated document
        );

        if (!updatedUserAlert) {
            return { status: 'error', message: 'User Alert not found', result: null };
        }

        console.log('User Alert updated successfully!');
        return { status: 'success', result: updatedUserAlert, message: 'User Alert Updated Successfully' };
    } catch (err) {
        console.error('Error updating User Alert:', err);
        return { status: 'error', message: err.message, result: null };
    }
}


// **Delete User Alert**
export async function deleteOne({ id }) {
    await connectMongo();
    try {
        const deletedUserAlert = await UserAlert.findByIdAndDelete(id);
        if (!deletedUserAlert) {
            return { status: 'error', message: 'User Alert not found', result: null };
        }

        console.log('User Alert deleted successfully!');
        return { status: 'success', result: deletedUserAlert, message: 'User Alert Deleted Successfully' };
    } catch (err) {
        console.error('Error deleting User Alert:', err);
        return { status: 'error', message: err.message, result: null };
    }
}


// Get All Users which have the given "alertId" in their "alerts"
// Users->(email, alert status(status and completionStatus of the given alert))
export async function getUsersAndAlertStatusByAlertId({ alertId }) {
    await connectMongo();
    try {
        const userAlerts = await UserAlert.find(
            { 'alerts.alert': alertId }, // Match documents with the given alertId in alerts array
            {
                email: 1, // Include email
                alerts: {
                    $elemMatch: { alert: alertId } // Filter alerts to include only the matching alert
                }
            }
        );

        console.log({ userAlerts });

        return {
            status: 'success',
            result: userAlerts.map(user => ({
                email: user.email,
                completionStatus: user.alerts[0]?.completionStatus,
                status: user.alerts[0]?.status,
            })),
            message: 'User alerts filtered successfully',
        };
    } catch (err) {
        console.error('Error fetching user alerts by alertId:', err);
        return {
            status: 'error',
            message: err.message,
            result: null,
        };
    }
}
