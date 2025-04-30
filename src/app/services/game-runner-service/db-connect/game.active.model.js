 mongoose = require("mongoose");


 const GameDefaultValues = {
  "_id": "id",
  "gamePin": "1234",
  "title": "Game Title",
  "details": "",
  "startDate":null,
  "slogan": null,
  "owner": "",
  "thumbnailUrl": "",
  "promoVideoUrl": "",
  "sponsorName":"",
  "sponsorWebSite":"",
  "quizId": null,
  "totalRewardsValue": "",
  "remarks":"",
  "remarksNotes":"",
  "status":"active", //active, deleted, inactive
  "gameStatus":"active" // live - active - archived
}


const GameSchema1_0_0 = new mongoose.Schema({

  _id:{
    type: String,
    required: true
    //default: () => new mongoose.Types.ObjectId().toString(), // Generates ObjectId as String
  },
  gamePin:{
    type: String,
    required: true
  },
  quizId:{
    type: String,
    required: true
  },
  title:{
    type: String,
    required: false
  },
  details:{
    type: String,
    required: true
  },
  startDate:{
    type: Date,
    required: false
  },
  endDate:{
    type: Date,
    required: false
  },
  slogan:{
    type: String,
    required:false
  },
  owner:{
    type:String,
    required:true
  },
  thumbnailUrl:{
    type: String,
    required: true
  },
  promoVideoUrl:{
    type:String,
    required: false,
  },
  sponsorName: {
    type: String,
    required: false
  },
  sponsorWebSite: {
    type: String,
    required:false
  },
  sponsorPhone:{
    type: String,
    required: false,
  },
  totalRewardsValue: {
    type: String,
  },
  remarks:{
    type: String,
  },
  remarksNotes:{
    type: String,
    required: false
  },
  status:{
    type: String,
    required: false,
    default: "active"
  },
  gameStatus:{
    type: String,
    required: false,
    default:"active"
  },
   schemaVersion: {
    type: String,
    default: '1.0.0', // Initial schema version
    required: true
  }
});

const ArtifactSchemaLatest = GameSchema1_0_0;
const GamesActive = mongoose.models.gamesActive || mongoose.model('gamesActive', ArtifactSchemaLatest,'gamesActive');
module.exports = GamesActive;

