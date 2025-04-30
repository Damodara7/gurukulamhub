import mongoose from "mongoose";

// Define schema for the Cities collection
const citySchema = new mongoose.Schema({
  city: String,
  state: String,
  latitude: Number,
  longitude: Number,
  country: String,
});

const Cities = mongoose.models.cities || mongoose.model('cities', citySchema);

export default Cities;
