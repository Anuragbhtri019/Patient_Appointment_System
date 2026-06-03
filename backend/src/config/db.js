import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer;

const getMongoUri = async () => {
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (mongoUri) {
    return mongoUri;
  }

  if (process.env.NODE_ENV === "test") {
    if (!memoryServer) {
      memoryServer = await MongoMemoryServer.create();
    }
    return memoryServer.getUri();
  }

  throw new Error("MONGODB_URI or MONGO_URI is not defined and NODE_ENV is not 'test'");
};

export const connectDB = async () => {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const mongoUri = await getMongoUri();
      const conn = await mongoose.connect(mongoUri);
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      retries += 1;
      console.error(
        `MongoDB connection error (Attempt ${retries}/${maxRetries}):`,
        error.message
      );
      if (retries === maxRetries) {
        if (process.env.NODE_ENV === "test") {
          throw error;
        }
        console.error("Failed to connect to MongoDB after 3 attempts");
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
};

export const stopMemoryServer = async () => {
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = undefined;
  }
};
