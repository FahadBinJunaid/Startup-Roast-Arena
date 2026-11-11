// config/db.js
// Responsibility: connect our Express app to MongoDB Atlas using Mongoose.
// We keep this in its own file so the connection logic is in ONE place.
//
// IMPORTANT: Vercel runs the backend as a serverless function. A serverless
// function can start up many times, so we must REUSE the MongoDB connection
// instead of opening a brand new one on every request.

import mongoose from "mongoose";

// We remember the connection attempt here so several requests can share it.
let connectionPromise = null;

async function connectDB() {
  // 1) Already connected? Just reuse the existing connection.
  //    mongoose.connection.readyState: 1 means "connected".
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // 2) A connection attempt is already running? Wait for that same one.
  if (connectionPromise) {
    return connectionPromise;
  }

  // 3) Otherwise start a new connection and remember the promise.
  connectionPromise = mongoose
    .connect(process.env.MONGO_URI)
    .then((connection) => {
      console.log(`MongoDB connected: ${connection.connection.host}`);
      return connection;
    })
    .catch((error) => {
      console.error(`MongoDB connection error: ${error.message}`);

      // Reset the promise so a later request can try again.
      // This matters on serverless platforms, where a cold start may retry.
      connectionPromise = null;

      // We THROW instead of calling process.exit(). Calling process.exit()
      // would crash the serverless function; throwing lets the error handler
      // return a normal error response instead.
      throw error;
    });

  return connectionPromise;
}

export default connectDB;
