import express from "express";
import cors from "cors";
import "dotenv/config";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import purchaseRoutes from "./routes/purchasesRoutes.js";

import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.json({ message: "API Condominio funcionando" });
  });



app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/purchases', purchaseRoutes);
app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.log("Erro ao iniciar servidor:", error.message);
  }
};
startServer();
