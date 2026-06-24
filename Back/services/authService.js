import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
// import User from '../models/User.js';

export const registerUser = async (userData) => {
   
    const { nome, email, password, apartamento, role } = userData;
    
   
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    const newUser = {
        nome,
        email,
        password: hashedPassword,
        apartamento,
        role: role || 'user',
        ativo: false 
    };

    await User.create(newUser);
    return { message: "Usuário cadastrado com sucesso. Aguardando validação do administrador." };
};

export const loginUser = async (email, password) => {
    
    // const user = await User.findOne({ email });
    // if (!user) throw new Error('Credenciais inválidas');

    const user = { _id: '123', password: '...', ativo: false }; 

    
    if (!user.ativo) {
        throw new Error('Conta inativa. Aguarde a aprovação do síndico.');
    }

    
    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) throw new Error('Credenciais inválidas');

  
    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    return { token, user: { id: user._id, role: user.role } };
};