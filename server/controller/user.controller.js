import db from "../db/db.js";
const { getPool } = db;
import { redis } from "../db/redis.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET || "default_secret", {
        expiresIn: "2d",
    });

    return { accessToken };
};

const setCookies = (res, accessToken) => {
    res.cookie("session", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days in ms
    });
};

export const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const pool = getPool();

        // Check if user exists
        const { rows: existingUsers } = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const { rows: newUsers } = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
            [username, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            userId: newUsers[0].id
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const pool = getPool();
        console.log("Login attempt:", email);

        const { rows: users } = await pool.query(
            'SELECT id, username, email, password, "createdAt" FROM users WHERE email = $1',
            [email]
        );
        const user = users[0];

        console.log("SQL user found:", user);

        if (user && (await bcrypt.compare(password, user.password))) {
            const { accessToken } = generateTokens(user.id);
            setCookies(res, accessToken);

            const redisUser = {
                id: user.id,
                username: user.username,
                email: user.email,
                createdAt: user["createdAt"]
            };

            await redis.set(
                `auth:${user.id}`,
                JSON.stringify(redisUser),
                'EX',
                2 * 24 * 60 * 60
            );

            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
            });
        } else {
            res.status(400).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.error("Error in login controller:", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const authProfile = async (req, res) => {
    try {
        const token = req.cookies?.session;
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "default_secret");
        let parsedUser = null;
        const redisUser = await redis.get(`auth:${decoded.userId}`);

        if (redisUser) {
            try {
                parsedUser = JSON.parse(redisUser);
            } catch (parseError) {
                parsedUser = null;
            }
        }

        // Redis may be intentionally disabled in local/dev. Fallback to DB by token subject.
        if (!parsedUser) {
            const pool = getPool();
            const { rows } = await pool.query(
                'SELECT id, username, email, "createdAt" FROM users WHERE id = $1 LIMIT 1',
                [decoded.userId]
            );
            parsedUser = rows[0] || null;
        }

        if (!parsedUser) {
            return res.status(401).json({ message: "Your session has expired. Please login again." });
        }

        return res.status(200).json({
            success: true,
            message: 'User is authenticated',
            user: parsedUser
        });
    } catch (error) {
        console.error("Error in authProfile controller:", error.message);
        res.status(500).json({ message: error.message });
    }
}

export const logout = async (req, res) => {
    try {
        const token = req.cookies?.session;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "default_secret");
                await redis.del(`auth:${decoded.userId}`);
            } catch (_) {
                // Ignore token verification failure on logout and still clear cookie.
            }
        }

        res.clearCookie("session", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout controller:", error.message);
        res.status(500).json({ message: error.message });
    }
}
