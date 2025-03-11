const { MongoClient } = require("mongodb");

let db;

async function connection() {
  try {
    const client = await MongoClient.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    db = client.db(process.env.DB_NAME);
    console.log("✅ Connected to MongoDB Atlas");

    return db;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

// ✅ Export `db` directly
function getDB() {
  if (!db) {
    throw new Error("❌ Database not initialized. Call connection() first.");
  }
  return db;
}

module.exports = { connection, getDB };
