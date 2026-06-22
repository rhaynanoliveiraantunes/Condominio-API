import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectDB from './config/db.js'; 

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/purchases', purchaseRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: "API do CondomínioBuy a funcionar corretamente!" });
});

app.use((req, res, next) => {
    res.status(404).json({ error: "Rota não encontrada." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
}); 