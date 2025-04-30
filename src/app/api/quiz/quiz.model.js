import mongoose from "mongoose";


export const QuizDefaultValues = {
  "id": "id",
  "title": "Quiz",
  "details": "Quiz Details",
  "owner": "system",
  "editorIds": [],
  "createdBy": null,
  "privacy": "PUBLIC",
  "contextIds": [],
  "genericContextIds": [],
  "academicContextIds": [],
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
  courseLinks: {
    type: [Object],
    required: false
  },
  documents: {
    type: [Object],
    required: false
  },
  syllabus: {
    type: String,
    required: false
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
    type: [String],
    required: true
  },
  genericContextIds: {
    type: [String],
    required: true,
  },
  academicContextIds: {
    type: [String],
    required: false,
  },
  approvalState: { /// draft | saved | pending | approved | rejected | published
    type: String,
    required: true,
    enum: ['draft', 'saved', 'pending', 'approved', 'rejected', 'published'],
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

export default Quizzes;
