import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import {
  getMyProfileAPI,
  updateMyProfileAPI,
  changeMyPasswordAPI,
  getMyWorkspaceRolesAPI
} from "../services/profile";

export type Role = "ADMIN" | "OWNER" | "MEMBER";
export type Status = "NONE" | "PENDING" | "APPROVED" | "REJECTED";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  roles: Role[];
  approved: Status;
  workspaceIds?: string[];
  lastLogin?: string;
  subscriptionPlan?: "FREE" | "PREMIUM";
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkspaceRoleType {
  _id: string;
  name: string;
  description?: string;
  myRole: Role;
  memberCount: number;
  owner: string;
}

interface UserContextType {
  user?: IUser;
  workspaces?: WorkspaceRoleType[];
  loading: boolean;
  error?: string;

  refreshUser: () => Promise<void>;
  fetchWorkspaceRoles: () => Promise<void>;
  updateProfile: (data: Partial<IUser>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser>();
  const [workspaces, setWorkspaces] = useState<WorkspaceRoleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const refreshUser = async () => {
    try {
      setLoading(true);
      const data = await getMyProfileAPI();
      setUser(data);
    } catch (err: any) {
      setError(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaceRoles = async () => {
    try {
      const roles = await getMyWorkspaceRolesAPI();
      setWorkspaces(roles);
    } catch (err: any) {
      setError(err.message || "Failed to load workspace roles");
    }
  };

  const updateProfile = async (data: Partial<IUser>) => {
    try {
      const updated = await updateMyProfileAPI(data);
      setUser(updated);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await changeMyPasswordAPI({ currentPassword, newPassword });
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    }
  };

  useEffect(() => {
    refreshUser();
    fetchWorkspaceRoles();
  }, []);

  return (
    <UserContext.Provider value={{ user, workspaces, loading, error, refreshUser, fetchWorkspaceRoles, updateProfile, changePassword }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
};
