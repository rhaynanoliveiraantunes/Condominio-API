import User from "../models/User.js";

const listUsers = async (currentUser) => {
    if (!currentUser) {
        return [];
    }

    if (currentUser.role === 'SUPER_ADMIN') {
        return await User.find().select("-password").populate("condoId", "name address");
    }

    if (!currentUser.condoId) {
        return [];
    }

    return await User.find({ condoId: currentUser.condoId }).select("-password").populate("condoId", "name address");
};

const toggleUserStatus = async (userId, currentUser) => {
    const user = await User.findById(userId);

    if (user) {
        if (currentUser.role !== 'SUPER_ADMIN' && currentUser.condoId && user.condoId && user.condoId.toString() !== currentUser.condoId.toString()) {
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