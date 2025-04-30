const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  playerId: {
    type: String, // Unique player ID
    required: true
  },
  name: {
    type: String, // Player name
    required: false
  },
  score: {
    type: Number, // Player's current score in the game
    default: 0
  },
  joinedAt: {
    type: Date, // Timestamp when the player joined the game
    default: Date.now
  }
});

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
  "gameStatus":"live", // live - active - archived
  "currentStatus":"notStarted",
  "startedTime":"",
  "endedTime":""
}


const GameSchema1_0_0 = new mongoose.Schema({

  _id:{
    type: String,
    required:true
    //default: () => new mongoose.Types.ObjectId().toString(), // Generates ObjectId as String
  },
  gamePin:{
    type: String,
    required: true,
    unique: true
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
    required: true
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
  },
  currentStatus:{
    type: String,
    required:false,
    default:"pending", // started // paused, // completed //
  },
  startedTime:{
    type: Date,
    required:false,
  },
  completedTime:{
    type: Date,
    required: false
  },
  players: [PlayerSchema],
});

GameSchema1_0_0.index({ gamePin: 1 }, { unique: true });

GameSchema1_0_0.on('index', (error) => {
  if (error) {
    console.error('Index creation failed:', error);
  } else {
    console.log('gamePin Index created successfully.');
  }
});



const ArtifactSchemaLatest = GameSchema1_0_0;
const GamesLive = mongoose.models.gamesLive || mongoose.model('gamesLive', ArtifactSchemaLatest,"gamesLive");
module.exports = GamesLive;
