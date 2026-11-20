const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { seedInitialData } = require("../services/seedService");

let mongoMemoryServerInstance = null;

const connectDB = async () => {
  // Option 1: Try MongoDB Atlas from .env with a short timeout
  if (process.env.MONGO_URI) {
    try {
      console.log("Attempting connection to MongoDB Atlas...");
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      console.log("Connected to MongoDB Atlas successfully!");
      await seedInitialData();
      return;
    } catch (atlasErr) {
      console.warn("MongoDB Atlas connection failed or IP not whitelisted:", atlasErr.message);
      console.log("Attempting fallback options to ensure 100% offline & local demo reliability...");
    }
  }

  // Option 2: Try Local MongoDB
  try {
    const localUri = "mongodb://127.0.0.1:27017/evidence_ai";
    console.log("Attempting connection to local MongoDB at", localUri);
    await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log("Connected to local MongoDB successfully!");
    await seedInitialData();
    return;
  } catch (localErr) {
    console.warn("Local MongoDB daemon not running:", localErr.message);
  }

  // Option 3: In-Memory MongoDB Server (Zero setup, guaranteed to work anywhere)
  try {
    console.log("Initializing in-process MongoMemoryServer engine...");
    mongoMemoryServerInstance = await MongoMemoryServer.create();
    const uri = mongoMemoryServerInstance.getUri();
    await mongoose.connect(uri);
    console.log("Connected to in-process MongoMemoryServer successfully at:", uri);
    await seedInitialData();
  } catch (memErr) {
    console.error("Critical: Failed to initialize all database engines:", memErr.message);
  }
};

module.exports = connectDB;
