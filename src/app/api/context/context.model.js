import mongoose from "mongoose";


export const ContextDefaultValues = {
  "id": "AUM",
  "title": "AUM",
  "lang": "en",
  "description": "Root Context",
  "owner": "system",
  "createdBy": "parsi.venkatramana@gmail.com",
  "privacy": "public",
  "parentContextId": "363636363636363636363636",
  "contextType": "COURSE",
  "tags": [],
  "status": "active",
}

const ContextSchema1_0_0 = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true
  },
  language: {
    type: Object,
    required: true,
    default: {
      code: "en",
      name: "English"
    }
  },
  description: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  parentContextId: {
    type: String,
    validate: {
      validator: function (value) {
        // If it's a root context, allow parentContextId to be nullable
        return this.isRoot || !!value;  // If isRoot is true, allow null, otherwise it must have a value
      },
      message: "Parent Context ID is required for non-root contexts.",
    },
    default: null, // Set the default value to null for root contexts
  },
  parentContextObjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "contexts", // Reference to the same collection
    validate: {
      validator: function (value) {
        // If it's a root context, allow parentContextObjectId to be nullable
        return this.isRoot || !!value; // If isRoot is true, allow null, otherwise it must have a value
      },
      message: "Parent Context Object ID is required for non-root contexts.",
    },
    default: null, // Set the default value to null for root contexts
  },

  contextType: {
    type: String,
    // required: false,
    default: "SUBJECT"
  },
  tags: {
    type: [String],
    // required: true
  },
  status: {
    type: String,
    default: 'active'
  },
  isRoot: {
    type: Boolean,
    default: false, // Explicitly define if the context is a root context
  },
  schemaVersion: {
    type: String,
    default: '1.0.0', // Initial schema version
    // required: true
  },
}, { timestamps: true });

const ArtifactSchemaLatest = ContextSchema1_0_0;



const Quizzes = mongoose.models.contexts || mongoose.model('contexts', ArtifactSchemaLatest);

export default Quizzes;
