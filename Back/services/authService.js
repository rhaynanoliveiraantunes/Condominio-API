import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = async (userData) => {
    const { name, email, password, apartment, condoId, role } = userData; 
    
    if (!name || !email || !password || !apartment) {
        throw new Error("Preencha todos os campos obrigatórios (nome, email, senha, apartamento).");
    }

    const assignedRole = role && ['SUPER_ADMIN', 'SYNDIC', 'RESIDENT'].includes(role) ? role : 'RESIDENT';

    if (assignedRole !== 'SUPER_ADMIN' && !condoId) {
        throw new Error("Informe o condomínio ao qual o usuário pertence.");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("Este e-mail já está cadastrado.");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); 
    
    const newUser = {
        name,
        email,
        password: hashedPassword,
        apartment,
        condoId: assignedRole !== 'SUPER_ADMIN' ? condoId : undefined,
        role: assignedRole, 
        active: false 
    };

    const savedUser = await User.create(newUser);
    
    return { 
        message: "Usuário registrado com sucesso. Aguardando aprovação do síndico.",
        userId: savedUser._id
    };
};

const login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Credenciais inválidas');
    }

    if (user.active) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = jwt.sign(
                { id: user._id, role: user.role, condoId: user.condoId },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            return { 
                token, 
                user: { 
                    id: user._id, 
                    name: user.name,
                    email: user.email,
                    apartment: user.apartment,
                    role: user.role,
                    condoId: user.condoId,
                    active: user.active
                } 
            };
        } else {
            throw new Error('Credenciais inválidas');
        }
    } else {
        throw new Error('Conta inativa. Aguarde a aprovação do síndico do seu condomínio.');
    }
};

export default {
    register,
    login,
};