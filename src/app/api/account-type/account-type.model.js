import mongoose from 'mongoose';

const accountTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    createdBy: {
        type: String,
        required: true,
    },
    creatorEmail: {
        type: String,
        required: true,
    },
    updatedBy: {
        type: String,
    },
    updaterEmail: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const AccountType = mongoose.models.accounttype || mongoose.model('accounttype', accountTypeSchema);
export default AccountType;

