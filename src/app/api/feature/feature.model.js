import mongoose from 'mongoose';

const featureSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    createdBy: {
        type: String,
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'User',
        required: true,
    },
    updatedBy: {
        type: String,
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'User',
        // required: true,
    },
    permissions: {
        type: [String],
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Feature = mongoose.models.feature || mongoose.model('feature', featureSchema);
export default Feature;
