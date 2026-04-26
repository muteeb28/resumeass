import jwt from "jsonwebtoken";
import { clearCookie } from "../scripts/helpers/token.helper.js";

export const isLoggedIn = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;
		console.log('this si a token from resumeassist: ', token);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "you are not authorized. Please login",
            });
        }

        // check if user is logged in (api call to auth service)
        const response = await fetch(`${process.env.AUTH_SERVICE_URL}/auth/verify-session`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        });
        const data = await response.json();
		console.log('lskfjslkdfjksldf', data);
        if (!data.success) {
            clearCookie(res);
            return res.status(401).json({
                success: false,
                message: "you don't have a valid session. Please log back in"
            });
        }
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "session expired. Try log back in",
        });
    }
}

export const adminRoute = (req, res, next) => {
	if (req.user && req.user.role === "admin") {
		next();
	} else {
		return res.status(403).json({ message: "Access denied - Admin only" });
	}
};
