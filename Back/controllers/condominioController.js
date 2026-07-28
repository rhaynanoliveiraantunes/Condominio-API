import condominioService from "../services/condominioService.js";

const create = async (req, res) => {
    try {
        if (req.user && req.user.role === 'SUPER_ADMIN') {
            const condominio = await condominioService.createCondominio(req.body);
            return res.status(201).json({
                message: "Condomínio cadastrado com sucesso",
                condominio: {
                    _id: condominio._id,
                    name: condominio.name,
                    address: condominio.address,
                    createdAt: condominio.createdAt
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
        const list = await condominioService.listCondominios();
        return res.status(200).json(list);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export default {
    create,
    list
};
