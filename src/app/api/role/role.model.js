import mongoose from 'mongoose'

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    createdBy: {
      type: String,
      required: true
    },
    updatedBy: {
      type: String
    },
    features: {
      type: [Object],
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    activatedAt: {
      type: Date
    },
    deactivatedAt: {
      type: Date
    },
    statusChangedBy: {
      type: String
    },
    statusHistory: [
      {
        status: { type: String, enum: ['active', 'inactive'] },
        changedBy: String,
        changedAt: { type: Date, default: Date.now }
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false
    },
    deleatedAt: Date,
    deletedBy: {
      type: String
    },
    deleterEmail: String
  },
  { timestamps: true }
)

const Role = mongoose.models.role || mongoose.model('role', roleSchema)
export default Role
