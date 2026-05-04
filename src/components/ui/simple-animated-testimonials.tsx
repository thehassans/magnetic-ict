"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { motion, useAnimation, useInView } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

export interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  testimonials?: ReadonlyArray<Testimonial>;
  autoRotateInterval?: number;
  showVerifiedBadge?: boolean;
  trustedCompanies?: string[];
  trustedCompaniesTitle?: string;
  className?: string;
  theme?: "light" | "dark";
}

export function TestimonialsSection({
  title = "Loved by Developers",
  subtitle = "See what others are saying about our premium starter template",
  testimonials = [],
  autoRotateInterval = 6000,
  showVerifiedBadge = true,
  trustedCompanies = [],
  trustedCompaniesTitle = "Trusted by teams at these companies and more",
  className,
  theme = "light"
}: TestimonialsSectionProps) {
  const isDark = theme === "dark";
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const controls = useAnimation();

  useEffect(() => {
    if (autoRotateInterval <= 0 || testimonials.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, autoRotateInterval);

    return () => clearInterval(interval);
  }, [testimonials.length, autoRotateInterval]);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} id="testimonials-alt" className={cn("relative flex justify-center overflow-hidden py-12", className)}>
      <div className="w-full px-4 md:px-6">
        <motion.div initial="hidden" animate={controls} variants={containerVariants} className="mb-8 space-y-4 text-left">
          <motion.h2 variants={itemVariants} className={cn("text-3xl font-bold tracking-tighter sm:text-4xl", isDark ? "text-white" : "text-slate-950")}>
            {title}
          </motion.h2>
          <motion.p variants={itemVariants} className={cn("max-w-[700px] md:text-lg/relaxed", isDark ? "text-slate-300" : "text-slate-600")}>
            {subtitle}
          </motion.p>
        </motion.div>

        <motion.div initial="hidden" animate={controls} variants={containerVariants} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <motion.div variants={itemVariants} className="relative">
            <div className={cn("absolute -left-3 -top-5 z-10 rounded-full border p-2 shadow-sm", isDark ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300" : "border-cyan-200 bg-cyan-50 text-cyan-600")}>
              <Quote className="h-8 w-8" strokeWidth={1.2} />
            </div>

            <div className="relative h-[360px] sm:h-[320px]">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={testimonial.id}
                  className={cn(
                    "absolute inset-0 rounded-[1.75rem] transition-all duration-500",
                    isDark
                      ? "border border-white/10 bg-slate-950/80 text-white shadow-[0_24px_80px_rgba(2,6,23,0.5)]"
                      : "border border-slate-200/80 bg-white/95 text-slate-950 shadow-[0_18px_60px_rgba(15,23,42,0.08)]",
                    index === activeIndex ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-[80px] opacity-0"
                  )}
                >
                  <CardContent className="flex h-full flex-col p-6 md:p-8">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className={cn("h-14 w-14 border-2 shadow-sm", isDark ? "border-cyan-400/20" : "border-cyan-100")}>
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className={cn("font-semibold", isDark ? "text-white" : "text-slate-950")}>{testimonial.name}</h4>
                          <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                            {testimonial.role}, {testimonial.company}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, index) => (
                          <Star key={index} className="h-4 w-4 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                    </div>

                    <Separator className={cn("my-4", isDark ? "bg-white/10" : "bg-slate-200")} />

                    <p className={cn("flex-1 text-base/relaxed italic", isDark ? "text-slate-200" : "text-slate-700")}>&quot;{testimonial.content}&quot;</p>

                    {showVerifiedBadge ? <div className={cn("mt-4 text-right text-xs", isDark ? "text-slate-400" : "text-slate-500")}>Verified Developer</div> : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-4 flex items-center justify-center gap-4 xl:mt-0 xl:flex-col">
            <Button variant="outline" size="icon" onClick={handlePrev} className="h-10 w-10 rounded-full" aria-label="Previous testimonial">
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 xl:flex-col">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={cn("h-2 w-2 rounded-full transition-colors", index === activeIndex ? "bg-cyan-500" : "bg-slate-300 dark:bg-white/20")}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button variant="outline" size="icon" onClick={handleNext} className="h-10 w-10 rounded-full" aria-label="Next testimonial">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>

        {trustedCompanies.length > 0 ? (
          <motion.div variants={itemVariants} className={cn("mt-10 border-t pt-8", isDark ? "border-white/10" : "border-slate-200")}>
            <h3 className={cn("mb-6 text-center text-sm font-medium", isDark ? "text-slate-400" : "text-slate-500")}>{trustedCompaniesTitle}</h3>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
              {trustedCompanies.map((company) => (
                <div key={company} className={cn("text-base font-semibold", isDark ? "text-slate-500" : "text-slate-400")}>
                  {company}
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
