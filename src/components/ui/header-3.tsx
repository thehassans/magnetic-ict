"use client";

import React from "react";
import { createPortal } from "react-dom";
import NextLink from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Activity,
  Bot,
  BrainCircuit,
  Briefcase,
  Database,
  Download,
  Globe,
  Grid2x2,
  HelpCircle,
  ImageIcon,
  LayersIcon,
  LayoutGrid,
  Lock,
  LogOut,
  LucideIcon,
  Mail,
  Package,
  ScanFace,
  Search,
  Server,
  Shield,
  ShieldCheck,
  Star,
  UserRound
} from "lucide-react";
import { BrandLogo } from "@/components/branding/brand-logo";
import { CartTrigger } from "@/components/commerce/cart-trigger";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { DropdownNavigation, type DropdownNavigationSubMenuItem } from "@/components/ui/dropdown-navigation";
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import { Link } from "@/i18n/navigation";
import type { ServiceMenuKey } from "@/lib/service-menu";
import { cn } from "@/lib/utils";
import type { ActiveLanguage } from "@/types/i18n";

type LinkItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
};

type HeaderProps = {
  locale: string;
  activeLanguages: ActiveLanguage[];
  visibleServiceMenuItems: ReadonlyArray<{ key: ServiceMenuKey; id: string; href: string }>;
  sessionUser?: SessionUser | null;
  hasMagneticSocialBotAccess?: boolean;
};

const iconMap = {
  ssl: ShieldCheck,
  websiteBuilder: LayoutGrid,
  emailServices: Mail,
  professionalEmail: Briefcase,
  seoTools: Search,
  imageConversion: ImageIcon,
  aiDetection: BrainCircuit,
  videoDownloader: Download,
  magneticSocialBot: Bot,
  magneticCommerce: Package,
  magneticVpsHosting: Server,
  magneticFaceSearch: ScanFace,
  siteLockVpn: Lock,
  siteMonitoring: Activity,
  websiteSecurity: Shield,
  websiteBackup: Database,
  nordVpn: Globe
} satisfies Record<ServiceMenuKey, LucideIcon>;

