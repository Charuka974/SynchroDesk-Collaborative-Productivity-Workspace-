import { NextFunction, Response } from "express";
import { AUthRequest } from "./auth";

// need multiple plan check
export const requirePlan = (plans: ("FREE" | "PREMIUM" | "ENTERPRISE")[]) => {
  return (req: AUthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userPlan = req.user.subscriptionPlan;

    if (!userPlan || !plans.includes(userPlan)) {
      return res.status(403).json({
        message: `Require ${plans.join(" or ")} plan`,
      });
    }

    next();
  };
};

export const requirePremium = (
  req: AUthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.subscriptionPlan !== "PREMIUM") {
    return res.status(403).json({
      message: "Premium subscription required",
    });
  }

  next();
};
