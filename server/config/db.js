import mongoose from "mongoose";
import fs from "fs";
import path from "path";

let isMongoConnected = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn("⚠️  No MONGO_URI specified in environment variables. Falling back to local file-based database storage (local_db).");
    isMongoConnected = false;
    return false;
  }
  // console.log(mongoUri)

  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(mongoUri);
    console.log("🟩 MONGODB CONNECTED SECURELY TO ATLAS");
    isMongoConnected = true;
    return true;
  } catch (err) {
    // console.error("❌ MongoDB Connection Error:", err.message);
    console.error(err);
    isMongoConnected = false;
    throw new Error(`Critical: Failed to connect to MongoDB Atlas specified by MONGO_URI: ${err.message}`);
  }
};

export const getDbState = () => {
  return isMongoConnected && mongoose.connection.readyState === 1;
};

export const isStrictMongo = () => {
  return !!process.env.MONGO_URI;
};

// Generic JSON local store helper for robust fallback (only initialized & written when NOT strictly in Mongo mode)
const LOCAL_DB_DIR = path.join(process.cwd(), "local_db");

export const readLocalFile = (filename, defaultData = []) => {
  if (isStrictMongo()) {
    // In strict Mongo mode, never read/create local files - direct return defaults in memory
    return defaultData;
  }

  if (!fs.existsSync(LOCAL_DB_DIR)) {
    fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
  }

  const filePath = path.join(LOCAL_DB_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading local file db: ${filename}`, err);
    return defaultData;
  }
};

export const writeLocalFile = (filename, data) => {
  if (isStrictMongo()) {
    // In strict Mongo mode, never write local files
    return;
  }

  if (!fs.existsSync(LOCAL_DB_DIR)) {
    fs.mkdirSync(LOCAL_DB_DIR, { recursive: true });
  }

  const filePath = path.join(LOCAL_DB_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing local file db: ${filename}`, err);
  }
};
