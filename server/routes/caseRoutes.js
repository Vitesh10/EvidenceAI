const express = require("express");
const Case = require("../models/Case");
const Evidence = require("../models/Evidence");
const ForensicReport = require("../models/ForensicReport");

const router = express.Router();

// GET all cases with optional search and filters
router.get("/", async (req, res) => {
  try {
    const { search, priority, status } = req.query;
    let query = {};

    if (priority && priority !== "All") {
      query.priority = priority;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { caseId: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { investigator: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const cases = await Case.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: cases.length,
      cases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch cases",
      error: error.message,
    });
  }
});

// GET one case by ID with associated evidence and forensic reports
router.get("/:id", async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id);

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    const evidenceList = await Evidence.find({ caseId: caseData._id }).sort({
      createdAt: -1,
    });

    const reports = await ForensicReport.find({ caseId: caseData._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      case: caseData,
      evidence: evidenceList,
      reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch case",
      error: error.message,
    });
  }
});

// CREATE a new case
router.post("/", async (req, res) => {
  try {
    const {
      caseId,
      title,
      description,
      investigator,
      priority,
      status,
      location,
      policeStation,
    } = req.body;

    // Check if case ID already exists
    const existing = await Case.findOne({ caseId: caseId.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Case ID / FIR ${caseId} already exists in the system.`,
      });
    }

    const newCase = await Case.create({
      caseId: caseId.trim(),
      title: title.trim(),
      description: description || "",
      investigator: investigator || "Inspector Vitesh Dongre",
      priority: priority || "Medium",
      status: status || "Open",
      location: location || "Pune, Maharashtra",
      policeStation: policeStation || "Shivajinagar Police Station, Pune",
      firNumber: caseId.trim(),
      incidentDate: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Case created successfully",
      case: newCase,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create case",
      error: error.message,
    });
  }
});

// UPDATE a case
router.put("/:id", async (req, res) => {
  try {
    const updatedCase = await Case.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCase) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    res.json({
      success: true,
      message: "Case updated successfully",
      case: updatedCase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update case",
      error: error.message,
    });
  }
});

// DELETE a case
router.delete("/:id", async (req, res) => {
  try {
    const deletedCase = await Case.findByIdAndDelete(req.params.id);

    if (!deletedCase) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    res.json({
      success: true,
      message: "Case deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete case",
      error: error.message,
    });
  }
});

module.exports = router;
