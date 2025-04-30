const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    index: true
  },
  phone: {
    type: String,
    index: true
    /*required: [true, "Please provide phone number"],*/
  },
  countryCode: {
    type: String,
    index: true
  },
  password: {
    type: String
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
  forgotPasswordToken: String,
  forgotPasswordTokenExpiry: Date,
  verifyToken: String,
  verifyTokenExpiry: Date,
  referredBy: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    index: true,
    default: 'none@gurukulhub.com'
  }
})

const User = mongoose.models?.users || mongoose.model('users', userSchema)

module.exports = User
