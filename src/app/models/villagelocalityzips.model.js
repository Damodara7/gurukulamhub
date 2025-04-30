import mongoose from "mongoose";
// Define your schema
const VillageLocalityZipSchema = new mongoose.Schema({
  'VillageOrLocalityName': String,
  'OfficeName(BO/SO/HO)': String,
  'PinCode': String,
  'SubDistName': String,
  'DistrictName': String,
  'StateName': String
});

// Create a model based on the schema
const VillageLocalityZip = mongoose.models.villagelocalityzips || mongoose.model('villagelocalityzips', VillageLocalityZipSchema);

export default VillageLocalityZip;
