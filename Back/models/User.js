import mongoose from 'mongoose';



const userSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    apartamento: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    ativo: {
        type: Boolean,
        default: false
    }
}, { 
    collection: "users",
    timestamps: true
});

export default mongoose.model("User", UserSchema);