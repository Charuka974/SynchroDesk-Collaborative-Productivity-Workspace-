import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  getMySubscription,
  mockSubscribe,
  mockCancelSubscription,
  mockRenewSubscription,
} from "../controllers/payment.controller";

const router = Router();

// ─────────────────────────────
// SUBSCRIPTION ROUTES (MOCK)
// ─────────────────────────────

// Get current user's subscription
router.get("/me", authenticate, getMySubscription);

// Subscribe / upgrade to PREMIUM (mock payment)
router.post("/subscribe", authenticate, mockSubscribe);

// Cancel subscription
router.post("/cancel", authenticate, mockCancelSubscription);

// Renew subscription
router.post("/renew", authenticate, mockRenewSubscription);

export default router;
