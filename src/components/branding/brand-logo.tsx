import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <span className={cn("inline-flex w-[220px]", className)}>
      <Image
        src="/branding/magnetic-ict-light.png"
        alt="Magnetic ICT"
        width={680}
        height={350}
        priority={priority}
        className="h-auto w-full object-contain dark:hidden"
      />
      <Image
        src="/branding/magnetic-ict-darkmode.png"
        alt="Magnetic ICT"
        width={800}
        height={330}
        priority={priority}
        className="hidden h-auto w-full object-contain dark:block"
      />
    </span>
  );
}
