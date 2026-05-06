import { GithubIcon, Mail, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "@/components/branding/brand-logo";
import { NewsletterSignupForm } from "@/components/layout/newsletter-signup-form";
import { Link } from "@/i18n/navigation";

type MinimalFooterProps = {
  locale: string;
  description: string;
  footerDetails: {
    supportEmail: string;
    supportPhone: string;
    locationLabel: string;
    ctaHref: string;
  };
};

export function MinimalFooter({ locale, description, footerDetails }: MinimalFooterProps) {
  const year = new Date().getFullYear();

  const company = [
    {
      title: "Support",
      href: "/support"
    },
    {
      title: "Dashboard",
      href: "/dashboard"
    },
    {
      title: "Services",
      href: "/services"
    }
  ];

  const resources = [
    {
      title: "Home",
      href: "/"
    },
    {
      title: "Cart",
      href: "/cart"
    },
    {
      title: "Contact support",
      href: footerDetails.ctaHref
    }
  ];

  const contactLinks = [
    {
      icon: <Mail className="size-4" />,
      link: `mailto:${footerDetails.supportEmail}`,
      label: footerDetails.supportEmail
    },
    {
      icon: <Phone className="size-4" />,
      link: `tel:${footerDetails.supportPhone.replace(/\s+/g, "")}`,
      label: footerDetails.supportPhone
    },
    {
      icon: <GithubIcon className="size-4" />,
      link: "https://github.com/thehassans/magnetic-ict",
      label: "GitHub"
    }
  ];

  return (
    <footer className="relative mt-12">
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white/85 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/60">
          <div className="grid grid-cols-6 gap-6 p-6 md:p-8">
            <div className="col-span-6 flex flex-col gap-5 md:col-span-4">
              <Link href="/" locale={locale} className="w-max opacity-90 transition hover:opacity-100">
                <BrandLogo className="w-[150px]" />
              </Link>
              <p className="max-w-sm text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p>
              <div className="flex flex-wrap gap-2">
                {contactLinks.map((item) => (
                  <a
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                    target={item.link.startsWith("http") ? "_blank" : undefined}
                    rel={item.link.startsWith("http") ? "noreferrer" : undefined}
                    href={item.link}
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.label}</span>
                  </a>
                ))}
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <MapPin className="size-4" />
                <span>{footerDetails.locationLabel}</span>
              </div>
              <div className="max-w-sm">
                <NewsletterSignupForm />
              </div>
            </div>
            <div className="col-span-3 w-full md:col-span-1">
              <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Resources</span>
              <div className="flex flex-col gap-2">
                {resources.map(({ href, title }) => (
                  <Link key={title} className="w-max py-1 text-sm text-slate-700 duration-200 hover:underline dark:text-slate-300" href={href} locale={locale}>
                    {title}
                  </Link>
                ))}
              </div>
            </div>
            <div className="col-span-3 w-full md:col-span-1">
              <span className="mb-2 block text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Company</span>
              <div className="flex flex-col gap-2">
                {company.map(({ href, title }) => (
                  <Link key={title} className="w-max py-1 text-sm text-slate-700 duration-200 hover:underline dark:text-slate-300" href={href} locale={locale}>
                    {title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 px-6 py-4 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400 md:px-8">
            © Magnetic ICT. All rights reserved {year}
          </div>
        </div>
      </div>
    </footer>
  );
}
