import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({
  className,
  priority = false,
  framed = false,
  lightSrc,
  darkSrc
}: {
  className?: string;
  priority?: boolean;
  framed?: boolean;
  lightSrc?: string;
  darkSrc?: string;
}) {
  const resolvedLight = lightSrc || "/branding/magnetic-ict-light.png";
  const resolvedDark  = darkSrc  || "/branding/magnetic-ict-darkmode.png";

  return (
    <span
      className={cn(
        "inline-flex w-[220px] items-center justify-center",
        framed && "rounded-[24px] border border-slate-200/80 bg-white/90 px-4 py-3 shadow-[0_16px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70",
        className
      )}
    >
      <Image
        src={resolvedLight}
        alt="Magnetic ICT"
        width={680}
        height={350}
        priority={priority}
        unoptimized={!!lightSrc}
        className="h-auto w-full object-contain dark:hidden"
      />
      <Image
        src={resolvedDark}
        alt="Magnetic ICT"
        width={800}
        height={330}
        priority={priority}
        unoptimized={!!darkSrc}
        className="hidden h-auto w-full object-contain dark:block"
      />
    </span>
  );
}
