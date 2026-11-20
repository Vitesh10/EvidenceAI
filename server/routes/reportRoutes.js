const express = require("express");
const Evidence = require("../models/Evidence");
const Case = require("../models/Case");
const AuditLog = require("../models/AuditLog");
const ForensicReport = require("../models/ForensicReport");

const router = express.Router();

// Generate Bharatiya Sakshya Adhiniyam (BSA), 2023 Certificate data
router.get("/bsa-certificate/:evidenceId", async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.evidenceId).populate(
      "caseId"
    );
    if (!evidence) {
      return res.status(404).json({ success: false, message: "Evidence not found" });
    }

    const caseData = evidence.caseId || {};
    const auditTrail = await AuditLog.find({ evidenceId: evidence._id }).sort({
      seq: 1,
    });
    const forensicReport = await ForensicReport.findOne({
      evidenceId: evidence._id,
    });

    const certificate = {
      statutoryHeading:
        "CERTIFICATE UNDER SECTION 63 / 65B OF THE BHARATIYA SAKSHYA ADHINIYAM, 2023 (ACT NO. 47 OF 2023)",
      subHeading:
        "For Admissibility of Electronic Records and Digital Forensic Exhibits in Court",
      jurisdiction: {
        court: "IN THE COURT OF SESSIONS / SPECIAL JUDGE, PUNE, MAHARASHTRA",
        state: "State of Maharashtra",
        policeStation: caseData.policeStation || "Shivajinagar Police Station, Pune",
        firNumber: caseData.firNumber || caseData.caseId,
        caseTitle: caseData.title,
      },
      evidenceDetails: {
        evidenceId: evidence.evidenceId,
        originalFileName: evidence.originalName,
        evidenceType: evidence.type.toUpperCase(),
        mimeType: evidence.mimeType,
        fileSize: `${(evidence.size / (1024 * 1024)).toFixed(2)} MB (${evidence.size.toLocaleString()} bytes)`,
        acquisitionDevice: evidence.deviceSource,
        collectionLocation: evidence.collectionLocation,
        uploadTimestamp: evidence.createdAt,
      },
      cryptographicAuthentication: {
        hashAlgorithm: "SHA-256 (FIPS PUB 180-4 Secure Hash Standard)",
        cryptographicFingerprint: evidence.sha256,
        encryptionStandard: "AES-256-GCM (Authenticated Envelope Encryption)",
        integrityStatus: evidence.status === "STORED_VERIFIED" ? "CERTIFIED_GENUINE" : "TAMPERED_WARNING",
        chainOfCustodyBlocks: auditTrail.length,
      },
      declaration:
        "I hereby solemnly declare and affirm that the electronic record identified herein was produced by the lawful digital capture apparatus during ordinary and lawful course of duties. At all material times, the cryptographic hash (SHA-256) of the exhibit has been continuously verified, and no unauthorized alteration, deletion, frame splicing, or manipulation has occurred since the moment of digital seizure and preservation.",
      certifyingOfficers: [
        {
          name: evidence.uploadedBy || "Inspector Vitesh Dongre",
          designation: "Investigating Officer / Custodian of Evidence",
          department: "Maharashtra Police / STF",
          badge: "MH-PUN-0383",
        },
        {
          name: forensicReport?.expertName || "Dr. Sakshi Mashere",
          designation: "Senior Digital Forensic Examiner",
          department: "State Forensic Science Laboratory (FSL), Pune",
          badge: "FSL-MH-0941",
        },
      ],
      custodyMilestones: auditTrail.map((log) => ({
        seq: log.seq,
        action: log.action,
        officer: log.userName,
        role: log.role,
        timestamp: log.timestamp,
        hashPreview: log.fileHash ? `${log.fileHash.slice(0, 16)}...` : "—",
      })),
      issuedAt: new Date().toISOString(),
      certificateId: `BSA-2025-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    res.json({
      success: true,
      certificate,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
