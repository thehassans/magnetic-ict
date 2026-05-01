import { Apple } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandProps = {
  className?: string;
};

export function VisaMark({ className }: BrandProps) {
  return (
    <span className={cn("inline-flex h-8 items-center rounded-xl border border-[#dbe5ff] bg-white px-3 shadow-sm", className)}>
      <span className="text-[0.8rem] font-black italic tracking-[-0.08em] text-[#1434cb]">VISA</span>
    </span>
  );
}

export function MastercardMark({ className }: BrandProps) {
  return (
    <span className={cn("inline-flex h-8 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm", className)}>
      <span className="relative flex h-4 w-7 items-center">
        <span className="absolute left-0 h-4 w-4 rounded-full bg-[#eb001b]" />
        <span className="absolute left-2.5 h-4 w-4 rounded-full bg-[#f79e1b] mix-blend-multiply" />
      </span>
      <span className="text-[0.66rem] font-semibold tracking-tight text-slate-700">mastercard</span>
    </span>
  );
}

export function PayPalMark({ className }: BrandProps) {
  return (
    <span className={cn("inline-flex h-9 items-center gap-2 rounded-xl border border-[#d8e7ff] bg-white px-3 shadow-sm", className)}>
      <span className="relative h-5 w-5">
        <span className="absolute inset-y-0 left-0 rounded-[5px] bg-[#003087] px-[5px] py-[1px] text-[11px] font-black italic leading-4 text-white">P</span>
        <span className="absolute inset-y-0 left-[6px] rounded-[5px] bg-[#009cde] px-[5px] py-[1px] text-[11px] font-black italic leading-4 text-white/95">P</span>
      </span>
      <span className="text-sm font-bold tracking-tight text-[#003087]">PayPal</span>
    </span>
  );
}

export function GooglePayMark({ className }: BrandProps) {
  return (
    <span className={cn("inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm", className)}>
      <span className="text-base font-black tracking-[-0.08em]">
        <span className="text-[#4285f4]">G</span>
        <span className="text-[#ea4335]">o</span>
        <span className="text-[#fbbc05]">o</span>
        <span className="text-[#4285f4]">g</span>
        <span className="text-[#34a853]">l</span>
        <span className="text-[#ea4335]">e</span>
      </span>
      <span className="text-sm font-semibold tracking-tight text-slate-800">Pay</span>
    </span>
  );
}

export function ApplePayMark({ className }: BrandProps) {
  return (
    <span className={cn("inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm", className)}>
      <Apple className="h-4 w-4 fill-current text-slate-950" />
      <span className="text-sm font-semibold tracking-tight text-slate-950">Pay</span>
    </span>
  );
}
