import * as purchaseService from "../services/purchasesService.js";
import Purchase from "../models/Purchase.js";

const purchasesController = {
    async getPurchase(req, res) {
        try {
            const purchases = await purchaseService.listActivePurchases();
            res.status(200).json(purchases);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async create(req, res) {
        try {
            const purchaseData = req.body;
            const userId = req.user.id;

            const newPurchase = await purchaseService.createPurchase(
                purchaseData,
                userId
            );

            res.status(201).json(newPurchase);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getId(req, res) {
        try {
            const purchase = await Purchase.findById(req.params.id);

            if (!purchase) {
                return res.status(404).json({
                    error: "Purchase not found",
                });
            }

            res.status(200).json(purchase);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async update(req, res) {
        try {
            const purchase = await purchaseService.editPurchase(
                req.params.id,
                req.body
            );

            res.status(200).json({
                message: "Purchase updated successfully",
                purchase,
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async cancel(req, res) {
        try {
            const purchase = await purchaseService.cancelPurchase(
                req.params.id
            );

            res.status(200).json({
                message: "Purchase cancelled successfully",
                purchase,
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async joinPur(req, res) {
        try {
            const purchaseId = req.params.id;
            const userId = req.user.id;
            const { quantidade } = req.body;

            if (!quantidade || quantidade <= 0) {
                return res.status(400).json({
                    error: "Invalid quantity",
                });
            }

            const result = await purchaseService.joinPurchase(
                purchaseId,
                userId,
                quantidade
            );

            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteJoin(req, res) {
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
    },

    async rankJoin(req, res) {
        try {
            const ranking = await Purchase.aggregate([
                {
                    $group: {
                        _id: "$produto",
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
    },
};

export default purchasesController;