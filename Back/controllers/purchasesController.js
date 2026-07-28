import purchasesService from "../services/purchasesService.js";
import Purchase from "../models/Purchase.js";
import Ranking from "../models/Ranking.js";
import xml2js from "xml2js";

const getPurchase = async (req, res) => {
    try {
        const condoId = req.user?.condoId;
        const role = req.user?.role;
        const purchases = await purchasesService.listActivePurchases(condoId, role);
        res.status(200).json(purchases);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const create = async (req, res) => {
    try {
        const purchaseData = req.body; 
        const userId = req.user.id;
        const condoId = req.user.role === 'SUPER_ADMIN' ? (req.body.condoId || req.user.condoId) : req.user.condoId;

        const newPurchase = await purchasesService.createPurchase(
            purchaseData,
            userId,
            condoId
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
            if (req.user.role !== 'SUPER_ADMIN' && req.user.condoId && purchase.condoId.toString() !== req.user.condoId.toString()) {
                return res.status(400).json({ error: "Acesso negado a compras de outro condomínio" });
            }
            res.status(200).json(purchase);
        } else {
            res.status(400).json({ error: "Compra não encontrada" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const update = async (req, res) => {
    try {
        const purchase = await purchasesService.editPurchase(
            req.params.id,
            req.body,
            req.user.condoId,
            req.user.role
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
        const purchase = await purchasesService.cancelPurchase(
            req.params.id,
            req.user.condoId,
            req.user.role
        );
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
                amount,
                req.user.condoId,
                req.user.role
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
            userId,
            req.user.condoId,
            req.user.role
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

const exportAcervoXML = async (req, res) => {
    try {
        const filter = (req.user?.role === 'SUPER_ADMIN' || !req.user?.condoId)
            ? {}
            : { condoId: req.user.condoId };

        const purchases = await Purchase.find(filter).lean();

        const plainPurchases = purchases.map((p) => ({
            id: p._id ? p._id.toString() : "",
            product: p.product || "",
            description: p.description || "",
            unitPrice: p.unitPrice || 0,
            minimumQuantity: p.minimumQuantity || 0,
            currentQuantity: p.currentQuantity || 0,
            term: p.term ? new Date(p.term).toISOString() : "",
            status: p.status || "",
            condoId: p.condoId ? p.condoId.toString() : "",
            createdBy: p.createdBy ? p.createdBy.toString() : "",
            createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : "",
            updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : ""
        }));

        const builder = new xml2js.Builder({ rootName: "acervo" });
        const xml = builder.buildObject({ compra: plainPurchases });

        res.setHeader("Content-Type", "application/xml");
        res.setHeader("Content-Disposition", "attachment; filename=acervo-compras.xml");
        return res.status(200).send(xml);
    } catch (error) {
        return res.status(500).json({ error: error.message });
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
    rankJoin,
    exportAcervoXML
};