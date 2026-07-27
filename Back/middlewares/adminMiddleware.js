const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(400).json({ 
            error: 'Access denied. Permission restricted to administrators.' 
        });
    }
};

export default adminMiddleware;