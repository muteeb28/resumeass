
import jwt from 'jsonwebtoken';

export const isLoggedIn = (req, res, next) => {
    const token = req.cookies?.session || req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized', code: 'no_token' });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || "default_secret"
        );
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized', code: 'invalid_token' });
    }
}


export const isAdmin = (req, res, next) => {
    if (!req.user?.admin || req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Forbidden", code: 'not_admin' });
    }
    next();
}
