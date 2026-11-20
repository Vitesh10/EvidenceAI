const express = require("express");
const AuditLog = require("../models/AuditLog");
const { verifyAuditChain } = require("../services/cryptoService");

const router = express.Router();

// GET all audit logs
router.get("/", async (req, res) => {
  try {
    const { evidenceId, caseId, action, limit = 100 } = req.query;
    let query = {};

    if (evidenceId) query.evidenceId = evidenceId;
    if (caseId) query.caseId = caseId;
    if (action && action !== "All") query.action = action;

    const logs = await AuditLog.find(query)
      .populate("caseId", "caseId title")
      .populate("evidenceId", "originalName evidenceId")
      .sort({ seq: -1 })
      .limit(Number(limit));

    const totalCount = await AuditLog.countDocuments();

    res.json({
      success: true,
      count: logs.length,
      totalCount,
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// VERIFY COMPLETE HASH CHAIN (Blockchain-like validation)
router.get("/verify-chain", async (req, res) => {
  try {
    const entries = await AuditLog.find().sort({ seq: 1 }).lean();
    const verification = verifyAuditChain(entries);

    res.json({
      success: true,
      verification,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// SIMULATE TAMPERING IN AUDIT LOG (Demonstration from Table 8.2 in Report)
// Alters the contents of Seq #2 without updating subsequent hashes, demonstrating detection.
router.post("/tamper-demo", async (req, res) => {
  try {
    const targetEntry = await AuditLog.findOne({ seq: 2 });
    if (!targetEntry) {
      return res.status(404).json({
        success: false,
        message: "Audit entry #2 not found to simulate tampering",
      });
    }

    targetEntry.isAltered = true;
    targetEntry.details = "[TAMPERED CONTENT]: Action details were illicitly modified by an adversary!";
    targetEntry.userId = "ATTACKER-99";
    await targetEntry.save();

    res.json({
      success: true,
      message:
        "Audit Log entry #2 has been modified illicitly! Running 'Verify Hash Chain' will now detect the break at Seq #2.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// RESTORE AUDIT CHAIN
router.post("/restore-chain", async (req, res) => {
  try {
    const targetEntry = await AuditLog.findOne({ seq: 2 });
    if (targetEntry) {
      targetEntry.isAltered = false;
      targetEntry.details =
        "Cryptographic fingerprint generated: 992a96b3b768b2ce7ad7b78c42effac1f265539d94c8e107b86de654386a8d4d";
      targetEntry.userId = "SYSTEM_CRYPTO";
      await targetEntry.save();
    }

    res.json({
      success: true,
      message: "Audit log chain has been restored to authentic original state.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
