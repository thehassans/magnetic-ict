"use client";

import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { useCommerce } from "@/components/commerce/commerce-provider";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function CartTrigger({ className }: { className?: string }) {
  const { itemCount } = useCommerce();

  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
    >
      <Link
        href="/cart"
        className={cn(
          "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 transition hover:border-violet-200 hover:bg-violet-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-cyan-400/20 dark:hover:bg-white/10",
          className
        )}
      >
        <ShoppingCart className="h-4 w-4" />
        {itemCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-bold text-slate-950">
            {itemCount}
          </span>
        ) : null}
      </Link>
    </motion.div>
  );
}
