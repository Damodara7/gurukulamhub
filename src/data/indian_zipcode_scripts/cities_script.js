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

    const citySchema = new mongoose.Schema({
        city: String,
        state: String,
        latitude: Number,
        longitude: Number,
        country: String,
    });

    const CityModel = mongoose.models.cities || mongoose.model('cities', citySchema);


    try {
        // Connect to MongoDB
        await connectMongo();

        // Clear the existing Cities collection to prevent duplicates
        await CityModel.deleteMany({});
        console.log('Cleared the Cities collection');

        const results = [];

        // Read and parse the CSV file
        fs.createReadStream('./src/data/indian_zipcode_scripts/cities.csv') // Adjust path if needed
            .pipe(csv())
            .on('data', (data) => {
                results.push(data);
            })
            .on('end', async () => {
                console.log('Read Records into Buffer - Inserting Records to DB now:', new Date());

                try {
                    // Insert the parsed data into the MongoDB collection
                    const cityDocuments = results.map((row) => ({
                        city: row.name,
                        state: row.state_name,
                        latitude: parseFloat(row.latitude),
                        longitude: parseFloat(row.longitude),
                        country: row.country_name,
                    }));

                    await CityModel.insertMany(cityDocuments);
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
