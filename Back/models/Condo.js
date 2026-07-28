import mongoose from 'mongoose';

const condoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    }
}, { 
    collection: "condos",
    timestamps: true 
});

export default mongoose.model("Condo", condoSchema);
