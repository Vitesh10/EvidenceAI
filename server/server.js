const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (Atlas with fallback to MongoMemoryServer)
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static preview files from uploads if needed
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Mount API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/cases", require("./routes/caseRoutes"));
app.use("/api/evidence", require("./routes/evidenceRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/audit", require("./routes/auditRoutes"));
app.use("/api/forensic/reports", require("./routes/forensicRoutes"));
app.use("/api/forensic", require("./routes/forensicRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/stats", require("./routes/statsRoutes"));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "EvidenceAI National Digital Evidence Management API is running",
    timestamp: new Date(),
    architecture: {
      framework: "Express.js 5 + Node.js",
      cryptography: "SHA-256 (FIPS 180-4) + AES-256-GCM",
      aiPipeline: "YOLOv8 + OCR + ANPR + Audio Transcription",
      legalCompliance: "Bharatiya Sakshya Adhiniyam, 2023 Section 63/65B",
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`EvidenceAI Backend running on http://localhost:${PORT}`);
  console.log(`Endpoints active: /api/cases, /api/evidence, /api/ai,`);
  console.log(`                 /api/audit, /api/reports, /api/stats`);
  console.log(`=======================================================`);
});

module.exports = app;
