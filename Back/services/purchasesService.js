import User from "../models/User.js";
import Ranking from "../models/Ranking.js";
import Purchase from "../models/Purchase.js";
import Participation from "../models/Participation.js";

const createPurchase = async (purchaseData, userId, condoId) => {
    if (!condoId) {
        throw new Error("O condomínio é obrigatório para cadastrar uma compra.");
    }
    if (new Date(purchaseData.term) >= new Date()) {
        const newPurchase = await Purchase.create({
            ...purchaseData,
            condoId,
            currentQuantity: 0,
            status: "OPEN",
            createdBy: userId,
            syndicPixKey: purchaseData.syndicPixKey || "sindico@condominiobuy.com.br"
        });

        return newPurchase;
    } else {
        throw new Error("O prazo não pode ser uma data no passado.");
    }
};

const listActivePurchases = async (condoId, userRole) => {
    const filter = (userRole === 'SUPER_ADMIN' || !condoId) 
        ? { status: { $in: ["OPEN", "MINIMUM_REACHED", "active", "goal_reached"] } } 
        : { status: { $in: ["OPEN", "MINIMUM_REACHED", "active", "goal_reached"] }, condoId };

    const activePurchases = await Purchase.find(filter);
    const now = new Date();

    for (let purchase of activePurchases) {
        if (new Date(purchase.term) <= now) {
            if (purchase.currentQuantity >= purchase.minimumQuantity) {
                purchase.status = "MINIMUM_REACHED";
            } else {
                purchase.status = "CANCELLED";
                // Trigger auto refund for expired failed purchases
                await Participation.updateMany(
                    { purchaseId: purchase._id, paymentStatus: { $in: ["CONFIRMED", "PAID_VERIFYING"] } },
                    { paymentStatus: "REFUND_PENDING" }
                );
            }
            await purchase.save();
        }
    }

    return await Purchase.find(filter);
};

const participatePurchase = async (purchaseId, userId, amount, userCondoId, userRole) => {
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
        throw new Error("Compra não encontrada.");
    }

    if (userRole !== 'SUPER_ADMIN' && userCondoId && purchase.condoId.toString() !== userCondoId.toString()) {
        throw new Error("Acesso negado. Esta compra pertence a outro condomínio.");
    }

    if (["OPEN", "MINIMUM_REACHED", "active"].includes(purchase.status)) {
        if (new Date(purchase.term) > new Date()) {
            let participation = await Participation.findOne({ purchaseId, userId });
            
            if (participation) {
                participation.amount = amount;
                participation.paymentStatus = "PENDING_PIX";
                await participation.save();
            } else {
                participation = await Participation.create({
                    purchaseId,
                    userId,
                    amount,
                    paid: false,
                    paymentStatus: "PENDING_PIX"
                });
            }

            return {
                message: "Participação registrada. Faça o PIX e confirme o pagamento.",
                participation,
                syndicPixKey: purchase.syndicPixKey,
                totalAmount: amount * purchase.unitPrice
            };
        } else {
            throw new Error("O prazo para esta compra já expirou.");
        }
    } else {
        throw new Error("Esta compra não aceita mais novas adesões.");
    }
};

const markPaid = async (participationId, userId, receiptDetails, userPixKey) => {
    const participation = await Participation.findById(participationId);
    if (!participation) {
        throw new Error("Participação não encontrada.");
    }

    if (participation.userId.toString() !== userId.toString()) {
        throw new Error("Acesso negado.");
    }

    participation.paymentStatus = "PAID_VERIFYING";
    if (receiptDetails) participation.receiptDetails = receiptDetails;
    if (userPixKey) participation.userPixKey = userPixKey;

    await participation.save();

    return {
        message: "Aviso de pagamento enviado! Aguardando confirmação do síndico.",
        participation
    };
};

