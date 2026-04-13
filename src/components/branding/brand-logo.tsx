import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/branding/magnetic-ict.png"
      alt="Magnetic"
      width={680}
      height={350}
      priority={priority}
      className={cn("h-auto w-[220px] object-contain", className)}
    />
  );
}
