import Condo from "../models/Condo.js";

const createCondo = async (data) => {
    const { name, address } = data;
    if (!name || !address) {
        throw new Error("Nome e endereço são obrigatórios para cadastrar um condomínio.");
    }
    const newCondo = await Condo.create({ name, address });
    return newCondo;
};

const listCondos = async () => {
    return await Condo.find().sort({ name: 1 });
};

export default {
    createCondo,
    listCondos
};