const confirmPayment = async (participationId, currentUser) => {
    const participation = await Participation.findById(participationId);
    if (!participation) {
        throw new Error("Participação não encontrada.");
    }

    const purchase = await Purchase.findById(participation.purchaseId);
    if (!purchase) {
        throw new Error("Compra relacionada não encontrada.");
    }

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.condoId && purchase.condoId.toString() !== currentUser.condoId.toString()) {
        throw new Error("Acesso negado. Esta compra pertence a outro condomínio.");
    }

    participation.paymentStatus = "CONFIRMED";
    participation.paid = true;
    await participation.save();

    purchase.currentQuantity += participation.amount;
    if (purchase.currentQuantity >= purchase.minimumQuantity && purchase.status === "OPEN") {
        purchase.status = "MINIMUM_REACHED";
    }
    await purchase.save();

    await Ranking.syncIndexes();
    await Ranking.findOneAndUpdate(
        { product: purchase.product },
        { $inc: { totalOrders: participation.amount } },
        { upsert: true, new: true }
    );

    return {
        message: "Pagamento via PIX verificado e confirmado pelo síndico com sucesso!",
        participation,
        purchase
    };
};

const cancelPurchaseWithRefunds = async (purchaseId, userCondoId, userRole) => {
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
        throw new Error("Compra não encontrada.");
    }

    if (userRole !== 'SUPER_ADMIN' && userCondoId && purchase.condoId.toString() !== userCondoId.toString()) {
        throw new Error("Acesso negado. Esta compra pertence a outro condomínio.");
    }

    purchase.status = "CANCELLED";
    await purchase.save();

    // Set confirmed / verifying participations to REFUND_PENDING
    await Participation.updateMany(
        { purchaseId, paymentStatus: { $in: ["CONFIRMED", "PAID_VERIFYING"] } },
        { paymentStatus: "REFUND_PENDING" }
    );

    return {
        message: "Compra cancelada com sucesso. Participações elegíveis foram movidas para Reembolso Pendente.",
        purchase
    };
};

const refundParticipation = async (participationId, currentUser) => {
    const participation = await Participation.findById(participationId);
    if (!participation) {
        throw new Error("Participação não encontrada.");
    }

    const purchase = await Purchase.findById(participation.purchaseId);
    if (!purchase) {
        throw new Error("Compra não encontrada.");
    }

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.condoId && purchase.condoId.toString() !== currentUser.condoId.toString()) {
        throw new Error("Acesso negado.");
    }

    participation.paymentStatus = "REFUNDED";
    await participation.save();

    return {
        message: "Reembolso marcado como concluído com sucesso!",
        participation
    };
};

const listParticipants = async (purchaseId, currentUser) => {
    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
        throw new Error("Compra não encontrada.");
    }

    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.condoId && purchase.condoId.toString() !== currentUser.condoId.toString()) {
        throw new Error("Acesso negado.");
    }

    const participations = await Participation.find({ purchaseId })
        .populate("userId", "name apartment email")
        .sort({ createdAt: -1 });

    return participations;
};

const joinPurchase = async (purchaseId, userId, amount, userCondoId, userRole) => {
    return await participatePurchase(purchaseId, userId, amount, userCondoId, userRole);
};

const leavePurchase = async (purchaseId, userId, userCondoId, userRole) => {
    const participation = await Participation.findOne({ purchaseId, userId });
    if (!participation) {
        throw new Error("Participação não encontrada.");
    }
    await Participation.findByIdAndDelete(participation._id);
    return { message: "Participação cancelada com sucesso." };
};

const editPurchase = async (purchaseId, updateData, userCondoId, userRole) => {
    const purchase = await Purchase.findById(purchaseId);

    if (purchase) {
        if (userRole !== 'SUPER_ADMIN' && userCondoId && purchase.condoId.toString() !== userCondoId.toString()) {
            throw new Error("Acesso negado. Esta compra pertence a outro condomínio.");
        }

        Object.assign(purchase, updateData);
        await purchase.save();

        return purchase;
    } else {
        throw new Error("Compra não encontrada.");
    }
};

const cancelPurchase = async (purchaseId, userCondoId, userRole) => {
    return await cancelPurchaseWithRefunds(purchaseId, userCondoId, userRole);
};

export default {
    createPurchase,
    listActivePurchases,
    participatePurchase,
    markPaid,
    confirmPayment,
    cancelPurchaseWithRefunds,
    refundParticipation,
    listParticipants,
    joinPurchase,
    leavePurchase,
    editPurchase,
    cancelPurchase,
};