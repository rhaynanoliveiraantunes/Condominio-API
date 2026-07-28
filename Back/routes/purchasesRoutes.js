import express from "express";
import purchasesController from "../controllers/purchasesController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/exportar-acervo", purchasesController.exportAcervoXML);
router.get("/ranking", authMiddleware, purchasesController.rankJoin);

router.get("/", authMiddleware, purchasesController.getPurchase);
router.post("/", authMiddleware, adminMiddleware, purchasesController.create);

router.get("/:id", authMiddleware, purchasesController.getId);
router.put("/:id", authMiddleware, adminMiddleware, purchasesController.update);
router.patch("/:id/cancel", authMiddleware, adminMiddleware, purchasesController.cancel);

router.post("/:id/participate", authMiddleware, purchasesController.participate);
router.post("/:id/join", authMiddleware, purchasesController.participate);
router.delete("/:id/join", authMiddleware, purchasesController.deleteJoin);
router.get("/:id/participants", authMiddleware, adminMiddleware, purchasesController.getParticipants);

export default router;