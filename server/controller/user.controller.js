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

const allowedGoals = new Set(["perfect_resume", "find_jobs", "hr_emails", "others"]);

export const updateAccountBasic = async (req, res) => {
  try {
    const { username } = req.body || {};

    if (!username || !String(username).trim()) {
      return res.status(400).json({
        success: false,
        message: "username is required.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { username: String(username).trim() } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found.",
      });
    }

    await redis.del(`account:${req.user.id}`);

    return res.status(200).json({
      success: true,
      message: "basic account details updated successfully.",
      user,
    });
  } catch (error) {
    console.log("error from updateAccountBasic controller: ", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "some unexpected error occured",
    });
  }
};

export const updateAccountCareer = async (req, res) => {
  try {
    const {
      currentDesignation,
      currentCompany,
      experience,
      desiredDesignation,
      companyType,
      goals,
      otherGoal,
      linkedinUrl,
    } = req.body || {};

    const payload = {
      currentDesignation: currentDesignation ? String(currentDesignation).trim() : "",
      currentCompany: currentCompany ? String(currentCompany).trim() : "",
      experience: experience ? String(experience).trim() : "",
      desiredDesignation: desiredDesignation ? String(desiredDesignation).trim() : "",
      companyType: companyType ? String(companyType).trim() : "",
      goals: Array.isArray(goals) ? goals.filter((goal) => allowedGoals.has(goal)) : [],
      otherGoal: otherGoal ? String(otherGoal).trim() : "",
      linkedinUrl: linkedinUrl ? String(linkedinUrl).trim() : "",
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: payload },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found.",
      });
    }

    await redis.del(`account:${req.user.id}`);

    return res.status(200).json({
      success: true,
      message: "career details updated successfully.",
      user,
    });
  } catch (error) {
    console.log("error from updateAccountCareer controller: ", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "some unexpected error occured",
    });
  }
};

export const updateAccountPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body || {};

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "newPassword and confirmPassword are required.",
      });
    }

    if (String(newPassword) !== String(confirmPassword)) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(newPassword), salt);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { password: hashedPassword } },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found.",
      });
    }

    await redis.del(`account:${req.user.id}`);

    return res.status(200).json({
      success: true,
      message: "password updated successfully.",
    });
  } catch (error) {
    console.log("error from updateAccountPassword controller: ", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "some unexpected error occured",
    });
  }
};
