import mongoose from 'mongoose'

const referralInviteSchema = new mongoose.Schema(
  {
    inviterEmail: {
      type: String,
      required: true,
      index: true
    },
    inviteeEmail: {
      type: String,
      required: true,
      index: true
    },
    referralToken: {
      type: String,
      default: ''
    },
    referralLink: {
      type: String,
      default: ''
    },
    locale: {
      type: String,
      default: 'en'
    },
    sentCount: {
      type: Number,
      default: 1
    },
    firstSentAt: {
      type: Date,
      default: Date.now
    },
    lastSentAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
)

referralInviteSchema.index({ inviterEmail: 1, inviteeEmail: 1 }, { unique: true })

const ReferralInvite = mongoose.models.referralinvites || mongoose.model('referralinvites', referralInviteSchema)

export default ReferralInvite
