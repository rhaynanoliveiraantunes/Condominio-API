import User from "../models/User.js";

const listUsers = async (currentUser) => {
    if (!currentUser) {
        return [];
    }

    if (currentUser.role === 'SUPER_ADMIN') {
        return await User.find().select("-password").populate("condominioId", "name address");
    }

    if (!currentUser.condominioId) {
        return [];
    }

    return await User.find({ condominioId: currentUser.condominioId }).select("-password").populate("condominioId", "name address");
};

const toggleUserStatus = async (userId, currentUser) => {
    const user = await User.findById(userId);

    if (user) {
        if (currentUser.role !== 'SUPER_ADMIN' && currentUser.condominioId && user.condominioId && user.condominioId.toString() !== currentUser.condominioId.toString()) {
            throw new Error("Acesso negado. Você só pode gerenciar moradores do seu próprio condomínio.");
        }

        user.active = !user.active;
        await user.save();
        return user;
    } else {
        throw new Error("Usuário não encontrado.");
    }
};

export default {
    listUsers,
    toggleUserStatus,
};