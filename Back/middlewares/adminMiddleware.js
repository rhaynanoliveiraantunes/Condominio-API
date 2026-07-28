const adminMiddleware = (req, res, next) => {
    const allowed = ['SUPER_ADMIN', 'SYNDIC', 'admin'];
    if (req.user && allowed.includes(req.user.role)) {
        next();
    } else {
        return res.status(400).json({ 
            error: 'Access denied. Permission restricted to administrators or syndics.' 
        });
    }
};

export default adminMiddleware;