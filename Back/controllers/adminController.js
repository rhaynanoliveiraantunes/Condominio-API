import adminService from "../services/adminService.js";

const listUsers = async (req, res) => {
    try {
        const users = await adminService.listUsers(req.user);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const user = await adminService.toggleUserStatus(req.params.id, req.user);

        if (user) {
            res.status(200).json({
                message: "Status do usuário atualizado com sucesso",
                user,
            });
        } else {
            res.status(400).json({ error: "Falha ao atualizar status do usuário" });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export default { listUsers, toggleUserStatus };