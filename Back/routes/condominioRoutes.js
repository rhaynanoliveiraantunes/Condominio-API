import express from "express";
import condominioController from "../controllers/condominioController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", condominioController.list);
router.post("/", authMiddleware, roleMiddleware("SUPER_ADMIN"), condominioController.create);

export default router;
