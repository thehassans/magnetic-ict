"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface OrderConfirmationCardProps {
  orderId?: string;
  paymentMethod?: string;
  dateTime?: string;
  totalAmount?: string;
  onGoToAccount: () => void;
  title?: string;
  buttonText?: string;
  icon?: React.ReactNode;
  className?: string;
  details?: { label: string; value: string; isBold?: boolean }[];
}

export const OrderConfirmationCard: React.FC<OrderConfirmationCardProps> = ({
  orderId,
  paymentMethod,
  dateTime,
  totalAmount,
  onGoToAccount,
  title = "Your order has been successfully submitted",
  buttonText = "Go to my account",
  icon = <CheckCircle2 className="h-12 w-12 text-emerald-500" />,
  className,
  details: detailsProp,
}) => {
  const details =
    detailsProp ??
    [
      orderId ? { label: "Order ID", value: orderId } : null,
      paymentMethod ? { label: "Payment Method", value: paymentMethod } : null,
      dateTime ? { label: "Date & Time", value: dateTime } : null,
      totalAmount ? { label: "Total", value: totalAmount, isBold: true } : null,
    ].filter(Boolean) as { label: string; value: string; isBold?: boolean }[];

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.92, y: 16 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.08 },
    },
    exit: { opacity: 0, scale: 0.96, y: -8, transition: { duration: 0.25 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 120, damping: 14 } },
  };

  const iconVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 200, damping: 15, delay: 0.1 },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        aria-live="polite"
        className={cn(
          "w-full max-w-sm rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_8px_40px_rgba(0,0,0,0.3)] sm:p-8",
          className
        )}
      >
        <div className="flex flex-col items-center space-y-5 text-center">
          {/* Animated success icon with glow ring */}
          <motion.div variants={iconVariants} className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl" />
            {icon}
          </motion.div>

          {/* Title */}
          <motion.h2
            variants={itemVariants}
            className="text-xl font-bold leading-snug tracking-tight text-slate-900 dark:text-white"
          >
            {title}
          </motion.h2>

          {/* Details */}
          {details.length > 0 && (
            <motion.div variants={itemVariants} className="w-full space-y-3 pt-2">
              {details.map((item, index) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center justify-between border-b border-slate-100 pb-3 text-sm dark:border-white/[0.06]",
                    index === details.length - 1 && "border-none pb-0"
                  )}
                >
                  <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                  <span
                    className={cn(
                      "font-medium text-slate-900 dark:text-white",
                      item.isBold && "text-base font-bold"
                    )}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Action button */}
          <motion.div variants={itemVariants} className="w-full pt-2">
            <Button
              onClick={onGoToAccount}
              className="h-11 w-full rounded-2xl bg-slate-950 text-sm font-semibold text-white hover:bg-indigo-600 dark:bg-white dark:text-slate-950 dark:hover:bg-indigo-100"
              size="lg"
            >
              {buttonText}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
