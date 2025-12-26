import { Request, Response } from "express";
import { Subscription, SubscriptionPlan } from "../models/subscription.model";
import { AUthRequest } from "../middleware/auth";
import { User } from "../models/user.model";

// ================================================================
// GET MY SUBSCRIPTION
// ================================================================
export const getMySubscription = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    const subscription = await Subscription.findOne({ userId }).lean();

    if (!subscription) {
      return res.status(200).json({
        plan: SubscriptionPlan.FREE,
        status: "inactive",
      });
    }

    res.status(200).json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({ message: "Server error fetching subscription" });
  }
};

// ================================================================
// MOCK SUBSCRIBE / UPGRADE TO PREMIUM
// ================================================================
export const mockSubscribe = async (req: AUthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { plan } = req.body;

    if (!Object.values(SubscriptionPlan).includes(plan)) {
      return res.status(400).json({ message: "Invalid subscription plan" });
    }

    let subscription = await Subscription.findOne({ userId });

    const periodEnd =
      plan === SubscriptionPlan.FREE
        ? undefined
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (!subscription) {
      subscription = await Subscription.create({
        userId,
        stripeCustomerId: `mock_cus_${Date.now()}`,
        stripeSubscriptionId: plan === SubscriptionPlan.FREE ? undefined : `mock_sub_${Date.now()}`,
        plan,
        status: plan === SubscriptionPlan.FREE ? "inactive" : "active",
        currentPeriodEnd: periodEnd,
      });
    } else {
      subscription.plan = plan;
      subscription.status = plan === SubscriptionPlan.FREE ? "inactive" : "active";
      subscription.stripeSubscriptionId =
        plan === SubscriptionPlan.FREE ? undefined : `mock_sub_${Date.now()}`;
      subscription.currentPeriodEnd = periodEnd;
      await subscription.save();
    }

    // Sync User
    await User.findByIdAndUpdate(userId, { subscriptionPlan: plan });

    res.status(200).json(subscription);
  } catch (error) {
    console.error("Error subscribing:", error);
    res.status(500).json({ message: "Server error subscribing" });
  }
};


// ================================================================
// MOCK CANCEL SUBSCRIPTION
// ================================================================
export const mockCancelSubscription = async (
  req: AUthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.sub;

    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    subscription.status = "canceled";
    subscription.plan = SubscriptionPlan.FREE;
    subscription.stripeSubscriptionId = undefined;
    subscription.currentPeriodEnd = undefined;
    await subscription.save();

    // SYNC USER
    await User.findByIdAndUpdate(userId, {
      subscriptionPlan: "FREE",
    });

    res.status(200).json({
      message: "Subscription canceled successfully",
      subscription,
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    res.status(500).json({ message: "Server error canceling subscription" });
  }
};

// ================================================================
// MOCK RENEW SUBSCRIPTION
// ================================================================
export const mockRenewSubscription = async (
  req: AUthRequest,
  res: Response
) => {
  try {
    const userId = req.user?.sub;

    const subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    if (![SubscriptionPlan.PREMIUM, SubscriptionPlan.ENTERPRISE].includes(subscription.plan)) {
    return res.status(400).json({ message: "Not a paid subscription" });
    }


    subscription.status = "active";
    subscription.currentPeriodEnd = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    );
    await subscription.save();

    // SYNC USER
    await User.findByIdAndUpdate(userId, {
      subscriptionPlan: "PREMIUM",
    });

    res.status(200).json(subscription);
  } catch (error) {
    console.error("Error renewing subscription:", error);
    res.status(500).json({ message: "Server error renewing subscription" });
  }
};
