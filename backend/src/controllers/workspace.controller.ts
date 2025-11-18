// ✔ createWorkspace()
// ✔ updateWorkspace()
// ✔ deleteWorkspace()
// ✔ getMyWorkspaces()
// ✔ getWorkspaceById()
// ✔ changeWorkspaceRole()
// ✔ leaveWorkspace()
// ✔ inviteMember()
// ✔ removeMember()

import { Request, Response } from "express";
import mongoose from "mongoose";
import { Workspace, WorkspaceRole, IWorkspace } from "../models/workspace.model";
import { User } from "../models/user.model"; // assume you have a User model
import { AUthRequest } from "../middleware/auth";

// -------------------------
// CREATE WORKSPACE
// -------------------------
export const createWorkspace = async (req: AUthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user?.sub; // set by authenticate middleware

    if (!name) return res.status(400).json({ message: "Workspace name is required" });

    const workspace = new Workspace({
      name, 
      description,
      owner: ownerId,
      members: [{ userId: ownerId, role: WorkspaceRole.OWNER }],
    });

    await workspace.save();

    // Add workspace ID to user
    await User.findByIdAndUpdate(ownerId, {
      $push: { workspaceIds: workspace._id },
    });

    return res.status(201).json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error creating workspace" });
  }
};

// -------------------------
// GET CURRENT USER'S WORKSPACES
// -------------------------
export const getMyWorkspaces = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    const workspaces = await Workspace.find({ 
      "members.userId": userId,
    }); // lean() makes them plain objects

    const populatedWorkspaces = await Promise.all(
      workspaces.map(async (ws) => {
        const members = await Promise.all(
          ws.members.map(async (m) => {
            const user = await User.findById(m.userId).lean();
            return {
              id: m.userId.toString(),
              name: user?.name ?? "Unknown",
              email: user?.email ?? "",
              role: m.role,
            };
          })
        );

        return {
          id: ws._id?.toString()??"Invalid Workspace",
          name: ws.name,
          description: ws.description,
          color: ws.settings?.color??"indigo",
          role: ws.members.find(m => m.userId.toString() === userId)?.role ?? "MEMBER",
          taskCount: ws.taskCount ?? 0,
          createdAt: ws.createdAt,
          members,
        };
      })
    );

    res.status(200).json(populatedWorkspaces);


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching workspaces" });
  }
};

// -------------------------
// GET SINGLE WORKSPACE
// -------------------------
export const getWorkspace = async (req: AUthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid workspace ID" });

    const ws = await Workspace.findById(id);
    if (!ws) return res.status(404).json({ message: "Workspace not found" });

    // Check membership
    const isMember = ws.members.some(
      (m) => m.userId.toString() === req.user?.sub.toString()
    );
    if (!isMember) return res.status(403).json({ message: "Access denied" });

    // ----- populate members exactly like getMyWorkspaces() -----
    const members = await Promise.all(
      ws.members.map(async (m) => {
        const user = await User.findById(m.userId).lean();
        return {
          id: m.userId.toString(),
          name: user?.name ?? "Unknown",
          email: user?.email ?? "",
          avatar: user?.avatar ?? null,
          role: m.role,
        };
      })
    );

    return res.status(200).json({
      id: ws._id.toString(),
      name: ws.name,
      description: ws.description,
      members,
      color: ws.settings?.color ?? "indigo",
      role: ws.members.find(m => m.userId.toString() === req.user?.sub)?.role ?? "MEMBER",
      taskCount: ws.taskCount ?? 0,
      createdAt: ws.createdAt,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error fetching workspace" });
  }
};

// -------------------------
// UPDATE WORKSPACE
// -------------------------
export const updateWorkspace = async (req: AUthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, settings } = req.body;

    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    // Only owner or admin can update
    const member = workspace.members.find(
      (m) => m.userId.toString() === req.user?.sub.toString()
    );
    if (!member || (member.role !== WorkspaceRole.OWNER && member.role !== WorkspaceRole.ADMIN))
      return res.status(403).json({ message: "Permission denied" });

    if (name) workspace.name = name;
    if (description) workspace.description = description;
    if (settings) workspace.settings = settings;

    await workspace.save();
    res.status(200).json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error updating workspace" });
  }
};

