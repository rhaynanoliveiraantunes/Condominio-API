import Condominio from "../models/Condominio.js";

const createCondominio = async (data) => {
    const { name, address } = data;
    if (!name || !address) {
        throw new Error("Nome e endereço são obrigatórios para cadastrar um condomínio.");
    }
    const newCondominio = await Condominio.create({ name, address });
    return newCondominio;
};

const listCondominios = async () => {
    return await Condominio.find().sort({ name: 1 });
};

export default {
    createCondominio,
    listCondominios
};
