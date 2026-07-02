import express from "express";
import purchasesController from "../controllers/purchasesController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();


router.get("/", authMiddleware, purchasesController.getPurchase);
router.post("/", authMiddleware, purchasesController.create);


router.get("/ranking", authMiddleware, purchasesController.rankJoin);


router.get("/:id", authMiddleware, purchasesController.getId);


router.put("/:id", authMiddleware, adminMiddleware, purchasesController.update);
router.patch("/:id/cancel", authMiddleware, adminMiddleware, purchasesController.cancel);


router.post("/:id/join", authMiddleware, purchasesController.joinPur);
router.delete("/:id/join", authMiddleware, purchasesController.deleteJoin);

export default router;