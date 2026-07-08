import adminService from "../services/adminService.js";


const listUsers = async (req, res) => {
    try {
        const users = await adminService.listUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const user = await adminService.toggleUserStatus(req.params.id);

        res.status(200).json({
            message: "User status updated successfully",
            user,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export default { listUsers, toggleUserStatus };