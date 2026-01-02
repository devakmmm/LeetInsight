import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdBanner({ onClose, onUpgradeClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl border bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 mb-4 flex items-center justify-between"
    >
      <div className="flex-1">
        <div className="text-sm font-medium text-foreground">Upgrade to Premium</div>
        <div className="text-xs text-muted-foreground mt-1">
          Unlimited history, no ads, and data export for just $9.99/month
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        <Button size="sm" className="h-8" onClick={onUpgradeClick}>
          Upgrade
        </Button>
        <button
          onClick={onClose}
          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-background/70"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
