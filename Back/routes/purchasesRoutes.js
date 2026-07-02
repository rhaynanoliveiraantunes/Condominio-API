import express from "express";
import purchasesController from "../controllers/purchasesController.js"; 
import adminMiddleware from "../middlewares/adminMiddleware.js";
import adminController from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/', authMiddleware, purchasesController.getPurchase);
router.post('/', authMiddleware, purchasesController.create);
router.post('/:id/join', authMiddleware, purchasesController.joinPur);
router.delete('/:id/join', authMiddleware, purchasesController.deleteJoin);
router.get('/ranking', authMiddleware, purchasesController.rankJoin);

router.get('/:id', authMiddleware, adminMiddleware, adminController.getId);
router.put('/:id', authMiddleware, adminMiddleware, adminController.putId);
router.patch('/:id/cancel', authMiddleware, adminMiddleware, adminController.cancelPur);

export default router;