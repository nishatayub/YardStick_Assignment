const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully...")
    } catch (err) {
        console.error(err.message, "MongoDB connection failed!");
    }
}

module.exports = connectDB