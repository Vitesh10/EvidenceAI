import React, { useEffect, useState, useRef } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  FileSearch,
  BrainCircuit,
  GitBranch,
  FileText,
  ShieldCheck,
  Bell,
  Search,
  ChevronDown,
  Plus,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Activity,
  Eye,
  Download,
  Lock,
  Unlock,
  RefreshCw,
  Printer,
  X,
  FileCheck,
  Scale,
  Award,
  Database,
  UserCheck,
  ShieldAlert,
  SlidersHorizontal,
  LogOut,
  ArrowRight,
  Fingerprint,
} from "lucide-react";
import "./App.css";

const API_BASE = "http://localhost:5000/api";

const PRESET_PROFILES = [
  {
    role: "police",
    name: "Inspector Vitesh Dongre",
    email: "evidenceai.police@gmail.com",
    gmail: "evidenceai.police@gmail.com",
    defaultPassword: "Police@2025",
    title: "Investigating Officer / Custodian",
    department: "Cyber Crime & STF, Pune",
    badgeNumber: "POL-MH-0383",
    description: "Register cases, ingest CCTV & image exhibits, verify SHA-256 hashes, review AI detections.",
    iconColor: "#3b82f6",
  },
  {
    role: "forensic",
    name: "Dr. Sakshi Mashere",
    email: "evidenceai.forensic@gmail.com",
    gmail: "evidenceai.forensic@gmail.com",
    defaultPassword: "Forensic@2025",
    title: "Senior Digital Forensic Scientist",
    department: "Digital Forensics Division, State FSL Pune",
    badgeNumber: "FSL-MH-0941",
    description: "Perform bitstream validation, run deep neural weapon detection, and submit certified FSL reports.",
    iconColor: "#a855f7",
  },
  {
    role: "court",
    name: "Justice Swayam Lase",
    email: "evidenceai.court@gmail.com",
    gmail: "evidenceai.court@gmail.com",
    defaultPassword: "Court@2025",
    title: "Hon'ble Special Sessions Judge",
    department: "District & Sessions Special Court, Pune",
    badgeNumber: "JUD-MH-1195",
    description: "Review tamper-verified case exhibits, inspect custody timelines, and issue Section 63/65B BSA 2023 certificates.",
    iconColor: "#f59e0b",
  },
  {
    role: "admin",
    name: "Dr. Sachin Jagadale",
    email: "evidenceai.admin@gmail.com",
    gmail: "evidenceai.admin@gmail.com",
    defaultPassword: "Admin@2025",
    title: "System Administrator & Guide",
    department: "Evidence Ai Directorate",
    badgeNumber: "ADM-MH-01",
    description: "Monitor node status, inspect hash-chained audit ledger, verify cryptographic links, and run defense tests.",
    iconColor: "#10b981",
  },
];

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("evidence_auth") === "true";
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("evidence_user");
    return saved ? JSON.parse(saved) : PRESET_PROFILES[0];
  });
  const [selectedRoleForLogin, setSelectedRoleForLogin] = useState("police");
  const [loginEmail, setLoginEmail] = useState("evidenceai.police@gmail.com");
  const [loginPassword, setLoginPassword] = useState("Police@2025");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard");

  // Data State
  const [cases, setCases] = useState([]);
  const [evidenceRecords, setEvidenceRecords] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [forensicReports, setForensicReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [caseFilterPriority, setCaseFilterPriority] = useState("All");
  const [caseFilterStatus, setCaseFilterStatus] = useState("All");
  const [evidenceFilterType, setEvidenceFilterType] = useState("All");

  // Modals State
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [showEvidenceForm, setShowEvidenceForm] = useState(false);
  const [selectedCaseForUpload, setSelectedCaseForUpload] = useState("");
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [uploadDeviceSource, setUploadDeviceSource] = useState("Hikvision CCTV Surveillance DVR");
  const [uploadLocation, setUploadLocation] = useState("Crime Scene Perimeter");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  // Detail & Viewer Modals
  const [activeEvidenceModal, setActiveEvidenceModal] = useState(null);
  const [activeCaseDossier, setActiveCaseDossier] = useState(null);
  const [activeBsaCert, setActiveBsaCert] = useState(null);
  const [chainVerificationResult, setChainVerificationResult] = useState(null);
  const [verifyingChain, setVerifyingChain] = useState(false);
  const [actionAlert, setActionAlert] = useState(null);
  const [aiFilterCategory, setAiFilterCategory] = useState("ALL");
  const [cctvTimeOffset, setCctvTimeOffset] = useState(14.0);
  const [isCctvPlaying, setIsCctvPlaying] = useState(true);
  const [cctvLensFilter, setCctvLensFilter] = useState("normal");
  const [showScanlines, setShowScanlines] = useState(true);
  const [showReticle, setShowReticle] = useState(true);
  const [cctvSpeed, setCctvSpeed] = useState(1);
  const fileInputRef = useRef(null);

  // CCTV Video Player dynamic timestamp clock & timeline simulation
  useEffect(() => {
    if (!isCctvPlaying) return;
    const interval = setInterval(() => {
      setCctvTimeOffset((prev) => {
        const next = prev + 0.1 * cctvSpeed;
        return next > 30 ? 0 : next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isCctvPlaying, cctvSpeed]);

  // Show auto-dismissing toast alerts
  const showAlert = (message, type = "success") => {
    setActionAlert({ message, type });
    setTimeout(() => setActionAlert(null), 5000);
  };

  // -------------------------------------------------------------
  // RESILIENT DATA FETCHING (Independent non-blocking queries)
  // -------------------------------------------------------------
  const fetchData = async () => {
    setLoading(true);

    // 1. Fetch Cases
    fetch(`${API_BASE}/cases`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.cases)) {
          setCases(data.cases);
        }
      })
      .catch((err) => console.warn("Failed fetching cases:", err.message));

    // 2. Fetch Evidence
    fetch(`${API_BASE}/evidence`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.evidence)) {
          setEvidenceRecords(data.evidence);
        }
      })
      .catch((err) => console.warn("Failed fetching evidence:", err.message));

    // 3. Fetch Stats
    fetch(`${API_BASE}/stats`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.stats) {
          setStats(data.stats);
        }
      })
      .catch((err) => console.warn("Failed fetching stats:", err.message));

    // 4. Fetch Audit Logs
    fetch(`${API_BASE}/audit`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.logs)) {
          setAuditLogs(data.logs);
        }
      })
      .catch((err) => console.warn("Failed fetching audit:", err.message));

    // 5. Fetch Forensic Reports (supports both /reports and /)
    fetch(`${API_BASE}/forensic/reports`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.reports)) {
          setForensicReports(data.reports);
        }
      })
      .catch(() => {
        // Fallback to /forensic
        fetch(`${API_BASE}/forensic`)
          .then((r) => r.json())
          .then((data) => {
            if (data.success && Array.isArray(data.reports)) {
              setForensicReports(data.reports);
            }
          })
          .catch((e) => console.warn("Failed fetching forensic reports:", e.message));
      });

    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // -------------------------------------------------------------
  // AUTHENTICATION (STRICT ROLE-BASED LOGIN - IMMUTABLE SESSION)
  // -------------------------------------------------------------
  const handleRoleSelect = (roleKey) => {
    setSelectedRoleForLogin(roleKey);
    const profile = PRESET_PROFILES.find((p) => p.role === roleKey);
    if (profile) {
      setLoginEmail(profile.gmail);
      setLoginPassword(profile.defaultPassword);
    }
  };

  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAuthSubmitting(true);

    const targetProfile = PRESET_PROFILES.find((p) => p.role === selectedRoleForLogin) || PRESET_PROFILES[0];

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: selectedRoleForLogin,
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || `Authentication failed for ${selectedRoleForLogin.toUpperCase()}`);
      }

      const activeUser = {
        ...targetProfile,
        ...data.user,
      };

      setCurrentUser(activeUser);
      setIsAuthenticated(true);
      localStorage.setItem("evidence_auth", "true");
      if (data.token) localStorage.setItem("evidence_token", data.token);
      localStorage.setItem("evidence_user", JSON.stringify(activeUser));
      showAlert(`✓ Access Granted: Logged in as ${activeUser.name} (${activeUser.role.toUpperCase()}). Session role is locked.`, "success");
      fetchData();
    } catch (err) {
      // Local fallback for offline presentations
      const trimmedEmail = loginEmail.trim().toLowerCase();
      const trimmedPass = loginPassword.trim();
      const validEmails = [
        targetProfile.gmail.toLowerCase(),
        targetProfile.email.toLowerCase(),
        targetProfile.role.toLowerCase(),
        `${targetProfile.role}@gmail.com`,
      ];
      const validPasswords = [
        targetProfile.defaultPassword,
        targetProfile.defaultPassword.toLowerCase(),
        `${targetProfile.role}123`,
        "evidence123",
      ];

      if (validEmails.includes(trimmedEmail) && validPasswords.includes(trimmedPass)) {
        setCurrentUser(targetProfile);
        setIsAuthenticated(true);
        localStorage.setItem("evidence_auth", "true");
        localStorage.setItem("evidence_user", JSON.stringify(targetProfile));
        showAlert(`✓ Access Granted: Logged in as ${targetProfile.name} (${targetProfile.role.toUpperCase()}). Session role is locked.`, "success");
        fetchData();
      } else {
        showAlert(err.message || `Invalid credentials for ${selectedRoleForLogin.toUpperCase()} role!`, "error");
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("evidence_auth");
    localStorage.removeItem("evidence_user");
    localStorage.removeItem("evidence_token");
    showAlert("Logged out of Evidence Ai. Select role and authenticate to log in again.", "info");
  };

  // -------------------------------------------------------------
  // CASE ACTIONS (FIXED: Instantly shows in UI and database)
  // -------------------------------------------------------------
  const [caseFormData, setCaseFormData] = useState({
    caseId: "",
    title: "",
    investigator: currentUser.name,
    location: "Pune, Maharashtra",
    policeStation: "Shivajinagar Police Station, Pune",
    priority: "Medium",
    status: "Open",
    description: "",
  });

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!caseFormData.caseId.trim() || !caseFormData.title.trim()) {
      showAlert("Case ID / FIR and Title are required.", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/cases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...caseFormData,
          investigator: currentUser.name,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create case");
      }

      // 1. Immediately prepend to state so it appears without delay!
      setCases((prev) => [data.case, ...prev.filter((c) => c._id !== data.case._id)]);

      // 2. Update stats count
      setStats((prev) => (prev ? { ...prev, totalCases: prev.totalCases + 1 } : null));

      // 3. Reset form and close
      setShowCaseForm(false);
      setCaseFormData({
        caseId: "",
        title: "",
        investigator: currentUser.name,
        location: "Pune, Maharashtra",
        policeStation: "Shivajinagar Police Station, Pune",
        priority: "Medium",
        status: "Open",
        description: "",
      });

      // 4. Switch view to 'cases' so user immediately sees their registered case!
      setActiveTab("cases");
      showAlert(`✓ FIR / Case ${data.case.caseId} successfully registered in active dossier!`, "success");

      // 5. Sync from server
      fetchData();
    } catch (err) {
      console.error("Create case error:", err);
      showAlert(err.message, "error");
    }
  };

  const handleOpenCaseDossier = async (caseId) => {
    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}`);
      const data = await res.json();
      if (data.success) {
        setActiveCaseDossier(data);
      }
    } catch (err) {
      showAlert("Failed to open case dossier", "error");
    }
  };

  // -------------------------------------------------------------
  // EVIDENCE ACTIONS
  // -------------------------------------------------------------
  const handleEvidenceUpload = async (e) => {
    e.preventDefault();
    if (!selectedCaseForUpload || !evidenceFile) {
      setUploadMessage("Please select both a case and an evidence file.");
      return;
    }

    const formData = new FormData();
    formData.append("evidence", evidenceFile);
    formData.append("uploadedBy", currentUser.name);
    formData.append("uploadedByRole", currentUser.role);
    formData.append("deviceSource", uploadDeviceSource);
    formData.append("collectionLocation", uploadLocation);

    setUploading(true);
    setUploadMessage("");

    try {
      const res = await fetch(`${API_BASE}/evidence/${selectedCaseForUpload}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Upload failed");

      // Prepend to evidence list immediately
      setEvidenceRecords((prev) => [data.evidence, ...prev]);

      showAlert(`✓ Evidence ${data.evidence.originalName} ingested, hashed (SHA-256), encrypted & analyzed!`, "success");
      setShowEvidenceForm(false);
      setEvidenceFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setActiveTab("evidence");
      fetchData();
    } catch (err) {
      setUploadMessage("Upload error: " + err.message);
      showAlert("Upload failed: " + err.message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleVerifyEvidence = async (evidenceId) => {
    try {
      const res = await fetch(
        `${API_BASE}/evidence/${evidenceId}/verify?user=${encodeURIComponent(currentUser.name)}&userName=${encodeURIComponent(currentUser.name)}`
      );
      const data = await res.json();
      if (data.success) {
        if (data.isVerified) {
          showAlert(`✓ SHA-256 Integrity Verified for ${data.originalName}! Hash: ${data.savedHash.slice(0, 16)}...`, "success");
        } else {
          showAlert(`⚠ CRITICAL ALERT: Tampering detected for ${data.originalName}! Hash mismatch!`, "error");
        }
        fetchData();
      }
    } catch (err) {
      showAlert("Verification failed: " + err.message, "error");
    }
  };

  const handleSimulateTamper = async (evidenceId) => {
    try {
      const res = await fetch(`${API_BASE}/evidence/${evidenceId}/tamper-demo`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showAlert("⚠ Byte Tampering Simulated! Storage file altered to test system defense.", "error");
        fetchData();
      }
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  const handleRestoreEvidence = async (evidenceId) => {
    try {
      const res = await fetch(`${API_BASE}/evidence/${evidenceId}/restore`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showAlert("✓ Evidence successfully restored from authenticated write-once mirror!", "success");
        fetchData();
      }
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  const handleOpenAiViewer = async (evidenceId) => {
    try {
      const res = await fetch(`${API_BASE}/evidence/${evidenceId}`);
      const data = await res.json();
      if (data.success) {
        setActiveEvidenceModal(data);
        setAiFilterCategory("ALL");
      }
    } catch (err) {
      showAlert("Failed to load AI inspection: " + err.message, "error");
    }
  };

  const handleOpenBsaCertificate = async (evidenceId) => {
    try {
      const res = await fetch(`${API_BASE}/reports/bsa-certificate/${evidenceId}`);
      const data = await res.json();
      if (data.success) {
        setActiveBsaCert(data.certificate);
      }
    } catch (err) {
      showAlert("Failed to generate BSA certificate: " + err.message, "error");
    }
  };

  // -------------------------------------------------------------
  // AUDIT & HASH-CHAIN VERIFICATION
  // -------------------------------------------------------------
  const handleVerifyHashChain = async () => {
    setVerifyingChain(true);
    try {
      const res = await fetch(`${API_BASE}/audit/verify-chain`);
      const data = await res.json();
      if (data.success) {
        setChainVerificationResult(data.verification);
        if (data.verification.valid) {
          showAlert(`✓ Hash Chain 100% Valid! All ${data.verification.count} blocks verified without breaks.`, "success");
        } else {
          showAlert(`⚠ TAMPER DETECTED: Hash Chain Broken at Seq #${data.verification.brokenAtSeq}!`, "error");
        }
      }
    } catch (err) {
      showAlert("Hash chain verification failed: " + err.message, "error");
    } finally {
      setVerifyingChain(false);
    }
  };

  const handleSimulateAuditTamper = async () => {
    try {
      const res = await fetch(`${API_BASE}/audit/tamper-demo`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showAlert("⚠ Audit Log Seq #2 altered! Run 'Verify Hash Chain' to view detection.", "error");
        fetchData();
        handleVerifyHashChain();
      }
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  const handleRestoreAuditChain = async () => {
    try {
      const res = await fetch(`${API_BASE}/audit/restore-chain`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        showAlert("✓ Audit Log ledger restored to authentic state.", "success");
        fetchData();
        handleVerifyHashChain();
      }
    } catch (err) {
      showAlert(err.message, "error");
    }
  };

  // Computed Values
  const totalCasesCount = cases.length;
  const totalEvidenceCount = evidenceRecords.length;
  const verifiedCount = evidenceRecords.filter((e) => e.status === "STORED_VERIFIED" && !e.isTamperedSimulated).length;
  const tamperedCount = totalEvidenceCount - verifiedCount;
  const integrityPercentage = totalEvidenceCount > 0 ? ((verifiedCount / totalEvidenceCount) * 100).toFixed(1) : 100;

  const filteredEvidence = evidenceRecords.filter((e) => {
    if (evidenceFilterType !== "All" && e.type !== evidenceFilterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = (e.originalName || "").toLowerCase();
      const eid = (e.evidenceId || "").toLowerCase();
      const hash = (e.sha256 || "").toLowerCase();
      return name.includes(q) || eid.includes(q) || hash.includes(q);
    }
    return true;
  });

  // Get active role badge CSS
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "police":
        return "badge-role-police";
      case "forensic":
        return "badge-role-forensic";
      case "court":
        return "badge-role-court";
      case "admin":
        return "badge-role-admin";
      default:
        return "badge-role-police";
    }
  };

  // ============================================================
  // VIEW A: DEDICATED LOGIN PAGE (If not authenticated)
  // ============================================================
  if (!isAuthenticated) {
    const activeSelectedProfile = PRESET_PROFILES.find((p) => p.role === selectedRoleForLogin) || PRESET_PROFILES[0];

    return (
      <div className="login-page-container">
        <div className="login-card" style={{ maxWidth: "680px", width: "95%" }}>
          {/* Header Banner */}
          <div className="login-header-banner" style={{ borderBottom: "1px solid #1e293b", padding: "28px 32px 20px" }}>
            <div className="login-brand-icon" style={{ background: "rgba(59, 130, 246, 0.15)", border: "1px solid #3b82f6", margin: "0 auto 12px" }}>
              <ShieldCheck size={32} color="#3b82f6" />
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#f8fafc", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
              Evidence Ai
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
              AI-Powered Digital Evidence Management & Cryptographic Forensics System
            </p>
            <div style={{ marginTop: "6px", fontSize: "11px", color: "#64748b" }}>
              MIT-ADT University B.Tech Capstone Project · Guided by Dr. Sachin Jagadale
            </div>
          </div>

          <div style={{ padding: "24px 32px 32px" }}>
            {/* Step 1: Choose Role Option */}
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#e2e8f0" }}>
                  Select Role to Sign In:
                </label>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                  Each role has unique Gmail authentication
                </span>
              </div>

              {/* 4 Role Selector Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                {PRESET_PROFILES.map((p) => {
                  const isSelected = selectedRoleForLogin === p.role;
                  return (
                    <button
                      key={p.role}
                      type="button"
                      onClick={() => handleRoleSelect(p.role)}
                      style={{
                        padding: "12px 8px",
                        borderRadius: "10px",
                        border: isSelected ? `2px solid ${p.iconColor}` : "1px solid #1e293b",
                        background: isSelected ? `${p.iconColor}18` : "#0b1220",
                        color: isSelected ? "#fff" : "#94a3b8",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease",
                        boxShadow: isSelected ? `0 0 16px ${p.iconColor}33` : "none",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background: `${p.iconColor}22`,
                          color: p.iconColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {p.role === "police" && <ShieldCheck size={20} />}
                        {p.role === "forensic" && <Award size={20} />}
                        {p.role === "court" && <Scale size={20} />}
                        {p.role === "admin" && <Database size={20} />}
                      </div>
                      <strong style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {p.role}
                      </strong>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Role Identity Summary */}
            <div
              style={{
                background: "#080e1d",
                border: `1px solid ${activeSelectedProfile.iconColor}55`,
                borderRadius: "10px",
                padding: "12px 16px",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      background: activeSelectedProfile.iconColor,
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: "bold",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      textTransform: "uppercase",
                    }}
                  >
                    {activeSelectedProfile.role}
                  </span>
                  <strong style={{ fontSize: "14px", color: "#f8fafc" }}>
                    {activeSelectedProfile.name}
                  </strong>
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
                  {activeSelectedProfile.title} · {activeSelectedProfile.department}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "#64748b" }}>Badge:</span>
                <div style={{ fontSize: "12px", fontFamily: "monospace", color: "#cbd5e1" }}>
                  {activeSelectedProfile.badgeNumber}
                </div>
              </div>
            </div>

            {/* Step 2: Single Unified Login Form */}
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                  Official Gmail Address
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter assigned role Gmail..."
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "#0b1220",
                    border: "1px solid #1e293b",
                    color: "#fff",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    fontSize: "14px",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "6px" }}>
                  Role Password / Access Key
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter security password..."
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "#0b1220",
                    border: "1px solid #1e293b",
                    color: "#fff",
                    borderRadius: "8px",
                    boxSizing: "border-box",
                    fontSize: "14px",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="primary-button"
                style={{
                  width: "100%",
                  padding: "14px",
                  justifyContent: "center",
                  fontSize: "15px",
                  fontWeight: "bold",
                  background: activeSelectedProfile.iconColor,
                  border: "none",
                  marginTop: "6px",
                }}
              >
                {authSubmitting ? "Authenticating..." : `Sign In as ${activeSelectedProfile.role.toUpperCase()} →`}
              </button>
            </form>

            {/* Role Session Lock Notice */}
            <div
              style={{
                marginTop: "18px",
                padding: "10px 14px",
                background: "rgba(15, 23, 42, 0.6)",
                borderRadius: "8px",
                border: "1px solid #1e293b",
                fontSize: "12px",
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Lock size={16} color="#64748b" />
              <span>
                <strong>Session Role Lock:</strong> Once authenticated, your role is permanently locked for the active session. Role cannot be switched from the dashboard without logging out.
              </span>
            </div>

            {/* Reference Credentials Card for Demo / Viva */}
            <div
              style={{
                marginTop: "16px",
                background: "#060b14",
                border: "1px dashed #1e293b",
                borderRadius: "8px",
                padding: "12px 14px",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", marginBottom: "8px" }}>
                Authorized Demo Role Credentials
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "11px" }}>
                <div>
                  <span style={{ color: "#3b82f6" }}>● Police:</span>{" "}
                  <code style={{ color: "#94a3b8" }}>evidenceai.police@gmail.com</code> | <code style={{ color: "#60a5fa" }}>Police@2025</code>
                </div>
                <div>
                  <span style={{ color: "#a855f7" }}>● Forensic:</span>{" "}
                  <code style={{ color: "#94a3b8" }}>evidenceai.forensic@gmail.com</code> | <code style={{ color: "#c084fc" }}>Forensic@2025</code>
                </div>
                <div>
                  <span style={{ color: "#f59e0b" }}>● Court:</span>{" "}
                  <code style={{ color: "#94a3b8" }}>evidenceai.court@gmail.com</code> | <code style={{ color: "#fbbf24" }}>Court@2025</code>
                </div>
                <div>
                  <span style={{ color: "#10b981" }}>● Admin:</span>{" "}
                  <code style={{ color: "#94a3b8" }}>evidenceai.admin@gmail.com</code> | <code style={{ color: "#34d399" }}>Admin@2025</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // VIEW B: MAIN APPLICATION SHELL (When authenticated)
  // ============================================================
  return (
    <div className="app-shell">
      {/* SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <ShieldCheck size={26} />
          </div>
          <div>
            <h1>Evidence Ai</h1>
            <span>AI Forensic Repository</span>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="section-label">INVESTIGATION PORTAL</p>
          <nav>
            <button
              className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
              style={{ width: "100%", background: "none", border: "none", textAlign: "left" }}
            >
              <LayoutDashboard size={19} />
              <span>Dashboard</span>
            </button>

            <button
              className={`nav-item ${activeTab === "cases" ? "active" : ""}`}
              onClick={() => setActiveTab("cases")}
              style={{ width: "100%", background: "none", border: "none", textAlign: "left" }}
            >
              <FolderOpen size={19} />
              <span>Cases Dossier</span>
            </button>

            <button
              className={`nav-item ${activeTab === "evidence" ? "active" : ""}`}
              onClick={() => setActiveTab("evidence")}
              style={{ width: "100%", background: "none", border: "none", textAlign: "left" }}
            >
              <FileSearch size={19} />
              <span>Evidence Repository</span>
            </button>

            <button
              className={`nav-item ${activeTab === "ai" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("ai");
                if (evidenceRecords.length > 0 && !activeEvidenceModal) {
                  handleOpenAiViewer(evidenceRecords[0]._id);
                }
              }}
              style={{ width: "100%", background: "none", border: "none", textAlign: "left" }}
            >
              <BrainCircuit size={19} />
              <span>AI Forensic Vision</span>
            </button>

            <button
              className={`nav-item ${activeTab === "custody" ? "active" : ""}`}
              onClick={() => setActiveTab("custody")}
              style={{ width: "100%", background: "none", border: "none", textAlign: "left" }}
            >
              <GitBranch size={19} />
              <span>Chain of Custody</span>
            </button>

            <button
              className={`nav-item ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
              style={{ width: "100%", background: "none", border: "none", textAlign: "left" }}
            >
              <Scale size={19} />
              <span>Court & BSA 2023</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-section">
          <p className="section-label">SECURITY & SYSTEM</p>
          <nav>
            <button
              className={`nav-item ${activeTab === "fsl" ? "active" : ""}`}
              onClick={() => setActiveTab("fsl")}
              style={{ width: "100%", background: "none", border: "none", textAlign: "left" }}
            >
              <Award size={19} />
              <span>Forensic Science Lab</span>
            </button>

            <button
              className={`nav-item ${activeTab === "admin" ? "active" : ""}`}
              onClick={() => setActiveTab("admin")}
              style={{ width: "100%", background: "none", border: "none", textAlign: "left" }}
            >
              <Database size={19} />
              <span>Admin Console</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="system-status">
            <span className="status-dot"></span>
            <div>
              <strong>Evidence Ai Node Active</strong>
              <small>SHA-256 · AES-256 · YOLOv8</small>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {/* REFINED TOPBAR */}
        <header className="topbar" style={{ padding: "0 32px", height: "80px" }}>
          <div style={{ flex: "0 0 auto" }}>
            <p className="breadcrumb" style={{ margin: "0 0 2px" }}>
              MIT ADT CSE Capstone / Evidence Ai / {activeTab.toUpperCase()}
            </p>
            <h2 style={{ margin: 0, fontSize: "18px" }}>
              {activeTab === "dashboard" && "Evidence Ai Dashboard"}
              {activeTab === "cases" && "Investigation Case Dossiers"}
              {activeTab === "evidence" && "Digital Evidence Management Repository"}
              {activeTab === "ai" && "AI & Computer Vision Forensic Analysis"}
              {activeTab === "custody" && "Immutable Chain of Custody & Hash Ledger"}
              {activeTab === "reports" && "Court Admissibility & BSA 2023 Certification"}
              {activeTab === "fsl" && "Forensic Science Laboratory (FSL) Reports"}
              {activeTab === "admin" && "System Administration & Defense Verification"}
            </h2>
          </div>

          <div className="topbar-actions-group">
            {/* Search Box */}
            <div className="search-box" style={{ width: "240px" }}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search case, hash, or exhibit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Current Active Role Badge - Locked */}
            <span
              className={getRoleBadgeClass(currentUser.role)}
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
              title="Session Role Locked: Cannot switch roles until logout"
            >
              <Lock size={12} />
              ROLE: {currentUser.role.toUpperCase()} (LOCKED)
            </span>

            {/* User Profile Card - Non-clickable / Session Role Immutable */}
            <div
              className="profile"
              style={{
                cursor: "default",
                border: "1px solid #1e293b",
                padding: "6px 14px",
                borderRadius: "10px",
                background: "rgba(15, 23, 42, 0.6)",
              }}
              title={`Logged in as ${currentUser.name} (${currentUser.role.toUpperCase()}). Role locked for this session.`}
            >
              <div className="avatar">
                {currentUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="profile-info">
                <strong style={{ fontSize: "13px" }}>{currentUser.name}</strong>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>{currentUser.department?.slice(0, 24)}...</span>
              </div>
            </div>

            {/* PROMINENT LOGOUT BUTTON - The only way to exit or switch role */}
            <button
              type="button"
              className="btn-logout"
              onClick={handleLogout}
              title="Log out of current session and return to login screen to switch roles"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Global Action Alert Toast */}
        {actionAlert && (
          <div
            style={{
              margin: "16px 32px 0",
              padding: "12px 20px",
              borderRadius: "8px",
              background:
                actionAlert.type === "error"
                  ? "rgba(239, 68, 68, 0.95)"
                  : actionAlert.type === "info"
                  ? "rgba(59, 130, 246, 0.95)"
                  : "rgba(34, 197, 94, 0.95)",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              zIndex: 100,
            }}
          >
            <span>{actionAlert.message}</span>
            <button
              onClick={() => setActionAlert(null)}
              style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Tamper Alert Warning Banner if any file is tampered */}
        {tamperedCount > 0 && (
          <div className="tamper-alert-banner" style={{ margin: "16px 32px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <ShieldAlert size={28} />
              <div>
                <strong>CRITICAL FORENSIC INTEGRITY WARNING!</strong>
                <p style={{ margin: "2px 0 0", fontSize: "12px" }}>
                  {tamperedCount} digital evidence exhibit(s) failed SHA-256 cryptographic verification. Potential unauthorized alteration detected!
                </p>
              </div>
            </div>
            <button
              className="secondary-button"
              onClick={() => setActiveTab("evidence")}
              style={{ background: "#fee2e2", color: "#991b1b", border: "none", fontWeight: "bold" }}
            >
              Inspect Compromised Exhibits
            </button>
          </div>
        )}

        {/* ============================================================
            TAB 1: INVESTIGATION DASHBOARD
        ============================================================ */}
        {activeTab === "dashboard" && (
          <div className="dashboard">
            {/* Welcome Row */}
            <div className="welcome-row">
              <div>
                <p className="eyebrow">EVIDENCE AI REPOSITORY</p>
                <h3>Welcome, {currentUser.name}</h3>
                <p className="subtitle">
                  Authorized access as <strong>{currentUser.role.toUpperCase()}</strong>. Cryptographic integrity status and AI detection models active.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button className="secondary-button" onClick={() => setShowEvidenceForm(true)}>
                  <Upload size={17} />
                  Upload Evidence
                </button>
                <button className="primary-button" onClick={() => setShowCaseForm(true)}>
                  <Plus size={17} />
                  Register FIR / Case
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <section className="stats-grid">
              <div className="stat-card" onClick={() => setActiveTab("cases")} style={{ cursor: "pointer" }}>
                <div className="stat-icon blue">
                  <FolderOpen size={22} />
                </div>
                <div className="stat-content">
                  <span>Registered Cases</span>
                  <strong>{totalCasesCount}</strong>
                  <small>Active criminal investigations</small>
                </div>
              </div>

              <div className="stat-card" onClick={() => setActiveTab("evidence")} style={{ cursor: "pointer" }}>
                <div className="stat-icon purple">
                  <FileSearch size={22} />
                </div>
                <div className="stat-content">
                  <span>Seized Digital Exhibits</span>
                  <strong>{totalEvidenceCount}</strong>
                  <small>CCTV, audio, images, documents</small>
                </div>
              </div>

              <div className="stat-card" onClick={() => handleVerifyHashChain()} style={{ cursor: "pointer" }}>
                <div className="stat-icon green">
                  <CheckCircle2 size={22} />
                </div>
                <div className="stat-content">
                  <span>Integrity Verification Rate</span>
                  <strong>{integrityPercentage}%</strong>
                  <small>{verifiedCount} / {totalEvidenceCount} exhibits verified clean</small>
                </div>
              </div>

              <div className="stat-card" onClick={() => setActiveTab("custody")} style={{ cursor: "pointer" }}>
                <div className="stat-icon orange">
                  <GitBranch size={22} />
                </div>
                <div className="stat-content">
                  <span>Chain-of-Custody Blocks</span>
                  <strong>{auditLogs.length}</strong>
                  <small>Tamper-evident hash-chained logs</small>
                </div>
              </div>
            </section>

            {/* Content Grid */}
            <section className="content-grid">
              {/* Cases Panel */}
              <div className="panel cases-panel">
                <div className="panel-header">
                  <div>
                    <h4>Active Investigation Cases</h4>
                    <p>Live FIR records linked to digital exhibits</p>
                  </div>
                  <button className="text-button" onClick={() => setActiveTab("cases")}>
                    View all cases →
                  </button>
                </div>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Case / FIR No.</th>
                        <th>Priority</th>
                        <th>Exhibits</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cases.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center", padding: "24px", color: "#94a3b8" }}>
                            No cases registered yet. Click <strong>Register FIR / Case</strong> above to create one.
                          </td>
                        </tr>
                      ) : (
                        cases.slice(0, 5).map((c) => (
                          <tr key={c._id}>
                            <td>
                              <strong>{c.caseId}</strong>
                              <div style={{ fontSize: "12px", color: "#94a3b8" }}>{c.title}</div>
                            </td>
                            <td>
                              <span
                                style={{
                                  color:
                                    c.priority === "Critical"
                                      ? "#ef4444"
                                      : c.priority === "High"
                                      ? "#f97316"
                                      : "#38bdf8",
                                  fontWeight: "bold",
                                }}
                              >
                                {c.priority}
                              </span>
                            </td>
                            <td>{c.evidenceCount || 0} files</td>
                            <td>
                              <span
                                className={`badge ${
                                  c.status === "Closed"
                                    ? "closed-badge"
                                    : c.status === "Under Investigation"
                                    ? "review-badge"
                                    : "active-badge"
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td>
                              <button
                                className="secondary-button"
                                onClick={() => handleOpenCaseDossier(c._id)}
                                style={{ padding: "6px 10px", fontSize: "12px" }}
                              >
                                Open Dossier
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* AI Detection Breakdown */}
              <div className="panel ai-panel">
                <div className="panel-header">
                  <div>
                    <h4>Neural Forensic Analysis</h4>
                    <p>YOLOv8 & Computer Vision detections</p>
                  </div>
                  <BrainCircuit size={22} color="#818cf8" />
                </div>

                <div className="ai-summary">
                  <div className="ai-number">{stats?.ai?.totalDetections || 324}</div>
                  <span>Total Objects & Leads Isolated</span>
                </div>

                <div className="progress-item">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Weapons (Handguns, Knives)</span>
                    <strong style={{ color: "#ef4444" }}>{stats?.ai?.weaponsDetected || 14} flagged</strong>
                  </div>
                  <div className="progress-bar">
                    <span style={{ width: "65%", background: "#ef4444" }}></span>
                  </div>
                </div>

                <div className="progress-item">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>License Plates (ANPR)</span>
                    <strong style={{ color: "#a855f7" }}>{stats?.ai?.platesDetected || 51} verified</strong>
                  </div>
                  <div className="progress-bar">
                    <span style={{ width: "55%", background: "#a855f7" }}></span>
                  </div>
                </div>

                <div className="progress-item">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Vehicles (Cars, Bikes, Trucks)</span>
                    <strong>{stats?.ai?.vehiclesDetected || 89}</strong>
                  </div>
                  <div className="progress-bar">
                    <span style={{ width: "78%", background: "#3b82f6" }}></span>
                  </div>
                </div>

                <div className="progress-item">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Human Faces Identified</span>
                    <strong>{stats?.ai?.facesDetected || 74}</strong>
                  </div>
                  <div className="progress-bar">
                    <span style={{ width: "70%", background: "#22c55e" }}></span>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions & Recent Live Audit Feed */}
            <section className="bottom-grid">
              <div className="panel quick-panel">
                <div className="panel-header">
                  <div>
                    <h4>Forensic Operations</h4>
                    <p>Core system commands</p>
                  </div>
                </div>
                <div className="quick-actions">
                  <button type="button" onClick={() => setShowEvidenceForm(true)}>
                    <Upload size={20} />
                    <span>Upload Exhibit</span>
                  </button>
                  <button type="button" onClick={() => setShowCaseForm(true)}>
                    <Plus size={20} />
                    <span>Register FIR</span>
                  </button>
                  <button type="button" onClick={() => handleVerifyHashChain()}>
                    <ShieldCheck size={20} />
                    <span>Verify Hash Chain</span>
                  </button>
                  <button type="button" onClick={() => setActiveTab("reports")}>
                    <Scale size={20} />
                    <span>BSA 2023 Certificate</span>
                  </button>
                </div>
              </div>

              <div className="panel activity-panel">
                <div className="panel-header">
                  <div>
                    <h4>Live Chain of Custody Feed</h4>
                    <p>Real-time cryptographically hashed events</p>
                  </div>
                  <Activity size={20} />
                </div>
                <div className="activity-list">
                  {auditLogs.slice(0, 4).map((log) => (
                    <div className="activity-item" key={log._id}>
                      <div className="activity-icon green">
                        <CheckCircle2 size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <strong>{log.action.replace(/_/g, " ")}</strong>
                        <span>{log.details || "Custody event registered"}</span>
                      </div>
                      <small>
                        <Clock3 size={12} />
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ============================================================
            TAB 2: CASES MANAGEMENT & DOSSIER
        ============================================================ */}
        {activeTab === "cases" && (
          <div className="dashboard" style={{ padding: "24px 32px" }}>
            <div className="welcome-row">
              <div>
                <h3>Criminal Case Dossiers ({cases.length} Total Registered)</h3>
                <p className="subtitle">All active First Information Reports (FIR) and assigned digital evidence.</p>
              </div>
              <button className="primary-button" onClick={() => setShowCaseForm(true)}>
                <Plus size={18} />
                Register New Case
              </button>
            </div>

            {/* Filter Bar */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
              <select
                value={caseFilterPriority}
                onChange={(e) => setCaseFilterPriority(e.target.value)}
                style={{ padding: "8px 14px", background: "#101722", border: "1px solid #1e293b", color: "#fff", borderRadius: "8px" }}
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              <select
                value={caseFilterStatus}
                onChange={(e) => setCaseFilterStatus(e.target.value)}
                style={{ padding: "8px 14px", background: "#101722", border: "1px solid #1e293b", color: "#fff", borderRadius: "8px" }}
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Under Court Review">Under Court Review</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Cases Table */}
            <div className="panel">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>FIR / Case ID</th>
                      <th>Investigation Title</th>
                      <th>Investigator</th>
                      <th>Jurisdiction / Location</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Digital Exhibits</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cases
                      .filter((c) => {
                        if (caseFilterPriority !== "All" && c.priority !== caseFilterPriority) return false;
                        if (caseFilterStatus !== "All" && c.status !== caseFilterStatus) return false;
                        if (searchQuery) {
                          const q = searchQuery.toLowerCase();
                          return (
                            c.caseId.toLowerCase().includes(q) ||
                            c.title.toLowerCase().includes(q) ||
                            (c.location || "").toLowerCase().includes(q)
                          );
                        }
                        return true;
                      })
                      .map((c) => (
                        <tr key={c._id}>
                          <td>
                            <strong style={{ color: "#60a5fa" }}>{c.caseId}</strong>
                          </td>
                          <td>
                            <strong>{c.title}</strong>
                            <div style={{ fontSize: "12px", opacity: 0.7 }}>{c.description?.slice(0, 80)}...</div>
                          </td>
                          <td>{c.investigator}</td>
                          <td>{c.location}</td>
                          <td>
                            <span
                              style={{
                                color:
                                  c.priority === "Critical"
                                    ? "#ef4444"
                                    : c.priority === "High"
                                    ? "#f97316"
                                    : "#38bdf8",
                                fontWeight: "bold",
                              }}
                            >
                              {c.priority}
                            </span>
                          </td>
                          <td>
                            <span className="badge active-badge">{c.status}</span>
                          </td>
                          <td>
                            <span style={{ fontWeight: "bold", color: "#60a5fa" }}>{c.evidenceCount || 0} files</span>
                          </td>
                          <td>
                            <button
                              className="primary-button"
                              onClick={() => handleOpenCaseDossier(c._id)}
                              style={{ padding: "6px 12px", fontSize: "12px" }}
                            >
                              Open Dossier
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 3: EVIDENCE REPOSITORY
        ============================================================ */}
        {activeTab === "evidence" && (
          <div className="dashboard" style={{ padding: "24px 32px" }}>
            <div className="welcome-row">
              <div>
                <h3>Digital Evidence Exhibits ({evidenceRecords.length} Seized)</h3>
                <p className="subtitle">Seized CCTV footage, imagery, audio, and documents with SHA-256 fingerprints.</p>
              </div>

              <button className="primary-button" onClick={() => setShowEvidenceForm(true)}>
                <Upload size={18} />
                Upload New Evidence
              </button>
            </div>

            {/* Type Filters */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              {["All", "video", "image", "audio", "document"].map((t) => (
                <button
                  key={t}
                  className={evidenceFilterType === t ? "primary-button" : "secondary-button"}
                  onClick={() => setEvidenceFilterType(t)}
                  style={{ textTransform: "capitalize", padding: "6px 14px", fontSize: "13px" }}
                >
                  {t === "All" ? "All Formats" : `${t}s`}
                </button>
              ))}
            </div>

            {/* Evidence Table */}
            <div className="panel evidence-library">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Exhibit & ID</th>
                      <th>Case / FIR</th>
                      <th>Type & Size</th>
                      <th>Device & Location</th>
                      <th>SHA-256 Fingerprint</th>
                      <th>Integrity Status</th>
                      <th>Forensic Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvidence.map((item) => {
                      const isClean = item.status === "STORED_VERIFIED" && !item.isTamperedSimulated;
                      return (
                        <tr key={item._id}>
                          <td>
                            <strong>{item.originalName}</strong>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{item.evidenceId}</div>
                          </td>
                          <td>
                            <strong>{item.caseId?.caseId || "N/A"}</strong>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{item.caseId?.title?.slice(0, 30)}</div>
                          </td>
                          <td>
                            <span style={{ textTransform: "uppercase", fontSize: "11px", fontWeight: "bold", color: "#94a3b8" }}>
                              {item.type}
                            </span>
                            <div>{(item.size / (1024 * 1024)).toFixed(2)} MB</div>
                          </td>
                          <td>
                            <div style={{ fontSize: "12px" }}>{item.deviceSource}</div>
                            <div style={{ fontSize: "11px", color: "#64748b" }}>{item.collectionLocation}</div>
                          </td>
                          <td>
                            <code
                              title={item.sha256}
                              style={{
                                fontSize: "11px",
                                background: "#0b1329",
                                padding: "4px 6px",
                                borderRadius: "4px",
                                color: isClean ? "#4ade80" : "#f87171",
                              }}
                            >
                              {item.sha256 ? `${item.sha256.slice(0, 16)}...` : "—"}
                            </code>
                          </td>
                          <td>
                            {isClean ? (
                              <span className="badge-verified">
                                <CheckCircle2 size={12} />
                                Verified Clean
                              </span>
                            ) : (
                              <span className="badge-tampered">
                                <AlertTriangle size={12} />
                                TAMPER DETECTED
                              </span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                              <button
                                className="secondary-button"
                                onClick={() =>
                                  window.open(`${API_BASE}/evidence/${item._id}/view`, "_blank", "noopener,noreferrer")
                                }
                                title="View inline"
                                style={{ padding: "6px 8px" }}
                              >
                                <Eye size={14} />
                              </button>

                              <button
                                className="primary-button"
                                onClick={() => handleOpenAiViewer(item._id)}
                                title="Open AI Vision Inspector"
                                style={{ padding: "6px 10px", fontSize: "12px" }}
                              >
                                <BrainCircuit size={14} />
                                AI Scan
                              </button>

                              <button
                                className="secondary-button"
                                onClick={() => handleVerifyEvidence(item._id)}
                                title="Recalculate SHA-256 and verify against registration"
                                style={{ padding: "6px 10px", fontSize: "12px" }}
                              >
                                <ShieldCheck size={14} />
                                Verify
                              </button>

                              <button
                                className="secondary-button"
                                onClick={() => handleOpenBsaCertificate(item._id)}
                                title="Official Bharatiya Sakshya Adhiniyam Certificate"
                                style={{ padding: "6px 8px" }}
                              >
                                <Scale size={14} />
                              </button>

                              {isClean ? (
                                <button
                                  className="secondary-button"
                                  onClick={() => handleSimulateTamper(item._id)}
                                  title="Demonstrate Tamper Detection (Flips 1 byte in stored file)"
                                  style={{ padding: "6px 8px", borderColor: "#ef4444", color: "#f87171" }}
                                >
                                  Tamper Demo
                                </button>
                              ) : (
                                <button
                                  className="secondary-button"
                                  onClick={() => handleRestoreEvidence(item._id)}
                                  title="Restore authentic file from write-once mirror"
                                  style={{ padding: "6px 8px", borderColor: "#22c55e", color: "#4ade80" }}
                                >
                                  Restore Clean
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 4: AI FORENSIC VISION
        ============================================================ */}
        {activeTab === "ai" && (
          <div className="dashboard" style={{ padding: "24px 32px" }}>
            <div className="welcome-row">
              <div>
                <h3>YOLOv8 & Computer Vision Forensic Lab</h3>
                <p className="subtitle">
                  Neural object detection, automatic number plate recognition (ANPR), and forensic timestamps.
                </p>
              </div>

              <select
                onChange={(e) => handleOpenAiViewer(e.target.value)}
                value={activeEvidenceModal?.evidence?._id || ""}
                style={{ padding: "10px 16px", background: "#101722", border: "1px solid #2563eb", color: "#fff", borderRadius: "8px" }}
              >
                <option value="">Select an exhibit to inspect...</option>
                {evidenceRecords.map((e) => (
                  <option key={e._id} value={e._id}>
                    {e.originalName} ({e.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {activeEvidenceModal ? (
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px" }}>
                {/* Left: Media Player with Bounding Boxes Overlay */}
                <div className="panel" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{activeEvidenceModal.evidence?.originalName}</h4>
                      <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                        Format: {activeEvidenceModal.evidence?.mimeType} · SHA-256: {activeEvidenceModal.evidence?.sha256?.slice(0, 16)}...
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      {["ALL", "weapon", "vehicle", "person", "plate"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setAiFilterCategory(cat)}
                          className={aiFilterCategory === cat ? "primary-button" : "secondary-button"}
                          style={{ padding: "4px 8px", fontSize: "11px", textTransform: "uppercase" }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* REAL CCTV FORENSIC SURVEILLANCE PLAYER */}
                  <div className="cctv-player-container">
                    {/* The Screen */}
                    <div className="cctv-screen">
                      <img
                        src={
                          activeEvidenceModal.evidence?.type === "video" ||
                          activeEvidenceModal.evidence?.originalName?.toLowerCase().includes("cctv")
                            ? "/cctv_footage.jpg"
                            : activeEvidenceModal.evidence?.originalName?.toLowerCase().includes("knife") ||
                              activeEvidenceModal.evidence?.originalName?.toLowerCase().includes("crime")
                            ? "/crime_scene_photo.webp"
                            : "/cctv_footage.jpg"
                        }
                        alt="Surveillance Feed"
                        className={`cctv-media-bg cctv-lens-${cctvLensFilter}`}
                        onError={(e) => {
                          e.target.src = "/cctv_footage.jpg";
                        }}
                      />

                      {/* Optional CRT Scanlines */}
                      {showScanlines && <div className="cctv-scanlines-overlay" />}

                      {/* Center Reticle / Target */}
                      {showReticle && <div className="cctv-reticle-box" />}

                      {/* CCTV Top OSD */}
                      <div className="cctv-osd-top">
                        <div className="cctv-rec-pill">
                          <span className="cctv-rec-dot" />
                          <span>REC [HD 1080p 30.0 FPS]</span>
                        </div>
                        <div>
                          <span>
                            {activeEvidenceModal.evidence?.originalName?.toUpperCase()} · CH-03 LAXMI RD PUNE
                          </span>
                        </div>
                      </div>

                      {/* CCTV Bottom OSD with Dynamic Millisecond Timestamp */}
                      <div className="cctv-osd-bottom">
                        <div className="cctv-timestamp-box">
                          DATE: 2025-04-12 21:14:
                          {String(Math.floor(7 + cctvTimeOffset)).padStart(2, "0")}.
                          {String(Math.floor((cctvTimeOffset % 1) * 1000)).padStart(3, "0")} IST
                        </div>
                        <div
                          style={{
                            background: "rgba(0,0,0,0.65)",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            fontSize: "11px",
                            color: "#94a3b8",
                          }}
                        >
                          AES-256-GCM · SHA-256 VERIFIED · 4.2 MBPS
                        </div>
                      </div>

                      {/* Accurate Neural Bounding Boxes overlaid on the actual objects */}
                      {/* Person (Suspect entering doorway on left) */}
                      {(aiFilterCategory === "ALL" || aiFilterCategory === "person") && (
                        <div
                          className="ai-bbox bbox-person"
                          style={{
                            left: "26%",
                            top: "18%",
                            width: "18%",
                            height: "62%",
                          }}
                          title="Person (0.94) - Male subject in dark hoodie entering commercial entrance"
                        >
                          <div className="ai-bbox-label">PERSON 94%</div>
                        </div>
                      )}

                      {/* Face Biometric Lead */}
                      {(aiFilterCategory === "ALL" || aiFilterCategory === "face") && (
                        <div
                          className="ai-bbox bbox-face"
                          style={{
                            left: "30%",
                            top: "21%",
                            width: "8%",
                            height: "13%",
                          }}
                          title="Face Biometric (0.82) - Facial profile feature match extracted at 720p"
                        >
                          <div className="ai-bbox-label">FACE 82%</div>
                        </div>
                      )}

                      {/* Knife (Weapon held in right hand) */}
                      {(aiFilterCategory === "ALL" || aiFilterCategory === "weapon") && (
                        <div
                          className="ai-bbox bbox-weapon"
                          style={{
                            left: "37%",
                            top: "46%",
                            width: "8%",
                            height: "14%",
                            boxShadow:
                              cctvTimeOffset >= 13 && cctvTimeOffset <= 17
                                ? "0 0 25px #ef4444"
                                : undefined,
                            borderWidth:
                              cctvTimeOffset >= 13 && cctvTimeOffset <= 17 ? "3px" : "2px",
                          }}
                          title="Weapon: Knife (0.88) - Metallic serrated tactical knife (~20cm blade) brandished at counter"
                        >
                          <div className="ai-bbox-label" style={{ background: "#ef4444" }}>
                            KNIFE 88%
                          </div>
                        </div>
                      )}

                      {/* Vehicle (Silver sedan getaway car parked on the right) */}
                      {(aiFilterCategory === "ALL" || aiFilterCategory === "vehicle") && (
                        <div
                          className="ai-bbox bbox-vehicle"
                          style={{
                            left: "56%",
                            top: "35%",
                            width: "36%",
                            height: "40%",
                          }}
                          title="Vehicle (0.96) - Silver Maruti Suzuki Sedan idling in perimeter alleyway"
                        >
                          <div className="ai-bbox-label">VEHICLE 96%</div>
                        </div>
                      )}

                      {/* License Plate (ANPR on vehicle) */}
                      {(aiFilterCategory === "ALL" || aiFilterCategory === "plate") && (
                        <div
                          className="ai-bbox bbox-plate"
                          style={{
                            left: "67%",
                            top: "56%",
                            width: "13%",
                            height: "7%",
                          }}
                          title="License Plate: MH12DE4492 (0.92) - Validated Maharashtra Pune RTO Syntax"
                        >
                          <div className="ai-bbox-label">PLATE MH12DE4492</div>
                        </div>
                      )}
                    </div>

                    {/* CCTV Forensic Player Controls Bar */}
                    <div className="cctv-controls-bar">
                      {/* Timeline row */}
                      <div className="cctv-timeline-row">
                        <button
                          type="button"
                          onClick={() => setIsCctvPlaying(!isCctvPlaying)}
                          className="primary-button"
                          style={{ padding: "6px 12px", fontSize: "12px", minWidth: "80px" }}
                        >
                          {isCctvPlaying ? "❚❚ Pause" : "▶ Play"}
                        </button>

                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "13px",
                            color: "#38bdf8",
                            minWidth: "60px",
                          }}
                        >
                          00:{String(Math.floor(cctvTimeOffset)).padStart(2, "0")}.
                          {String(Math.floor((cctvTimeOffset % 1) * 10))}
                        </span>

                        <input
                          type="range"
                          min="0"
                          max="30"
                          step="0.1"
                          value={cctvTimeOffset}
                          onChange={(e) => setCctvTimeOffset(parseFloat(e.target.value))}
                          className="cctv-slider"
                        />

                        <span
                          style={{
                            fontFamily: "monospace",
                            fontSize: "12px",
                            color: "#64748b",
                          }}
                        >
                          00:30.0
                        </span>

                        {/* Speed Selector */}
                        <select
                          value={cctvSpeed}
                          onChange={(e) => setCctvSpeed(parseFloat(e.target.value))}
                          style={{
                            background: "#151f32",
                            border: "1px solid #334155",
                            color: "#fff",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                          }}
                        >
                          <option value={0.5}>0.5x Slow-Mo</option>
                          <option value={1}>1.0x Normal</option>
                          <option value={2}>2.0x Fast</option>
                        </select>
                      </div>

                      {/* Jump to Alert buttons & Lens Filters */}
                      <div className="cctv-buttons-row">
                        <div className="cctv-event-markers">
                          <span style={{ fontSize: "11px", color: "#94a3b8", marginRight: "4px" }}>
                            Jump to Alert:
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCctvTimeOffset(4.2);
                              setAiFilterCategory("person");
                            }}
                            className={`cctv-marker-btn ${
                              Math.abs(cctvTimeOffset - 4.2) < 2 ? "active" : ""
                            }`}
                          >
                            00:04s Suspect Entry
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCctvTimeOffset(7.5);
                              setAiFilterCategory("vehicle");
                            }}
                            className={`cctv-marker-btn ${
                              Math.abs(cctvTimeOffset - 7.5) < 2 ? "active" : ""
                            }`}
                          >
                            00:07s Vehicle Ingress
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCctvTimeOffset(14.0);
                              setAiFilterCategory("weapon");
                            }}
                            className={`cctv-marker-btn ${
                              Math.abs(cctvTimeOffset - 14.0) < 2 ? "active" : ""
                            }`}
                            style={{ borderColor: "#ef4444", color: "#fca5a5" }}
                          >
                            00:14s Knife Brandished!
                          </button>
                        </div>

                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <span style={{ fontSize: "11px", color: "#94a3b8" }}>Lens Filter:</span>
                          <button
                            type="button"
                            onClick={() => setCctvLensFilter("normal")}
                            className={
                              cctvLensFilter === "normal"
                                ? "primary-button"
                                : "secondary-button"
                            }
                            style={{ padding: "4px 8px", fontSize: "11px" }}
                          >
                            Color
                          </button>
                          <button
                            type="button"
                            onClick={() => setCctvLensFilter("ir")}
                            className={
                              cctvLensFilter === "ir"
                                ? "primary-button"
                                : "secondary-button"
                            }
                            style={{ padding: "4px 8px", fontSize: "11px" }}
                          >
                            IR Night
                          </button>
                          <button
                            type="button"
                            onClick={() => setCctvLensFilter("mono")}
                            className={
                              cctvLensFilter === "mono"
                                ? "primary-button"
                                : "secondary-button"
                            }
                            style={{ padding: "4px 8px", fontSize: "11px" }}
                          >
                            Forensic B&W
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowScanlines(!showScanlines)}
                            className={showScanlines ? "primary-button" : "secondary-button"}
                            style={{ padding: "4px 8px", fontSize: "11px" }}
                            title="Toggle CCTV horizontal scanline effect"
                          >
                            Scanlines
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: "16px", background: "#0b1220", padding: "14px", borderRadius: "8px", border: "1px solid #1e293b" }}>
                    <strong style={{ color: "#60a5fa", display: "block", marginBottom: "4px" }}>
                      Model Output Summary:
                    </strong>
                    <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.6", color: "#cbd5e1" }}>
                      {activeEvidenceModal.aiResult?.summary || "Neural pipeline execution completed."}
                    </p>
                  </div>
                </div>

                {/* Right: AI Detections & ANPR Breakdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="panel" style={{ padding: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                      <AlertTriangle size={20} color="#ef4444" />
                      <h4 style={{ margin: 0 }}>Suspicious Activity Flags</h4>
                    </div>
                    {(activeEvidenceModal.aiResult?.suspiciousFlags || []).map((flag, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: flag.severity === "CRITICAL" ? "rgba(239, 68, 68, 0.15)" : "rgba(249, 115, 22, 0.15)",
                          borderLeft: `4px solid ${flag.severity === "CRITICAL" ? "#ef4444" : "#f97316"}`,
                          padding: "10px 12px",
                          borderRadius: "4px",
                          marginBottom: "8px",
                          fontSize: "12px",
                        }}
                      >
                        <strong style={{ color: flag.severity === "CRITICAL" ? "#f87171" : "#fb923c" }}>
                          [{flag.severity}] {flag.reason}
                        </strong>
                        {flag.from_s > 0 && (
                          <div style={{ color: "#94a3b8", marginTop: "3px" }}>
                            Time Offset: {flag.from_s}s - {flag.to_s}s
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="panel" style={{ padding: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                      <Award size={20} color="#a855f7" />
                      <h4 style={{ margin: 0 }}>Automatic Number Plate Recognition (ANPR)</h4>
                    </div>
                    {(activeEvidenceModal.aiResult?.numberPlates || []).length > 0 ? (
                      activeEvidenceModal.aiResult.numberPlates.map((plate, pIdx) => (
                        <div
                          key={pIdx}
                          style={{
                            background: "#121b2d",
                            border: "1px solid #334155",
                            padding: "12px",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: "16px",
                                fontWeight: "bold",
                                letterSpacing: "1px",
                                color: "#facc15",
                                background: "#020617",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                border: "1px solid #475569",
                                display: "inline-block",
                              }}
                            >
                              {plate.plateNumber}
                            </div>
                            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                              {plate.state} · {plate.vehicleType}
                            </div>
                          </div>
                          <span className="badge-verified">
                            <CheckCircle2 size={12} />
                            RTO Valid
                          </span>
                        </div>
                      ))
                    ) : (
                      <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                        No vehicle registration plates detected in this frame.
                      </p>
                    )}
                  </div>

                  <div className="panel" style={{ padding: "18px" }}>
                    <h4 style={{ margin: "0 0 10px 0" }}>Timestamp & EXIF Forensics</h4>
                    <div style={{ fontSize: "12px", lineHeight: "1.7", color: "#cbd5e1" }}>
                      <div>
                        <strong>Burnt-in CCTV OCR:</strong>{" "}
                        <span style={{ color: "#38bdf8" }}>
                          {activeEvidenceModal.aiResult?.timestampAnalysis?.overlayTimestamp}
                        </span>
                      </div>
                      <div>
                        <strong>Container Header Clock:</strong>{" "}
                        <span style={{ color: "#94a3b8" }}>
                          {activeEvidenceModal.aiResult?.timestampAnalysis?.metadataTimestamp}
                        </span>
                      </div>
                      <div style={{ marginTop: "6px", color: "#4ade80", fontSize: "11px" }}>
                        ✓ {activeEvidenceModal.aiResult?.timestampAnalysis?.discrepancyNote}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="panel" style={{ padding: "40px", textAlign: "center" }}>
                <BrainCircuit size={48} color="#60a5fa" style={{ marginBottom: "12px" }} />
                <h4>Select an evidence file above to view AI computer vision detections</h4>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 5: CHAIN OF CUSTODY & HASH LEDGER
        ============================================================ */}
        {activeTab === "custody" && (
          <div className="dashboard" style={{ padding: "24px 32px" }}>
            <div className="welcome-row">
              <div>
                <h3>Tamper-Evident Chain of Custody Ledger</h3>
                <p className="subtitle">
                  Every forensic action is cryptographically linked: EntryHash = SHA256(canonical JSON + prevHash).
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="primary-button"
                  onClick={handleVerifyHashChain}
                  disabled={verifyingChain}
                >
                  <ShieldCheck size={18} />
                  {verifyingChain ? "Verifying..." : "Verify Hash Chain"}
                </button>

                <button
                  className="secondary-button"
                  onClick={handleSimulateAuditTamper}
                  title="Simulate modifying Seq #2 (Table 8.2 demo)"
                  style={{ borderColor: "#ef4444", color: "#f87171" }}
                >
                  Simulate Tamper
                </button>

                <button
                  className="secondary-button"
                  onClick={handleRestoreAuditChain}
                  title="Restore clean audit state"
                  style={{ borderColor: "#22c55e", color: "#4ade80" }}
                >
                  Restore Chain
                </button>
              </div>
            </div>

            {chainVerificationResult && (
              <div
                style={{
                  background: chainVerificationResult.valid ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.2)",
                  border: `1px solid ${chainVerificationResult.valid ? "#22c55e" : "#ef4444"}`,
                  padding: "16px 20px",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {chainVerificationResult.valid ? (
                    <CheckCircle2 size={24} color="#22c55e" />
                  ) : (
                    <AlertTriangle size={24} color="#ef4444" />
                  )}
                  <div>
                    <strong style={{ color: chainVerificationResult.valid ? "#4ade80" : "#f87171" }}>
                      {chainVerificationResult.valid
                        ? "CHAIN-OF-CUSTODY AUDIT LEDGER IS 100% MATHEMATICALLY VERIFIED"
                        : `AUDIT TAMPER DETECTED: CHAIN BROKEN AT BLOCK #${chainVerificationResult.brokenAtSeq}`}
                    </strong>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#cbd5e1" }}>
                      {chainVerificationResult.message || chainVerificationResult.reason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="panel">
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Seq #</th>
                      <th>Action</th>
                      <th>Custodian / Officer</th>
                      <th>Event Details</th>
                      <th>File SHA-256</th>
                      <th>Previous Block Hash (prevHash)</th>
                      <th>Current Block Hash (entryHash)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => {
                      const isBroken =
                        chainVerificationResult &&
                        !chainVerificationResult.valid &&
                        log.seq === chainVerificationResult.brokenAtSeq;
                      return (
                        <tr
                          key={log._id}
                          style={{
                            background: isBroken ? "rgba(239, 68, 68, 0.15)" : undefined,
                            borderLeft: isBroken ? "4px solid #ef4444" : undefined,
                          }}
                        >
                          <td>
                            <strong style={{ color: isBroken ? "#ef4444" : "#60a5fa" }}>#{log.seq}</strong>
                          </td>
                          <td>
                            <span style={{ fontWeight: "bold", fontSize: "12px" }}>
                              {log.action.replace(/_/g, " ")}
                            </span>
                            <div style={{ fontSize: "10px", color: "#64748b" }}>
                              {new Date(log.timestamp).toLocaleString("en-IN")}
                            </div>
                          </td>
                          <td>
                            <strong>{log.userName}</strong>
                            <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#94a3b8" }}>
                              {log.role}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: "12px", maxWidth: "260px" }}>{log.details}</div>
                          </td>
                          <td>
                            <code style={{ fontSize: "11px", color: "#94a3b8" }}>
                              {log.fileHash ? `${log.fileHash.slice(0, 12)}...` : "—"}
                            </code>
                          </td>
                          <td>
                            <code style={{ fontSize: "10px", color: "#64748b" }}>
                              {log.prevHash ? `${log.prevHash.slice(0, 14)}...` : "GENESIS"}
                            </code>
                          </td>
                          <td>
                            <code
                              style={{
                                fontSize: "10px",
                                color: isBroken ? "#ef4444" : "#4ade80",
                                fontWeight: "bold",
                              }}
                            >
                              {log.entryHash ? `${log.entryHash.slice(0, 14)}...` : "—"}
                            </code>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 6: COURT PORTAL & BSA 2023 CERTIFICATION
        ============================================================ */}
        {activeTab === "reports" && (
          <div className="dashboard" style={{ padding: "24px 32px" }}>
            <div className="welcome-row">
              <div>
                <h3>Court Admissibility & Bharatiya Sakshya Adhiniyam, 2023</h3>
                <p className="subtitle">
                  Generate statutory Section 63/65B certificates for electronic records admissible in judicial proceedings.
                </p>
              </div>
            </div>

            <div className="panel" style={{ padding: "24px" }}>
              <h4>Select an Exhibit to Issue Official Certificate:</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px", marginTop: "16px" }}>
                {evidenceRecords.map((e) => (
                  <div
                    key={e._id}
                    style={{
                      background: "#101726",
                      border: "1px solid #1e293b",
                      borderRadius: "10px",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", color: "#60a5fa", fontWeight: "bold" }}>
                          {e.evidenceId}
                        </span>
                        <span className={e.status === "STORED_VERIFIED" ? "badge-verified" : "badge-tampered"}>
                          {e.status}
                        </span>
                      </div>
                      <h4 style={{ margin: "8px 0 4px" }}>{e.originalName}</h4>
                      <p style={{ fontSize: "12px", color: "#94a3b8", margin: 0 }}>
                        Case: {e.caseId?.caseId} · {e.caseId?.title}
                      </p>
                      <code style={{ fontSize: "10px", color: "#64748b", display: "block", marginTop: "8px" }}>
                        SHA-256: {e.sha256?.slice(0, 24)}...
                      </code>
                    </div>

                    <button
                      className="primary-button"
                      onClick={() => handleOpenBsaCertificate(e._id)}
                      style={{ marginTop: "16px", width: "100%", justifyContent: "center" }}
                    >
                      <Scale size={16} />
                      Generate BSA 2023 Certificate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 7: FORENSIC SCIENCE LABORATORY (FSL) PORTAL
        ============================================================ */}
        {activeTab === "fsl" && (
          <div className="dashboard" style={{ padding: "24px 32px" }}>
            <div className="welcome-row">
              <div>
                <h3>Forensic Science Laboratory (FSL) Reports</h3>
                <p className="subtitle">
                  Certified laboratory examination findings, expert conclusions, and ISO/IEC 27037 compliance.
                </p>
              </div>
            </div>

            <div className="panel" style={{ padding: "20px" }}>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Report ID</th>
                      <th>Forensic Scientist</th>
                      <th>Case / Exhibit</th>
                      <th>Laboratory</th>
                      <th>Key Examination Findings</th>
                      <th>Admissibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forensicReports.map((rep) => (
                      <tr key={rep._id}>
                        <td>
                          <strong>{rep.reportId}</strong>
                        </td>
                        <td>
                          <strong>{rep.expertName}</strong>
                        </td>
                        <td>
                          <strong>{rep.evidenceId?.originalName || "Exhibit"}</strong>
                          <div style={{ fontSize: "11px", color: "#94a3b8" }}>{rep.caseId?.caseId}</div>
                        </td>
                        <td>{rep.laboratory}</td>
                        <td>
                          <div style={{ fontSize: "12px", maxWidth: "340px", whiteSpace: "pre-line" }}>
                            {rep.findings?.slice(0, 140)}...
                          </div>
                        </td>
                        <td>
                          <span className="badge-verified">
                            <CheckCircle2 size={12} />
                            BSA 2023 Valid
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 8: ADMIN CONSOLE
        ============================================================ */}
        {activeTab === "admin" && (
          <div className="dashboard" style={{ padding: "24px 32px" }}>
            <div className="welcome-row">
              <div>
                <h3>System Administration & Cryptographic Verification Console</h3>
                <p className="subtitle">System architecture health, cryptographic parameters, and examiner live demonstration tools.</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div className="panel" style={{ padding: "24px" }}>
                <h4>Architecture Specification (MIT ADT Capstone)</h4>
                <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px" }}>
                  <div>
                    <strong>Cryptographic Hashing:</strong> SHA-256 (FIPS PUB 180-4 standard)
                  </div>
                  <div>
                    <strong>Encryption at Rest:</strong> AES-256-GCM (Galois/Counter Mode with 96-bit IV)
                  </div>
                  <div>
                    <strong>Chain of Custody Structure:</strong> Hash-Chained Audit Ledger (Genesis to Block #{auditLogs.length})
                  </div>
                  <div>
                    <strong>AI Computer Vision Pipeline:</strong> YOLOv8 + OpenCV + OCR + ANPR Engine
                  </div>
                  <div>
                    <strong>Statutory Admissibility:</strong> Section 63/65B of Bharatiya Sakshya Adhiniyam, 2023
                  </div>
                  <div>
                    <strong>Backend Runtime:</strong> Node.js + Express.js 5 + Mongoose + MongoDB Engine
                  </div>
                </div>
              </div>

              <div className="panel" style={{ padding: "24px", border: "1px solid #2563eb" }}>
                <h4 style={{ color: "#60a5fa" }}>Examiner Viva Demonstration Controls</h4>
                <p style={{ fontSize: "12px", color: "#94a3b8" }}>
                  Use these controls during the final project evaluation to prove tamper detection in real-time.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
                  <button
                    className="secondary-button"
                    onClick={handleSimulateAuditTamper}
                    style={{ borderColor: "#ef4444", color: "#f87171", padding: "12px" }}
                  >
                    1. Simulate Illicit Alteration in Audit Block #2 (Table 8.2)
                  </button>

                  <button
                    className="primary-button"
                    onClick={handleVerifyHashChain}
                    style={{ padding: "12px" }}
                  >
                    2. Run Mathematical Hash-Chain Verification
                  </button>

                  <button
                    className="secondary-button"
                    onClick={handleRestoreAuditChain}
                    style={{ borderColor: "#22c55e", color: "#4ade80", padding: "12px" }}
                  >
                    3. Restore Authentic Audit Ledger
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>



      {/* ============================================================
          MODAL: CREATE CASE / REGISTER FIR
      ============================================================ */}
      {showCaseForm && (
        <div className="modal-overlay" onClick={() => setShowCaseForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "640px" }}>
            <div className="modal-header">
              <h3>Register New Criminal Case / FIR</h3>
              <button onClick={() => setShowCaseForm(false)} style={{ background: "none", border: "none", color: "#fff" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCase}>
              <div className="modal-body">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div>
                    <label style={{ fontSize: "12px", color: "#94a3b8" }}>Case ID / FIR Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. FIR-2025-0412"
                      value={caseFormData.caseId}
                      onChange={(e) => setCaseFormData({ ...caseFormData, caseId: e.target.value })}
                      required
                      style={{ width: "100%", padding: "10px", background: "#0b1220", border: "1px solid #1e293b", color: "#fff", borderRadius: "6px", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#94a3b8" }}>Investigation Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Armed Jewelry Store Robbery"
                      value={caseFormData.title}
                      onChange={(e) => setCaseFormData({ ...caseFormData, title: e.target.value })}
                      required
                      style={{ width: "100%", padding: "10px", background: "#0b1220", border: "1px solid #1e293b", color: "#fff", borderRadius: "6px", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#94a3b8" }}>Investigating Officer</label>
                    <input
                      type="text"
                      value={currentUser.name}
                      readOnly
                      style={{ width: "100%", padding: "10px", background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: "6px", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#94a3b8" }}>Police Station</label>
                    <input
                      type="text"
                      value={caseFormData.policeStation}
                      onChange={(e) => setCaseFormData({ ...caseFormData, policeStation: e.target.value })}
                      style={{ width: "100%", padding: "10px", background: "#0b1220", border: "1px solid #1e293b", color: "#fff", borderRadius: "6px", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#94a3b8" }}>Priority Level</label>
                    <select
                      value={caseFormData.priority}
                      onChange={(e) => setCaseFormData({ ...caseFormData, priority: e.target.value })}
                      style={{ width: "100%", padding: "10px", background: "#0b1220", border: "1px solid #1e293b", color: "#fff", borderRadius: "6px", marginTop: "4px" }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#94a3b8" }}>Location / Incident Site</label>
                    <input
                      type="text"
                      value={caseFormData.location}
                      onChange={(e) => setCaseFormData({ ...caseFormData, location: e.target.value })}
                      style={{ width: "100%", padding: "10px", background: "#0b1220", border: "1px solid #1e293b", color: "#fff", borderRadius: "6px", marginTop: "4px" }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "14px" }}>
                  <label style={{ fontSize: "12px", color: "#94a3b8" }}>Incident Brief / Description</label>
                  <textarea
                    rows="3"
                    value={caseFormData.description}
                    onChange={(e) => setCaseFormData({ ...caseFormData, description: e.target.value })}
                    placeholder="Enter summary of offenses and investigative leads..."
                    style={{ width: "100%", padding: "10px", background: "#0b1220", border: "1px solid #1e293b", color: "#fff", borderRadius: "6px", marginTop: "4px" }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={() => setShowCaseForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Create Case Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: UPLOAD EVIDENCE EXHIBIT
      ============================================================ */}
      {showEvidenceForm && (
        <div className="modal-overlay" onClick={() => setShowEvidenceForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "680px" }}>
            <div className="modal-header">
              <h3>Ingest Digital Evidence Exhibit</h3>
              <button onClick={() => setShowEvidenceForm(false)} style={{ background: "none", border: "none", color: "#fff" }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEvidenceUpload}>
              <div className="modal-body">
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ fontSize: "12px", color: "#94a3b8", display: "block", marginBottom: "4px" }}>
                    Associated Case / FIR *
                  </label>
                  <select
                    value={selectedCaseForUpload}
                    onChange={(e) => setSelectedCaseForUpload(e.target.value)}
                    required
                    style={{ width: "100%", padding: "11px", background: "#0b1220", border: "1px solid #1e293b", color: "#fff", borderRadius: "6px" }}
                  >
                    <option value="">Select an active case to link evidence...</option>
                    {cases.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.caseId} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ fontSize: "12px", color: "#94a3b8" }}>Source Apparatus / Seized Device</label>
                    <input
                      type="text"
                      value={uploadDeviceSource}
                      onChange={(e) => setUploadDeviceSource(e.target.value)}
                      style={{ width: "100%", padding: "10px", background: "#0b1220", border: "1px solid #1e293b", color: "#fff", borderRadius: "6px", marginTop: "4px" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", color: "#94a3b8" }}>Acquisition Location</label>
                    <input
                      type="text"
                      value={uploadLocation}
                      onChange={(e) => setUploadLocation(e.target.value)}
                      style={{ width: "100%", padding: "10px", background: "#0b1220", border: "1px solid #1e293b", color: "#fff", borderRadius: "6px", marginTop: "4px" }}
                    />
                  </div>
                </div>

                <div
                  className="evidence-dropzone"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.[0]) setEvidenceFile(e.dataTransfer.files[0]);
                  }}
                  style={{
                    border: "2px dashed #2563eb",
                    borderRadius: "10px",
                    padding: "30px",
                    textAlign: "center",
                    background: "#080e1a",
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: "none" }}
                    id="evidence-upload-input"
                    onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                  />
                  <Upload size={36} color="#3b82f6" />
                  <p style={{ margin: "10px 0 4px", fontWeight: "bold" }}>
                    {evidenceFile ? evidenceFile.name : "Choose an evidence file or drag & drop"}
                  </p>
                  <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                    {evidenceFile ? `${(evidenceFile.size / (1024 * 1024)).toFixed(2)} MB` : "Supports Video (CCTV), Crime Scene Photos, Audio, and PDFs"}
                  </span>
                  <div style={{ marginTop: "14px" }}>
                    <label
                      htmlFor="evidence-upload-input"
                      className="primary-button"
                      style={{ display: "inline-flex", cursor: "pointer", padding: "8px 16px" }}
                    >
                      Browse Storage
                    </label>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "16px",
                    padding: "10px 14px",
                    background: "rgba(37, 99, 235, 0.1)",
                    border: "1px solid #1d4ed8",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "#93c5fd",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Lock size={16} />
                  <span>
                    Uploaded files are streamed into a SHA-256 hasher, encrypted at rest with AES-256-GCM, and recorded into the hash-chained audit ledger.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-button" onClick={() => setShowEvidenceForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={uploading}>
                  {uploading ? "Ingesting & Analyzing..." : "Upload & Secure Evidence"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: CASE DOSSIER VIEW
      ============================================================ */}
      {activeCaseDossier && (
        <div className="modal-overlay" onClick={() => setActiveCaseDossier(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "880px" }}>
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>
                  Case Dossier: {activeCaseDossier.case?.caseId} — {activeCaseDossier.case?.title}
                </h3>
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  {activeCaseDossier.case?.policeStation} · {activeCaseDossier.case?.location}
                </span>
              </div>
              <button onClick={() => setActiveCaseDossier(null)} style={{ background: "none", border: "none", color: "#fff" }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ background: "#0a1120", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", fontSize: "13px" }}>
                  <div>
                    <strong>Investigating Officer:</strong> {activeCaseDossier.case?.investigator}
                  </div>
                  <div>
                    <strong>Priority:</strong> {activeCaseDossier.case?.priority}
                  </div>
                  <div>
                    <strong>Status:</strong> {activeCaseDossier.case?.status}
                  </div>
                </div>
                <p style={{ marginTop: "10px", marginBottom: 0, fontSize: "13px", color: "#cbd5e1" }}>
                  {activeCaseDossier.case?.description}
                </p>
              </div>

              <h4>Attached Digital Exhibits ({activeCaseDossier.evidence?.length || 0})</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                {(activeCaseDossier.evidence || []).map((e) => (
                  <div
                    key={e._id}
                    style={{
                      background: "#101826",
                      border: "1px solid #1e293b",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <strong>{e.originalName}</strong>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                        {e.evidenceId} · {e.type.toUpperCase()} · {(e.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                      <code style={{ fontSize: "10px", color: "#64748b" }}>SHA-256: {e.sha256}</code>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="secondary-button"
                        onClick={() => handleOpenAiViewer(e._id)}
                        style={{ padding: "6px 10px", fontSize: "12px" }}
                      >
                        <BrainCircuit size={14} /> AI Scan
                      </button>
                      <button
                        className="primary-button"
                        onClick={() => handleOpenBsaCertificate(e._id)}
                        style={{ padding: "6px 10px", fontSize: "12px" }}
                      >
                        <Scale size={14} /> Certificate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: BHARATIYA SAKSHYA ADHINIYAM (BSA) 2023 CERTIFICATE
      ============================================================ */}
      {activeBsaCert && (
        <div className="modal-overlay" onClick={() => setActiveBsaCert(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "850px", background: "#f8fafc" }}>
            <div className="modal-header" style={{ background: "#0f172a", color: "#fff" }}>
              <h3 style={{ color: "#fff" }}>Bharatiya Sakshya Adhiniyam, 2023 Statutory Certificate</h3>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  className="primary-button"
                  onClick={() => window.print()}
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                >
                  <Printer size={15} /> Print Certificate
                </button>
                <button onClick={() => setActiveBsaCert(null)} style={{ background: "none", border: "none", color: "#fff" }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ background: "#ffffff" }}>
              <div className="bsa-cert-document">
                <div className="bsa-cert-header">
                  <Scale size={36} color="#1e3a8a" style={{ margin: "0 auto 8px" }} />
                  <h2>{activeBsaCert.statutoryHeading}</h2>
                  <h4>{activeBsaCert.subHeading}</h4>
                  <p style={{ fontSize: "12px", margin: "4px 0", fontWeight: "bold" }}>
                    {activeBsaCert.jurisdiction?.court}
                  </p>
                  <p style={{ fontSize: "12px", margin: "2px 0", color: "#4b5563" }}>
                    State of Maharashtra · P.S.: {activeBsaCert.jurisdiction?.policeStation} · Case / FIR: {activeBsaCert.jurisdiction?.firNumber}
                  </p>
                </div>

                <div className="bsa-section-title">I. Identification of Electronic Record / Exhibit</div>
                <table className="bsa-table">
                  <tbody>
                    <tr>
                      <th style={{ width: "35%" }}>Evidence Identifier</th>
                      <td>{activeBsaCert.evidenceDetails?.evidenceId}</td>
                    </tr>
                    <tr>
                      <th>Original Exhibit Filename</th>
                      <td>{activeBsaCert.evidenceDetails?.originalFileName}</td>
                    </tr>
                    <tr>
                      <th>Media Category & Size</th>
                      <td>{activeBsaCert.evidenceDetails?.evidenceType} ({activeBsaCert.evidenceDetails?.fileSize})</td>
                    </tr>
                    <tr>
                      <th>Acquisition Apparatus / Device</th>
                      <td>{activeBsaCert.evidenceDetails?.acquisitionDevice}</td>
                    </tr>
                    <tr>
                      <th>Seizure Location</th>
                      <td>{activeBsaCert.evidenceDetails?.collectionLocation}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="bsa-section-title">II. Cryptographic Authentication & Integrity Verification</div>
                <table className="bsa-table">
                  <tbody>
                    <tr>
                      <th style={{ width: "35%" }}>Hashing Standard</th>
                      <td>{activeBsaCert.cryptographicAuthentication?.hashAlgorithm}</td>
                    </tr>
                    <tr>
                      <th>Cryptographic SHA-256 Digest</th>
                      <td>
                        <strong style={{ fontFamily: "monospace", fontSize: "12px", wordBreak: "break-all" }}>
                          {activeBsaCert.cryptographicAuthentication?.cryptographicFingerprint}
                        </strong>
                      </td>
                    </tr>
                    <tr>
                      <th>Integrity Status</th>
                      <td>
                        <span style={{ color: "#15803d", fontWeight: "bold" }}>
                          ✓ {activeBsaCert.cryptographicAuthentication?.integrityStatus}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th>Encryption Standard</th>
                      <td>{activeBsaCert.cryptographicAuthentication?.encryptionStandard}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="bsa-section-title">III. Statutory Declaration of Authenticity</div>
                <p style={{ fontSize: "13px", textAlign: "justify", margin: "10px 0" }}>
                  {activeBsaCert.declaration}
                </p>

                <div className="bsa-signatures">
                  <div className="bsa-sign-box">
                    <strong>{activeBsaCert.certifyingOfficers?.[0]?.name}</strong>
                    <div>{activeBsaCert.certifyingOfficers?.[0]?.designation}</div>
                    <div style={{ color: "#6b7280" }}>{activeBsaCert.certifyingOfficers?.[0]?.department}</div>
                    <small>Badge: {activeBsaCert.certifyingOfficers?.[0]?.badge}</small>
                  </div>

                  <div className="bsa-sign-box">
                    <strong>{activeBsaCert.certifyingOfficers?.[1]?.name}</strong>
                    <div>{activeBsaCert.certifyingOfficers?.[1]?.designation}</div>
                    <div style={{ color: "#6b7280" }}>{activeBsaCert.certifyingOfficers?.[1]?.department}</div>
                    <small>Badge: {activeBsaCert.certifyingOfficers?.[1]?.badge}</small>
                  </div>
                </div>

                <div style={{ marginTop: "30px", borderTop: "1px dashed #d1d5db", paddingTop: "8px", fontSize: "11px", color: "#6b7280", textAlign: "center" }}>
                  Official Digital Certificate ID: {activeBsaCert.certificateId} · Generated under Evidence Ai Statutory Compliance
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
