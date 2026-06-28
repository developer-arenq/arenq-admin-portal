// database/conn.js
import mongoose from "mongoose";

mongoose.set("strictQuery", false); // remove deprecation warning

let isConnected = false; // connection state

const main = async () => {
  if (isConnected) {
    // Already connected → skip re-connecting
    return;
  }

  try {
    const db = await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("✅ Database Connected");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
};

export default main;
