import Image from "next/image";
import { ExternalLink, Github, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import type { PortfolioSite } from "@/lib/portfolio-db";

const platformIcon: Record<string, typeof Github> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram
};

export function AuroraTemplate({ site }: { site: PortfolioSite }) {
  const accent = site.accentColor || "#6366f1";
  const logoLight = site.logoLight;
  const logoDark  = site.logoDark;

  return (
    <div className="min-h-screen bg-[#07090f] font-sans text-white">
      <style>{`
        :root { --accent: ${accent}; }
        .accent-bg { background-color: var(--accent); }
        .accent-text { color: var(--accent); }
        .accent-border { border-color: var(--accent); }
        .accent-ring:focus { --tw-ring-color: var(--accent); }
      `}</style>

      {/* Background mesh */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-[15%] h-[70vh] w-[70vh] rounded-full opacity-20 blur-3xl" style={{ background: `radial-gradient(circle, ${accent}, transparent 65%)` }} />
        <div className="absolute bottom-0 right-[5%] h-[50vh] w-[50vh] rounded-full opacity-10 blur-3xl" style={{ background: `radial-gradient(circle, ${accent}, transparent 65%)` }} />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">

        {/* Nav */}
        <nav className="mb-16 flex items-center justify-between">
          <div className="flex items-center">
            {(logoLight || logoDark) ? (
              <>
                {logoLight && (
                  <Image src={logoLight} alt={site.name} width={160} height={50} className="h-9 w-auto object-contain block dark:hidden" unoptimized />
                )}
                {logoDark && (
                  <Image src={logoDark} alt={site.name} width={160} height={50} className="h-9 w-auto object-contain hidden dark:block" unoptimized />
                )}
                {logoLight && !logoDark && (
                  <Image src={logoLight} alt={site.name} width={160} height={50} className="hidden h-9 w-auto object-contain dark:block" unoptimized />
                )}
              </>
            ) : (
              <span className="text-lg font-bold tracking-tight">{site.name}</span>
            )}
          </div>
          <div className="flex items-center gap-5 text-sm text-white/50">
            <a href="#about" className="transition hover:text-white">About</a>
            <a href="#skills" className="transition hover:text-white">Skills</a>
            {site.projects.length > 0 && <a href="#projects" className="transition hover:text-white">Work</a>}
            {site.experience.length > 0 && <a href="#experience" className="transition hover:text-white">Experience</a>}
            <a href="#contact" className="inline-flex h-8 items-center rounded-full px-4 text-xs font-semibold text-white transition" style={{ backgroundColor: accent }}>
              Contact
            </a>
          </div>
        </nav>

        {/* Hero */}
        <section className="mb-24 grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
              <span className="h-1.5 w-1.5 rounded-full accent-bg" style={{ backgroundColor: accent }} />
              {site.status === "ACTIVE" ? "Available for work" : "Portfolio"}
            </div>
            <h1 className="text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              {site.name}
            </h1>
            {site.tagline && (
              <p className="mt-5 text-xl leading-relaxed text-white/60 sm:text-2xl">{site.tagline}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contact" className="inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold text-white shadow-lg transition hover:opacity-90" style={{ backgroundColor: accent }}>
                Get in touch <ExternalLink className="h-4 w-4" />
              </a>
              {site.projects.length > 0 && (
                <a href="#projects" className="inline-flex h-12 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 text-sm font-semibold text-white transition hover:bg-white/10">
                  View work
                </a>
              )}
            </div>
          </div>

          {/* Stats bubble */}
          <div className="hidden lg:block">
            <div className="w-56 rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur">
              {site.skills.length > 0 && (
                <div className="mb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">Skills</p>
                  <p className="mt-1 text-2xl font-bold">{site.skills.length}</p>
                </div>
              )}
              {site.projects.length > 0 && (
                <div className="mb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">Projects</p>
                  <p className="mt-1 text-2xl font-bold">{site.projects.length}</p>
                </div>
              )}
              {site.experience.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">Experience</p>
                  <p className="mt-1 text-2xl font-bold">{site.experience.length}+</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* About */}
        {site.about && (
          <section id="about" className="mb-20 scroll-mt-20">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/40">About</p>
            <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur">
              <p className="text-lg leading-relaxed text-white/75">{site.about}</p>
            </div>
          </section>
        )}

        {/* Skills */}
        {site.skills.length > 0 && (
          <section id="skills" className="mb-20 scroll-mt-20">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.28em] text-white/40">Skills</p>
            <div className="flex flex-wrap gap-2.5">
              {site.skills.map((s) => (
                <span key={s} className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/80 backdrop-blur transition hover:border-white/20 hover:text-white">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {site.projects.length > 0 && (
          <section id="projects" className="mb-20 scroll-mt-20">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.28em] text-white/40">Selected work</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {site.projects.map((p) => (
                <div key={p.id} className="group rounded-[24px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.07]">
                  {p.imageUrl && (
                    <div className="mb-4 overflow-hidden rounded-2xl">
                      <Image src={p.imageUrl} alt={p.title} width={500} height={280} className="h-40 w-full object-cover transition group-hover:scale-[1.02]" unoptimized />
                    </div>
                  )}
                  <h3 className="font-semibold text-white">{p.title}</h3>
                  {p.description && <p className="mt-1.5 text-sm leading-6 text-white/55">{p.description}</p>}
                  {p.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.tags.map((t) => (
                        <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/50">{t}</span>
                      ))}
                    </div>
                  )}
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold transition hover:opacity-100" style={{ color: accent, opacity: 0.7 }}>
                      View project <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {site.experience.length > 0 && (
          <section id="experience" className="mb-20 scroll-mt-20">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.28em] text-white/40">Experience</p>
            <div className="space-y-4">
              {site.experience.map((e) => (
                <div key={e.id} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-white">{e.role}</p>
                      <p className="text-sm text-white/55">{e.company}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/40">{e.period}</span>
                  </div>
                  {e.description && <p className="mt-3 text-sm leading-6 text-white/55">{e.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        <section id="contact" className="scroll-mt-20">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.28em] text-white/40">Contact</p>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur">
            <div className="grid gap-5 sm:grid-cols-2">
              {site.phone && (
                <a href={`tel:${site.phone}`} className="flex items-center gap-3 text-sm text-white/70 transition hover:text-white">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <Phone className="h-4 w-4" style={{ color: accent }} />
                  </div>
                  {site.phone}
                </a>
              )}
              {site.email && (
                <a href={`mailto:${site.email}`} className="flex items-center gap-3 text-sm text-white/70 transition hover:text-white">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <Mail className="h-4 w-4" style={{ color: accent }} />
                  </div>
                  {site.email}
                </a>
              )}
              {site.address && (
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <MapPin className="h-4 w-4" style={{ color: accent }} />
                  </div>
                  {site.address}
                </div>
              )}
            </div>

            {site.socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {site.socialLinks.map((link) => {
                  const Icon = platformIcon[link.platform.toLowerCase()] ?? ExternalLink;
                  return (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                    >
                      <Icon className="h-4 w-4" />
                      {link.platform}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/10 pt-8 text-center text-xs text-white/25">
          Built with Magnetic Portfolio Builder · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
