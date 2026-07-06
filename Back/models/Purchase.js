import mongoose from 'mongoose';



const purchaseSchema = new mongoose.Schema({
    produto: {
        type: String,
        required: true
    },
    descricao: {
        type: String
    },
    valorUnitario: {
        type: Number,
        required: true
    },
    quantidadeMinima: {
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
    collection: "purchases",
    timestamps: true
 });
export default mongoose.model("Purchase", purchaseSchema);