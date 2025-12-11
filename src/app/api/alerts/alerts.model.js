import mongoose from 'mongoose'
import AudienceModel from '../audience/audience.model'
import VideoModel from '../videos/videos.model'

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
    audience: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'audiences',
        default: null,
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
