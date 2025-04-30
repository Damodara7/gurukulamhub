import mongoose from 'mongoose'

// Define the schema for StatesAndPinCodesAndLocality
const pinCodeSchema = new mongoose.Schema({
  pincode: String,
  localities: [
    {
      VillageOrLocalityName: String,
      OfficeName: String
    }
  ]
})

const stateSchema = new mongoose.Schema({
  state: String,
  pinCodes: [pinCodeSchema]
})

const StatesAndPinCodesAndLocalityModel =
  mongoose.models.StatesAndPinCodesAndLocality || mongoose.model('StatesAndPinCodesAndLocality', stateSchema)

export default StatesAndPinCodesAndLocalityModel
