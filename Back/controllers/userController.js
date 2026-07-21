import userService from "../services/userService.js";
import Participation from "../models/Participation.js";

const getMe = async (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const user = await userService.updateUserProfile(req.user._id, req.body);    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const history = await Participation.find({ userId: userId }).populate("purchaseId");

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const listUsers = async (req, res, next) => {
  try {
    const users = await userService.listAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await userService.toggleUserStatus(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export default {
  getMe,
  updateMe,
  getHistory,
  listUsers,
  toggleUserStatus
};
