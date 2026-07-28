import express from "express";
import condominioController from "../controllers/condominioController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", condominioController.list);
router.post("/", authMiddleware, condominioController.create);

export default router;
