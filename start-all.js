const { spawn } = require("child_process");
const path = require("path");

console.log("======================================================================");
console.log("   EVIDENCE AI: DIGITAL EVIDENCE MANAGEMENT SYSTEM");
console.log("   MIT-ADT University B.Tech Capstone Project");
console.log("   Guided by Dr. Sachin Jagadale");
console.log("======================================================================");
console.log(">> Launching Backend API Server on http://localhost:5000 ...");
console.log(">> Launching Frontend Web Client on http://localhost:5173 ...");
console.log("======================================================================");

// Spawn backend server
const serverProcess = spawn(/^win/.test(process.platform) ? "npm.cmd" : "npm", ["run", "start"], {
  cwd: path.join(__dirname, "server"),
  stdio: "inherit",
  shell: true,
});

// Spawn frontend client
const clientProcess = spawn(/^win/.test(process.platform) ? "npm.cmd" : "npm", ["run", "dev"], {
  cwd: path.join(__dirname, "client"),
  stdio: "inherit",
  shell: true,
});

serverProcess.on("error", (err) => {
  console.error("Backend process error:", err);
});

clientProcess.on("error", (err) => {
  console.error("Frontend process error:", err);
});

const cleanup = () => {
  console.log("\nStopping Evidence Ai services...");
  try { serverProcess.kill(); } catch (e) {}
  try { clientProcess.kill(); } catch (e) {}
  process.exit();
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
