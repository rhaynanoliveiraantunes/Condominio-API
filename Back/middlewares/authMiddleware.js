import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({ error: "Token not sent" });
        }

        const parts = authorization.split(" ");


        if (parts.length !== 2) {
            return res.status(401).json({ error: "Malformed token" });
        }
        const [scheme, token] = parts;

        if (scheme !== "Bearer") {
            return res.status(401).json({ error: "Invalid token format" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        if (!user.active) {
            return res.status(403).json({ error: "Inactive user" });
        }
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

export default authMiddleware;