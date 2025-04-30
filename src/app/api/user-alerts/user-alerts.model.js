import mongoose from 'mongoose'

const userAlertsSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    alerts: {
        type: [
            {
                alert: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'alerts', // Reference to the Alerts collection
                    required: true,
                },
                completionStatus: {
                    type: String,
                    enum: ['pending', 'completed'],
                    default: 'pending',
                    required: true,
                },
                status: {
                    type: String,
                    enum: ['active', 'inactive'],
                    default: 'active',
                    required: true,
                },
            }
        ],
        default: [],
    },
}, { timestamps: true });


userAlertsSchema.index({ email: 1 }, { unique: true });

const UserAlerts = mongoose.models.userAlerts || mongoose.model('userAlerts', userAlertsSchema)

export default UserAlerts
