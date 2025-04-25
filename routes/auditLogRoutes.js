// backend/routes/auditLogs.js
const express = require("express");
const router = express.Router();

router.get("/audit-logs", (req, res) => {
  // Example data or your database query logic
  res.json([
    { message: "Stock added", timestamp: "2025-04-25T08:00:00Z" },
    { message: "Stock edited", timestamp: "2025-04-25T09:00:00Z" },
  ]);
});

module.exports = router;
