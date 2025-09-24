// const fs = require('node:fs');
// const csv = require('csv-parser');
import mongoose from 'mongoose'

const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI
const cached: { connection?: typeof mongoose; promise?: Promise<typeof mongoose> } = {}
async function connectMongo() {
  if (!MONGODB_URI) {
    throw new Error('Please define the DATABASE_URL environment variable inside .env.local')
  }
  if (cached.connection) {
    return cached.connection
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: true, autoIndex:true
    }
    cached.promise = mongoose.connect(MONGODB_URI, opts)
  }
  try {
    cached.connection = await cached.promise
  } catch (e: any) {
    console.log('MONGODB CONNECTION ERROR: ', e?.message)
    cached.promise = undefined
    throw e
  }
  return cached.connection
}
export default connectMongo

// Define your schema
const indianPinCodeDataSchema = new mongoose.Schema({
  'VillageOrLocalityName': String,
  'OfficeName(BO/SO/HO)': String,
  'PinCode': String,
  'SubDistName': String,
  'DistrictName': String,
  'StateName': String
});

// Create a model based on the schema
const DataModel = mongoose.models.villageLocalityZip ||mongoose.model('villageLocalityZip', indianPinCodeDataSchema);


// async function extractUniqueStatesWithPinCodesAndCities() {
//   await connectMongo();
//   const session = await mongoose.startSession();

//   try {
//     // Connect to MongoDB
//     console.log('Connected to MongoDB');
//     // session.startTransaction();

//     // Query the database for unique state names
//     const uniqueStateNames = await DataModel.distinct('StateName');
//     console.log('Unique State Names:', uniqueStateNames);

//     // Define schema for the unique state names collection
//     const stateSchema = new mongoose.Schema({
//       StateName: String,
//       PinCodes: [String],
//       Cities: [String], // Added a field for cities
//     });

//     const StateModel = mongoose.model('State', stateSchema);

//     // Prepare documents for insertion
//     const stateDocuments = await Promise.all(
//       uniqueStateNames.map(async (stateName) => {
//         console.log("StateName: " + stateName);

//         // Query the database for documents matching the given state name
//         const documents = await DataModel.find({ StateName: stateName }, 'PinCode name');
//         console.log("StateName: " + stateName + " (record count): " + documents.length);

//         // Extract unique pinCodes
//         const uniquePinCodes = [...new Set(documents.map(doc => doc.PinCode))];

//         // Extract unique city names
//         const uniqueCities = [...new Set(documents.map(doc => doc.name))];

//         return {
//           StateName: stateName,
//           PinCodes: uniquePinCodes,
//           Cities: uniqueCities,
//         };
//       })
//     );

//     // Insert the unique state names with pinCodes and cities into the State collection
//     console.log("State documents:", stateDocuments.length, stateDocuments);
//     await StateModel.insertMany(stateDocuments);

//     // Commit the transaction
//     // await session.commitTransaction();
//     console.log('Unique state names with pinCodes and cities stored successfully');
//   } catch (error) {
//     console.error('Error:', error);
//   } finally {
//     // End the session
//     session.endSession();
//     // Close the connection
//     mongoose.connection.close();
//   }
// }

// // await main().catch(console.error);
// extractUniqueStatesWithPinCodesAndCities().catch(console.error);
