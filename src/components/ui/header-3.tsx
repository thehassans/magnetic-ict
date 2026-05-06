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
  magneticCommerce: Package,
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
      <nav className="mx-auto flex h-[4.75rem] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-5">
          <Link href="/" locale={locale} className="rounded-md p-1 transition">
            <BrandLogo className="w-[150px] sm:w-[168px]" priority />
          </Link>
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuLink className="px-1" asChild>
                <Link
                  href="/"
                  locale={locale}
                  className="rounded-none border-b border-transparent px-0 py-2 text-sm font-medium text-slate-700 transition hover:bg-transparent hover:text-slate-950 dark:text-slate-200 dark:hover:bg-transparent dark:hover:text-white"
                >
                  {t("home")}
                </Link>
              </NavigationMenuLink>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-9 rounded-none border-b border-transparent bg-transparent px-0 text-sm font-medium text-slate-700 hover:bg-transparent hover:text-slate-950 focus:bg-transparent focus:text-slate-950 data-[active]:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-slate-950 dark:text-slate-200 dark:hover:bg-transparent dark:hover:text-white dark:focus:bg-transparent dark:focus:text-white dark:data-[state=open]:text-white">
                  {t("services")}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-transparent p-0 pt-4 shadow-none">
                  <div className="w-[min(92vw,32rem)] rounded-[1.75rem] border border-slate-200/70 bg-white/85 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
                    <ul className="grid gap-1">
                      {productLinks.map((item) => (
                        <li key={item.href}>
                          <ListItem locale={locale} {...item} />
                        </li>
                      ))}
                    </ul>
                    <div className="px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                      <Link href="/services" locale={locale} className="transition hover:text-slate-950 dark:hover:text-white">
                        {t("allServices")}
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-9 rounded-none border-b border-transparent bg-transparent px-0 text-sm font-medium text-slate-700 hover:bg-transparent hover:text-slate-950 focus:bg-transparent focus:text-slate-950 data-[active]:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-slate-950 dark:text-slate-200 dark:hover:bg-transparent dark:hover:text-white dark:focus:bg-transparent dark:focus:text-white dark:data-[state=open]:text-white">
                  {t("magneticServices")}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-transparent p-0 pt-4 shadow-none">
                  <div className="w-[min(92vw,34rem)] rounded-[1.75rem] border border-slate-200/70 bg-white/85 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
                    <ul className="grid gap-1">
                      {magneticProductLinks.map((item) => (
                        <li key={item.href}>
                          <ListItem locale={locale} {...item} />
                        </li>
                      ))}
                    </ul>
                    <div className="px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
                      <Link href="/services" locale={locale} className="transition hover:text-slate-950 dark:hover:text-white">
                        {t("allServices")}
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="h-9 rounded-none border-b border-transparent bg-transparent px-0 text-sm font-medium text-slate-700 hover:bg-transparent hover:text-slate-950 focus:bg-transparent focus:text-slate-950 data-[active]:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-slate-950 dark:text-slate-200 dark:hover:bg-transparent dark:hover:text-white dark:focus:bg-transparent dark:focus:text-white dark:data-[state=open]:text-white">
                  Company
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-transparent p-0 pt-4 shadow-none">
                  <div className="grid w-[min(92vw,46rem)] grid-cols-2 gap-3 rounded-[1.75rem] border border-slate-200/70 bg-white/85 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80">
                    <ul className="grid gap-1">
                      {companyLinks.map((item) => (
                        <li key={item.title}>
                          <ListItem locale={locale} {...item} />
                        </li>
                      ))}
                    </ul>
                    <ul className="space-y-1 px-2 py-1.5">
                      {companyLinks2.map((item) => (
                        <li key={item.title}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={item.href}
                              locale={locale}
                              className="flex flex-row items-center gap-x-2 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-transparent hover:text-slate-950 dark:text-slate-200 dark:hover:bg-transparent dark:hover:text-white"
                            >
                              <item.icon className="text-foreground size-4" />
                              <span>{item.title}</span>
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
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
            <span className="text-sm text-slate-500">Navigation</span>
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
            <span className="text-sm text-slate-500">Services</span>
            {productLinks.map((link) => (
              <MobileLink key={link.title} locale={locale} href={link.href} onClick={() => setOpen(false)} icon={link.icon}>
                {link.title}
              </MobileLink>
            ))}
          </div>

          <div className="space-y-2">
            <span className="text-sm text-slate-500">{t("magneticServices")}</span>
            {magneticProductLinks.map((link) => (
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
        "flex w-full flex-row gap-x-3 rounded-2xl border border-transparent px-3 py-3 transition hover:bg-transparent hover:text-slate-950 focus:bg-transparent focus:text-slate-950 dark:hover:text-white dark:focus:text-white",
        className
      )}
      asChild
    >
      <Link href={href} locale={locale}>
        <div className="flex aspect-square size-10 items-center justify-center rounded-full border border-slate-200/70 text-slate-500 dark:border-white/10 dark:text-slate-300">
          <Icon className="size-4" />
        </div>
        <div className="flex flex-col items-start justify-center">
          <span className="font-medium text-slate-900 dark:text-white">{title}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">{description}</span>
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
