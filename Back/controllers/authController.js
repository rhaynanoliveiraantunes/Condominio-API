import authService from "../services/authService.js";

const register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json({ message: "User successfully registered", data: user });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
const result = await authService.login(email, password);
        res.status(200).json({ message: "Login successful", data: result });
    } catch (error) {
        next(error);
    }
};

export default { register, login };
