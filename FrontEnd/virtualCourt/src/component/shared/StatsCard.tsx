import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { cn } from "../utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
  to?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, className, delay = 0, to }: StatsCardProps) {
  const Content = (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {trend && (
          <p className={cn(
            "text-sm mt-2",
            trend.isPositive ? "text-success" : "text-destructive"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}% from last month
          </p>
        )}
      </div>
      <div className="p-3 rounded-lg gradient-primary">
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        "glass-card rounded-xl hover-lift",
        to && "cursor-pointer transition-colors active:scale-95",
        className
      )}
    >
      {to ? (
        <Link to={to} className="block w-full h-full p-6">
          {Content}
        </Link>
      ) : (
        <div className="p-6">
          {Content}
        </div>
      )}
    </motion.div>
  );
}
