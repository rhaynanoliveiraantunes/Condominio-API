import purchasesService from"../services/purchasesService.js";
import Purchase from "../models/Purchase.js";

const purchasesController = {
    async getPurchase(req, res) {
        try {
            const purchases = await purchasesService.listActivePurchases();
            res.status(200).json(purchases);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

const create = async (req, res) => {
    try {
        const purchaseDate = req.body;
        const userId = req.user.id;

            const newPurchase = await purchasesService.createPurchase(
                purchaseDate,
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

            res.status(200).json(purchase);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async update(req, res) {
        try {
            const purchase = await purchasesService.editPurchase(
                req.params.id,
                req.body
            );

            res.status(200).json({
                message: "Purchase updated successfully",
                purchase,
            });
        }

    async cancel(req, res) {
        try {
            const purchase = await purchasesService.cancelPurchase(
                req.params.id
            );

        if (!amount || amount <= 0) {
            return res.status(400).json({
                error: "Invalid quantity",
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async joinPur(req, res) {
        try {
            const purchaseId = req.params.id;
            const userId = req.user.id;
            const { amount } = req.body;

            if (!amount || amount <= 0) {
                return res.status(400).json({
                    error: "Invalid quantity",
                });
            }

            const result = await purchasesService.joinPurchase(
                purchaseId,
                userId,
                amount

            );

            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }

        const result = await purchaseService.joinPurchase(
            purchaseId,
            userId,
            amount
        );

            const result = await purchasesService.leavePurchase(
                purchaseId,
                userId
            );

const deleteJoin = async (req, res) => {
    try {
        const purchaseId = req.params.id;
        const userId = req.user.id;

        const result = await purchaseService.leavePurchase(
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
        const ranking = await Purchase.aggregate([
            {
                $group: {
                    _id: "$product",
                    totalPedidos: { $sum: 1 },
                },
            },
            {
                $sort: {
                    totalPedidos: -1,
                },
            },
        ]);

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