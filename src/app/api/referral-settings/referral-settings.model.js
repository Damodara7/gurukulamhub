import mongoose from 'mongoose'

export const DEFAULT_REFERRAL_SETTINGS = {
  directReferrerPoints: 500,
  maxDistributionLevels: 4,
  promotionPointsThreshold: 1000
}

const referralSettingsSchema = new mongoose.Schema(
  {
    directReferrerPoints: {
      type: Number,
      default: DEFAULT_REFERRAL_SETTINGS.directReferrerPoints,
      min: 0
    },
    maxDistributionLevels: {
      type: Number,
      default: DEFAULT_REFERRAL_SETTINGS.maxDistributionLevels,
      min: 1,
      max: 25
    },
    promotionPointsThreshold: {
      type: Number,
      default: DEFAULT_REFERRAL_SETTINGS.promotionPointsThreshold,
      min: 1
    },
    history: {
      type: [
        new mongoose.Schema(
          {
            editedAt: { type: Date, default: Date.now },
            editedByName: { type: String, default: '' },
            editedByEmail: { type: String, default: '' },
            changes: {
              type: [
                new mongoose.Schema(
                  {
                    field: { type: String, required: true },
                    previousValue: { type: mongoose.Schema.Types.Mixed, default: null },
                    newValue: { type: mongoose.Schema.Types.Mixed, default: null }
                  },
                  { _id: false }
                )
              ],
              default: []
            }
          },
          { _id: true }
        )
      ],
      default: []
    }
  },
  { timestamps: true }
)

const ReferralSettings = mongoose.models.referralsettings || mongoose.model('referralsettings', referralSettingsSchema)

export default ReferralSettings
