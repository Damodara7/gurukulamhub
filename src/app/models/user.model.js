import mongoose from 'mongoose'
import UserProfile from '../api/profile/profile.model'

export const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      index: true
    },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'userprofiles'
    },
    phone: {
      type: String,
      index: true
      /*required: [true, "Please provide phone number"],*/
    },
    roles: {
      type: [String],
      default: ['USER']
    },
    geoRoles: {
      type: [String],
      default: []
    },
    groupIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'groups',
        index: true
      }
    ],
    countryCode: {
      type: String,
      index: true
    },
    password: {
      type: String
      // required: [true, 'Please provide a password']
      //select: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    currentStatus: {
      type: String,
      default: 'SIGNED_UNVERIFIED'
    },
    socialLogin: {
      type: String
    },
    loginCount: {
      type: Number,
      default: 0
    },
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    verifyToken: String,
    verifyTokenExpiry: Date,
    referredBy: {
      type: String,
      // required: [true, 'Please provide email'],
      default: 'none@gurukulamhub.com'
    },
    referralSource: {
      type: String
    },
    referralSourceDetails: {
      type: String
    },
    memberId: {
      type: String,
      unique: true
    },
    referralToken: {
      type: String,
      unique: true
    }
  },
  { timestamps: true }
)

const User = mongoose.models?.users || mongoose.model('users', userSchema)

export default User
