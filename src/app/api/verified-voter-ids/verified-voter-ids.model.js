import mongoose from 'mongoose'

const verifiedVoterIdsSchema = new mongoose.Schema({
  voterId: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean
  }
})

const VerifiedVoterIds = mongoose.models.verifiedvoterids || mongoose.model('verifiedvoterids', verifiedVoterIdsSchema)
export default VerifiedVoterIds
