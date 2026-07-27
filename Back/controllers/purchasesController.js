import purchasesService from "../services/purchasesService.js";
import Purchase from "../models/Purchase.js";
import Ranking from "../models/Ranking.js";

const getPurchase = async (req, res) => {
    try {
        const purchases = await purchasesService.listActivePurchases();
        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const create = async (req, res) => {
    try {
        const purchaseData = req.body; 
        const userId = req.user.id;

        const newPurchase = await purchasesService.createPurchase(
            purchaseData,
            userId
        );
        res.status(201).json(newPurchase);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getId = async (req, res) => {
    try {
        const purchase = await Purchase.findById(req.params.id);
        if (purchase) {
            res.status(200).json(purchase);
        } else {
            res.status(400).json({ error: "Purchase not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    try {
        const purchase = await purchasesService.editPurchase(
            req.params.id,
            req.body
        );

        if (purchase) {
            res.status(200).json({
                message: "Compra atualizada com sucesso",
                purchase,
            });
        } else {
            res.status(400).json({ error: "Não foi possível atualizar a compra" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const cancel = async (req, res) => {
    try {
        const purchase = await purchasesService.cancelPurchase(req.params.id);
        if (purchase) {
            res.status(200).json({
                message: "Compra cancelada com sucesso", 
                purchase
            });
        } else {
            res.status(400).json({ error: "Não foi possível cancelar a compra" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const joinPur = async (req, res) => {
    try {
        const purchaseId = req.params.id;
        const userId = req.user.id;
        const { amount } = req.body;

        if (amount && amount > 0) {
            const result = await purchasesService.joinPurchase(
                purchaseId,
                userId,
                amount
            );

            res.status(200).json(result);
        } else {
            return res.status(400).json({
                error: "Quantidade inválida",
            });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteJoin = async (req, res) => {
    try {
        const purchaseId = req.params.id;
        const userId = req.user.id;

        const result = await purchasesService.leavePurchase(
            purchaseId,
            userId
        );

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const rankJoin = async (req, res) => {
    try {
        const ranking = await Ranking.find().sort({ totalOrders: -1 });
        res.status(200).json(ranking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default {
    getPurchase,
    create,
    getId,
    update,
    cancel,
    joinPur,
    deleteJoin,
    rankJoin
};