import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: { type: String, enum: ["accountant", "billing", "admin"] },
    
});

export default mongoose.model("User", UserSchema);
