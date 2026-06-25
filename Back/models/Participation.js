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
    quantidade: {
        type: Number,
        required: true
    },
    pago: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

participationSchema.index({ purchaseId: 1, userId: 1 }, { unique: true });

const Participation = mongoose.model('Participation', participationSchema);
export default Participation;