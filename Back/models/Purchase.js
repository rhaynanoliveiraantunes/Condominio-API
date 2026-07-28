import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
    product: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    unitPrice: {
        type: Number,
        required: true
    },
    minimumQuantity: {
        type: Number,
        required: true
    },
    currentQuantity: {
        type: Number,
        default: 0
    },
    term: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['OPEN', 'MINIMUM_REACHED', 'CANCELLED', 'active', 'goal_reached', 'closed', 'expired'],
        default: 'OPEN'
    },
    syndicPixKey: {
        type: String,
        required: true,
        default: "sindico@condominiobuy.com.br"
    },
    condoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Condo',
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { 
    collection: "purchases",
    timestamps: true
});

export default mongoose.model("Purchase", purchaseSchema);