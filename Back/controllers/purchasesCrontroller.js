import * as purchaseService from '../services/purchaseService.js';
import Purchase from '../models/Purchase.js';

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

            const novaCompra = await purchaseService.createPurchase(purchaseData, userId);
            
            res.status(201).json(novaCompra);
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
                return res.status(400).json({ error: 'Quantidade inválida.' });
            }

            const resultado = await purchaseService.joinPurchase(purchaseId, userId, quantidade);
            res.status(200).json(resultado);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteJoin(req, res) {
        try {
            const purchaseId = req.params.id;
            const userId = req.user.id;

            const resultado = await purchaseService.leavePurchase(purchaseId, userId);
            res.status(200).json(resultado);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async rankJoin(req, res) {
        try {
            const ranking = await Purchase.aggregate([
                { $group: { _id: "$produto", totalPedidos: { $sum: 1 } } },
                { $sort: { totalPedidos: -1 } }
            ]);
            
            res.status(200).json(ranking);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

export default purchasesController;