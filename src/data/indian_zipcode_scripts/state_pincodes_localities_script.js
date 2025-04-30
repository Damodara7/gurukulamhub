const fs = require('node:fs');
const csv = require('csv-parser');
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://gurkulhub_dbuser:2025Mongodb@cluster0.dlhzk.mongodb.net/gurkulhub?retryWrites=true&w=majority&appName=Cluster0";
const cached = {};

async function connectMongo() {
    if (!MONGODB_URI) {
        throw new Error('Please define the MONGO_URI environment variable inside .env.local');
    }

    // If a connection exists, use it
    if (cached.connection) {
        return cached.connection;
    }

    // If no cached connection, attempt to establish a new one
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };
        cached.promise = mongoose.connect(MONGODB_URI, opts);
    }

    try {
        cached.connection = await cached.promise;

        // Log the connection status for debugging
        console.log('MongoDB connection state:', mongoose.connection.readyState);  // Should be 1 for connected
        return cached.connection;
    } catch (e) {
        console.error('Error while connecting to MongoDB:', e);
        cached.promise = undefined;
        throw e;
    }
}

async function main() {
    const startTime = new Date();
    console.log('Script start time:', startTime);

    // Define the schema for StatesAndPinCodesAndLocality
    const pinCodeSchema = new mongoose.Schema({
        pincode: String,
        localities: [{
            VillageOrLocalityName: String,
            OfficeName: String,
        }],
    });

    const stateSchema = new mongoose.Schema({
        state: String,
        pinCodes: [pinCodeSchema],
    });

    const StatesAndPinCodesAndLocalityModel = mongoose.models.StatesAndPinCodesAndLocality || mongoose.model('StatesAndPinCodesAndLocality', stateSchema);

    try {
        // Connect to MongoDB
        await connectMongo();

        // Clear the existing collection to prevent duplicates
        await StatesAndPinCodesAndLocalityModel.deleteMany({});
        console.log('Cleared the StatesAndPinCodesAndLocality collection');

        const results = [];

        // Read and parse the CSV file
        fs.createReadStream('./src/data/indian_zipcode_scripts/locality_village_pincode_final_mar-2017.csv') // Replace with your CSV file path
            .pipe(csv())
            .on('data', (data) => {
                results.push(data);
            })
            .on('end', async () => {
                console.log('Read Records into Buffer - Transforming and Inserting Records to DB now:', new Date());

                try {
                    // Transform the data into the desired structure
                    const transformedData = {};

                    results.forEach((row) => {
                        const state = row.StateName;
                        const pincode = row.PinCode;
                        const locality = {
                            VillageOrLocalityName: row.VillageOrLocalityName,
                            OfficeName: row['OfficeName(BO/SO/HO)'],
                        };

                        if (!transformedData[state]) {
                            transformedData[state] = {
                                state: state,
                                pinCodes: [],
                            };
                        }

                        const pincodeEntry = transformedData[state].pinCodes.find((entry) => entry.pincode === pincode);

                        if (pincodeEntry) {
                            pincodeEntry.localities.push(locality);
                        } else {
                            transformedData[state].pinCodes.push({
                                pincode: pincode,
                                localities: [locality],
                            });
                        }
                    });

                    // Convert the transformed data into an array
                    const documents = Object.values(transformedData);

                    // Insert the transformed data into the MongoDB collection
                    await StatesAndPinCodesAndLocalityModel.insertMany(documents);
                    console.log('Data loaded successfully:', new Date());
                } catch (error) {
                    console.error('Error inserting data:', error);
                } finally {
                    // Close the connection
                    const endTime = new Date();
                    console.log('Script end time:', endTime);
                    mongoose.connection.close();
                }
            });
    } catch (error) {
        console.error('Error:', error);
    }
}

main().catch(console.error);