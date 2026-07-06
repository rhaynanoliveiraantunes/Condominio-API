import mongoose from 'mongoose';



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
    amount: {
        type: Number,
        required: true
    },
    paid: {
        type: Boolean,
        default: false
    }
}, { 
    
    collection: "participation",
    timestamps: true 
    
});

export default mongoose.model("Participation", participationSchema);