const mongoose = require("mongoose");
 const QuestionDefaultValues = {
  "id": "",
  "quizId":"",
  "isPrimary":"",
  "primaryQuestionId":"",
  "templateId": "",
  "language":{},
  "createdBy":"system",
  "status":"",
  "approvalState":"",
  "approvedBy":"",
  "schemaVersion":"1.0.0"
}

const QuestionSchema1_0_0 = new mongoose.Schema({
  id:{
    type: String,
    required: true
  },
  quizId:{
    type: String,
    required:false
  },
  isPrimary:{
    type: Boolean,
    required: true,
    default: true
  },
  primaryQuestionId:{
    type: String,
    required: false
  },
  templateId:{
    type: String,
    required: true
  },
  createdBy:{
    type: String,
    required: true
  },
   approvalState:{ /// draft -- pending --approved
    type: String,
    required: true,
    default:"draft"
  },
  approvedBy:{
    type:String,
    required: false,
  },
  tags: {
    type: [String],
    required:false
  },
  status: {
    type: String,
    default: 'active'
    // Mark new quizes as active
  },
  language: {
    type: String,
    required: true
  },
  languageCode:{
    type: String,
    required: true,
    default: 'en'
  },
  languageName:{
    type:String,
    required:true,
    default:'English'
  },
  data:{
    type: Object
  },
  schemaVersion: {
    type: String,
    default: '1.0.0', // Initial schema version
    required: true
  }
});

const ArtifactSchemaLatest = QuestionSchema1_0_0;



const QuestionsModel = mongoose.models.questions || mongoose.model('questions', ArtifactSchemaLatest);

module.exports = QuestionsModel;
