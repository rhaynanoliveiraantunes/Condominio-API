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
        enum: ['active', 'goal_reached', 'closed', 'cancelled', 'expired'],
        default: 'active'
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