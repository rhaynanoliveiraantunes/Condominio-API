import User from "../models/User.js";

const listUsers = async () => {
    return await User.find().select("-password");
};

const toggleUserStatus = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    user.ativo = !user.ativo;

    await user.save();

    return user;
};

export default {
    listUsers,
    toggleUserStatus,
};