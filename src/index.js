const express = require("express");
const cors = require("cors");
require("dotenv").config();
const {connection} = require("./ConnectToDb/connection");
const router = require("./api/api");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ API Routes
app.use("/api",router);

// ✅ Start Server
const startServer = async () => {
  try {
    await connection(); // Ensure DB connection before starting server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1); // Exit process on failure
  }
};

startServer();


module.exports=app