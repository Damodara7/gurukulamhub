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
    }
  },
  { timestamps: true }
)

const ReferralSettings = mongoose.models.referralsettings || mongoose.model('referralsettings', referralSettingsSchema)

export default ReferralSettings
