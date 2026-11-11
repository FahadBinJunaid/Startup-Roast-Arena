// config/db.js
// Responsibility: connect our Express app to MongoDB Atlas using Mongoose.
// We keep this in its own file so the connection logic is in ONE place.

import mongoose from "mongoose";

async function connectDB() {
  try {
    // mongoose.connect() returns a connection object once it succeeds.
    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);

    // If we cannot reach the database, the app is useless, so stop it.
    process.exit(1);
  }
}

export default connectDB;
