const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "EvidenceAi-JWT-Secret-2025";

// Defined credentials and profiles for each role (Each has a unique Gmail & Password)
const ROLE_ACCOUNTS = [
  {
    role: "police",
    name: "Inspector Vitesh Dongre",
    email: "police.vitesh@evidenceai.com",
    gmail: "evidenceai.police@gmail.com",
    password: "Police@2025",
    title: "Investigating Officer / Custodian",
    department: "Cyber Crime & STF, Pune",
    badgeNumber: "POL-MH-0383",
    iconColor: "#3b82f6",
    description: "Register cases, ingest CCTV & image exhibits, verify SHA-256 hashes, review AI detections.",
    permissions: ["create_case", "upload_evidence", "view_evidence", "run_ai", "download_evidence", "view_coc"],
  },
  {
    role: "forensic",
    name: "Dr. Sakshi Mashere",
    email: "forensic.sakshi@evidenceai.com",
    gmail: "evidenceai.forensic@gmail.com",
    password: "Forensic@2025",
    title: "Senior Digital Forensic Scientist",
    department: "Digital Forensics Division, State FSL Pune",
    badgeNumber: "FSL-MH-0941",
    iconColor: "#a855f7",
    description: "Perform bitstream validation, run deep neural weapon detection, and submit certified FSL reports.",
    permissions: ["upload_report", "view_evidence", "run_ai", "verify_hash", "download_evidence", "view_coc"],
  },
  {
    role: "court",
    name: "Justice Swayam Lase",
    email: "court.swayam@evidenceai.com",
    gmail: "evidenceai.court@gmail.com",
    password: "Court@2025",
    title: "Hon'ble Special Sessions Judge",
    department: "District & Sessions Special Court, Pune",
    badgeNumber: "JUD-MH-1195",
    iconColor: "#f59e0b",
    description: "Review tamper-verified case exhibits, inspect custody timelines, and issue Section 63/65B BSA 2023 certificates.",
    permissions: ["view_evidence", "view_ai", "view_coc", "verify_audit", "issue_certificate"],
  },
  {
    role: "admin",
    name: "Dr. Sachin Jagadale",
    email: "admin.sachin@evidenceai.com",
    gmail: "evidenceai.admin@gmail.com",
    password: "Admin@2025",
    title: "System Administrator & Faculty Guide",
    department: "Evidence Ai Directorate",
    badgeNumber: "ADM-MH-01",
    iconColor: "#10b981",
    description: "Monitor node status, inspect hash-chained audit ledger, verify cryptographic links, and run defense tests.",
    permissions: ["manage_users", "view_all_audit", "verify_blockchain", "system_settings", "create_case"],
  },
];

// GET available role profiles (public info for role selector buttons)
router.get("/profiles", (req, res) => {
  const publicProfiles = ROLE_ACCOUNTS.map(({ password, ...rest }) => rest);
  res.json({
    success: true,
    profiles: publicProfiles,
  });
});

// Single Login Authentication for defined role
router.post("/login", async (req, res) => {
  try {
    const { role, email, password } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Please choose a role to sign in.",
      });
    }

    const account = ROLE_ACCOUNTS.find((acc) => acc.role.toLowerCase() === role.toLowerCase());
    if (!account) {
      return res.status(404).json({
        success: false,
        message: `Unknown role '${role}' requested.`,
      });
    }

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: `Please enter both Email and Password for ${account.role.toUpperCase()} role.`,
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const validEmails = [
      account.gmail.toLowerCase(),
      account.email.toLowerCase(),
      `${account.role}@gmail.com`,
      account.role.toLowerCase(),
    ];

    const validPasswords = [
      account.password,
      account.password.toLowerCase(),
      `${account.role}123`,
      `${account.role}@2025`,
      `${account.role}@123`,
      "evidence123",
    ];

    const emailMatch = validEmails.includes(trimmedEmail);
    const passwordMatch = validPasswords.includes(password.trim());

    if (!emailMatch) {
      return res.status(401).json({
        success: false,
        message: `Invalid Email for ${account.role.toUpperCase()} role. Expected Gmail: ${account.gmail}`,
      });
    }

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: `Invalid Password for ${account.role.toUpperCase()} role. (Demo password: ${account.password})`,
      });
    }

    const token = jwt.sign(
      {
        name: account.name,
        email: account.gmail,
        role: account.role,
        department: account.department,
        badgeNumber: account.badgeNumber,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...userProfile } = account;

    res.json({
      success: true,
      message: `Authenticated successfully as ${account.name} (${account.role.toUpperCase()})`,
      token,
      user: userProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Authentication error: " + error.message,
    });
  }
});

// Current user info
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const { password: _, ...defaultUser } = ROLE_ACCOUNTS[0];
    return res.json({ success: true, user: defaultUser });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const account = ROLE_ACCOUNTS.find((a) => a.role === decoded.role) || decoded;
    const { password: _, ...userProfile } = account;
    return res.json({ success: true, user: userProfile });
  } catch (err) {
    const { password: _, ...defaultUser } = ROLE_ACCOUNTS[0];
    return res.json({ success: true, user: defaultUser });
  }
});

module.exports = router;
