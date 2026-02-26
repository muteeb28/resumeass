import mongoose from "mongoose";

let connectionPromise;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!connectionPromise) {
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not set");
    }

    connectionPromise = mongoose
      .connect(mongoUri, {
        dbName: process.env.MONGODB_DB_NAME || undefined,
      })
      .then((conn) => {
        console.log("Connected to MongoDB");
        return conn.connection;
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
};

// Temporary compatibility export for any leftover PostgreSQL seed scripts.
export const getPool = () => {
  throw new Error("getPool is no longer available. Use Mongoose models instead.");
};

export default { connectDB, getPool };
