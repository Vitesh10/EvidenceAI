const crypto = require("crypto");
const fs = require("fs");

// Genesis block hash (64 hex zeros as specified in Section 2.6 of the Project Report)
const GENESIS_HASH = "0".repeat(64);

// Master encryption key for AES-256-GCM (32 bytes = 256 bits)
const MASTER_KEY = crypto
  .createHash("sha256")
  .update(process.env.ENCRYPTION_SECRET || "EvidenceAI-National-Digital-Evidence-Key-2025")
  .digest();

/**
 * Compute SHA-256 hash of a file stream or buffer
 */
function sha256Buffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function sha256Stream(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

/**
 * Encrypt a buffer using AES-256-GCM (authenticated encryption at rest)
 */
function encryptBuffer(buffer) {
  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", MASTER_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedBuffer: encrypted,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
}

/**
 * Decrypt a buffer using AES-256-GCM
 */
function decryptBuffer(encryptedBuffer, ivHex, authTagHex) {
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", MASTER_KEY, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);
  return decrypted;
}

/**
 * Hash-chained audit log hash calculation (Section 2.6, Figure 2.1)
 * entryHash = SHA-256(canonical representation of entry data + prevHash)
 */
function computeAuditEntryHash(entryData) {
  const payload = {
    seq: entryData.seq,
    evidenceId: entryData.evidenceId ? String(entryData.evidenceId) : "",
    caseId: entryData.caseId ? String(entryData.caseId) : "",
    action: entryData.action,
    userId: entryData.userId || "",
    role: entryData.role || "",
    fileHash: entryData.fileHash || "",
    timestamp: new Date(entryData.timestamp).toISOString(),
    prevHash: entryData.prevHash || GENESIS_HASH,
  };

  const canonicalString = JSON.stringify(payload);
  return crypto.createHash("sha256").update(canonicalString).digest("hex");
}

/**
 * Verify a sequence of audit log entries
 * Walks the chain and returns whether it is completely valid, or where broken.
 */
function verifyAuditChain(entries) {
  if (!entries || entries.length === 0) {
    return { valid: true, count: 0, message: "Chain is empty" };
  }

  // Sort by sequence
  const sorted = [...entries].sort((a, b) => a.seq - b.seq);
  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];

    // Check if the previous hash link matches
    if (entry.prevHash !== expectedPrevHash) {
      return {
        valid: false,
        brokenAtSeq: entry.seq,
        entryId: entry._id,
        action: entry.action,
        reason: `Previous hash mismatch at Seq #${entry.seq}. Expected ${expectedPrevHash.slice(0, 16)}... but found ${entry.prevHash ? entry.prevHash.slice(0, 16) : "null"}...`,
      };
    }

    // If marked manually as altered for demo, flag it
    if (entry.isAltered) {
      return {
        valid: false,
        brokenAtSeq: entry.seq,
        entryId: entry._id,
        action: entry.action,
        reason: `Cryptographic signature broken at Seq #${entry.seq}. Content was modified post-signing!`,
      };
    }

    // Recompute current entry hash
    const recomputedHash = computeAuditEntryHash(entry);
    if (entry.entryHash !== recomputedHash) {
      return {
        valid: false,
        brokenAtSeq: entry.seq,
        entryId: entry._id,
        action: entry.action,
        reason: `Hash mismatch at Seq #${entry.seq}. Computed: ${recomputedHash.slice(0, 16)}... Stored: ${entry.entryHash.slice(0, 16)}...`,
      };
    }

    expectedPrevHash = entry.entryHash;
  }

  return {
    valid: true,
    count: sorted.length,
    latestHash: expectedPrevHash,
    message: `All ${sorted.length} chain-of-custody blocks cryptographically verified. No tampering detected.`,
  };
}

module.exports = {
  GENESIS_HASH,
  MASTER_KEY,
  sha256Buffer,
  sha256Stream,
  encryptBuffer,
  decryptBuffer,
  computeAuditEntryHash,
  verifyAuditChain,
};
