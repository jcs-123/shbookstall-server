import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js"; // Adjust path if needed

dotenv.config();

const createCashierUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

        const existingUser = await User.findOne({ email: "cashier@example.com" });
        if (existingUser) {
            console.log("⚠️ Cashier already exists.");
        } else {
            const hashedPassword = await bcrypt.hash("cashier123", 10);
            await User.create({
                username: "Cashier",
                email: "cashier@example.com",
                password: hashedPassword,
                role: "billing"
            });
            console.log("✅ Cashier User Created Successfully!");
        }
        mongoose.connection.close();
    } catch (error) {
        console.log("❌ Error:", error);
    }
};

createCashierUser();
