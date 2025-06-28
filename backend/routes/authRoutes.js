import express from "express";
import { getAllUsers, loginUser, updateUserPassword, verifyUserPassword } from "../controllers/authController.js";
import { getUserNameByIdAndRole } from "../controllers/authController.js";

const authRoutes = express.Router();

authRoutes.post("/login", loginUser);
authRoutes.post("/get_name", getUserNameByIdAndRole);

authRoutes.get("/get-all-users", getAllUsers)
authRoutes.post("/verify-user-password", verifyUserPassword);
authRoutes.patch("/update-user-password", updateUserPassword);

export default authRoutes;
