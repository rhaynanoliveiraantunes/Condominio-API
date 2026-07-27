import User from "../models/User.js";

const listUsers = async () => {
    return await User.find().select("-password");
};

const toggleUserStatus = async (userId) => {
    const user = await User.findById(userId);

    if (user) {
        user.active = !user.active;
        await user.save();
        return user;
    } else {
        throw new Error("User not found");
    }
};

export default {
    listUsers,
    toggleUserStatus,
};