import mongoose from 'mongoose';

const condominioSchema = new mongoose.Schema({
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
    collection: "condominios",
    timestamps: true 
});

export default mongoose.model("Condominio", condominioSchema);
