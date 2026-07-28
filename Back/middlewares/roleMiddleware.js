const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "User not authenticated" });
        }
        
        const userRole = req.user.role;
        const normalizedRole = userRole === 'admin' ? 'SYNDIC' : userRole === 'user' ? 'RESIDENT' : userRole;

        if (allowedRoles.includes(userRole) || allowedRoles.includes(normalizedRole)) {
            next();
        } else {
            return res.status(400).json({
                error: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`
            });
        }
    };
};

export default roleMiddleware;
