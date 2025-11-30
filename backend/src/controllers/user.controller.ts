// ✔ getMyDetails()
// ✔ updateProfile()
// ✔ updatePassword()
// ✔ uploadAvatar()
// ✔ deleteUser()
// ✔ adminGetAllUsers() (admin)
// ✔ adminUpdateUserRole() (admin)

import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { Workspace } from "../models/workspace.model";
import { AUthRequest } from "../middleware/auth";

// ===============================================
// GET MY PROFILE
// ===============================================
export const getMyProfile = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    const user = await User.findById(userId).select("-password").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error loading my profile:", error);
    res.status(500).json({ message: "Server error loading profile" });
  }
};

// ===============================================
// GET ALL USERS (Admin use or dropdown lists)
// ===============================================
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select("name email avatar roles approved").lean();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error loading users:", error);
    res.status(500).json({ message: "Server error loading users" });
  }
};

// ===============================================
// GET USERS IN MY WORKSPACES — Used by chat sidebar
// ===============================================
export const getUsersInMyWorkspaces = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    // Get all workspaces the user belongs to
    const workspaces = await Workspace.find({
      "members.userId": userId
    })
      .select("members")
      .lean();

    const memberIds = new Set<string>();

    workspaces.forEach(ws => {
      ws.members.forEach(m => memberIds.add(m.userId.toString()));
    });

    const users = await User.find({
      _id: { $in: [...memberIds] }
    })
      .select("name email avatar roles approved")
      .lean();

    res.status(200).json(users);
  } catch (error) {
    console.error("Error loading workspace users:", error);
    res.status(500).json({ message: "Server error loading workspace users" });
  }
};

// ===============================================
// UPDATE PROFILE
// ===============================================
export const updateProfile = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { name, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, avatar },
      { new: true }
    )
      .select("-password")
      .lean();

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};

// ===============================================
// CHANGE PASSWORD
// ===============================================
export const changePassword = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) return res.status(400).json({ message: "Incorrect current password" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error changing password" });
  }
};

// ===============================================
// GET MY WORKSPACES WITH MY ROLE
// ===============================================
export const getMyWorkspaceRoles = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Fetch all workspaces where user is a member or owner
    const workspaces = await Workspace.find({
      $or: [
        { owner: userId },
        { "members.userId": userId }
      ]
    })
      .select("name description owner members")
      .lean();

    // Map each workspace to include user's role
    const workspacesWithRoles = workspaces.map((ws) => {
      let myRole = "MEMBER";

      if (ws.owner?.toString() === userId.toString()) {
        myRole = "OWNER";
      } else {
        const membership = ws.members.find(
          (m) => m.userId?.toString() === userId.toString()
        );
        if (membership) myRole = membership.role;
      }

      return {
        _id: ws._id,
        name: ws.name,
        description: ws.description,
        myRole,
        memberCount: ws.members?.length || 0,
        owner: ws.owner,
      };
    });

    res.status(200).json(workspacesWithRoles);
  } catch (error) {
    console.error("Error fetching workspace roles:", error);
    res.status(500).json({ message: "Server error fetching workspace roles" });
  }
};
