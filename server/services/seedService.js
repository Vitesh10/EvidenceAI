const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Case = require("../models/Case");
const Evidence = require("../models/Evidence");
const AiResult = require("../models/AiResult");
const AuditLog = require("../models/AuditLog");
const ForensicReport = require("../models/ForensicReport");
const {
  GENESIS_HASH,
  computeAuditEntryHash,
  encryptBuffer,
} = require("./cryptoService");

const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function seedInitialData() {
  try {
    const caseCount = await Case.countDocuments();
    if (caseCount > 0) {
      console.log(`Database already has ${caseCount} cases. Checking integrity...`);
      return;
    }

    console.log("Seeding National Evidence-AI initial data for MIT-ADT University project demo...");

    // 1. Seed Users (Roles from Table 2.2 in Project Report)
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash("evidence123", salt);

    const users = await User.create([
      {
        name: "Inspector Vitesh Dongre",
        email: "vitesh.dongre@police.gov.in",
        passwordHash: defaultPassword,
        role: "police",
        department: "Cyber Crime & Special Task Force, Pune",
        badgeNumber: "MH-PUN-0383",
      },
      {
        name: "Dr. Sakshi Mashere",
        email: "sakshi.mashere@fsl.gov.in",
        passwordHash: defaultPassword,
        role: "forensic",
        department: "Digital Forensics Division, State FSL Pune",
        badgeNumber: "FSL-MH-0941",
      },
      {
        name: "Justice Swayam Lase",
        email: "swayam.lase@judiciary.gov.in",
        passwordHash: defaultPassword,
        role: "court",
        department: "District & Sessions Special Court, Pune",
        badgeNumber: "JUD-MH-1195",
      },
      {
        name: "Dr. Sachin Jagadale",
        email: "admin@evidenceai.gov.in",
        passwordHash: defaultPassword,
        role: "admin",
        department: "National Digital Evidence Repository Directorate",
        badgeNumber: "NDEMS-ADMIN-01",
      },
    ]);

    // 2. Seed Realistic Investigation Cases
    const cases = await Case.create([
      {
        caseId: "FIR-2025-0187",
        title: "Armed Robbery & Breach at Laxmi Road Gold Exchange",
        description:
          "Two masked suspects entered commercial jewelry premises armed with edged weapons and concealed firearms. High-definition CCTV footage and ballistic residue recovered.",
        investigator: "Inspector Vitesh Dongre",
        policeStation: "Vishrambaug Police Station, Pune",
        priority: "Critical",
        status: "Under Investigation",
        location: "Laxmi Road, Pune, Maharashtra",
        incidentDate: new Date("2025-04-12T21:14:00Z"),
        evidenceCount: 2,
      },
      {
        caseId: "FIR-2025-0204",
        title: "Hit-and-Run Fatal Collision on Pune-Solapur Highway",
        description:
          "High-speed unregistered vehicle collision with pedestrian near Hadapsar bypass. Captured by toll plaza ANPR camera and roadside dashcam.",
        investigator: "Inspector Vitesh Dongre",
        policeStation: "Hadapsar Police Station, Pune",
        priority: "High",
        status: "Under Investigation",
        location: "Pune-Solapur Highway KM 14",
        incidentDate: new Date("2025-05-03T18:30:00Z"),
        evidenceCount: 1,
      },
      {
        caseId: "FIR-2025-0312",
        title: "Unauthorized Server Room Intrusion & Data Seizure",
        description:
          "Suspect accessed high-security datacenter using compromised access badge. Physical flash drives seized and digital access logs acquired for forensic analysis.",
        investigator: "Inspector Vitesh Dongre",
        policeStation: "Hinjawadi Cyber Police Station, Pune",
        priority: "Medium",
        status: "Under Court Review",
        location: "Hinjawadi Phase 1, Pune",
        incidentDate: new Date("2025-06-15T02:40:00Z"),
        evidenceCount: 1,
      },
    ]);

    // Helper to write a sample file to uploads and return its details
    function createSampleEvidenceFile(filename, contentString, mimeType) {
      const storedName = `${Date.now()}-${crypto.randomUUID()}-${filename}`;
      const filePath = path.join(uploadsDir, storedName);
      const rawBuffer = Buffer.from(contentString, "utf-8");
      const sha256 = crypto.createHash("sha256").update(rawBuffer).digest("hex");
      
      const { encryptedBuffer, iv, authTag } = encryptBuffer(rawBuffer);
      fs.writeFileSync(filePath, encryptedBuffer);

      return {
        originalName: filename,
        storedName,
        filePath,
        size: rawBuffer.length,
        sha256,
        iv,
        authTag,
        rawBuffer,
      };
    }

    // 3. Create Sample Evidence Files
    // Evidence 1: CCTV Footage
    const ev1Data = createSampleEvidenceFile(
      "CCTV_Cam03_LaxmiRoad_Entrance.mp4",
      "VIDEO_STREAM_DATA: CCTV Recording @ 1080p 30fps. Camera: Hikvision DS-2CD2143G2-I. Burnt-in timestamp: 2025-04-12 21:14:07 IST. Persons detected: 2. Knife detected. Vehicle: MH12DE4492.",
      "video/mp4"
    );

    const evidence1 = await Evidence.create({
      evidenceId: "EVD-2025-00187",
      caseId: cases[0]._id,
      originalName: ev1Data.originalName,
      storedName: ev1Data.storedName,
      type: "video",
      mimeType: "video/mp4",
      size: 14857600, // 14.1 MB
      sha256: ev1Data.sha256,
      isEncrypted: true,
      encryptionIv: ev1Data.iv,
      authTag: ev1Data.authTag,
      status: "STORED_VERIFIED",
      uploadedBy: "Inspector Vitesh Dongre",
      uploadedByRole: "police",
      deviceSource: "Hikvision DS-2CD2143G2-I (DVR Channel 03)",
      collectionLocation: "Laxmi Road Gold Exchange Storefront",
      aiStatus: "COMPLETED",
      originalHashBackup: ev1Data.sha256,
    });

    // Evidence 2: Crime Scene Weapon Photo
    const ev2Data = createSampleEvidenceFile(
      "CrimeScene_Recovered_Weapon_Knife.jpg",
      "IMAGE_DATA: High-resolution forensic photo of recovered 20cm serrated tactical knife with visible blood spatter residue. Seized under Panchnama Memo #44/2025.",
      "image/jpeg"
    );

    const evidence2 = await Evidence.create({
      evidenceId: "EVD-2025-00188",
      caseId: cases[0]._id,
      originalName: ev2Data.originalName,
      storedName: ev2Data.storedName,
      type: "image",
      mimeType: "image/jpeg",
      size: 4280192, // 4.1 MB
      sha256: ev2Data.sha256,
      isEncrypted: true,
      encryptionIv: ev2Data.iv,
      authTag: ev2Data.authTag,
      status: "STORED_VERIFIED",
      uploadedBy: "Inspector Vitesh Dongre",
      uploadedByRole: "police",
      deviceSource: "Nikon D7500 Forensic Camera (Serial #8812903)",
      collectionLocation: "Store counter interior floor",
      aiStatus: "COMPLETED",
      originalHashBackup: ev2Data.sha256,
    });

    // 4. Seed AI Results for Evidence 1
    await AiResult.create({
      evidenceId: evidence1._id,
      caseId: cases[0]._id,
      modelVersion: "YOLOv8x-Forensic-v2.4",
      summary:
        "Automated computer vision scan completed on 24 video frames. Detected male subject brandishing metallic knife at 00:14, silver sedan getaway vehicle with license plate MH12DE4492, and verified CCTV overlay timestamp.",
      findings: [
        {
          label: "person",
          category: "person",
          confidence: 0.94,
          time_s: 4.2,
          bbox: [180, 110, 140, 320],
          details: "Male subject in dark hoodie entering frame left",
        },
        {
          label: "knife",
          category: "weapon",
          confidence: 0.88,
          time_s: 14.0,
          bbox: [305, 240, 55, 75],
          details: "Metallic edged weapon (approx. 20cm blade) brandished at counter",
        },
        {
          label: "vehicle",
          category: "vehicle",
          confidence: 0.96,
          time_s: 7.5,
          bbox: [420, 260, 280, 160],
          details: "Silver sedan (Swift Dzire) idling in alleyway",
        },
        {
          label: "face",
          category: "face",
          confidence: 0.82,
          time_s: 6.8,
          bbox: [210, 120, 60, 70],
          details: "Partial profile visible under lighting; eye/nose aspect ratio extracted",
        },
      ],
      numberPlates: [
        {
          plateNumber: "MH12DE4492",
          confidence: 0.92,
          isValidRTO: true,
          state: "Maharashtra (Pune RTO)",
          vehicleType: "Private Commercial Sedan",
          time_s: 8.2,
        },
      ],
      timestampAnalysis: {
        overlayTimestamp: "2025-04-12 21:14:07 IST",
        metadataTimestamp: "2025-04-12 21:14:05 UTC",
        hasDiscrepancy: false,
        discrepancyNote: "Burnt-in CCTV overlay correlates with internal container clock within standard 2-second buffer.",
      },
      suspiciousFlags: [
        {
          severity: "CRITICAL",
          reason: "Lethal Edged Weapon (Knife) Brandished in Public Commercial Zone",
          from_s: 13.5,
          to_s: 16.0,
        },
        {
          severity: "HIGH",
          reason: "Vehicle Plate MH12DE4492 ID verified with speed of ingress > 45 km/h",
          from_s: 7.0,
          to_s: 9.5,
        },
      ],
    });

    // 5. Seed Hash-Chained Audit Log (Chain of Custody)
    let prevHash = GENESIS_HASH;
    let seq = 1;

    const auditSequence = [
      {
        action: "EVIDENCE_UPLOAD",
        evidenceId: evidence1._id,
        caseId: cases[0]._id,
        userId: users[0]._id.toString(),
        userName: users[0].name,
        role: "police",
        details: "CCTV video file acquired at crime scene and ingested into EvidenceAI repository.",
        fileHash: evidence1.sha256,
        timestamp: new Date("2025-04-13T09:00:00Z"),
      },
      {
        action: "SHA256_HASHED",
        evidenceId: evidence1._id,
        caseId: cases[0]._id,
        userId: "SYSTEM_CRYPTO",
        userName: "Evidence-AI SHA-256 Engine",
        role: "system",
        details: `Cryptographic fingerprint generated: ${evidence1.sha256}`,
        fileHash: evidence1.sha256,
        timestamp: new Date("2025-04-13T09:00:02Z"),
      },
      {
        action: "AES_ENCRYPTED",
        evidenceId: evidence1._id,
        caseId: cases[0]._id,
        userId: "SYSTEM_CRYPTO",
        userName: "Evidence-AI AES-256-GCM Daemon",
        role: "system",
        details: "File payload encrypted at rest using envelope encryption with 256-bit Galois/Counter Mode.",
        fileHash: evidence1.sha256,
        timestamp: new Date("2025-04-13T09:00:04Z"),
      },
      {
        action: "AI_ANALYSIS_COMPLETED",
        evidenceId: evidence1._id,
        caseId: cases[0]._id,
        userId: "SYSTEM_AI",
        userName: "YOLOv8x Forensic Neural Service",
        role: "system",
        details: "AI analysis detected person, knife (0.88), sedan (0.96), and plate MH12DE4492.",
        fileHash: evidence1.sha256,
        timestamp: new Date("2025-04-13T09:02:15Z"),
      },
      {
        action: "FORENSIC_EXAMINATION",
        evidenceId: evidence1._id,
        caseId: cases[0]._id,
        userId: users[1]._id.toString(),
        userName: users[1].name,
        role: "forensic",
        details: "Digital forensic validation conducted at State FSL Pune. SHA-256 matches initial seizure.",
        fileHash: evidence1.sha256,
        timestamp: new Date("2025-04-14T11:30:00Z"),
      },
      {
        action: "COURT_INSPECTED",
        evidenceId: evidence1._id,
        caseId: cases[0]._id,
        userId: users[2]._id.toString(),
        userName: users[2].name,
        role: "court",
        details: "Case evidence dossier inspected by Honorable District Court for bail hearing admissibility.",
        fileHash: evidence1.sha256,
        timestamp: new Date("2025-04-16T14:15:00Z"),
      },
    ];

    for (const item of auditSequence) {
      const entryData = {
        seq,
        evidenceId: item.evidenceId,
        caseId: item.caseId,
        action: item.action,
        userId: item.userId,
        userName: item.userName,
        role: item.role,
        details: item.details,
        fileHash: item.fileHash,
        timestamp: item.timestamp,
        prevHash,
      };

      const entryHash = computeAuditEntryHash(entryData);
      await AuditLog.create({
        ...entryData,
        entryHash,
      });

      prevHash = entryHash;
      seq++;
    }

    // 6. Seed Forensic Report
    await ForensicReport.create({
      reportId: "FSL-PUN-2025-0941",
      caseId: cases[0]._id,
      evidenceId: evidence1._id,
      expertName: "Dr. Sakshi Mashere, Senior Digital Forensic Scientist",
      laboratory: "State Forensic Science Laboratory (FSL), Pune",
      title: "Digital Forensic Examination & Verification of CCTV Footage Cam03",
      methodology:
        "Bitstream verification with SHA-256 cryptographic hashing (FIPS 180-4), video frame decoding via OpenCV, and neural object classification with YOLOv8. Tested pursuant to ISO/IEC 27037:2012 standards.",
      findings:
        "1. Video integrity confirmed with zero bit alterations since upload.\n2. Edged weapon (serrated knife, ~20cm) verified in right hand of suspect at timestamp 21:14:14.\n3. License plate MH12DE4492 authenticated with valid Maharashtra RTO syntax.\n4. No video splicing, frame insertion, or timestamp tampering detected.",
      conclusion:
        "The digital recording CCTV_Cam03_LaxmiRoad_Entrance.mp4 is authentic, forensically sound, and admissible as substantive electronic evidence under Bharatiya Sakshya Adhiniyam, 2023.",
      certifiedUnderBSA: true,
    });

    console.log("Successfully seeded Evidence-AI database with initial cases, evidence, AI findings, and hash-chained custody logs!");
  } catch (error) {
    console.error("Error seeding Evidence-AI database:", error);
  }
}

module.exports = { seedInitialData };
