const fs = require('node:fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://gurkulhub_dbuser:2025Mongodb@cluster0.dlhzk.mongodb.net/gurkulhub?retryWrites=true&w=majority&appName=Cluster0";
const cached = {};

async function connectMongo() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGO_URI environment variable inside .env.local');
  }

  if (cached.connection) {
    return cached.connection;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.connection = await cached.promise;
    console.log('Connected to MongoDB');
    return cached.connection;
  } catch (e) {
    console.error('Error connecting to MongoDB:', e.message);
    cached.promise = undefined;
    throw e;
  }
}

// Define your schema
const indianPinCodeDataSchema = new mongoose.Schema({
  VillageOrLocalityName: String,
  OfficeName: String, // Changed field name to avoid invalid characters
  PinCode: String,
  SubDistName: String,
  DistrictName: String,
  StateName: String,
});

// Create a model based on the schema
const DataModel = mongoose.models.villageLocalityZip || mongoose.model('villageLocalityZip', indianPinCodeDataSchema);

async function main() {
  const startTime = new Date();
  console.log('Script start time:', startTime);

  try {
    // Connect to MongoDB
    await connectMongo();

    const results = [];

    // Read and parse the CSV file
    fs.createReadStream('./src/data/indian_zipcode_scripts/locality_village_pincode_final_mar-2017.csv') // Replace with the path to your CSV file
      .pipe(csv())
      .on('data', (data) => {
        // Transform the data to match the schema
        const transformedData = {
          VillageOrLocalityName: data['VillageOrLocalityName'],
          OfficeName: data['OfficeName(BO/SO/HO)'], // Map the CSV column to the schema field
          PinCode: data['PinCode'],
          SubDistName: data['SubDistName'],
          DistrictName: data['DistrictName'],
          StateName: data['StateName'],
        };
        results.push(transformedData);
      })
      .on('end', async () => {
        console.log('Read Records into Buffer - Inserting Records to DB now:', new Date());
        try {
          // Insert the parsed data into the MongoDB collection
          await DataModel.insertMany(results);
          console.log('Data loaded successfully:', new Date());
        } catch (error) {
          console.error('Error inserting data:', error);
        } finally {
          // Close the connection
          mongoose.connection.close();
          console.log('MongoDB connection closed');
        }
      });
  } catch (error) {
    console.error('Error:', error);
  }
}

async function extractAndStoreUniquePinCodes(stateName) {
  try {
    // Connect to MongoDB
    await connectMongo();

    // Query the database for documents matching the given state name
    const documents = await DataModel.find({ StateName: stateName }, 'PinCode').exec();

    // Extract unique pinCodes
    const uniquePinCodes = [...new Set(documents.map((doc) => doc.PinCode))];

    // Define schema for the unique pinCodes collection
    const pinCodeSchema = new mongoose.Schema({
      StateName: String,
      PinCodes: [String],
    });

    const PinCodeModel = mongoose.models.uniquePinCodes || mongoose.model('uniquePinCodes', pinCodeSchema);

    // Create a document to store unique pinCodes for the state
    const pinCodeDoc = new PinCodeModel({
      StateName: stateName,
      PinCodes: uniquePinCodes,
    });

    // Save the document into the separate collection
    await pinCodeDoc.save();
    console.log(`Unique pinCodes for ${stateName} stored successfully`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
}

async function extractUniqueStatesWithPinCodesAndCities() {
  try {
    // Connect to MongoDB
    await connectMongo();

    // Query the database for unique state names
    const uniqueStateNames = await DataModel.distinct('StateName');
    console.log('Unique State Names:', uniqueStateNames);

    // Define schema for the unique state names collection
    const stateSchema = new mongoose.Schema({
      StateName: String,
      PinCodes: [String],
      Cities: [String], // Added a field for cities
    });

    const StateModel = mongoose.models.State || mongoose.model('State', stateSchema);

    // Prepare documents for insertion
    const stateDocuments = await Promise.all(
      uniqueStateNames.map(async (stateName) => {
        // Query the database for documents matching the given state name
        const documents = await DataModel.find({ StateName: stateName }, 'PinCode VillageOrLocalityName');

        // Extract unique pinCodes
        const uniquePinCodes = [...new Set(documents.map((doc) => doc.PinCode))];

        // Extract unique city names
        const uniqueCities = [...new Set(documents.map((doc) => doc.VillageOrLocalityName))];

        return {
          StateName: stateName,
          PinCodes: uniquePinCodes,
          Cities: uniqueCities,
        };
      })
    );

    // Insert the unique state names with pinCodes and cities into the State collection
    await StateModel.insertMany(stateDocuments);
    console.log('Unique state names with pinCodes and cities stored successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
}

// Execute the functions sequentially
(async () => {
  await main();
  await extractAndStoreUniquePinCodes('DELHI'); // Replace with the desired state name
  await extractUniqueStatesWithPinCodesAndCities();
})().catch(console.error);