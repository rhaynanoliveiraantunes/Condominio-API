
import User from "../models/User.js";
import Ranking from "../models/Ranking.js";
import Purchase from "../models/Purchase.js";
import Participation from "../models/Participation.js";

 const getUserProfile = async (userId) => {
    return { id: userId, message: "Profile data returned" };
};

const updateUserProfile = async (userId, updateData) => {
    delete updateData.role;
    delete updateData.ativo;

    return { message: "Profile successfully updated" };
};

const listAllUsers = async () => {
    return [];
};

 const toggleUserStatus = async (userId, isAtivo) => {
    return { message: `User status updated to ${isAtivo}.` };
};
export default{
    getUserProfile,
    toggleUserStatus,
    listAllUsers,
    updateUserProfile,

}