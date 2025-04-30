//import mongoose from 'mongoose'

const mongoose = require('mongoose')
require('dotenv').config(); // Load environment variables

const MONGODB_URI = process.env.MONGODB_URI
const cached = {}
console.log("The mongo uri is ",MONGODB_URI,cached)

module.exports = async function connectMongo() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
  }
  if (cached.connection) {
   // console.log("DB connected cached......")
    return cached.connection
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: true, autoIndex: true
    }
    cached.promise = mongoose.connect(MONGODB_URI, opts)
  }
  try {
    cached.connection = await cached.promise
    //console.log("DB connected....")
  } catch (e) {
    console.log('MONGODB CONNECTION ERROR: ', e?.message)
    cached.promise = undefined
    throw e
  }
  return cached.connection
}
//export default connectMongo
