import mongoose from "mongoose";

const userLearningSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    learning: {
        type: [
            {
                video: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'video', // Assuming you have a Video model
                    required: true
                },
                learningPoints: {
                    type: Number,
                    required: true
                },
                totalPoints: { // Also available in video.questions (sum of all question marks)
                    type: Number,
                    required: true
                },
                answers: {
                    type: [Object],
                    required: true
                },
                completionPercent: {
                    type: Number,
                    required: true,
                },
                earnedAt: {
                    type: Date,
                    required: true
                }
            }
        ],
        default: []
    }
}, { timestamps: true })

const UserLearning = mongoose.models.userLearning || mongoose.model('userLearning', userLearningSchema)

export default UserLearning;
