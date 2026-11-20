const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    caseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    investigator: {
      type: String,
      required: true,
      trim: true,
      default: "Inspector Vitesh Dongre",
    },
    policeStation: {
      type: String,
      default: "Shivajinagar Police Station, Pune",
    },
    firNumber: {
      type: String,
      default: function () {
        return this.caseId;
      },
    },
    status: {
      type: String,
      enum: ["Open", "Under Investigation", "Under Court Review", "Closed"],
      default: "Open",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    location: {
      type: String,
      default: "Pune, Maharashtra",
    },
    incidentDate: {
      type: Date,
      default: Date.now,
    },
    evidenceCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Case", caseSchema);
