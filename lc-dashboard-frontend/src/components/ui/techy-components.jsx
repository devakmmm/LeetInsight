import React, { memo } from "react";

export const GlowingCard = memo(function GlowingCard({ children, className = "", glowColor = "green" }) {
  const glowColors = {
    green: "from-green-500/20 to-emerald-500/20",
    purple: "from-purple-500/20 to-pink-500/20",
    blue: "from-blue-500/20 to-cyan-500/20",
    orange: "from-orange-500/20 to-yellow-500/20",
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Glow effect */}
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r ${glowColors[glowColor]} rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500`}
      />
      {/* Card content */}
      <div className="relative rounded-2xl border border-white/10 bg-background/80 backdrop-blur-xl p-6">
        {children}
      </div>
    </div>
  );
});

export const FloatingOrb = memo(function FloatingOrb({ color = "green", size = "lg", className = "" }) {
  const sizes = {
    sm: "h-32 w-32",
    md: "h-64 w-64",
    lg: "h-96 w-96",
    xl: "h-[500px] w-[500px]",
  };

  const colors = {
    green: "from-green-500/30 to-emerald-500/30",
    purple: "from-purple-500/30 to-pink-500/30",
    blue: "from-blue-500/30 to-cyan-500/30",
  };

  return (
    <div
      className={`absolute rounded-full blur-3xl bg-gradient-to-br ${colors[color]} ${sizes[size]} ${className} animate-float-slow`}
      style={{
        animation: 'float-slow 20s ease-in-out infinite',
      }}
    />
  );
});

export function GridPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
}

export function AnimatedBorder({ children, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -inset-[1px] bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-2xl opacity-20 blur-sm animate-pulse" />
      <div className="absolute -inset-[1px] bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 rounded-2xl opacity-40" />
      <div className="relative bg-background rounded-2xl">{children}</div>
    </div>
  );
}

export const StatCard = memo(function StatCard({ label, value, subValue, icon: Icon, trend, color = "green" }) {
  const colorClasses = {
    green: "from-green-500 to-emerald-500 text-green-400",
    blue: "from-blue-500 to-cyan-500 text-blue-400",
    purple: "from-purple-500 to-pink-500 text-purple-400",
    orange: "from-orange-500 to-yellow-500 text-orange-400",
  };

  return (
    <div className="relative group hover:scale-[1.02] hover:-translate-y-0.5 transition-transform duration-300">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorClasses[color].split(" ")[0]} ${colorClasses[color].split(" ")[1]} rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-300`} />
      <div className="relative rounded-2xl border border-white/10 bg-background/60 backdrop-blur-xl p-5 overflow-hidden">
        {/* Background decoration */}
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClasses[color].split(" ")[0]} ${colorClasses[color].split(" ")[1]} opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`} />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {Icon && (
                <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClasses[color].split(" ")[0]} ${colorClasses[color].split(" ")[1]}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              )}
              <span className="text-sm text-muted-foreground font-medium">{label}</span>
            </div>
            {trend && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          <div className="text-3xl font-bold text-foreground">{value}</div>
          {subValue && <div className="text-sm text-muted-foreground mt-1">{subValue}</div>}
        </div>
      </div>
    </div>
  );
});

export function GlassNavbar({ children, className = "" }) {
  return (
    <div className={`sticky top-4 z-50 mx-4 rounded-2xl border border-white/10 bg-background/60 backdrop-blur-xl shadow-2xl shadow-black/10 ${className}`}>
      {children}
    </div>
  );
}

export function FeatureBadge({ children, variant = "default" }) {
  const variants = {
    default: "bg-white/5 border-white/10 text-muted-foreground",
    success: "bg-green-500/10 border-green-500/20 text-green-400",
    warning: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
}
