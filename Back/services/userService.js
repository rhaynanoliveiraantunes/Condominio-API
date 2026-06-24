export const getUserProfile = async (userId) => {
    return { id: userId, message: "Dados do perfil retornados." };
};

export const updateUserProfile = async (userId, updateData) => {
    delete updateData.role;
    delete updateData.ativo;

    return { message: "Perfil updated com sucesso." };
};

export const listAllUsers = async () => {
    return [];
};

export const toggleUserStatus = async (userId, isAtivo) => {
    return { message: `Status do usuário atualizado para ${isAtivo}.` };
};