const mongoose = require("mongoose");

const aiResultSchema = new mongoose.Schema(
  {
    evidenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evidence",
      required: true,
      unique: true,
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
    },
    modelVersion: {
      type: String,
      default: "YOLOv8x-Forensic-v2.4",
    },
    summary: {
      type: String,
      default: "",
    },
    findings: [
      {
        label: String,
        category: String,
        confidence: Number,
        time_s: Number,
        bbox: [Number], // [x, y, width, height]
        details: String,
      },
    ],
    numberPlates: [
      {
        plateNumber: String,
        confidence: Number,
        isValidRTO: Boolean,
        state: String,
        vehicleType: String,
        time_s: Number,
      },
    ],
    timestampAnalysis: {
      overlayTimestamp: String,
      metadataTimestamp: String,
      hasDiscrepancy: Boolean,
      discrepancyNote: String,
    },
    suspiciousFlags: [
      {
        severity: {
          type: String,
          enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
          default: "MEDIUM",
        },
        reason: String,
        from_s: Number,
        to_s: Number,
      },
    ],
    transcription: {
      text: String,
      keywords: [String],
      speakerCount: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AiResult", aiResultSchema);
