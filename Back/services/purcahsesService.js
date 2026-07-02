import Purchase from '../models/Purchase.js';

export const createPurchase = async (purchaseData, userId) => {
    if (new Date(purchaseData.prazo) < new Date()) {
        throw new Error('O prazo não pode ser uma data no passado.');
    }

    const newPurchase = await Purchase.create({
        ...purchaseData,
        quantidadeAtual: 0,
        status: 'active',
        criadoPor: userId
    });

    return newPurchase;
};

export const listActivePurchases = async () => {
    return await Purchase.find({ status: 'active' });
};

export const joinPurchase = async (purchaseId, userId, quantidade) => {
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
        throw new Error('Compra não encontrada.');
    }

    if (purchase.status !== 'active' && purchase.status !== 'goal_reached') {
        throw new Error('Esta compra já não aceita novas adesões.');
    }

    purchase.quantidadeAtual += quantidade;

    if (purchase.quantidadeAtual >= purchase.quantidadeMinima && purchase.status === 'active') {
        purchase.status = 'goal_reached';
    }

    await purchase.save();

    return { message: "Participação confirmada e pagamento realizado." };
};

export const leavePurchase = async (purchaseId, userId) => {
    const purchase = await Purchase.findById(purchaseId);

    if (!purchase) {
        throw new Error('Compra não encontrada.');
    }

    if (purchase.status !== 'active') {
        throw new Error('Não é possível cancelar a participação após a meta ser atingida ou a compra encerrada.');
    }

    return { message: "Participação cancelada com sucesso." };
};

export const editPurchase = async (purchaseId, updateData) => {
    const purchase = await Purchase.findByIdAndUpdate(purchaseId, updateData, { new: true });
    return { message: "Compra atualizada pelo administrador.", purchase };
};

export const cancelPurchase = async (purchaseId) => {
    const purchase = await Purchase.findByIdAndUpdate(purchaseId, { status: 'cancelled' }, { new: true });
    return { message: "Compra cancelada pelo administrador e estornos solicitados.", purchase };
};