const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    seq: {
      type: Number,
      required: true,
      index: true,
    },
    evidenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Evidence",
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
    },
    action: {
      type: String,
      required: true,
      enum: [
        "EVIDENCE_UPLOAD",
        "SHA256_HASHED",
        "AES_ENCRYPTED",
        "INTEGRITY_VERIFIED",
        "AI_ANALYSIS_COMPLETED",
        "FORENSIC_EXAMINATION",
        "FORENSIC_REPORT_ATTACHED",
        "COURT_INSPECTED",
        "CHAIN_VERIFIED",
        "EVIDENCE_DOWNLOAD",
        "TAMPER_SIMULATED",
        "EVIDENCE_RESTORED",
        "BSA_CERTIFICATE_ISSUED",
      ],
    },
    userId: {
      type: String,
      default: "SYSTEM",
    },
    userName: {
      type: String,
      default: "System Auditor",
    },
    role: {
      type: String,
      enum: ["police", "forensic", "court", "admin", "system"],
      default: "system",
    },
    details: {
      type: String,
      default: "",
    },
    fileHash: {
      type: String,
      default: "",
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1",
    },
    prevHash: {
      type: String,
      required: true,
    },
    entryHash: {
      type: String,
      required: true,
    },
    isAltered: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
