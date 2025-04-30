import mongoose from "mongoose";
const CounterSchema = new mongoose.Schema({
  _id: {
    type: String, // e.g., 'advertisementId'
    required: true
  },
  sequence_value: {
    type: Number,
    required: true
  }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema,'Counter');

export default Counter;
