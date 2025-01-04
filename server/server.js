const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Initialize app
const app = express();
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();


// Middleware


app.use(cors());

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/blocked-sites", require("./routes/blockedSiteRoute"));
app.use("/api/time-tracking", require("./routes/timeTracking"));
app.use("/api/productivity-report", require("./routes/reports"));

// Error Handling Middleware
app.use(require("./middlewares/errorHandler"));

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
