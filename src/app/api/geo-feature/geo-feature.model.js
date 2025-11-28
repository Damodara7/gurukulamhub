import mongoose from 'mongoose'

const geoFeatureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    createdBy: {
      type: String,
      // type: mongoose.Schema.Types.ObjectId,
      // ref: 'User',
      required: true
    },
    updatedBy: {
      type: String
      // type: mongoose.Schema.Types.ObjectId,
      // ref: 'User',
      // required: true,
    },
    permissions: {
      type: [String],
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    deletedBy: {
      type: String
    },
    deleterEmail: String
  },
  { timestamps: true }
)

const GeoFeature = mongoose.models.geoFeature || mongoose.model('geoFeature', geoFeatureSchema)
export default GeoFeature
