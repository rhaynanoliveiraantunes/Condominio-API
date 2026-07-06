import userService from "../services/userService.js";

const getMe = async (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const user = await userService.updateMe(req.user._id, req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const users = await userService.listUsers();
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
  listUsers,
  toggleUserStatus,
};
