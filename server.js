import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";


dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// ✅ Import Routes
import authRoutes from "./routes/auth.js";
import stockRoutes from "./routes/stock.js";

app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);
 

import billRoutes from "./routes/billRoutes.js";
app.use("/api/bills", billRoutes);


import damageReturnRoutes from "./routes/damageReturnRoutes.js";
app.use("/api/damage-return", damageReturnRoutes);

import daybookRoutes from './routes/daybook.js';
app.use("/api/daybook", daybookRoutes);


import dashboardRoutes from "./routes/dashboardRoute.js";
app.use("/api/dashboard", dashboardRoutes);

import auditLogRoutes from './routes/auditLogRoutes.js';
app.use('/api/audit-logs', auditLogRoutes); 


const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Database Connected"))
  .catch(err => console.log("❌ DB Error:", err));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
