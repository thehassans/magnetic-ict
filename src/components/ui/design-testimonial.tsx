"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useTranslations } from "next-intl"

const testimonials = [
  {
    quote: "Transformed our entire e-commerce operations. The admin panel is incredibly powerful.",
    author: "Ahmed Wasim",
    role: "CEO & Founder",
    company: "Magnetic Commerce",
  },
  {
    quote: "The AI automation handles our entire customer support flow. Absolutely game-changing.",
    author: "Hassan Sarwar",
    role: "CTO",
    company: "Magnetic Social Bot",
  },
  {
    quote: "Blazing fast servers with zero downtime. Best hosting decision we ever made.",
    author: "Hassan Sarwar",
    role: "CTO",
    company: "Magnetic VPS",
  },
]

export function Testimonial() {
  const t = useTranslations("FeaturedTestimonials")
  const [activeIndex, setActiveIndex] = useState(0)
  
  const translatedTestimonials = testimonials.map((item, index) => ({
    ...item,
    quote: t(`item${index}_quote`) || item.quote,
    role: t(`item${index}_role`) || item.role,
  }))

  const containerRef = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 200 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  const numberX = useTransform(x, [-200, 200], [-20, 20])
  const numberY = useTransform(y, [-200, 200], [-10, 10])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      mouseX.set(e.clientX - centerX)
      mouseY.set(e.clientY - centerY)
    }
  }

  const goNext = () => setActiveIndex((prev) => (prev + 1) % translatedTestimonials.length)
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + translatedTestimonials.length) % translatedTestimonials.length)

  useEffect(() => {
    const timer = setInterval(goNext, 6000)
    return () => clearInterval(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const current = translatedTestimonials[activeIndex]

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-[40px] border border-slate-200/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(248,250,252,0.98))] px-6 py-10 shadow-[0_25px_80px_rgba(59,130,246,0.06)] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(2,6,23,0.96),rgba(15,23,42,0.92))] sm:px-10 sm:py-14 lg:px-14"
      onMouseMove={handleMouseMove}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(99,102,241,0.08),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.06),transparent_40%)] dark:bg-[radial-gradient(circle_at_20%_50%,rgba(99,102,241,0.16),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.12),transparent_40%)]" />

      {/* Oversized index number */}
      <motion.div
        className="absolute -left-4 top-1/2 -translate-y-1/2 select-none pointer-events-none leading-none tracking-tighter text-[14rem] font-bold text-slate-950/[0.03] dark:text-white/[0.03] sm:text-[18rem]"
        style={{ x: numberX, y: numberY }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={activeIndex}
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="block"
          >
            {String(activeIndex + 1).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      {/* Main content */}
      <div className="relative flex">
        {/* Left column – vertical label + progress */}
        <div className="hidden flex-col items-center justify-center pr-10 sm:flex border-r border-slate-200/60 dark:border-white/[0.08]">
          <motion.span
            className="text-[10px] font-mono text-slate-400 dark:text-slate-500 tracking-widest uppercase"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Testimonials
          </motion.span>
          <div className="relative mt-6 h-24 w-px bg-slate-200 dark:bg-white/10">
            <motion.div
              className="absolute top-0 left-0 w-full bg-indigo-500 origin-top"
              animate={{ height: `${((activeIndex + 1) / testimonials.length) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {/* Center – content */}
        <div className="flex-1 sm:pl-10 py-2">
          {/* Company badge */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200/70 dark:border-white/10 rounded-full px-3 py-1 bg-white/60 dark:bg-white/[0.04]">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                {current.company}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Quote */}
          <div className="relative mb-10 min-h-[100px]">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={activeIndex}
                className="text-2xl font-light text-slate-950 dark:text-white leading-[1.2] tracking-tight sm:text-3xl lg:text-4xl"
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {current.quote.split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    className="inline-block mr-[0.25em]"
                    variants={{
                      hidden: { opacity: 0, y: 20, rotateX: 90 },
                      visible: {
                        opacity: 1, y: 0, rotateX: 0,
                        transition: { duration: 0.5, delay: i * 0.045, ease: [0.22, 1, 0.36, 1] },
                      },
                      exit: {
                        opacity: 0, y: -10,
                        transition: { duration: 0.2, delay: i * 0.015 },
                      },
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* Author + nav */}
          <div className="flex items-end justify-between gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="flex items-center gap-4"
              >
                <motion.div
                  className="w-8 h-px bg-slate-950 dark:bg-white"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  style={{ originX: 0 }}
                />
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{current.author}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{current.role}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={goPrev}
                aria-label="Previous testimonial"
                className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] overflow-hidden"
                whileTap={{ scale: 0.93 }}
                whileHover={{ borderColor: "rgba(99,102,241,0.5)" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="relative z-10 text-slate-700 dark:text-slate-300">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
              <motion.button
                onClick={goNext}
                aria-label="Next testimonial"
                className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-white/[0.04] overflow-hidden"
                whileTap={{ scale: 0.93 }}
                whileHover={{ borderColor: "rgba(99,102,241,0.5)" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="relative z-10 text-slate-700 dark:text-slate-300">
                  <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="mt-6 flex justify-center gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-label={`Go to testimonial ${i + 1}`}
            className="h-1 rounded-full transition-all duration-500"
            style={{
              width: i === activeIndex ? "2rem" : "0.5rem",
              background: i === activeIndex ? "rgb(99,102,241)" : "rgba(99,102,241,0.25)",
            }}
          />
        ))}
      </div>

      {/* Bottom ticker */}
      <div className="absolute -bottom-8 left-0 right-0 overflow-hidden opacity-[0.06] pointer-events-none select-none">
        <motion.div
          className="flex whitespace-nowrap text-4xl font-bold tracking-tight text-slate-950 dark:text-white"
          animate={{ x: [0, -800] }}
          transition={{ duration: 18, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          {[...Array(12)].map((_, i) => (
            <span key={i} className="mx-6">
              {testimonials.map((t) => t.company).join(" · ")} ·
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
