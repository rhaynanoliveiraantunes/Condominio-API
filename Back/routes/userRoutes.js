import express from "express";
import userController from "../controllers/userController.js";
import adminController from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, userController.getMe);
router.put("/me", authMiddleware, userController.updateMe);

router.get("/history", authMiddleware, userController.getHistory);

router.get("/admin", authMiddleware, adminController.listUsers);
router.put("/admin/:id", authMiddleware, adminMiddleware, adminController.toggleUserStatus);

export default router;