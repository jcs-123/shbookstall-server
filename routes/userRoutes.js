// routes/userRoutes.js
import express from "express";
import { getUsers, addUser, updateUser, deleteUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUsers);
router.post("/", addUser); // ✅ POST /api/users
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
