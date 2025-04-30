const mongoose = require("mongoose");


const QuizDefaultValues = {
  "id": "id",
  "title": "Quiz",
  "details": "Quiz Details",
  "owner": "system",
  "editorIds": [],
  "createdBy": null,
  "privacy": "PUBLIC",
  "contextIds": "",
  "approvalState": "draft",
  "remarks": "",
  "thumbnail": "",
  "tags": null,
  "status": "active",
}

const languageSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  }
});

const secondaryLanguagesSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
});


const QuizSchema1_0_0 = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  editorIds: {
    type: [String],
    required: false
  },
  createdBy: {
    type: String,
    required: true
  },
  privacy: { // PUBLIC | PRIVATE
    type: String,
    required: true
  },
  contextIds: {
    type: String,
    required: true
  },
  approvalState: { /// draft | pending | approved | rejected | published
    type: String,
    required: true,
    default: "draft"
  },
  approvedBy: {
    type: String,
    required: false,
  },
  nodeType: {
    type: String,
    required: false
  },
  tags: {
    type: [String],
    required: false
  },
  children: {
    type: [String],
    required: true,
    default: []
  },
  status: {
    type: String,
    default: 'active'
    // Mark new quizes as active
  },
  remarks: {
    type: [String]
  },
  thumbnail: {
    type: String,
    required: false
  },
  language: {
    type: languageSchema,
    required: true
  },
  secondaryLanguages: {
    type: [secondaryLanguagesSchema],
    default: []
  },
  schemaVersion: {
    type: String,
    default: '1.0.0', // Initial schema version
    required: true
  }
});

const ArtifactSchemaLatest = QuizSchema1_0_0;



const Quizzes = mongoose.models.quizzes || mongoose.model('quizzes', ArtifactSchemaLatest);

module.exports = Quizzes;
