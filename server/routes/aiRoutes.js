const express = require("express");
const AiResult = require("../models/AiResult");
const Evidence = require("../models/Evidence");
const Case = require("../models/Case");
const { analyzeEvidence } = require("../services/aiService");

const router = express.Router();

// GET AI Results for a specific evidence item
router.get("/:evidenceId", async (req, res) => {
  try {
    const aiResult = await AiResult.findOne({
      evidenceId: req.params.evidenceId,
    }).populate("evidenceId", "originalName type sha256 size status");

    if (!aiResult) {
      return res.status(404).json({
        success: false,
        message: "No AI analysis found for this evidence",
      });
    }

    res.json({
      success: true,
      aiResult,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// SEARCH AI DETECTIONS (weapons, plates, objects)
router.get("/search/detections", async (req, res) => {
  try {
    const { q, category } = req.query;
    let query = {};

    if (q) {
      query.$or = [
        { "findings.label": { $regex: q, $options: "i" } },
        { "findings.details": { $regex: q, $options: "i" } },
        { "numberPlates.plateNumber": { $regex: q, $options: "i" } },
        { "transcription.keywords": { $regex: q, $options: "i" } },
      ];
    }

    if (category) {
      query["findings.category"] = category;
    }

    const results = await AiResult.find(query)
      .populate("evidenceId", "originalName type size sha256 status")
      .populate("caseId", "caseId title");

    res.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// RE-ANALYZE EVIDENCE
router.post("/:evidenceId/reanalyze", async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.evidenceId);
    if (!evidence) {
      return res.status(404).json({ success: false, message: "Evidence not found" });
    }

    const caseData = await Case.findById(evidence.caseId);
    const newAnalysis = analyzeEvidence(evidence, caseData);

    const updated = await AiResult.findOneAndUpdate(
      { evidenceId: evidence._id },
      {
        ...newAnalysis,
        caseId: evidence.caseId,
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: "AI analysis pipeline completed successfully",
      aiResult: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
