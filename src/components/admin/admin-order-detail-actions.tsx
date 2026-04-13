"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

type AdminOrderStatus = "CART" | "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "FULFILLED";

export function AdminOrderDetailActions({ orderId, status }: { orderId: string; status: AdminOrderStatus }) {
  const t = useTranslations("Pages");
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleFulfill() {
    setError("");

    startTransition(async () => {
      const response = await fetch(`/api/admin/orders/${orderId}/fulfill`, {
        method: "POST"
      });

      const payload = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(payload.error ?? t("adminOrdersFulfillError"));
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={handleFulfill}
        disabled={isPending || status !== "PAID"}
        className="inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? t("adminOrdersFulfilling") : t("adminOrdersFulfillAction")}
      </button>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
