const mongoose = require("mongoose");

const forensicReportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    evidenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evidence",
      required: true,
    },
    expertName: {
      type: String,
      required: true,
      default: "Dr. Sakshi Mashere, Senior Forensic Scientist",
    },
    laboratory: {
      type: String,
      default: "State Forensic Science Laboratory (FSL), Pune",
    },
    title: {
      type: String,
      required: true,
    },
    methodology: {
      type: String,
      default: "Cryptographic hash verification (SHA-256), frame extraction, neural object classification, and spectral audio analysis pursuant to ISO/IEC 27037.",
    },
    findings: {
      type: String,
      required: true,
    },
    conclusion: {
      type: String,
      required: true,
    },
    certifiedUnderBSA: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ForensicReport", forensicReportSchema);
