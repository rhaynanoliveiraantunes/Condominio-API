import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'Utilizador não encontrado.' });
        }

        if (!user.ativo) {
            return res.status(403).json({ error: 'Conta inativa. Aguarde a aprovação do administrador.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
};

export default authMiddleware;