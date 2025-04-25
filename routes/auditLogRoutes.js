import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

// Log the action to the audit log file
const logAction = (action, model, data, user) => {
  const logFilePath = path.join(__dirname, 'auditLogs.json');
  const log = {
    action,
    model,
    data,
    user,
    timestamp: new Date().toISOString(),
  };

  // Append log entry to the file
  fs.appendFile(logFilePath, JSON.stringify(log) + '\n', (err) => {
    if (err) {
      console.error('Error writing to audit log file:', err);
    }
  });
};

// Get all audit logs
router.get("/", (req, res) => {
  fs.readFile(path.join(__dirname, "auditLogs.json"), "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Unable to read audit logs" });
    }
    res.json(data ? data.split("\n").filter(Boolean).map(JSON.parse) : []);
  });
});

export default router;
