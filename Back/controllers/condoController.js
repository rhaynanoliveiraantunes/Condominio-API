import condoService from "../services/condoService.js";

const create = async (req, res) => {
    try {
        if (req.user && req.user.role === 'SUPER_ADMIN') {
            const condo = await condoService.createCondo(req.body);
            return res.status(201).json({
                message: "Condomínio cadastrado com sucesso",
                condo: {
                    _id: condo._id,
                    name: condo.name,
                    address: condo.address,
                    createdAt: condo.createdAt
                }
            });
        } else {
            return res.status(400).json({ error: "Apenas SUPER_ADMIN pode cadastrar condomínios." });
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const list = async (req, res) => {
    try {
        const list = await condoService.listCondos();
        return res.status(200).json(list);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export default {
    create,
    list
};
