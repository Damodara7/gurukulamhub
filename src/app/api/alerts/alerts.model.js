import mongoose from 'mongoose'

const alertsSchema = new mongoose.Schema({
    alertType: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    priority: {
        type: Number,
        required: true,
        default: 1,
    },
    videos: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'videos',
        default: [],
    },
    content: {
        type: Object,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    updatedBy: {
        type: String,
    }
}, { timestamps: true });

const Alerts = mongoose.models.alerts || mongoose.model('alerts', alertsSchema)

export default Alerts
