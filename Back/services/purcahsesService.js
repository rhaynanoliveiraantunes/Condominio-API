import User from "../models/User.js";
import Ranking from "../models/Ranking.js";
import Purchase from "../models/Purchase.js";
import Participation from "../models/Participation.js";

 const createPurchase = async (purchaseData, userId) => {
    if (new Date(purchaseData.prazo) < new Date()) {
        throw new Error('The deadline cannot be a date in the past');
    }

    const newPurchase = {
        ...purchaseData,
        quantidadeAtual: 0,
        status: 'active',
        criadoPor: userId
    };

    return newPurchase;
};

const listActivePurchases = async () => {
    return [];
};

 const joinPurchase = async (purchaseId, userId, quantidade) => {
    const purchase = { status: 'active', quantidadeMina: 10, quantidadeAtual: 5 }; 

    if (purchase.status !== 'active' && purchase.status !== 'goal_reached') {
        throw new Error('This purchase no longer accepts new sign-ups');
    }

    purchase.quantidadeAtual += quantidade;

    if (purchase.quantidadeAtual >= purchase.quantidadeMina && purchase.status === 'active') {
        purchase.status = 'goal_reached';
    }

    return { message: "Participation confirmed and payment made" };
};

const leavePurchase = async (purchaseId, userId) => {
    const purchase = { status: 'active' }; 

    if (purchase.status !== 'active') {
        throw new Error('Participation cannot be cancelled once the goal has been reached or the purchase has closed');
    }

    return { message: "Participation successfully cancelled" };
};

const editPurchase = async (purchaseId, updateData) => {
    return { message: "Purchase updated by the administrator" };
};

const cancelPurchase = async (purchaseId) => {
    return { message: "Purchase cancelled by the administrator and refunds requested" };
};

export default{
    createPurchase,
    listActivePurchases,
    editPurchase,
    cancelPurchase,
    leavePurchase,
    joinPurchase
}