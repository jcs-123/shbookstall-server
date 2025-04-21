import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        const existingAdmin = await User.findOne({ email: "admin@example.com" });
        if (existingAdmin) {
            console.log("⚠️ Admin already exists.");
        } else {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            await User.create({
                username: "Admin",
                email: "admin@example.com",
                password: hashedPassword,
                role: "admin"
            });
            console.log("✅ Admin User Created");
        }
        mongoose.connection.close();
    })
    .catch(err => console.error("❌ MongoDB Error:", err));
