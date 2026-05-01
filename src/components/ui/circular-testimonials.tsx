"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties
} from "react";
import { BadgeCheck, Building2, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
  company?: string;
  rating?: number;
  badgeLabel?: string;
};

type Colors = {
  name?: string;
  designation?: string;
  testimony?: string;
  arrowBackground?: string;
  arrowForeground?: string;
  arrowHoverBackground?: string;
};

type FontSizes = {
  name?: string;
  designation?: string;
  quote?: string;
};

type CircularTestimonialsProps = {
  testimonials: Testimonial[];
  autoplay?: boolean;
  colors?: Colors;
  fontSizes?: FontSizes;
  theme?: "light" | "dark";
};

function calculateGap(width: number) {
  const minWidth = 1024;
  const maxWidth = 1456;
  const minGap = 60;
  const maxGap = 86;

  if (width <= minWidth) {
    return minGap;
  }

  if (width >= maxWidth) {
    return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));
  }

  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

export function CircularTestimonials({
  testimonials,
  autoplay = true,
  colors = {},
  fontSizes = {},
  theme = "light"
}: CircularTestimonialsProps) {
  const isDark = theme === "dark";
  const colorName = colors.name ?? (isDark ? "#f8fafc" : "#020617");
  const colorDesignation = colors.designation ?? (isDark ? "#cbd5e1" : "#475569");
  const colorTestimony = colors.testimony ?? (isDark ? "#e2e8f0" : "#0f172a");
  const colorArrowBg = colors.arrowBackground ?? (isDark ? "#e2e8f0" : "#0f172a");
  const colorArrowFg = colors.arrowForeground ?? (isDark ? "#020617" : "#f8fafc");
  const colorArrowHoverBg = colors.arrowHoverBackground ?? (isDark ? "#22d3ee" : "#06b6d4");
  const fontSizeName = fontSizes.name ?? "1.875rem";
  const fontSizeDesignation = fontSizes.designation ?? "1rem";
  const fontSizeQuote = fontSizes.quote ?? "1.125rem";

  const [activeIndex, setActiveIndex] = useState(0);
  const [hoverPrev, setHoverPrev] = useState(false);
  const [hoverNext, setHoverNext] = useState(false);
  const [containerWidth, setContainerWidth] = useState(1200);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const autoplayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const testimonialsLength = useMemo(() => testimonials.length, [testimonials]);
  const activeTestimonial = useMemo(() => testimonials[activeIndex] ?? testimonials[0], [activeIndex, testimonials]);

  const handleNext = useCallback(() => {
    if (testimonialsLength <= 1) {
      return;
    }

    setActiveIndex((prev) => (prev + 1) % testimonialsLength);

    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
  }, [testimonialsLength]);

  const handlePrev = useCallback(() => {
    if (testimonialsLength <= 1) {
      return;
    }

    setActiveIndex((prev) => (prev - 1 + testimonialsLength) % testimonialsLength);

    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
  }, [testimonialsLength]);

  useEffect(() => {
    if (testimonialsLength === 0) {
      return;
    }

    setActiveIndex((prev) => prev % testimonialsLength);
  }, [testimonialsLength]);

  useEffect(() => {
    const container = imageContainerRef.current;

    if (!container) {
      return;
    }

    const updateWidth = () => {
      setContainerWidth(container.offsetWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!autoplay || testimonialsLength <= 1) {
      return;
    }

    autoplayIntervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonialsLength);
    }, 5000);

    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
        autoplayIntervalRef.current = null;
      }
    };
  }, [autoplay, testimonialsLength]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handlePrev();
      }

      if (event.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [handleNext, handlePrev]);

  function getImageStyle(index: number): CSSProperties {
    const gap = calculateGap(containerWidth);
    const maxStickUp = gap * 0.8;
    const isActive = index === activeIndex;
    const isLeft = (activeIndex - 1 + testimonialsLength) % testimonialsLength === index;
    const isRight = (activeIndex + 1) % testimonialsLength === index;

    if (isActive) {
      return {
        zIndex: 3,
        opacity: 1,
        pointerEvents: "auto",
        transform: "translateX(-50%) translateY(0px) scale(1) rotateY(0deg)",
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)"
      };
    }

    if (isLeft) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(calc(-50% - ${gap}px)) translateY(-${maxStickUp}px) scale(0.91) rotateY(15deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)"
      };
    }

    if (isRight) {
      return {
        zIndex: 2,
        opacity: 1,
        pointerEvents: "auto",
        transform: `translateX(calc(-50% + ${gap}px)) translateY(-${maxStickUp}px) scale(0.91) rotateY(-15deg)`,
        transition: "all 0.8s cubic-bezier(.4,2,.3,1)"
      };
    }

    return {
      zIndex: 1,
      opacity: 0,
      pointerEvents: "none",
      transform: "translateX(-50%) translateY(-30px) scale(0.78)",
      transition: "all 0.8s cubic-bezier(.4,2,.3,1)"
    };
  }

  if (!activeTestimonial) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl px-2 sm:px-4">
      <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-14">
        <div ref={imageContainerRef} className="relative h-[10rem] w-full perspective-[1400px] sm:h-[12rem] lg:h-[14rem]">
          {testimonials.map((testimonial, index) => (
            <button
              key={`${testimonial.name}-${testimonial.src}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`absolute left-1/2 top-0 h-full w-[60%] overflow-hidden rounded-[1.5rem] border backdrop-blur-sm ${
                isDark
                  ? "border-white/10 bg-slate-950/45 shadow-[0_30px_90px_rgba(2,6,23,0.55)] ring-1 ring-white/10"
                  : "border-white/60 bg-white/70 shadow-[0_28px_80px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/70"
              }`}
              style={getImageStyle(index)}
              aria-label={`View testimonial from ${testimonial.name}`}
            >
              <Image
                src={testimonial.src}
                alt={testimonial.name}
                fill
                sizes="(max-width: 768px) 72vw, 32vw"
                className="object-cover"
                unoptimized
              />
              <div className={`absolute inset-0 ${isDark ? "bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" : "bg-gradient-to-t from-slate-950/35 via-slate-950/5 to-transparent"}`} />
            </button>
          ))}
        </div>

        <div className="flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-5"
            >
              <div>
                <h3 className="font-semibold tracking-tight" style={{ color: colorName, fontSize: fontSizeName }}>
                  {activeTestimonial.name}
                </h3>
                <p className="mt-2 leading-7" style={{ color: colorDesignation, fontSize: fontSizeDesignation }}>
                  {activeTestimonial.designation}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {activeTestimonial.company ? (
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase ${
                    isDark
                      ? "border-white/10 bg-white/5 text-slate-200"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}>
                    <Building2 className="h-3.5 w-3.5" />
                    {activeTestimonial.company}
                  </div>
                ) : null}
                {activeTestimonial.badgeLabel ? (
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase ${
                    isDark
                      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
                      : "border-cyan-200 bg-cyan-50 text-cyan-700"
                  }`}>
                    <BadgeCheck className="h-3.5 w-3.5" />
                    {activeTestimonial.badgeLabel}
                  </div>
                ) : null}
              </div>

              {activeTestimonial.rating ? (
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: Math.floor(activeTestimonial.rating) }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className={`ml-2 text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-500"}`}>{activeTestimonial.rating.toFixed(1)} / 5.0</span>
                </div>
              ) : null}

              <motion.p className="leading-8" style={{ color: colorTestimony, fontSize: fontSizeQuote }}>
                {activeTestimonial.quote.split(" ").map((word, index) => (
                  <motion.span
                    key={`${word}-${index}`}
                    initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: "easeInOut", delay: 0.025 * index }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center gap-4">
            <button
              type="button"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full transition-colors"
              onClick={handlePrev}
              onMouseEnter={() => setHoverPrev(true)}
              onMouseLeave={() => setHoverPrev(false)}
              aria-label="Previous testimonial"
              style={{ backgroundColor: hoverPrev ? colorArrowHoverBg : colorArrowBg }}
            >
              <ChevronLeft className="h-6 w-6" style={{ color: colorArrowFg }} />
            </button>
            <button
              type="button"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full transition-colors"
              onClick={handleNext}
              onMouseEnter={() => setHoverNext(true)}
              onMouseLeave={() => setHoverNext(false)}
              aria-label="Next testimonial"
              style={{ backgroundColor: hoverNext ? colorArrowHoverBg : colorArrowBg }}
            >
              <ChevronRight className="h-6 w-6" style={{ color: colorArrowFg }} />
            </button>
            <div className="ml-2 flex items-center gap-2">
              {testimonials.map((testimonial, index) => (
                <button
                  key={`${testimonial.name}-dot`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2.5 rounded-full transition-all ${
                    index === activeIndex
                      ? isDark
                        ? "w-8 bg-cyan-400"
                        : "w-8 bg-slate-950"
                      : isDark
                        ? "w-2.5 bg-white/20"
                        : "w-2.5 bg-slate-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CircularTestimonials;
