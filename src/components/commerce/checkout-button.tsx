"use client";

import { useTransition } from "react";
import { ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useCommerce } from "@/components/commerce/commerce-provider";

export function CheckoutButton({
  checkoutPath = "/checkout",
  disabled,
  className,
  compact = false
}: {
  checkoutPath?: string;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
}) {
  const { status } = useSession();
  const { closeCart } = useCommerce();
  const router = useRouter();
  const t = useTranslations("Commerce");
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled || isPending}
      onClick={() => {
        if (status === "authenticated") {
          closeCart();
          startTransition(() => router.push(checkoutPath));
          return;
        }

        closeCart();
        startTransition(() => router.push(`/customer/sign-in?callback=${encodeURIComponent(checkoutPath)}`));
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50",
        compact ? "h-11" : "h-12",
        className
      )}
    >
      {isPending ? t("redirecting") : t("checkout")}
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}
