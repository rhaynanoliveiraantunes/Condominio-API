import express from "express";
import purcahsesController from "../controllers/purcahsesController.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import adminController from "../controllers/adminController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/',authMiddleware, purcahsesController.getMe);
router.post('/',authMiddleware, purcahsesController.getPost);
router.get('/:id',authMiddleware, purcahsesController, adminMiddleware ,adminController.getId);
router.put('/:id', authMiddleware, purcahsesController, adminMiddleware ,adminController.putId);
router.patch('/:id/cancel',authMiddleware, purcahsesController, adminController.cancelPur);
router.post('/:id/join', authMiddleware, purcahsesController.joinPur );
router.delete('/:id/join', authMiddleware, purcahsesController.deleteJoin);
router.get('/ranking', authMiddleware, purcahsesController.rankJoin);


export default router;