import mongoose from 'mongoose'
import { Truculenta } from 'next/font/google'

const languageSchema = new mongoose.Schema({
  language: { type: String, required: true },
  canRead: { type: Boolean },
  canWrite: { type: Boolean },
  canSpeak: { type: Boolean }
})

const associatedOrganizationSchema = new mongoose.Schema({
  organization: { type: String, required: true },
  organizationType: { type: String },
  websiteUrl: { type: String, required: true }
})

const schoolSchema = new mongoose.Schema({
  school: { type: String, required: true },
  highestQualification: { type: String },
  degree: { type: String },
  fieldOfStudy: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String },
  type: { type: String, default: 'education' }
})

const workingPositionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  employmentType: { type: String, required: true },
  companyName: { type: String, required: true },
  location: { type: String },
  locationType: { type: String },
  isCurrentlyWorking: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String },
  type: { type: String, default: 'work' }
})

const userProfileSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    age: {
      type: Number,
      validate: {
        validator: value => value >= 6 && value <= 120,
        message: 'Age must be between 6 and 120.'
      }
    },
    firstname: { type: String },
    lastname: { type: String },
    image: { type: String },
    gender: { type: String },
    referredBy: { type: String, default: 'none@gurukulamhub.com' },
    phone: { type: String },
    accountType: { type: String },
    nickname: { type: String },
    roleInOrganization: { type: String },
    address: { type: String },
    country: { type: String },
    countryCode: { type: String },
    countryDialCode: { type: Number },
    region: { type: String },
    zipcode: { type: String },
    locality: { type: String },
    street: { type: String },
    colony: { type: String },
    village: { type: String },
    timezone: { type: String },
    religion: { type: String },
    caste: { type: String },
    category: { type: String },
    motherTongue: { type: String },
    languages: { type: [languageSchema] },
    knownLanguageIds: {
      type: [String]
    },
    associatedOrganizations: { type: [associatedOrganizationSchema] },
    activeAssociatedOrganizationIds: { type: [String] },
    currency: { type: String },
    voterId: {
      epicNumber: { type: String },
      frontImage: { type: String }, // URL or base64 of front image
      backImage: { type: String } // URL or base64 of back image
    },
    linkedInUrl: { type: String },
    facebookUrl: { type: String },
    instagramUrl: { type: String },
    openToWork: { type: Boolean },
    hiring: { type: Boolean },
    organization: { type: String },
    organizationRegistrationNumber: { type: String },
    organizationGSTNumber: { type: String },
    organizationPANNumber: { type: String },
    websiteUrl: { type: String },
    coordinates: {
      type: [Number],
      index: '2d'
    },
    schools: [schoolSchema],
    workingPositions: [workingPositionSchema],
    currentSchoolId: {
      type: String
    },
    currentWorkingPositionId: {
      type: String
    },
    networkLevel: { type: Number, default: 0 },
    referralPoints: { type: Number, default: 0 }
  },
  { timestamps: true }
)

const UserProfile = mongoose.models.userprofiles || mongoose.model('userprofiles', userProfileSchema)

export default UserProfile
