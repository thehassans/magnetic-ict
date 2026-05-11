import Image from "next/image";
import { ExternalLink, Github, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import type { PortfolioSite } from "@/lib/portfolio-db";

const platformIcon: Record<string, typeof Github> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  instagram: Instagram
};

export function LuminaTemplate({ site }: { site: PortfolioSite }) {
  const accent = site.accentColor || "#0ea5e9";
  const logoLight = site.logoLight;
  const logoDark = site.logoDark;

  return (
    <div className="min-h-screen bg-[#f8f9fc] font-sans text-slate-900">
      <style>{`:root{--accent:${accent}}.a-bg{background-color:var(--accent)}.a-text{color:var(--accent)}.a-border{border-color:var(--accent)}`}</style>

      {/* Subtle grid background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px] opacity-50" />
        <div className="absolute right-0 top-0 h-[60vh] w-[60vw] rounded-full opacity-30 blur-3xl" style={{ background: `radial-gradient(circle, ${accent}22, transparent 65%)` }} />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">

        {/* Nav */}
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center">
            {logoLight ? (
              <Image src={logoLight} alt={site.name} width={160} height={48} className="h-9 w-auto object-contain" unoptimized />
            ) : (
              <span className="text-lg font-bold tracking-tight text-slate-950">{site.name}</span>
            )}
          </div>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-500 sm:flex">
            {site.about && <a href="#about" className="transition hover:text-slate-950">About</a>}
            {site.skills.length > 0 && <a href="#skills" className="transition hover:text-slate-950">Skills</a>}
            {site.projects.length > 0 && <a href="#work" className="transition hover:text-slate-950">Work</a>}
            <a href="#contact" className="inline-flex h-9 items-center rounded-full px-5 text-sm font-semibold text-white shadow-md transition hover:opacity-90" style={{ backgroundColor: accent }}>
              Contact
            </a>
          </div>
        </nav>

        {/* Hero */}
        <section className="mb-24 mt-12 grid items-center gap-10 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
              Portfolio
            </div>
            <h1 className="text-5xl font-extrabold leading-[1.06] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              {site.name}
            </h1>
            {site.tagline && (
              <p className="mt-5 text-xl leading-relaxed text-slate-500 sm:text-2xl">{site.tagline}</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contact" className="inline-flex h-12 items-center rounded-full px-7 text-sm font-semibold text-white shadow-lg transition hover:opacity-90" style={{ backgroundColor: accent }}>
                Get in touch
              </a>
              {site.projects.length > 0 && (
                <a href="#work" className="inline-flex h-12 items-center rounded-full border border-slate-200 bg-white px-7 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
                  See my work
                </a>
              )}
            </div>
          </div>

          {/* Stats card */}
          {(site.skills.length > 0 || site.projects.length > 0 || site.experience.length > 0) && (
            <div className="hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_8px_40px_rgba(15,23,42,0.07)] lg:block">
              {site.skills.length > 0 && (
                <div className="mb-5 border-b border-slate-100 pb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Skills</p>
                  <p className="mt-1 text-3xl font-bold text-slate-950">{site.skills.length}</p>
                </div>
              )}
              {site.projects.length > 0 && (
                <div className="mb-5 border-b border-slate-100 pb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Projects</p>
                  <p className="mt-1 text-3xl font-bold text-slate-950">{site.projects.length}</p>
                </div>
              )}
              {site.experience.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">Experience</p>
                  <p className="mt-1 text-3xl font-bold text-slate-950">{site.experience.length}+ roles</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* About */}
        {site.about && (
          <section id="about" className="mb-20 scroll-mt-20">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-slate-200" />
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">About</p>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
              <p className="text-lg leading-relaxed text-slate-600">{site.about}</p>
            </div>
          </section>
        )}

        {/* Skills */}
        {site.skills.length > 0 && (
          <section id="skills" className="mb-20 scroll-mt-20">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-slate-200" />
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Skills</p>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="flex flex-wrap gap-2.5">
              {site.skills.map((s) => (
                <span key={s} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:shadow">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {site.projects.length > 0 && (
          <section id="work" className="mb-20 scroll-mt-20">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-slate-200" />
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Selected work</p>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {site.projects.map((p) => (
                <div key={p.id} className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
                  {p.imageUrl && (
                    <div className="overflow-hidden">
                      <Image src={p.imageUrl} alt={p.title} width={500} height={280} className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]" unoptimized />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-slate-900">{p.title}</h3>
                    {p.description && <p className="mt-1.5 text-sm leading-6 text-slate-500">{p.description}</p>}
                    {p.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {p.tags.map((tag) => (
                          <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] text-slate-500">{tag}</span>
                        ))}
                      </div>
                    )}
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold transition hover:opacity-100" style={{ color: accent, opacity: 0.8 }}>
                        View project <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {site.experience.length > 0 && (
          <section className="mb-20 scroll-mt-20">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px flex-1 bg-slate-200" />
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Experience</p>
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <div className="space-y-3">
              {site.experience.map((e) => (
                <div key={e.id} className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{e.role}</p>
                      <p className="text-sm text-slate-500">{e.company}</p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-400">{e.period}</span>
                  </div>
                  {e.description && <p className="mt-3 text-sm leading-6 text-slate-500">{e.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact */}
        <section id="contact" className="scroll-mt-20">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px flex-1 bg-slate-200" />
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Contact</p>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
            <div className="grid gap-4 sm:grid-cols-2">
              {site.phone && (
                <a href={`tel:${site.phone}`} className="flex items-center gap-3 text-sm text-slate-600 transition hover:text-slate-950">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                    <Phone className="h-4 w-4" style={{ color: accent }} />
                  </div>
                  {site.phone}
                </a>
              )}
              {site.email && (
                <a href={`mailto:${site.email}`} className="flex items-center gap-3 text-sm text-slate-600 transition hover:text-slate-950">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                    <Mail className="h-4 w-4" style={{ color: accent }} />
                  </div>
                  {site.email}
                </a>
              )}
              {site.address && (
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                    <MapPin className="h-4 w-4" style={{ color: accent }} />
                  </div>
                  {site.address}
                </div>
              )}
            </div>
            {site.socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {site.socialLinks.map((link) => {
                  const Icon = platformIcon[link.platform.toLowerCase()] ?? ExternalLink;
                  return (
                    <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-950">
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
        <footer className="mt-16 border-t border-slate-200 pt-8 text-center text-xs text-slate-400">
          Built with Magnetic Portfolio Builder · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
