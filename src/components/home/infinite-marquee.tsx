"use client";

import type { CSSProperties, ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
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
  const marqueeStyle = {
    "--marquee-duration": `${duration}s`,
    "--marquee-direction": reverse ? "reverse" : "normal"
  } as CSSProperties;

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
      <div className="marquee-track flex w-max gap-4 will-change-transform" style={marqueeStyle}>
        {duplicated.map((item, index) => (
          <div key={`${index}-${reverse ? "r" : "l"}`} className={itemClassName}>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
