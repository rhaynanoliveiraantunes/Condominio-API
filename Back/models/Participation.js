import mongoose from 'mongoose';

const participationSchema = new mongoose.Schema({
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
    },
    paymentStatus: {
        type: String,
        enum: ['PENDING_PIX', 'PAID_VERIFYING', 'CONFIRMED', 'REFUND_PENDING', 'REFUNDED'],
        default: 'PENDING_PIX'
    },
    receiptDetails: {
        type: String,
        default: ""
    },
    userPixKey: {
        type: String,
        default: ""
    }
}, { 
    collection: "participations",
    timestamps: true 
});

export default mongoose.model("Participation", participationSchema);