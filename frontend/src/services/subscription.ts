import api from "./api";

// ─────────────────────────────
// SUBSCRIPTION SERVICES (MOCK PAYMENT)
// ─────────────────────────────

// Get current user's subscription
export const getMySubscriptionAPI = async () => {
  const res = await api.get("/subscriptions/me");
  return res.data;
};

// Subscribe / upgrade to PREMIUM (mock payment)
export const subscribePlanAPI = async (payload: {
  plan: "FREE" | "PREMIUM" | "ENTERPRISE";
}) => {
  const res = await api.post("/subscriptions/subscribe", payload);
  return res.data;
};

// Cancel subscription
export const cancelSubscriptionAPI = async () => {
  const res = await api.post("/subscriptions/cancel");
  return res.data;
};

// Renew subscription
export const renewSubscriptionAPI = async () => {
  const res = await api.post("/subscriptions/renew");
  return res.data;
};
