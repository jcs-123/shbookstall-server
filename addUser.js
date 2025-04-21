import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config(); // Load environment variables

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log("✅ Connected to MongoDB");

        // Check if the user already exists
        const existingUser = await User.findOne({ email: "accountant@example.com" });
        if (existingUser) {
            console.log("⚠️ User already exists.");
        } else {
            // Hash the password
            const hashedPassword = await bcrypt.hash("accountant123", 10);

            // Create a new accountant user
            await User.create({
                username: "Accountant",
                email: "accountant@example.com",
                password: hashedPassword,
                role: "accountant"
            });

            console.log("✅ Accountant User Created");
        }
        mongoose.connection.close();
    })
    .catch(err => console.error("❌ Error connecting to MongoDB:", err));
    
