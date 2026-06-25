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
}, { timestamps: true });

const Ranking = mongoose.model('Ranking', rankingSchema);
export default Ranking;