function chunkDropdownItems(items: DropdownNavigationSubMenuItem[], size: number) {
  const chunks: DropdownNavigationSubMenuItem[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

export function Header({
  locale,
  activeLanguages,
  visibleServiceMenuItems,
  sessionUser,
  hasMagneticSocialBotAccess = false
}: HeaderProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname() ?? "";
  const scrolled = useScroll(10);
  const t = useTranslations("Navigation");
  const signInHref = "/customer/sign-in?callback=/dashboard";
  const hideOnDashboard = pathname.startsWith(`/${locale}/dashboard`);

  const mapServiceLink = React.useCallback((item: { key: ServiceMenuKey; id: string; href: string }): LinkItem => {
    return {
      title: t(`items.${item.key}.title`),
      href: `/services/${item.key}`,
      description: t(`items.${item.key}.description`),
      icon: iconMap[item.key]
    };
  }, [t]);

  const productLinks = React.useMemo<LinkItem[]>(() => {
    return visibleServiceMenuItems.filter((item) => !item.key.startsWith("magnetic")).map(mapServiceLink);
  }, [mapServiceLink, visibleServiceMenuItems]);

  const magneticProductLinks = React.useMemo<LinkItem[]>(() => {
    return visibleServiceMenuItems.filter((item) => item.key.startsWith("magnetic")).map(mapServiceLink);
  }, [mapServiceLink, visibleServiceMenuItems]);

  const companyLinks = React.useMemo<LinkItem[]>(() => {
    const items: LinkItem[] = [
      {
        title: "Customer stories",
        href: "/#home-reviews",
        description: "See how operators describe their delivery experience",
        icon: Star
      },
      {
        title: "Trusted ecosystem",
        href: "/#trusted-ecosystem",
        description: "Partners and platforms behind the MagneticICT stack",
        icon: LayersIcon
      },
      {
        title: t("support"),
        href: "/support",
        description: "Talk to support for onboarding and operations help",
        icon: HelpCircle
      }
    ];

    if (hasMagneticSocialBotAccess) {
      items.push({
        title: t("dashboard"),
        href: "/dashboard/magnetic-social-bot",
        description: "Open your Magnetic Social Bot workspace",
        icon: Bot
      });
    }

    return items;
  }, [hasMagneticSocialBotAccess, t]);

  const companyLinks2 = React.useMemo<LinkItem[]>(() => {
    const items: LinkItem[] = [{ title: t("allServices"), href: "/services", icon: Grid2x2 }];

    if (sessionUser) {
      items.push({
        title: t("memberships"),
        href: "/dashboard",
        icon: UserRound
      });
    } else {
      items.push({
        title: t("signIn"),
        href: signInHref,
        icon: UserRound
      });
    }

    return items;
  }, [sessionUser, signInHref, t]);

  const desktopNavItems = React.useMemo(() => {
    const serviceColumns = chunkDropdownItems(
      productLinks.map((item) => ({
        label: item.title,
        description: item.description,
        icon: item.icon,
        href: item.href
      })),
      4
    ).map((items, index) => ({
      title: index === 0 ? t("services") : `${t("services")} ${index + 1}`,
      items
    }));

    const magneticColumns = chunkDropdownItems(
      magneticProductLinks.map((item) => ({
        label: item.title,
        description: item.description,
        icon: item.icon,
        href: item.href
      })),
      4
    ).map((items, index) => ({
      title: index === 0 ? t("magneticServices") : `${t("magneticServices")} ${index + 1}`,
      items
    }));

    return [
      {
        id: 1,
        label: t("home"),
        icon: Grid2x2,
        link: "/"
      },
      ...(serviceColumns.length > 0 ? [{
        id: 2,
        label: t("services"),
        icon: LayersIcon,
        subMenus: serviceColumns
      }] : []),
      ...(magneticColumns.length > 0 ? [{
        id: 3,
        label: t("magneticServices"),
        icon: Package,
        subMenus: magneticColumns
      }] : []),
      {
        id: 4,
        label: "Company",
        icon: Briefcase,
        subMenus: [
          {
            title: "Company",
            items: companyLinks.map((item) => ({
              label: item.title,
              description: item.description,
              icon: item.icon,
              href: item.href
            }))
          },
          {
            title: "Access",
            items: companyLinks2.map((item) => ({
              label: item.title,
              description: item.description,
              icon: item.icon,
              href: item.href
            }))
          }
        ]
      },
      {
        id: 5,
        label: t("support"),
        icon: HelpCircle,
        link: "/support"
      }
    ];
  }, [companyLinks, companyLinks2, magneticProductLinks, productLinks, t]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleSignOut() {
    void signOut({ redirectTo: `/${locale}` });
  }

  if (hideOnDashboard) {
    return null;
  }

  return (
    <header
      className={cn("sticky top-0 z-50 w-full bg-transparent", {
        "backdrop-blur-sm": scrolled
      })}
    >
      <nav className="mx-auto flex h-[4.75rem] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4 xl:gap-5">
          <Link href="/" locale={locale} className="rounded-md p-1 transition">
            <BrandLogo className="w-[150px] sm:w-[168px]" priority />
          </Link>
          <DropdownNavigation navItems={desktopNavItems} locale={locale} className="hidden lg:flex" />
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher
            activeLanguages={activeLanguages}
            triggerClassName="border-slate-200/60 bg-transparent px-3 text-slate-700 hover:border-slate-300 hover:bg-transparent hover:text-slate-950 dark:border-white/10 dark:bg-transparent dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-transparent dark:hover:text-white"
          />
          <ThemeToggle />
          <CartTrigger className="border-slate-200/60 bg-transparent text-slate-700 hover:border-slate-300 hover:bg-transparent hover:text-slate-950 dark:border-white/10 dark:bg-transparent dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-transparent dark:hover:text-white" />
          {sessionUser?.role === "ADMIN" ? (
            <NextLink href="/admin/dashboard" className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200/70 bg-transparent px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-transparent hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-transparent dark:hover:text-white">
              {t("adminOps")}
            </NextLink>
          ) : null}
          {sessionUser ? (
            <>
              <Link href="/dashboard" locale={locale} className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200/70 bg-transparent px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-transparent hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-transparent dark:hover:text-white">
                {t("dashboard")}
              </Link>
              <Button variant="outline" size="icon" onClick={handleSignOut} aria-label={t("signOut")} className="rounded-full border-slate-200/70 bg-transparent text-slate-700 hover:bg-transparent hover:text-slate-950 dark:border-white/10 dark:bg-transparent dark:text-slate-200 dark:hover:bg-transparent dark:hover:text-white">
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Link href={signInHref} locale={locale} className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200/70 bg-transparent px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-transparent hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-transparent dark:hover:text-white">
              {t("signIn")}
            </Link>
          )}
        </div>
        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen((value) => !value)}
          className="lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          <MenuToggleIcon open={open} className="size-5" duration={300} />
        </Button>
      </nav>
      <MobileMenu open={open} className="flex flex-col justify-between gap-5 overflow-y-auto">
        <div className="space-y-5">
          <div className="flex flex-col gap-y-2">
            <SectionHeading icon={Grid2x2}>Navigation</SectionHeading>
            <MobileLink locale={locale} href="/" onClick={() => setOpen(false)} icon={Grid2x2}>
              {t("home")}
            </MobileLink>
            <MobileLink locale={locale} href="/services" onClick={() => setOpen(false)} icon={LayersIcon}>
              {t("services")}
            </MobileLink>
            <MobileLink locale={locale} href="/support" onClick={() => setOpen(false)} icon={HelpCircle}>
              {t("support")}
            </MobileLink>
          </div>

          <div className="space-y-2">
            <SectionHeading icon={LayersIcon}>Services</SectionHeading>
            {productLinks.map((link) => (
              <MobileLink key={link.title} locale={locale} href={link.href} onClick={() => setOpen(false)} icon={link.icon}>
                {link.title}
              </MobileLink>
            ))}
          </div>

          <div className="space-y-2">
            <SectionHeading icon={Package}>{t("magneticServices")}</SectionHeading>
            {magneticProductLinks.map((link) => (
              <MobileLink key={link.title} locale={locale} href={link.href} onClick={() => setOpen(false)} icon={link.icon}>
                {link.title}
              </MobileLink>
            ))}
          </div>

          <div className="space-y-2">
            <SectionHeading icon={Briefcase}>Company</SectionHeading>
            {companyLinks.map((link) => (
              <MobileLink key={link.title} locale={locale} href={link.href} onClick={() => setOpen(false)} icon={link.icon}>
                {link.title}
              </MobileLink>
            ))}
            {companyLinks2.map((link) => (
              <MobileLink key={link.title} locale={locale} href={link.href} onClick={() => setOpen(false)} icon={link.icon}>
                {link.title}
              </MobileLink>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LanguageSwitcher
              activeLanguages={activeLanguages}
              className="w-full sm:w-auto"
              align="left"
              triggerClassName="w-full justify-between border-slate-200/70 bg-transparent text-slate-700 hover:border-slate-300 hover:bg-transparent hover:text-slate-950 dark:border-white/10 dark:bg-transparent dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-transparent dark:hover:text-white"
            />
            <ThemeToggle className="rounded-full px-1 py-1" />
            <CartTrigger className="border-slate-200/70 bg-transparent text-slate-700 hover:border-slate-300 hover:bg-transparent hover:text-slate-950 dark:border-white/10 dark:bg-transparent dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-transparent dark:hover:text-white" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {sessionUser?.role === "ADMIN" ? (
            <NextLink href="/admin/dashboard" onClick={() => setOpen(false)} className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200/70 bg-transparent px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-transparent hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-transparent dark:hover:text-white">
              {t("adminOps")}
            </NextLink>
          ) : null}
          {sessionUser ? (
            <>
              <Link href="/dashboard" locale={locale} onClick={() => setOpen(false)} className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200/70 bg-transparent px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-transparent hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-transparent dark:hover:text-white">
                {t("dashboard")}
              </Link>
              <Button variant="outline" className="w-full rounded-full border-slate-200/70 bg-transparent text-slate-700 hover:bg-transparent hover:text-slate-950 dark:border-white/10 dark:bg-transparent dark:text-slate-200 dark:hover:bg-transparent dark:hover:text-white" onClick={handleSignOut}>
                {t("signOut")}
              </Button>
            </>
          ) : (
            <Link href={signInHref} locale={locale} onClick={() => setOpen(false)} className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200/70 bg-transparent px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-transparent hover:text-slate-950 dark:border-white/10 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-transparent dark:hover:text-white">
              {t("signIn")}
            </Link>
          )}
        </div>
      </MobileMenu>
    </header>
  );
}

function SectionHeading({
  icon: Icon,
  children
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 px-1 text-sm font-medium text-slate-500 dark:text-slate-400">
      <Icon className="size-4" />
      <span>{children}</span>
    </div>
  );
}

type MobileMenuProps = React.ComponentProps<"div"> & {
  open: boolean;
};

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
  if (!open || typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <div
      id="mobile-menu"
      className={cn(
        "bg-transparent backdrop-blur-lg",
        "fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-hidden border-y lg:hidden"
      )}
    >
      <div
        data-slot={open ? "open" : "closed"}
        className={cn("data-[slot=open]:animate-in data-[slot=open]:zoom-in-97 size-full p-4 ease-out", className)}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

function MobileLink({
  locale,
  href,
  children,
  onClick,
  icon: Icon
}: {
  locale: string;
  href: string;
  children: React.ReactNode;
  onClick: () => void;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      locale={locale}
      onClick={onClick}
      className="inline-flex items-center gap-3 rounded-xl border border-slate-200/70 bg-transparent px-4 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-transparent dark:border-white/10 dark:bg-transparent dark:text-white dark:hover:border-white/20 dark:hover:bg-transparent"
    >
      <Icon className="size-4 text-slate-500 dark:text-slate-300" />
      {children}
    </Link>
  );
}

function useScroll(threshold: number) {
  const [scrolled, setScrolled] = React.useState(false);

  const onScroll = React.useCallback(() => {
    setScrolled(window.scrollY > threshold);
  }, [threshold]);

  React.useEffect(() => {
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  React.useEffect(() => {
    onScroll();
  }, [onScroll]);

  return scrolled;
}
