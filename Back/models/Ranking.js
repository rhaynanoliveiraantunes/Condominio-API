import mongoose from 'mongoose';

const rankingSchema = new mongoose.Schema({
    product: {
        type: String,
        required: true,
        unique: true
    },
    totalOrders: { 
        type: Number,
        default: 0
    }
}, {
    collection: "ranking",
    timestamps: true
});

export default mongoose.model("Ranking", rankingSchema);