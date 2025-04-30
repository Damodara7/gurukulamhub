import UserLearning from './user-learning.model';
import connectMongo from '@/utils/dbConnect-mongo';
import '../videos/videos.model.js'; // Import models of populating ref's

// Get all learning records for a user
export async function getLearningRecordsForUser({ email }) {
    await connectMongo();

    try {
        // Find the user by email and retrieve their learning records, populating the video field
        const user = await UserLearning.findOne(
            { email },
            { learning: 1, _id: 0 } // Only return the learning field, omit the _id
        ).populate({
            path: 'learning.video', // Populate the 'video' field inside each learning object
            model: 'videos' // Ensure that the 'videos' model is populated
        }); // Populate the video reference

        if (user) {
            console.log("Learning records for user:", email, user.learning);
            return { status: 'success', result: user.learning, message: 'Fetched learning records for user successfully.' };
        } else {
            console.log("User not found.");
            return { status: 'error', result: null, message: 'User not found.' };
        }
    } catch (error) {
        console.error("Error fetching learning records for user:", error);
        return { status: 'error', result: null, message: error.message };
    }
}



// Get all learning records for all users
export async function getAll() {
    await connectMongo();

    try {
        // Find all users and their learning records
        const users = await UserLearning.find({}, { learning: 1, email: 1, _id: 0 });

        if (users && users.length > 0) {
            console.log("All users' learning records:", users);
            return { status: 'success', result: users, message: "Fetched all users' learning records successfully." };
        } else {
            console.log("No users found.");
            return { status: 'error', result: null, message: 'No users found.' };
        }
    } catch (error) {
        console.error("Error fetching all learning records:", error);
        return { status: 'error', result: null, message: error.message };
    }
}

// Add a new learning record(s) for a user
export async function addLearningRecords({ email, data }) {
    await connectMongo()

    // Ensure data is always an array
    const learningRecords = Array.isArray(data) ? data : [data];

    try {
        // Loop over each learning record and add it to the user's learning array
        const updatedUser = await UserLearning.findOneAndUpdate(
            { email },
            {
                $addToSet: { // Use $addToSet to avoid duplicates
                    learning: {
                        $each: learningRecords.map(record => ({
                            video: record.videoId,
                            learningPoints: record.learningPoints,
                            totalPoints: record.totalPoints,
                            answers: record.answers,
                            completionPercent: record.completionPercent,
                            earnedAt: new Date(),
                        }))
                    }
                }
            },
            { new: true, upsert: true }
        );

        if (updatedUser) {
            console.log("Updated user with learning records:", updatedUser);
            return { status: 'success', result: updatedUser, message: 'Added learning records for user successfully.' };
        } else {
            console.log("User or video already exists, no update performed.");
            return { status: 'error', result: null, message: 'No update performed.' };
        }
    } catch (error) {
        console.error("Error updating user learning record:", error);
        return { status: 'error', result: null, message: error.message };
    }
};



// Get users(email, learningPoints, earnedAt) earned points for a videoId
export async function getUsersForVideo({ videoId }) {
    await connectMongo()

    try {
        // Aggregate the data to find users who have earned points for the given videoId
        const users = await UserLearning.aggregate([
            {
                $unwind: "$learning" // Flatten the 'learning' array to make each entry accessible
            },
            {
                $match: { "learning.video": mongoose.Types.ObjectId(videoId) } // Match only records for the specific videoId
            },
            {
                $project: { // Select only the relevant fields
                    email: 1,
                    "learning.learningPoints": 1,
                    "learning.earnedAt": 1
                }
            }
        ]);

        console.log("Users and their earned points for videoId:", videoId, users);
        return { status: 'success', result: users, message: 'Fetched users for videoId successfully.' }

    } catch (error) {
        console.error("Error fetching users for videoId:", error);
        return { status: 'error', result: null, message: error.message };
    }
};

