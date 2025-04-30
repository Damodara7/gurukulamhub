import mongoose from 'mongoose';

const geoRoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    region: {
        type: String,
    },
    city: {
        type: String,
    },
    features: {
        type: [Object],
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, { timestamps: true });

const GeoRole = mongoose.models.geoRole || mongoose.model('geoRole', geoRoleSchema);
export default GeoRole;
