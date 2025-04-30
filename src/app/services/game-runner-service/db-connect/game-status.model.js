const mongoose = require("mongoose");


const GameStatusDefaultValues = {
  //"_id":"XXXXXX"
  "gamePin": "654321",
  "gameId": "1234",
  "startDateTime": "2024-09-26T10:00:00",
  "gameStatus": "", //active live running completed archived
  "endDateTime": null,
  "owner": "parsi.venkatramana@gmail.com",
  "privacy": "public",
  "remarks": null,
  "status": "active", //active, deleted, inactive
}


const GameStatusSchema1_0_0 = new mongoose.Schema({
  // _id: {
  //   type: String, // _id default created by mongo.
  //   required: true
  // },
  gamePin: {
    type: String,
    required: true,
    unique: true // Index on gamePin for fast configs
  },
  gameId: {
    type: String,
    required: true //we can run a same game  multiple times with different game pins simultaneously.
  },
  startDate: {
    type: Date,
    required: true
  },
  gameStatus: {
    type: String,
    enum: ['active', 'live', 'running', 'completed', 'archive'], // Define possible statuses
    required: true
  },
  endDate: {
    type: Date,
    required: false
  },
  remarks: {
    type: String,
    required: false
  },
  owner: {
    type: String,
    required: false
  },
  privacy: {
    type: String,
    required: true,
  },
  // Audit fields
  createdAt: {
    type: Date,
    default: Date.now // Automatically set on creation
  },
  updatedAt: {
    type: Date,
    default: Date.now // Automatically updated on each save
  },
  audit: {
    updatedBy: {
      type: String,
      required: false // Store the user or system making the update
    },
    changeLog: {
      type: [String], // Array of strings to store descriptions of changes
      default: []
    }
  }
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

// Create indexes for performance (optional, if _id is already gamePin, it's unique by default)
//GameStatusSchema1_0_0.index({ _id: 1 }); // Ensures _id (gamePin) is indexed and unique
GameStatusSchema1_0_0.index({ gamePin: 1 }, { unique: true }); // Unique index on gamePin

// Model creation with name GameStatus

const ArtifactSchemaLatest = GameStatusSchema1_0_0;
const GameStatus = mongoose.models.gamestatus || mongoose.model('gamestatus', ArtifactSchemaLatest, 'gamestatus');
//await GameStatus.syncIndexes();
module.exports = GameStatus;
