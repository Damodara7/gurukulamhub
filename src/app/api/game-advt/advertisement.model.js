
import mongoose from "mongoose";

export const GameAdvtDefaultValues = {
  "_id": "id",
  "pin": "1234",
  "title": "Game Title",
  "details": "",
  "startDate": null,
  "slogan": null,
  "owner": "",
  "thumbnailUrl": "",
  "promoVideoUrl": "",
  "sponsorName": "",
  "sponsorWebSite": "",
  "quizId": null,
  "totalRewardsValue": "",
  "remarks": "",
  "remarksNotes": "",
  "status": "active", //active, deleted, inactive
  "gameStatus": "active" // live - active - archived
}

const boundsSchema = new mongoose.Schema({
  geoGraphy: {
    country: { type: String, },
    region: { type: String, },
    city: { type: String, },
  },
  quizzes: { type: mongoose.Schema.Types.Mixed, default: 'all' }, // Can be "all" or an array of IDs
});


const AdvertisementsSchema = new mongoose.Schema({

 advertisementId: {
    type: Number,
    unique: true,
    required: true
  },
  schemaVersion: {
    type: String,
    default: '1.0.0', // Initial schema version
    required: true
  },
  userName:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true
  },
  company:{
    type: String,
    required: true
  },
  contact:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  imageUrl: {
    type: String, // Optional, for pre-uploaded images
    required: true
  },
  actionUrl: {
    type: String, // Optional, for pre-uploaded images
    required: false
  },
  imageType: {
    type: String
  },
  width: {
    type: Number
  },
  height: {
    type: Number
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    default: 'active'
    // Mark new ads as active
  },
  runType:{
    type:String,
    default: "rolling"
  },
  advtCategory:{
    type:String,
    default:"top-marquee"
  },
  clicks:{
    type:Number
  },
  impressions:{
    type:Number
  },

  mediaType:{
    type:String
  },
  updatedBy:{
    type:String
  },
  auditHistory:{
    type:String
  },
  bounds: boundsSchema,
  industry: String,
  otherIndustry: String,
  organizationType: String,
  tagline: String,
});


// AdvertisementsSchema.pre('save', async function (next) {
//   if (this.isNew) {
//     this.advertisementId = await getNextSequenceValue('advertisementId');
//   }
//   next();
// });

const Advertisements = mongoose.models.Advertisements || mongoose.model('Advertisements', AdvertisementsSchema);
export default Advertisements;

