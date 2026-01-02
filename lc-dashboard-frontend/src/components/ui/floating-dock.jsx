import React from "react";
import { motion } from "framer-motion";

export function FloatingDock({ items, className }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 rounded-2xl border bg-background/80 px-4 py-3 backdrop-blur-xl shadow-2xl ${className || ""}`}
    >
      {items.map((item, idx) => (
        <motion.a
          key={idx}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.2, y: -8 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary"
          title={item.title}
        >
          {item.icon}
        </motion.a>
      ))}
    </motion.div>
  );
}
