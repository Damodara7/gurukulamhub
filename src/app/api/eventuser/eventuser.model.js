import mongoose from 'mongoose'

export const eventuserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        // unique: true,
        // index: true
    },
    age: {
        type: Number,
        required: [true, "Please provide age"],
        min: 6,
        max: 120
    },
    gender: {
        type: String,
        required: [true, "Please provide gender"],
        // enum: ['Male', 'Female', 'Other']
    },
    mobileNumber: {
        type: String,
        required: [true, "Please provide mobile number"],
    },
    fatherOrHusbandName: {
        type: String,
        required: [true, "Please provide father or husband name"]
    },
    designation: {
        type: String,
        required: [true, "Please provide designation"]
    },
    village: {
        type: String,
        required: [true, "Please provide village"]
    },
    taluka: {
        type: String,
        required: [true, "Please provide taluka"]
    },
    district: {
        type: String,
        required: [true, "Please provide district"]
    },
})

const EventUsers = mongoose.models?.eventusers || mongoose.model('eventusers', eventuserSchema)

export default EventUsers
