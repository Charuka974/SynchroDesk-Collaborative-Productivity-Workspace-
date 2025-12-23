import { Request, Response } from "express"
import { IUSER, Role, User } from "../models/user.model"
import bcrypt from "bcryptjs"
import { signAccessToken, signRefreshToken } from "../utils/tokens"
import { AUthRequest } from "../middleware/auth"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { sendEmail } from "../utils/emails"
import { forgotPasswordTemplate } from "../types/email/forgot-password-email"
import { v4 as uuidv4 } from "uuid";

dotenv.config()

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string

// -----------------------------
// REGISTER NORMAL USER (MEMBER)
// -----------------------------
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body

    if (!name) {
      return res.status(400).json({ message: "Name required" })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await User.create({
      email,
      password: hash,
      name,
      roles: [Role.MEMBER],
      approved: "NONE"
    })

    res.status(201).json({
      message: "User registered",
      data: {
        email: user.email,
        roles: user.roles,
        approved: user.approved
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
}

// -----------------------------
// LOGIN
// -----------------------------
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // update last login time
    user.lastLogin = new Date()
    await user.save()

    const accessToken = signAccessToken(user)
    const refreshToken = signRefreshToken(user)

    res.status(200).json({
      message: "success",
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        approved: user.approved,
        accessToken,
        refreshToken
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
}

// -----------------------------
// REGISTER ADMIN
// -----------------------------
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body

    if (!name) {
      return res.status(400).json({ message: "Name required" })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await User.create({
      email,
      password: hash,
      name,
      roles: [Role.ADMIN],
      approved: "APPROVED"
    })

    res.status(201).json({
      message: "Admin registered",
      data: { email: user.email, roles: user.roles }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Internal server error" })
  }
}

// -----------------------------
// GET LOGGED-IN USER PROFILE
// -----------------------------
export const getMyProfile = async (req: AUthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const user = await User.findById(req.user.sub).select("-password")
  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }

  res.status(200).json({
    message: "ok",
    data: {
      id: user._id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      approved: user.approved,
      avatar: user.avatar,
      subscriptionPlan: user.subscriptionPlan,
      lastLogin: user.lastLogin
    }
  })
}

// -----------------------------
// GET REFRESH TOKEN
// -----------------------------
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body
    if (!token) {
      return res.status(400).json({ message: "Token required" })
    }

    const payload: any = jwt.verify(token, JWT_REFRESH_SECRET)
    const user = await User.findById(payload.sub)
    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" })
    }
    const accessToken = signAccessToken(user)

    res.status(200).json({
      accessToken
    })
  } catch (err) {
    res.status(403).json({ message: "Invalid or expire token" })
  }
}



// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({
        message: "Email not found",
      });
    }

    // Generate secure token
    const token = uuidv4();

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your Synchro Desk password",
      html: forgotPasswordTemplate({
        name: user.name,
        resetUrl,
      }),
    });

    res.status(200).json({
      message: "Password reset email sent",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password required" });
    }

    // Find user with matching token and unexpired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, // token not expired
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Clear reset token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};