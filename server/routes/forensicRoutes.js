const express = require("express");
const ForensicReport = require("../models/ForensicReport");
const Case = require("../models/Case");
const Evidence = require("../models/Evidence");
const AuditLog = require("../models/AuditLog");
const { GENESIS_HASH, computeAuditEntryHash } = require("../services/cryptoService");

const router = express.Router();

// Helper handler for GET reports
const getReportsHandler = async (req, res) => {
  try {
    const { caseId, evidenceId } = req.query;
    let query = {};
    if (caseId) query.caseId = caseId;
    if (evidenceId) query.evidenceId = evidenceId;

    const reports = await ForensicReport.find(query)
      .populate("caseId", "caseId title")
      .populate("evidenceId", "originalName evidenceId sha256 type")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mount on both "/" and "/reports" so both /api/forensic and /api/forensic/reports work
router.get("/", getReportsHandler);
router.get("/reports", getReportsHandler);

// Helper handler for POST report
const createReportHandler = async (req, res) => {
  try {
    const {
      caseId,
      evidenceId,
      expertName = "Dr. Sakshi Mashere",
      laboratory = "State Forensic Science Laboratory (FSL), Pune",
      title,
      findings,
      methodology,
      conclusion,
    } = req.body;

    const existingEvidence = await Evidence.findById(evidenceId);
    if (!existingEvidence) {
      return res.status(404).json({ success: false, message: "Evidence not found" });
    }

    const reportId = "FSL-" + Math.floor(1000 + Math.random() * 9000) + "-2025";

    const report = await ForensicReport.create({
      reportId,
      caseId: existingEvidence.caseId,
      evidenceId: existingEvidence._id,
      expertName,
      laboratory,
      title: title || `Forensic Analysis Memo for ${existingEvidence.originalName}`,
      methodology:
        methodology ||
        "Cryptographic SHA-256 verification, OpenCV frame analysis, and neural weapon/object detection pursuant to ISO/IEC 27037:2012.",
      findings,
      conclusion,
      certifiedUnderBSA: true,
    });

    // Append to audit log
    const lastEntry = await AuditLog.findOne().sort({ seq: -1 });
    const seq = lastEntry ? lastEntry.seq + 1 : 1;
    const prevHash = lastEntry ? lastEntry.entryHash : GENESIS_HASH;

    const auditData = {
      seq,
      prevHash,
      evidenceId: existingEvidence._id,
      caseId: existingEvidence.caseId,
      action: "FORENSIC_REPORT_ATTACHED",
      userId: expertName,
      userName: expertName,
      role: "forensic",
      details: `Official Forensic Report ${reportId} authored by ${expertName}.`,
      fileHash: existingEvidence.sha256,
      timestamp: new Date(),
    };

    auditData.entryHash = computeAuditEntryHash(auditData);
    await AuditLog.create(auditData);

    existingEvidence.status = "REVIEWED";
    await existingEvidence.save();

    res.status(201).json({
      success: true,
      message: "Forensic Report submitted and recorded into the Chain of Custody.",
      report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.post("/", createReportHandler);
router.post("/reports", createReportHandler);

module.exports = router;
