import User from "../models/User.js";
import Ranking from "../models/Ranking.js";
import Purchase from "../models/Purchase.js";
import Participation from "../models/Participation.js";

const createPurchase = async (purchaseData, userId) => {
    if (new Date(purchaseData.term) < new Date()) {
        throw new Error("The deadline cannot be a date in the past");
    }

    const newPurchase = await Purchase.create({
        ...purchaseData,
        currentQuantity: 0,
        status: "active",
        createdBy: userId,
    });

    return newPurchase;
};

const listActivePurchases = async () => {
    const activePurchases = await Purchase.find({ status: "active" });
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

    return await Purchase.find({ status: "active" });
};

const joinPurchase = async (purchaseId, userId, amount) => {
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
        throw new Error("Purchase not found");
    }

    if (purchase.status !== "active") {
        throw new Error("This purchase no longer accepts new sign-ups");
    }

    if (new Date(purchase.term) <= new Date()) {
        throw new Error("The deadline for this purchase has passed");
    }
    
    purchase.currentQuantity += amount;
    await purchase.save();

    await Participation.create({
        purchaseId: purchase._id,
        userId: userId,
        amount: amount,
        paid: true 
    });

    await Ranking.findOneAndUpdate(
        { product: purchase.product },
        { $inc: { totalOrders: amount } },
        { upsert: true, new: true }
    );

    return { message: "Participation confirmed and payment made" };
};

const leavePurchase = async (purchaseId, userId) => {
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
        throw new Error("Purchase not found");
    }

    if (purchase.status !== "active") {
        throw new Error(
            "Participation cannot be cancelled once the purchase has closed"
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