import User from "../models/User.js";
import Ranking from "../models/Ranking.js";
import Purchase from "../models/Purchase.js";
import Participation from "../models/Participation.js";

const createPurchase = async (purchaseData, userId) => {
    if (new Date(purchaseData.prazo) < new Date()) {
        throw new Error("The deadline cannot be a date in the past");
    }

    const newPurchase = await Purchase.create({
        ...purchaseData,
        quantidadeAtual: 0,
        status: "active",
        criadoPor: userId,
    });

    return newPurchase;
};

const listActivePurchases = async () => {
    return await Purchase.find({ status: "active" });
};

const joinPurchase = async (purchaseId, userId, quantidade) => {
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
        throw new Error("Purchase not found");
    }

    if (purchase.status !== "active" && purchase.status !== "goal_reached") {
        throw new Error("This purchase no longer accepts new sign-ups");
    }

    purchase.quantidadeAtual += quantidade;

    if (
        purchase.quantidadeAtual >= purchase.quantidadeMinima &&
        purchase.status === "active"
    ) {
        purchase.status = "goal_reached";
    }

    await purchase.save();

    return { message: "Participation confirmed and payment made" };
};

const leavePurchase = async (purchaseId, userId) => {
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
        throw new Error("Purchase not found");
    }

    if (purchase.status !== "active") {
        throw new Error(
            "Participation cannot be cancelled once the goal has been reached or the purchase has closed"
        );
    }

    return { message: "Participation successfully cancelled" };
};

const editPurchase = async (purchaseId, updateData) => {
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
        throw new Error("Purchase not found");
    }

    Object.assign(purchase, updateData);

    await purchase.save();

    return purchase;
};

const cancelPurchase = async (purchaseId) => {
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
        throw new Error("Purchase not found");
    }

    purchase.status = "cancelled";

    await purchase.save();

    return purchase;
};

export default {
    createPurchase,
    listActivePurchases,
    joinPurchase,
    leavePurchase,
    editPurchase,
    cancelPurchase,
};