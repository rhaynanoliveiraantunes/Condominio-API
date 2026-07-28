import User from "../models/User.js";
import Ranking from "../models/Ranking.js";
import Purchase from "../models/Purchase.js";
import Participation from "../models/Participation.js";

const createPurchase = async (purchaseData, userId, condominioId) => {
    if (!condominioId) {
        throw new Error("O condomínio é obrigatório para cadastrar uma compra.");
    }
    if (new Date(purchaseData.term) >= new Date()) {
        const newPurchase = await Purchase.create({
            ...purchaseData,
            condominioId,
            currentQuantity: 0,
            status: "active",
            createdBy: userId,
        });

        return newPurchase;
    } else {
        throw new Error("O prazo não pode ser uma data no passado.");
    }
};

const listActivePurchases = async (condominioId, userRole) => {
    const filter = (userRole === 'SUPER_ADMIN' || !condominioId) 
        ? { status: "active" } 
        : { status: "active", condominioId };

    const activePurchases = await Purchase.find(filter);
    const now = new Date();

    for (let purchase of activePurchases) {
        if (new Date(purchase.term) <= now) {
            if (purchase.currentQuantity >= purchase.minimumQuantity) {
                purchase.status = "goal_reached";
            } else {
                purchase.status = "cancelled";
            }
            await purchase.save();
        }
    }

    return await Purchase.find(filter);
};

const joinPurchase = async (purchaseId, userId, amount, userCondominioId, userRole) => {
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
        throw new Error("Compra não encontrada.");
    }

    if (userRole !== 'SUPER_ADMIN' && userCondominioId && purchase.condominioId.toString() !== userCondominioId.toString()) {
        throw new Error("Acesso negado. Esta compra pertence a outro condomínio.");
    }

    if (purchase.status === "active") {
        if (new Date(purchase.term) > new Date()) {
            purchase.currentQuantity += amount;
            await purchase.save();

            await Participation.create({
                purchaseId: purchase._id,
                userId: userId,
                amount: amount,
                paid: true 
            });

            await Ranking.syncIndexes();

            await Ranking.findOneAndUpdate(
               { product: purchase.product },
                { $inc: { totalOrders: amount } },
                { upsert: true, new: true }
            );

            return { message: "Participação confirmada e pagamento realizado." };
        } else {
            throw new Error("O prazo para esta compra já expirou.");
        }
    } else {
        throw new Error("Esta compra não aceita mais adesões.");
    }
};

const leavePurchase = async (purchaseId, userId, userCondominioId, userRole) => {
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
        throw new Error("Compra não encontrada.");
    }

    if (userRole !== 'SUPER_ADMIN' && userCondominioId && purchase.condominioId.toString() !== userCondominioId.toString()) {
        throw new Error("Acesso negado. Esta compra pertence a outro condomínio.");
    }

    if (purchase.status === "active") {
        return { message: "Participação cancelada com sucesso." };
    } else {
        throw new Error(
            "A participação não pode ser cancelada após o encerramento da compra."
        );
    }
};

const editPurchase = async (purchaseId, updateData, userCondominioId, userRole) => {
    const purchase = await Purchase.findById(purchaseId);

    if (purchase) {
        if (userRole !== 'SUPER_ADMIN' && userCondominioId && purchase.condominioId.toString() !== userCondominioId.toString()) {
            throw new Error("Acesso negado. Esta compra pertence a outro condomínio.");
        }

        Object.assign(purchase, updateData);
        await purchase.save();

        return purchase;
    } else {
        throw new Error("Compra não encontrada.");
    }
};

const cancelPurchase = async (purchaseId, userCondominioId, userRole) => {
    const purchase = await Purchase.findById(purchaseId);

    if (purchase) {
        if (userRole !== 'SUPER_ADMIN' && userCondominioId && purchase.condominioId.toString() !== userCondominioId.toString()) {
            throw new Error("Acesso negado. Esta compra pertence a outro condomínio.");
        }

        purchase.status = "cancelled";
        await purchase.save();

        return purchase;
    } else {
        throw new Error("Compra não encontrada.");
    }
};

export default {
    createPurchase,
    listActivePurchases,
    joinPurchase,
    leavePurchase,
    editPurchase,
    cancelPurchase,
};