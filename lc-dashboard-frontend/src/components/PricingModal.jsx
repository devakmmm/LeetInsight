import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const STRIPE_PRICE_ID = import.meta.env.VITE_STRIPE_PRICE_ID || "price_1234567890";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5050";

export function PricingModal({ onClose, onPaymentSuccess }) {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/stripe/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priceId: STRIPE_PRICE_ID }),
      }).then((r) => r.json());

      if (res.ok && res.url) {
        window.location.href = res.url; // Redirect to Stripe checkout
      } else {
        alert("Checkout failed: " + res.error);
      }
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const features = {
    free: [
      "Basic readiness score",
      "Last 7 days of history",
      "Ad-supported",
      "Limited snapshots",
    ],
    premium: [
      "Advanced readiness metrics",
      "Unlimited history (365 days)",
      "No ads",
      "Unlimited snapshots",
      "Export data (CSV/PDF)",
      "Priority support",
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Upgrade to Premium</CardTitle>
            <CardDescription>
              Unlock unlimited history and advanced analytics
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Free Tier */}
              <Card className="border-muted-foreground/20">
                <CardHeader>
                  <CardTitle className="text-lg">Free</CardTitle>
                  <div className="mt-2 text-3xl font-bold">$0</div>
                  <p className="text-xs text-muted-foreground">Forever free</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {features.free.map((f) => (
                    <div key={f} className="flex gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{f}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Premium Tier */}
              <Card className="border-green-500/50 bg-green-500/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Premium</CardTitle>
                      <div className="mt-2 text-3xl font-bold">$9.99/mo</div>
                      <p className="text-xs text-muted-foreground">Billed monthly</p>
                    </div>
                    <Badge className="bg-green-500">Popular</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {features.premium.map((f) => (
                    <div key={f} className="flex gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{f}</span>
                    </div>
                  ))}
                  <Button
                    onClick={handleUpgrade}
                    disabled={loading || user?.tier === "premium"}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700"
                  >
                    {user?.tier === "premium" ? "Current Plan" : loading ? "Loading..." : "Upgrade Now"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Continue with free plan
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
