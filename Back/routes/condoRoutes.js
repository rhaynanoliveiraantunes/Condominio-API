import express from "express";
import condoController from "../controllers/condoController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get("/", condoController.list);
router.post("/", authMiddleware, roleMiddleware("SUPER_ADMIN"), condoController.create);

export default router;
