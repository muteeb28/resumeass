import { redis } from "../db/redis.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../model/user.model.js";

const generateSingleToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { token };
};

const setSingleTokenCookie = (res, token) => {
  res.cookie("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    domain: process.env.COOKIE_DOMAIN,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const tokenStorage = async (userId, sessionData) => {
  await redis.set(`session:${userId}`, JSON.stringify(sessionData), "EX", 7 * 24 * 60 * 60);
};

export const createUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    const userExists = await User.findOne({ email }).select('_id').lean();

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const user = await User.create(req.body);

    const userId = String(user._id);
    const sessionData = {
      id: userId,
      email: user.email,
      name: user.name,
      role: user.role,
      address: user.address,
    };

    const { token } = generateSingleToken(userId);
    await tokenStorage(userId, sessionData);
    setSingleTokenCookie(res, token);

    res.status(201).json({
      _id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
      address: user.address,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log("this is a db user: ", user);

    if (user && (await bcrypt.compare(password, user.password))) {
      const userId = String(user._id);
      const { token } = generateSingleToken(userId);
      const sessionData = {
        id: userId,
        email: user.email,
        name: user.name,
        role: user.role,
        address: user.address,
      };
      await tokenStorage(userId, sessionData);
      setSingleTokenCookie(res, token);

      res.json({
        _id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
      });
    } else {
      res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const authProfile = async (req, res) => {
  try {
    console.log('klsdfjklsdfj', req.user);
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies?.session;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "default_secret");
        await redis.del(`session:${decoded.userId}`);
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
};

export const getAccount = async (req, res) => {
  try {
    // try fetching redis from the server
    let user = null;
    let rawUser = await redis.get(`account:${req.user.id}`);
    if (rawUser) {
      user = JSON.parse(rawUser);
    }
    else {
      user = await User.findById(req.user.id).select('-password').lean();
      await redis.set(`account:${user._id}`, JSON.stringify(user));
    }
    if (!user) {
      return res.status(404).json({
        success: true,
        message: "user not found."
      });
    }
    return res.status(200).json({
      success: true,
      message: "user fetched successfully!",
      user: user,
    });
  } catch (error) {
    console.log('error from the account controller: ', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "some unexpected error occured",
    });
  }
}