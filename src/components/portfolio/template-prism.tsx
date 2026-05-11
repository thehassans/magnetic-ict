import Image from "next/image";
import { ArrowUpRight, Github, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import type { PortfolioSite } from "@/lib/portfolio-db";

const platformIcon: Record<string, typeof Github> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram
};

export function PrismTemplate({ site }: { site: PortfolioSite }) {
  const accent = site.accentColor || "#f59e0b";

  return (
    <div className="min-h-screen bg-[#0c0f14] font-sans text-white">
      <style>{`:root{--accent:${accent}}`}</style>

      {/* Noise + gradient overlay */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }} />
        <div className="absolute top-0 left-0 h-[50vh] w-[40vw] opacity-15 blur-[120px]" style={{ background: `radial-gradient(ellipse at top left, ${accent}, transparent 70%)` }} />
        <div className="absolute bottom-0 right-0 h-[40vh] w-[30vw] opacity-10 blur-[100px]" style={{ background: `radial-gradient(ellipse at bottom right, ${accent}, transparent 70%)` }} />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

        {/* Nav */}
        <nav className="flex items-center justify-between py-7">
          <div className="text-sm font-bold uppercase tracking-[0.3em] text-white/80">
            {site.name.split(" ")[0]}
            <span style={{ color: accent }}>{site.name.split(" ").slice(1).join(" ")}</span>
          </div>
          <div className="flex items-center gap-5 text-[13px] font-medium text-white/40">
            {site.about && <a href="#about" className="transition hover:text-white">About</a>}
            {site.skills.length > 0 && <a href="#skills" className="transition hover:text-white">Stack</a>}
            {site.projects.length > 0 && <a href="#work" className="transition hover:text-white">Work</a>}
            <a href="#contact" className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[12px] font-semibold transition hover:opacity-80" style={{ borderColor: `${accent}50`, color: accent }}>
              Contact <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </nav>

        {/* Hero — split layout */}
        <section className="mb-24 flex min-h-[80vh] flex-col justify-center pt-8">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <div className="mb-7 flex items-center gap-3">
              <span className="inline-block h-px w-12" style={{ backgroundColor: accent }} />
              <span className="text-[11px] font-bold uppercase tracking-[0.32em]" style={{ color: accent }}>
                {site.tagline ? "Available for work" : "Portfolio"}
              </span>
            </div>

            {/* Big name */}
            <h1 className="text-[clamp(3rem,8vw,6.5rem)] font-black leading-[0.92] tracking-[-0.03em] text-white">
              {site.name.split(" ").map((word, i) => (
                <span key={i} className={i % 2 === 1 ? "block italic" : "block"} style={i % 2 === 1 ? { color: accent } : {}}>
                  {word}
                </span>
              ))}
            </h1>

            {site.tagline && (
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/50">{site.tagline}</p>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#contact" className="inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-bold text-black transition hover:opacity-90" style={{ backgroundColor: accent }}>
                Let&apos;s work together <ArrowUpRight className="h-4 w-4" />
              </a>
              {site.projects.length > 0 && (
                <a href="#work" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 px-7 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:text-white">
                  View work
                </a>
              )}
            </div>
          </div>

          {/* Floating skills strip */}
          {site.skills.length > 0 && (
            <div className="mt-16 flex flex-wrap gap-2">
              {site.skills.map((s, i) => (
                <span key={s} className="rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]"
                  style={{
                    backgroundColor: i === 0 ? `${accent}20` : "rgba(255,255,255,0.04)",
                    color: i === 0 ? accent : "rgba(255,255,255,0.4)",
                    border: i === 0 ? `1px solid ${accent}40` : "1px solid rgba(255,255,255,0.06)"
                  }}>
                  {s}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* About */}
        {site.about && (
          <section id="about" className="mb-24 scroll-mt-20">
            <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
              <div>
                <span className="inline-block h-px w-8 align-middle" style={{ backgroundColor: accent }} />
                <span className="ml-3 text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: accent }}>About</span>
              </div>
              <p className="text-xl leading-relaxed text-white/60">{site.about}</p>
            </div>
          </section>
        )}

        {/* Projects */}
        {site.projects.length > 0 && (
          <section id="work" className="mb-24 scroll-mt-20">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-block h-px w-8" style={{ backgroundColor: accent }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: accent }}>Selected work</span>
              </div>
            </div>
            <div className="space-y-4">
              {site.projects.map((p, i) => (
                <a key={p.id} href={p.link ?? "#"} target="_blank" rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 rounded-[20px] border border-white/[0.06] bg-white/[0.03] px-6 py-5 transition hover:border-white/[0.14] hover:bg-white/[0.06]">
                  <div className="flex items-start gap-5">
                    <span className="mt-0.5 text-[11px] font-bold tabular-nums text-white/20">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="font-semibold text-white">{p.title}</p>
                      {p.description && <p className="mt-1 text-sm text-white/40">{p.description}</p>}
                      {p.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {p.tags.map((t) => (
                            <span key={t} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-0.5 text-[10px] text-white/30">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-white/20 transition group-hover:text-white/60" style={{ color: accent }} />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {site.experience.length > 0 && (
          <section className="mb-24 scroll-mt-20">
            <div className="mb-8 flex items-center gap-3">
              <span className="inline-block h-px w-8" style={{ backgroundColor: accent }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: accent }}>Experience</span>
            </div>
            <div className="space-y-0 divide-y divide-white/[0.06]">
              {site.experience.map((e) => (
                <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-5">
                  <div>
                    <p className="font-semibold text-white">{e.role}</p>
                    <p className="text-sm text-white/40">{e.company}</p>
                  </div>
                  <span className="text-sm text-white/25">{e.period}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        <section id="contact" className="mb-24 scroll-mt-20">
          <div className="mb-8 flex items-center gap-3">
            <span className="inline-block h-px w-8" style={{ backgroundColor: accent }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: accent }}>Contact</span>
          </div>
          <div className="rounded-[28px] border border-white/[0.07] bg-white/[0.03] p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {site.phone && (
                <a href={`tel:${site.phone}`} className="flex items-center gap-3 text-sm text-white/50 transition hover:text-white">
                  <Phone className="h-4 w-4 shrink-0" style={{ color: accent }} />
                  {site.phone}
                </a>
              )}
              {site.email && (
                <a href={`mailto:${site.email}`} className="flex items-center gap-3 text-sm text-white/50 transition hover:text-white">
                  <Mail className="h-4 w-4 shrink-0" style={{ color: accent }} />
                  {site.email}
                </a>
              )}
              {site.address && (
                <div className="flex items-center gap-3 text-sm text-white/50">
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: accent }} />
                  {site.address}
                </div>
              )}
            </div>
            {site.socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {site.socialLinks.map((link) => {
                  const Icon = platformIcon[link.platform.toLowerCase()] ?? ArrowUpRight;
                  return (
                    <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/50 transition hover:border-white/20 hover:text-white">
                      <Icon className="h-4 w-4" />
                      {link.platform}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-white/20">
          Built with Magnetic Portfolio Builder · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
