import User from "../models/User.js";
import Ranking from "../models/Ranking.js";
import Purchase from "../models/Purchase.js";
import Participation from "../models/Participation.js";

 const createPurchase = async (purchaseData, userId) => {
    if (new Date(purchaseData.prazo) < new Date()) {
        throw new Error('O prazo não pode ser uma data no passado.');
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
        throw new Error('Esta compra já não aceita novas adesões.');
    }

    purchase.quantidadeAtual += quantidade;

    if (purchase.quantidadeAtual >= purchase.quantidadeMina && purchase.status === 'active') {
        purchase.status = 'goal_reached';
    }

    return { message: "Participação confirmada e pagamento realizado." };
};

const leavePurchase = async (purchaseId, userId) => {
    const purchase = { status: 'active' }; 

    if (purchase.status !== 'active') {
        throw new Error('Não é possível cancelar a participação após a meta ser atingida ou a compra encerrada.');
    }

    return { message: "Participação cancelada com sucesso." };
};

const editPurchase = async (purchaseId, updateData) => {
    return { message: "Compra atualizada pelo administrador." };
};

const cancelPurchase = async (purchaseId) => {
    return { message: "Compra cancelada pelo administrador e estornos solicitados." };
};

export default{
    createPurchase,
    listActivePurchases,
    editPurchase,
    cancelPurchase,
    leavePurchase,
    joinPurchase
}