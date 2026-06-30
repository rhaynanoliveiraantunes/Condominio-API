import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
    produto: {
        type: String,
        required: true
    },
    descricao: {
        type: String
    },
    precoUnitario: {
        type: Number,
        required: true
    },
    quantidadeMina: {
        type: Number,
        required: true
    },
    quantidadeAtual: {
        type: Number,
        default: 0
    },
    prazo: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'goal_reached', 'closed', 'cancelled', 'expired'],
        default: 'active'
    },
    criadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { 
    collection: "purchase",
    timestamps: true
 });

 export default mongoose.model("Purchase", LoanSchema);