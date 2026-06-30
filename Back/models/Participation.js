import mongoose from 'mongoose';
import mongoose from "mongoose";

const participationSchema = new mongoose.Schema(
    {
    purchaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Purchase',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quantidade: {
        type: Number,
        required: true
    },
    pago: {
        type: Boolean,
        default: false
    }
}, { 
    
    collection: "participation",
    timestamps: true 
    
});

export default mongoose.model("Participation", LoanSchema);