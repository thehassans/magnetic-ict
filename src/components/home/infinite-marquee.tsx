"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function InfiniteMarquee({
  items,
  duration = 30,
  className,
  itemClassName,
  reverse = false
}: {
  items: ReactNode[];
  duration?: number;
  className?: string;
  itemClassName?: string;
  reverse?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const duplicated = [...items, ...items];

  if (reduceMotion) {
    return (
      <div className={cn("overflow-hidden", className)}>
        <div className="flex flex-wrap justify-center gap-4">
          {items.map((item, index) => (
            <div key={index} className={itemClassName}>
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        className="flex w-max gap-4 will-change-transform"
        animate={{
          x: reverse ? ["-50%", "0%"] : ["0%", "-50%"]
        }}
        transition={{
          duration,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop"
        }}
      >
        {duplicated.map((item, index) => (
          <div key={`${index}-${reverse ? "r" : "l"}`} className={itemClassName}>
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
