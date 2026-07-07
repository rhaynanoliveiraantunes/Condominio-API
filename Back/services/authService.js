import User from "../models/User.js";
import Ranking from "../models/Ranking.js";
import Purchase from "../models/Purchase.js";
import Participation from "../models/Participation.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

 const register = async (userData) => {
   
    const { name, email, password, apartment, role } = userData;
    
    const salt = await bcry+-pt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt); 
    
    const newUser = {
        name,
        email,
        password: hashedPassword,
        apartment,
        role: 'user',
        active: false 
    };

    await User.create(newUser);
    
    return { message: "User successfully registered. Awaiting administrator validation." };
};

const login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid credentials');
    
    if (!user.active) {
        throw new Error('Inactive account. Please wait for the property managers approval.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    return { token, user: { id: user._id, role: user.role } };
};

export default {
    register,
    login,
};