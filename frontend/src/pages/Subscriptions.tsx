import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getMySubscriptionAPI,
  subscribePlanAPI,
} from "../services/subscription";

type PlanId = "free" | "pro" | "enterprise";

const planMap: Record<PlanId, "FREE" | "PREMIUM" | "ENTERPRISE"> = {
  free: "FREE",
  pro: "PREMIUM",
  enterprise: "ENTERPRISE",
};

export default function SubscriptionPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">(
    "monthly"
  );
  const [selectedTier, setSelectedTier] = useState<PlanId | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [billingEmail, setBillingEmail] = useState("");

  const [currentSubscription, setCurrentSubscription] = useState<{
    plan: "FREE" | "PREMIUM" | "ENTERPRISE";
    status: string;
    currentPeriodEnd?: string;
  } | null>(null);

  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  const plans = [
    {
      id: "free",
      name: "Free",
      description: "For individuals getting started",
      monthlyPrice: 0,
      annualPrice: 0,
      features: [
        "1 Workspace",
        "Up to 3 team members",
        "Personal dashboard",
        "Basic task management",
        "Notes & knowledge base",
        "Rich-text editor & Markdown",
        "Folders & basic sharing",
        "Calendar view & reminders",
        "Real-time notifications",
        "Community support",
      ],
      color: "from-gray-500 to-gray-700",
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      description: "Best for growing teams and power users",
      monthlyPrice: 29,
      annualPrice: 290,
      features: [
        "Unlimited workspaces",
        "Up to 20 team members",
        "Advanced task manager",
        "Subtasks & task comments",
        "Kanban board with drag & drop",
        "File attachments",
        "Team chat & group channels",
        "Typing indicator & online status",
        "Notes version history",
        "AI assistant (summaries & insights)",
        "Meeting minutes & smart search",
        "Advanced notifications",
        "Priority support",
      ],
      color: "from-slate-700 via-slate-800 to-slate-900",
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For large teams with advanced needs",
      monthlyPrice: 99,
      annualPrice: 990,
      features: [
        "Unlimited workspaces & members",
        "Enterprise task & workflow automation",
        "Advanced role-based access control",
        "Workspace-level permissions",
        "AI chat summaries & insights",
        "Advanced analytics & reporting",
        "Custom integrations & API access",
        "Dedicated account manager",
        "24/7 premium support",
        "Enterprise-grade security",
        "Custom billing & contracts",
        "Onboarding & training",
      ],
      color: "from-blue-700 via-blue-800 to-blue-900",
      popular: false,
    },
  ];

  // ──────────────
  // Load current subscription
  // ──────────────
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const subscription = await getMySubscriptionAPI();
        setCurrentSubscription(subscription);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSubscription();
  }, []);

  const handleSelectPlan = (planId: PlanId) => {
    if (planId === "free") {
      Toast.fire({
        icon: "success",
        title: "Free plan activated successfully!",
      });
      setCurrentSubscription({ plan: "FREE", status: "active" });
      return;
    }
    setSelectedTier(planId);
    setShowCheckout(true);
  };

  const handlePayment = async () => {
    if (!billingEmail.trim()) {
      Toast.fire({ icon: "warning", title: "Please enter billing email" });
      return;
    }
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, "").length < 16) {
      Toast.fire({ icon: "warning", title: "Please enter valid card number" });
      return;
    }
    if (!cardName.trim()) {
      Toast.fire({ icon: "warning", title: "Please enter cardholder name" });
      return;
    }
    if (!expiryDate.trim() || expiryDate.length < 5) {
      Toast.fire({ icon: "warning", title: "Please enter valid expiry date" });
      return;
    }
    if (!cvv.trim() || cvv.length < 3) {
      Toast.fire({ icon: "warning", title: "Please enter valid CVV" });
      return;
    }

    try {
      setIsProcessing(true);

      // Send correct plan to backend
      const backendPlan = selectedTier ? planMap[selectedTier] : "PREMIUM";
      const subscription = await subscribePlanAPI({ plan: backendPlan });

      setCurrentSubscription(subscription);

      const selectedPlanDetails = plans.find((p) => p.id === selectedTier);

      Toast.fire({
        icon: "success",
        title: `Payment successful! Welcome to ${selectedPlanDetails?.name} plan 🎉`,
      });

      // Reset modal
      setShowCheckout(false);
      setSelectedTier(null);
      setCardNumber("");
      setCardName("");
      setExpiryDate("");
      setCvv("");
      setBillingEmail("");
    } catch (error: any) {
      Toast.fire({
        icon: "error",
        title:
          error?.response?.data?.message || "Payment failed. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(" ") : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                Choose Your Plan
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Select the perfect plan for your team's needs
              </p>
            </div>

            {/* Current Subscription Card */}
            {currentSubscription && (
              <div className="bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 rounded-xl p-4 sm:p-6 shadow-lg w-full lg:min-w-[300px] lg:max-w-[300px]">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-white font-bold text-base sm:text-lg">Current Plan</h3>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-opacity-80 text-xs sm:text-sm">
                      Plan
                    </span>
                    <span className="text-white font-bold text-base sm:text-lg">
                      {currentSubscription.plan}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white text-opacity-80 text-xs sm:text-sm">
                      Status
                    </span>
                    <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-green-500 bg-opacity-20 backdrop-blur-sm rounded-full text-green-300 text-xs sm:text-sm font-semibold">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                      {currentSubscription.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-white text-opacity-80 text-xs sm:text-sm">
                      Billing
                    </span>
                    <span className="text-white font-semibold text-xs sm:text-sm capitalize">
                      {currentSubscription.plan}
                    </span>
                  </div>

                  {currentSubscription.currentPeriodEnd && (
                    <div className="pt-2 sm:pt-3 border-t border-white border-opacity-20">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-opacity-80 text-xs sm:text-sm">
                          Renews on
                        </span>
                        <span className="text-white font-semibold text-xs sm:text-sm">
                          {new Date(
                            currentSubscription.currentPeriodEnd
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <span
              className={`text-sm font-medium ${
                selectedPlan === "monthly" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setSelectedPlan(selectedPlan === "monthly" ? "annual" : "monthly")
              }
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors focus:outline-none"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  selectedPlan === "annual" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                selectedPlan === "annual" ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Annual
            </span>
          </div>
          {selectedPlan === "annual" && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
              Save 17%
            </span>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl shadow-sm border-2 overflow-hidden hover:shadow-md transition ${
                plan.popular ? "border-slate-800 relative" : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 text-white px-3 sm:px-4 py-1 text-xs font-bold rounded-bl-lg z-10">
                  MOST POPULAR
                </div>
              )}

              <div className={`h-24 sm:h-32 bg-linear-to-r ${plan.color} p-4 sm:p-6`}>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  {plan.name}
                </h3>
                <p className="text-white text-opacity-90 text-xs sm:text-sm">
                  {plan.description}
                </p>
              </div>

              <div className="p-4 sm:p-6">
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                      $
                      {selectedPlan === "monthly"
                        ? plan.monthlyPrice
                        : plan.annualPrice}
                    </span>
                    <span className="text-gray-600 text-xs sm:text-sm">
                      /{selectedPlan === "monthly" ? "month" : "year"}
                    </span>
                  </div>
                  {selectedPlan === "annual" && plan.annualPrice > 0 && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      ${(plan.annualPrice / 12).toFixed(0)}/month billed
                      annually
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleSelectPlan(plan.id as PlanId)}
                  className={`w-full px-4 sm:px-6 py-2.5 sm:py-3 font-bold rounded-lg shadow-lg transition-all duration-300 mb-4 sm:mb-6 text-sm sm:text-base ${
                    plan.popular
                      ? "bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 text-white hover:shadow-2xl hover:scale-105"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {plan.id === "free" ? "Get Started" : "Subscribe Now"}
                </button>

                <div className="space-y-2 sm:space-y-3">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-2 sm:mb-3">
                    What's included:
                  </p>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-xs sm:text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="max-w-4xl mx-auto mt-8 sm:mt-12 text-center px-4">
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
            Trusted by over 10,000 teams worldwide
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span className="text-xs sm:text-sm font-medium">256-bit SSL Encryption</span>
            </div>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="text-xs sm:text-sm font-medium">Money-back Guarantee</span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="text-xs sm:text-sm font-medium">Cancel Anytime</span>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedTier && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto"
          onClick={() => setShowCheckout(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-4 sm:p-6 my-4 sm:my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                Complete Your Purchase
              </h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                Order Summary
              </h3>
              <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
                <span className="text-gray-600 capitalize">
                  {selectedTier} Plan ({selectedPlan})
                </span>
                <span className="font-bold text-gray-900">
                  $
                  {selectedPlan === "monthly"
                    ? plans.find((p) => p.id === selectedTier)?.monthlyPrice
                    : plans.find((p) => p.id === selectedTier)?.annualPrice}
                </span>
              </div>
              <div className="border-t border-gray-200 mt-2 sm:mt-3 pt-2 sm:pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900 text-sm sm:text-base">Total</span>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">
                  $
                  {selectedPlan === "monthly"
                    ? plans.find((p) => p.id === selectedTier)?.monthlyPrice
                    : plans.find((p) => p.id === selectedTier)?.annualPrice}
                </span>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Billing Email
                </label>
                <input
                  type="email"
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(formatCardNumber(e.target.value.slice(0, 19)))
                  }
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={(e) =>
                      setExpiryDate(formatExpiryDate(e.target.value))
                    }
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))
                    }
                    placeholder="123"
                    maxLength={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <span>Your payment information is secure and encrypted</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-6">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="w-full sm:flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className={`w-full sm:flex-1 px-4 py-2.5 sm:py-3 text-sm sm:text-base font-bold rounded-lg transition-all duration-300
                    ${
                      isProcessing
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-linear-to-r from-slate-700 via-slate-800 to-slate-900 hover:shadow-2xl hover:scale-105 text-white"
                    }`}
                >
                  {isProcessing ? "Processing..." : "Complete Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}