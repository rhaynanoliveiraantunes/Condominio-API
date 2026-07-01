import mongoose from 'mongoose';



const rankingSchema = new mongoose.Schema({
    produto: {
        type: String,
        required: true,
        unique: true
    },
    totalPedidos: {
        type: Number,
        default: 0
    }
}, {
    collection: "ranking",
timestamps: true
});

export default mongoose.model("Ranking", LoanSchema);