// -------------------------
// DELETE WORKSPACE
// -------------------------
export const deleteWorkspace = async (req: AUthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    // Only owner can delete
    if (workspace.owner.toString() !== req.user?.sub.toString())
      return res.status(403).json({ message: "Only owner can delete workspace" });

    await workspace.deleteOne();
    res.status(200).json({ message: "Workspace deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error deleting workspace" });
  }
};

// -------------------------
// INVITE MEMBER
// -------------------------
export const inviteMember = async (req: AUthRequest, res: Response) => {
  try {
    const { id } = req.params; // workspace ID
    const { email, role } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    const member = workspace.members.find(
      (m) => m.userId.toString() === req.user?.sub.toString()
    );
    if (!member || (member.role !== WorkspaceRole.OWNER && member.role !== WorkspaceRole.ADMIN))
      return res.status(403).json({ message: "Permission denied" });

    const userToInvite = await User.findOne({ email });
    if (!userToInvite) return res.status(404).json({ message: "User not found" });

    const alreadyMember = workspace.members.some(
      (m) => m.userId.toString() === userToInvite._id.toString()
    );
    if (alreadyMember) return res.status(400).json({ message: "User already in workspace" });

    // Add to members
    workspace.members.push({
      userId: userToInvite._id,
      role: role || WorkspaceRole.MEMBER,
    });

    // Track invited users
    workspace.invitedUsers = workspace.invitedUsers || [];
    workspace.invitedUsers.push(userToInvite._id);

    await workspace.save();

    // Add workspace to user's workspaceIds
    await User.findByIdAndUpdate(userToInvite._id, {
      $addToSet: { workspaceIds: workspace._id },
    });

    res.status(200).json({ message: "Member invited successfully", workspace });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error inviting member" });
  }
};


// -------------------------
// REMOVE MEMBER
// -------------------------
export const removeMember = async (req: AUthRequest, res: Response) => {
  try {
    const { id, userId } = req.params; // workspace ID + user ID to remove

    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    // Only owner/admin
    const member = workspace.members.find(
      (m) => m.userId.toString() === req.user?.sub.toString()
    );
    if (!member || (member.role !== WorkspaceRole.OWNER && member.role !== WorkspaceRole.ADMIN))
      return res.status(403).json({ message: "Permission denied" });

    // Prevent removing owner
    if (workspace.owner.toString() === userId)
      return res.status(400).json({ message: "Cannot remove workspace owner" });

    workspace.members = workspace.members.filter(
      (m) => m.userId.toString() !== userId
    );

    await workspace.save();
    res.status(200).json({ message: "Member removed successfully", workspace });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error removing member" });
  }
};

// -------------------------
// CHANGE MEMBER ROLE
// -------------------------
export const changeWorkspaceRole = async (req: AUthRequest, res: Response) => {
  try {
    const { id } = req.params; // workspace ID
    const { userId, role } = req.body;

    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    // Only owner/admin can change roles
    const member = workspace.members.find(m => m.userId.toString() === req.user?.sub.toString());
    if (!member || (member.role !== WorkspaceRole.OWNER && member.role !== WorkspaceRole.ADMIN))
      return res.status(403).json({ message: "Permission denied" });

    // Cannot change owner's role
    if (workspace.owner.toString() === userId)
      return res.status(400).json({ message: "Cannot change owner's role" });

    const targetMember = workspace.members.find(m => m.userId.toString() === userId);
    if (!targetMember) return res.status(404).json({ message: "Member not found" });

    targetMember.role = role;
    await workspace.save();

    res.status(200).json(workspace);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error changing role" });
  }
};
