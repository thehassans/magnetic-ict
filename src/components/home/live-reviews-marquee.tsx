"use client";

import { Star } from "lucide-react";
import { ScrollReveal } from "@/components/home/scroll-reveal";
import { TestimonialsSection } from "@/components/ui/simple-animated-testimonials";
import { developerTestimonials } from "@/lib/developer-testimonials";
import { cn } from "@/lib/utils";

export function LiveReviewsMarquee() {
  const customerReviews = [
    {
      id: "emily-chen",
      name: "Emily Chen",
      role: "eCommerce Owner",
      company: "Magnetic Cloud Customer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=640&h=640&fit=crop&crop=face",
      rating: 5,
      comment: "Migrated from another host and the difference is night and day. Highly recommend!"
    },
    {
      id: "michael-brown",
      name: "Michael Brown",
      role: "Startup Founder",
      company: "Magnetic Cloud Customer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=640&h=640&fit=crop&crop=face",
      rating: 5,
      comment: "The cloud servers are blazing fast. Perfect for our growing business needs."
    },
    {
      id: "fatima-rahman",
      name: "Fatima Rahman",
      role: "Blogger",
      company: "Magnetic Cloud Customer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=640&h=640&fit=crop&crop=face",
      rating: 5,
      comment: "Simple setup and great performance. My blog loads instantly now!"
    },
    {
      id: "james-wilson",
      name: "James Wilson",
      role: "Agency Director",
      company: "Magnetic Cloud Customer",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=640&h=640&fit=crop&crop=face",
      rating: 5,
      comment: "We host 50+ client sites here. Never had any issues. Premium quality service."
    },
    {
      id: "sophie-anderson",
      name: "Sophie Anderson",
      role: "Marketing Manager",
      company: "Magnetic Cloud Customer",
      avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=640&h=640&fit=crop&crop=face",
      rating: 5,
      comment: "Incredible speed and reliability. Our campaigns run smoothly every time."
    },
    {
      id: "lisa-wang",
      name: "Lisa Wang",
      role: "Product Manager",
      company: "Magnetic Cloud Customer",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=640&h=640&fit=crop&crop=face",
      rating: 5,
      comment: "Seamless integration with our workflow. Highly recommended!"
    },
    {
      id: "alex-johnson",
      name: "Alex Johnson",
      role: "CTO",
      company: "Magnetic Cloud Customer",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=640&h=640&fit=crop&crop=face",
      rating: 5,
      comment: "Enterprise-grade security and performance. Top notch!"
    },
    {
      id: "maria-garcia",
      name: "Maria Garcia",
      role: "Freelancer",
      company: "Magnetic Cloud Customer",
      avatar: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=640&h=640&fit=crop&crop=face",
      rating: 5,
      comment: "Affordable and reliable. Perfect for freelancers like me."
    },
    {
      id: "john-smith",
      name: "John Smith",
      role: "Developer",
      company: "Magnetic Cloud Customer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=640&h=640&fit=crop&crop=face",
      rating: 5,
      comment: "The API is fantastic. Integration was a breeze."
    }
  ];

  return (
    <section id="home-reviews" className="space-y-10 py-10 sm:py-14">
      <ScrollReveal>
        <div className="rounded-[2.5rem] border border-slate-200 bg-white px-4 py-6 shadow-[0_30px_100px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-sm font-bold text-[#4285F4] shadow-sm dark:bg-white/95">G</span>
              <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </span>
                <span>328 Reviews on Google</span>
              </span>
            </div>

            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
              Loved by <span className="text-violet-600 dark:text-violet-400">50,000+</span> Customers
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
              Join thousands of businesses who trust us for their cloud infrastructure.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {customerReviews.map((review, index) => (
              <article
                key={review.id}
                className={cn(
                  "group rounded-[1.5rem] border p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(15,23,42,0.09)]",
                  index === 2
                    ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                    : "border-slate-200 bg-white/95 text-slate-950 dark:border-white/10 dark:bg-white/[0.03] dark:text-white"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full ring-1 ring-slate-200 dark:ring-white/10">
                      <img src={review.avatar} alt={review.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className={cn("truncate text-sm font-semibold leading-none", index === 2 ? "text-white dark:text-slate-950" : "text-slate-950 dark:text-white")}>{review.name}</div>
                      <div className={cn("mt-1 truncate text-[11px] uppercase tracking-[0.18em]", index === 2 ? "text-white/65 dark:text-slate-700" : "text-slate-400 dark:text-slate-500")}>{review.role}</div>
                    </div>
                  </div>

                  <span className={cn("text-lg font-semibold leading-none", index === 2 ? "text-white/90 dark:text-slate-950" : "text-slate-300 dark:text-slate-500")}>G</span>
                </div>

                <div className="mt-4 flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className={cn(
                        "h-3.5 w-3.5",
                        starIndex < Math.floor(review.rating)
                          ? "fill-amber-400 text-amber-400"
                          : index === 2
                            ? "fill-white/15 text-white/15 dark:fill-slate-300/30 dark:text-slate-300/30"
                            : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                      )}
                    />
                  ))}
                </div>

                <p className={cn("mt-4 text-sm leading-6", index === 2 ? "text-white/85 dark:text-slate-700" : "text-slate-600 dark:text-slate-300")}>{review.comment}</p>

                <div className={cn("mt-4 text-[11px] uppercase tracking-[0.22em]", index === 2 ? "text-white/55 dark:text-slate-700" : "text-slate-400 dark:text-slate-500")}>{review.company}</div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(99,102,241,0.35)] transition hover:bg-indigo-600"
            >
              View All 2,847 Reviews
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      <TestimonialsSection
        title="Loved by Developers"
        subtitle="Real feedback from developers and operators across South Asia."
        testimonials={developerTestimonials}
        theme="light"
      />
    </section>
  );
}
