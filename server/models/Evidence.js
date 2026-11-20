const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
  {
    evidenceId: {
      type: String,
      required: true,
      unique: true,
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    storedName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["video", "image", "audio", "document", "forensic_report"],
      default: "document",
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    sha256: {
      type: String,
      required: true,
      index: true,
    },
    isEncrypted: {
      type: Boolean,
      default: true,
    },
    encryptionIv: {
      type: String,
      default: "",
    },
    authTag: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: [
        "STORED_VERIFIED",
        "TAMPERED",
        "ANALYZED",
        "REVIEWED",
        "SUBMITTED_COURT",
        "ARCHIVED",
      ],
      default: "STORED_VERIFIED",
    },
    uploadedBy: {
      type: String,
      default: "Inspector Vitesh Dongre",
    },
    uploadedByRole: {
      type: String,
      default: "police",
    },
    deviceSource: {
      type: String,
      default: "Digital Seizure / Forensic Acquisition",
    },
    collectionLocation: {
      type: String,
      default: "Crime Scene / Seizure Site",
    },
    aiStatus: {
      type: String,
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      default: "COMPLETED",
    },
    isTamperedSimulated: {
      type: Boolean,
      default: false,
    },
    originalHashBackup: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Evidence", evidenceSchema);
