# Evidence Ai: AI-Powered Digital Evidence Management System



##  Project Overview
**Evidence Ai** is a centralized, forensically sound, and AI-assisted digital evidence management system. It solves the critical national challenges of fragmented evidence storage, chain-of-custody gaps, missing/altered CCTV footage, and exhausting manual video reviews in Indian criminal investigations.

The system is fully compliant with modern Indian criminal jurisprudence under the **Bharatiya Sakshya Adhiniyam, 2023 (BSA)** and **Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS)**.

---

##  How to Run in VS Code (Simple 1-Command Startup)

### Method A: Single Command in VS Code Terminal (Recommended)
Open VS Code in `C:\Users\hp\EvidenceAI` and run:
```bash
npm run dev
```
*(This starts both the backend API on http://localhost:5000 and the Vite frontend on http://localhost:5173 simultaneously!)*

### Method B: Double-Click Batch Launcher
Simply double-click:
```
run_project.bat
```

### Method C: Run Separately in Two Terminals
- **Terminal 1 (Backend):**
  ```bash
  cd server
  npm start
  ```
- **Terminal 2 (Frontend):**
  ```bash
  cd client
  npm run dev
  ```

Then open your browser at: **`http://localhost:5173`**

---

##  Role Authentication & Credentials (Session-Locked)

Evidence Ai enforces strict **Single-Role Authentication**. Each agency role has its own dedicated official Gmail address and password. Once authenticated, the active session is **cryptographically locked to that role** and cannot be switched from the dashboard without clicking **Logout**.

| Role | Officer / Authority | Dedicated Official Gmail | Password | Designation & Scope |
| :--- | :--- | :--- | :--- | :--- |
| **POLICE** | Inspector Vitesh Dongre | `evidenceai.police@gmail.com` | `Police@2025` | FIR registration, CCTV exhibit ingestion, SHA-256 verification |
| **FORENSIC** | Dr. Sakshi Mashere | `evidenceai.forensic@gmail.com` | `Forensic@2025` | FSL laboratory reports, bitstream integrity, YOLOv8 weapon scans |
| **COURT** | Justice Swayam Lase | `evidenceai.court@gmail.com` | `Court@2025` | Exhibit inspection, chain-of-custody audit, Section 63/65B BSA 2023 Certificates |
| **ADMIN** | Dr. Sachin Jagadale | `evidenceai.admin@gmail.com` | `Admin@2025` | System ledger audit, mathematical chain defense verification |

---

##  Key Modules & Engineering Features

### 1. Single-Entry Role Authentication (RBAC)
- Unified login form with 1-click Role Selector tabs.
- Dedicated Gmail & password validation for each specific role.
- **Session-Locked:** Role switching from inside the dashboard is disabled; users must explicitly log out to authenticate as another role.

### 2. Cryptographic Hashing & Tamper-Proof Storage (FIPS 180-4 & FIPS 197)
- **SHA-256 Digesting:** Generated at the moment of file ingestion; recomputed and compared on every access.
- **Avalanche Effect & Tamper Defense:** Any bit modification flips the digest and immediately triggers high-priority alerts (`STORED_VERIFIED` ➔ `TAMPERED`).
- **Authenticated Encryption at Rest:** Files are encrypted with **AES-256-GCM** using unique per-file initialization vectors (IV) and authentication tags.

### 3. Hash-Chained Tamper-Evident Audit Ledger (Chain of Custody)
- Block structure: `entryHash = SHA256(canonical JSON payload + prevHash)` starting from genesis block `000...0`.
- Sequential tracking of every action (`EVIDENCE_UPLOAD`, `SHA256_HASHED`, `AES_ENCRYPTED`, `AI_ANALYSIS`, `FORENSIC_EXAMINATION`, `COURT_INSPECTED`).
- **Mathematical Chain Verification:** 1-click verification walks the ledger and proves 100% mathematical integrity or points out the exact broken block.

### 4. AI & Computer Vision Forensic Analysis
- **YOLOv8 Object & Weapon Detection:** Automatically isolates persons, vehicles, handguns, and knives with bounding boxes, class labels, and confidence ratings.
- **Interactive CCTV Player & Lens Controls:** Surveillance video viewer with OSD timecode clock, Night Vision / Infrared lens filters, scanlines, and speed controls.
- **Automatic Number Plate Recognition (ANPR):** OCR extraction with Indian RTO syntax regex validation (`MH12DE4492`).

### 5. Statutory Legal Compliance (BSA 2023)
- Instant generation and printing of official **Certificates under Section 63/65B of the Bharatiya Sakshya Adhiniyam, 2023 (Act No. 47 of 2023)** complete with court jurisdiction, FIR details, SHA-256 hash, custody trail, and certifying officer signatures.

---

##  Technology Stack
- **Frontend:** React.js 19, Vite, Lucide-react, Custom Glassmorphism Dark UI
- **Backend:** Node.js, Express.js 5, Mongoose, Multer, Crypto (AES-256-GCM & SHA-256), JSON Web Tokens (JWT)
- **Database:** MongoDB (Supports MongoDB Atlas with automatic fallback to in-process MongoMemoryServer for 100% offline reliability)
- **AI Engine:** Python 3.14 / Node Computer Vision pipeline (YOLOv8, OpenCV, OCR, ANPR)
