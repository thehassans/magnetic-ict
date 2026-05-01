"use client";

import React from "react";
import { createPortal } from "react-dom";
import NextLink from "next/link";
import { signOut } from "next-auth/react";
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
import { MenuToggleIcon } from "@/components/ui/menu-toggle-icon";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from "@/components/ui/navigation-menu";
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
  magneticVpsHosting: Server,
  magneticFaceSearch: ScanFace,
  siteLockVpn: Lock,
  siteMonitoring: Activity,
  websiteSecurity: Shield,
  websiteBackup: Database,
  nordVpn: Globe
} satisfies Record<ServiceMenuKey, LucideIcon>;

export function Header({
  locale,
  activeLanguages,
  visibleServiceMenuItems,
  sessionUser,
  hasMagneticSocialBotAccess = false
}: HeaderProps) {
  const [open, setOpen] = React.useState(false);
  const scrolled = useScroll(10);
  const t = useTranslations("Navigation");
  const signInHref = "/customer/sign-in?callback=/dashboard";

  const productLinks = React.useMemo<LinkItem[]>(() => {
    return visibleServiceMenuItems.map((item) => ({
      title: t(`items.${item.key}.title`),
      href: `/services/${item.key}`,
      description: t(`items.${item.key}.description`),
      icon: iconMap[item.key]
    }));
  }, [t, visibleServiceMenuItems]);

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
    const items: LinkItem[] = [
      {
        title: "Domain search",
        href: "/domains",
        icon: Globe
      },
      {
        title: t("allServices"),
        href: "/services",
        icon: Grid2x2
      }
    ];

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

  return (
    <header
      className={cn("sticky top-0 z-50 w-full border-b border-transparent", {
        "border-border bg-background/95 supports-[backdrop-filter]:bg-background/70 backdrop-blur-lg": scrolled
      })}
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-5">
          <Link href="/" locale={locale} className="rounded-md p-1 transition hover:bg-accent/70">
            <BrandLogo className="w-[150px] sm:w-[168px]" priority />
          </Link>
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuLink className="px-1" asChild>
                <Link href="/" locale={locale} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                  {t("home")}
                </Link>
              </NavigationMenuLink>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">{t("services")}</NavigationMenuTrigger>
                <NavigationMenuContent className="rounded-xl border border-slate-200 bg-white p-1 pr-1.5 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/96 dark:shadow-[0_24px_80px_rgba(2,6,23,0.55)]">
                  <ul className="grid w-[min(92vw,760px)] grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-slate-950/92 dark:shadow-none">
                    {productLinks.map((item) => (
                      <li key={item.title}>
                        <ListItem locale={locale} {...item} />
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent">Company</NavigationMenuTrigger>
                <NavigationMenuContent className="rounded-xl border border-slate-200 bg-white p-1 pr-1.5 pb-1.5 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/96 dark:shadow-[0_24px_80px_rgba(2,6,23,0.55)]">
                  <div className="grid w-[min(92vw,760px)] grid-cols-2 gap-2">
                    <ul className="space-y-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-slate-950/92 dark:shadow-none">
                      {companyLinks.map((item) => (
                        <li key={item.title}>
                          <ListItem locale={locale} {...item} />
                        </li>
                      ))}
                    </ul>
                    <ul className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-950/92">
                      {companyLinks2.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink asChild>
                            <Link href={item.href} locale={locale} className="flex flex-row items-center gap-x-2 rounded-md p-2 text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-white/[0.06] dark:hover:text-white">
                              <item.icon className="size-4 text-slate-500 dark:text-slate-300" />
                              <span className="font-medium">{item.title}</span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuLink className="px-1" asChild>
                <Link href="/domains" locale={locale} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                  Domain search
                </Link>
              </NavigationMenuLink>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitcher activeLanguages={activeLanguages} />
          <ThemeToggle />
          <CartTrigger />
          {sessionUser?.role === "ADMIN" ? (
            <NextLink href="/admin/dashboard" className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              {t("adminOps")}
            </NextLink>
          ) : null}
          {sessionUser ? (
            <>
              <Link href="/dashboard" locale={locale} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                {t("dashboard")}
              </Link>
              <Button variant="outline" size="icon" onClick={handleSignOut} aria-label={t("signOut")}>
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Link href={signInHref} locale={locale} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
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
            <span className="text-sm text-slate-500">Navigation</span>
            <MobileLink locale={locale} href="/" onClick={() => setOpen(false)} icon={Grid2x2}>
              {t("home")}
            </MobileLink>
            <MobileLink locale={locale} href="/services" onClick={() => setOpen(false)} icon={LayersIcon}>
              {t("services")}
            </MobileLink>
            <MobileLink locale={locale} href="/domains" onClick={() => setOpen(false)} icon={Globe}>
              Domain search
            </MobileLink>
            <MobileLink locale={locale} href="/support" onClick={() => setOpen(false)} icon={HelpCircle}>
              {t("support")}
            </MobileLink>
          </div>

          <div className="space-y-2">
            <span className="text-sm text-slate-500">Services</span>
            {productLinks.map((link) => (
              <MobileLink key={link.title} locale={locale} href={link.href} onClick={() => setOpen(false)} icon={link.icon}>
                {link.title}
              </MobileLink>
            ))}
          </div>

          <div className="space-y-2">
            <span className="text-sm text-slate-500">Company</span>
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
            <LanguageSwitcher activeLanguages={activeLanguages} className="w-full sm:w-auto" align="left" />
            <ThemeToggle className="rounded-full border border-slate-200 bg-white px-2 py-1 dark:border-white/10 dark:bg-white/5" />
            <CartTrigger />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {sessionUser?.role === "ADMIN" ? (
            <NextLink href="/admin/dashboard" onClick={() => setOpen(false)} className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              {t("adminOps")}
            </NextLink>
          ) : null}
          {sessionUser ? (
            <>
              <Link href="/dashboard" locale={locale} onClick={() => setOpen(false)} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                {t("dashboard")}
              </Link>
              <Button variant="outline" className="w-full bg-transparent" onClick={handleSignOut}>
                {t("signOut")}
              </Button>
            </>
          ) : (
            <Link href={signInHref} locale={locale} onClick={() => setOpen(false)} className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              {t("signIn")}
            </Link>
          )}
        </div>
      </MobileMenu>
    </header>
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
        "bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-lg",
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

function ListItem({
  title,
  description,
  icon: Icon,
  className,
  href,
  locale
}: LinkItem & { locale: string; className?: string }) {
  return (
    <NavigationMenuLink
      className={cn(
        "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground flex w-full flex-row gap-x-2 rounded-sm p-2",
        className
      )}
      asChild
    >
      <Link href={href} locale={locale}>
        <div className="bg-background/40 flex aspect-square size-12 items-center justify-center rounded-md border shadow-sm">
          <Icon className="text-foreground size-5" />
        </div>
        <div className="flex flex-col items-start justify-center">
          <span className="font-medium">{title}</span>
          <span className="text-muted-foreground text-xs">{description}</span>
        </div>
      </Link>
    </NavigationMenuLink>
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
    <Link href={href} locale={locale} onClick={onClick} className="inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">
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
