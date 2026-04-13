import type { ServiceMenuKey } from "@/lib/service-menu";

export type CatalogTier = {
  id: string;
  name: "Starter" | "Professional" | "Enterprise";
  price: number;
  summary: string;
  features: string[];
};

export type CatalogService = {
  id: ServiceMenuKey;
  name: string;
  category: string;
  eyebrow: string;
  tagline: string;
  description: string;
  imageLabel: string;
  highlights: string[];
  benefits: string[];
  tiers: CatalogTier[];
};

export const serviceCatalog: CatalogService[] = [
  {
    id: "ssl",
    name: "SSL Certificates",
    category: "Website Security",
    eyebrow: "Trust & encryption",
    tagline: "Protect every customer interaction with premium encryption and trust signals.",
    description:
      "Deploy business-grade certificates, automated renewal workflows, and confidence-building trust coverage for ecommerce, SaaS, and enterprise sites.",
    imageLabel: "TLS Trust Layer",
    highlights: ["Auto renewal", "SHA-256 encryption", "Premium browser trust"],
    benefits: [
      "Reduce checkout hesitation with visible trust markers.",
      "Secure sensitive traffic across landing pages, apps, and customer dashboards.",
      "Support brand credibility with proactive certificate lifecycle management."
    ],
    tiers: [
      {
        id: "ssl-starter",
        name: "Starter",
        price: 29,
        summary: "Ideal for single-site protection and fast setup.",
        features: ["Single domain coverage", "Automated issuance", "Standard support"]
      },
      {
        id: "ssl-professional",
        name: "Professional",
        price: 79,
        summary: "Expanded coverage for growing brands and storefronts.",
        features: ["Wildcard or multi-domain", "Priority renewal monitoring", "Trust badge assets"]
      },
      {
        id: "ssl-enterprise",
        name: "Enterprise",
        price: 199,
        summary: "High-trust certificate operations for critical properties.",
        features: ["Advanced validation", "Dedicated onboarding", "Managed lifecycle governance"]
      }
    ]
  },
  {
    id: "websiteBuilder",
    name: "Website Builder",
    category: "Web Presence",
    eyebrow: "Launch faster",
    tagline: "Create premium sites with polished UX and conversion-ready structure.",
    description:
      "Ship modern digital experiences with guided design systems, premium sections, responsive layouts, and optimization support for performance-focused brands.",
    imageLabel: "Premium Site Studio",
    highlights: ["Responsive sections", "Modern templates", "Conversion blocks"],
    benefits: [
      "Accelerate launches without sacrificing visual quality.",
      "Create consistent brand experiences across every screen size.",
      "Package premium pages with future-ready infrastructure."
    ],
    tiers: [
      {
        id: "websiteBuilder-starter",
        name: "Starter",
        price: 49,
        summary: "A refined web presence for emerging brands.",
        features: ["Up to 5 pages", "Mobile-optimized templates", "Foundational SEO setup"]
      },
      {
        id: "websiteBuilder-professional",
        name: "Professional",
        price: 119,
        summary: "Built for serious marketing and lead generation.",
        features: ["Up to 20 pages", "Advanced sections & forms", "Performance and analytics review"]
      },
      {
        id: "websiteBuilder-enterprise",
        name: "Enterprise",
        price: 299,
        summary: "A premium digital front door for high-growth teams.",
        features: ["Unlimited page architecture", "Custom design system integration", "White-glove launch support"]
      }
    ]
  },
  {
    id: "emailServices",
    name: "E-mail Services",
    category: "Communication",
    eyebrow: "Reliable delivery",
    tagline: "Keep critical communication flowing with secure business-grade email operations.",
    description:
      "From transactional flows to internal business communications, get dependable delivery, domain alignment, and premium operational visibility.",
    imageLabel: "Email Reliability Grid",
    highlights: ["Deliverability controls", "Domain authentication", "Operational visibility"],
    benefits: [
      "Improve inbox placement and sender trust.",
      "Support customer lifecycle messaging with consistency.",
      "Centralize email governance for your team."
    ],
    tiers: [
      {
        id: "emailServices-starter",
        name: "Starter",
        price: 19,
        summary: "Business email reliability essentials.",
        features: ["Domain setup", "SPF/DKIM guidance", "Basic delivery monitoring"]
      },
      {
        id: "emailServices-professional",
        name: "Professional",
        price: 59,
        summary: "Operational visibility for growing teams.",
        features: ["Transactional setup review", "Deliverability diagnostics", "Priority support"]
      },
      {
        id: "emailServices-enterprise",
        name: "Enterprise",
        price: 149,
        summary: "Email infrastructure for mission-critical communications.",
        features: ["High-volume readiness", "Incident response support", "Ongoing deliverability optimization"]
      }
    ]
  },
  {
    id: "professionalEmail",
    name: "Professional Email & Apps",
    category: "Workplace Productivity",
    eyebrow: "Branded collaboration",
    tagline: "Power premium communication and productivity with your own branded workspace.",
    description:
      "Equip teams with professional inboxes, collaboration tools, shared calendars, and brand-aligned productivity systems built for trusted operations.",
    imageLabel: "Team Collaboration Suite",
    highlights: ["Branded inboxes", "Calendar & apps", "Team onboarding"],
    benefits: [
      "Elevate brand trust in every customer-facing interaction.",
      "Consolidate collaboration and communication workflows.",
      "Streamline onboarding for internal teams and contractors."
    ],
    tiers: [
      {
        id: "professionalEmail-starter",
        name: "Starter",
        price: 15,
        summary: "Professional inboxes for lean teams.",
        features: ["5 branded mailboxes", "Shared calendar basics", "Admin setup assistance"]
      },
      {
        id: "professionalEmail-professional",
        name: "Professional",
        price: 39,
        summary: "Scalable productivity for growing operations.",
        features: ["25 user rollout", "Drive and docs enablement", "Security baseline setup"]
      },
      {
        id: "professionalEmail-enterprise",
        name: "Enterprise",
        price: 99,
        summary: "Managed collaboration systems for advanced teams.",
        features: ["Advanced workspace governance", "Migration support", "Executive onboarding experience"]
      }
    ]
  },
  {
    id: "seoTools",
    name: "SEO Tools",
    category: "Growth Optimization",
    eyebrow: "Search visibility",
    tagline: "Turn technical polish into discoverability, rankings, and measurable acquisition growth.",
    description:
      "Deploy premium SEO tooling and strategic visibility insights that help brands improve discoverability, technical health, and growth performance.",
    imageLabel: "Search Growth Engine",
    highlights: ["Ranking insights", "Site audits", "Content intelligence"],
    benefits: [
      "Find technical bottlenecks blocking search growth.",
      "Strengthen the connection between visibility and conversion.",
      "Support long-term traffic resilience with better tooling."
    ],
    tiers: [
      {
        id: "seoTools-starter",
        name: "Starter",
        price: 39,
        summary: "Core SEO visibility for growing websites.",
        features: ["Keyword baseline tracking", "Technical audit", "Monthly recommendations"]
      },
      {
        id: "seoTools-professional",
        name: "Professional",
        price: 99,
        summary: "High-context optimization for acquisition teams.",
        features: ["Competitive tracking", "On-page opportunity mapping", "Performance reporting"]
      },
      {
        id: "seoTools-enterprise",
        name: "Enterprise",
        price: 249,
        summary: "Advanced visibility strategy for serious growth operators.",
        features: ["Cross-market search intelligence", "Content gap planning", "Executive growth dashboards"]
      }
    ]
  },
  {
    id: "siteLockVpn",
    name: "SiteLock VPN",
    category: "Security & Privacy",
    eyebrow: "Private access",
    tagline: "Protect remote sessions and digital operations with managed privacy safeguards.",
    description:
      "Support secure browsing, privacy protection, and remote work resilience with VPN experiences designed for professional reliability.",
    imageLabel: "Secure Access Layer",
    highlights: ["Managed privacy", "Secure remote access", "Policy controls"],
    benefits: [
      "Protect distributed teams across shared networks.",
      "Reduce exposure when handling sensitive admin workflows.",
      "Extend a premium security posture beyond your public site."
    ],
    tiers: [
      {
        id: "siteLockVpn-starter",
        name: "Starter",
        price: 12,
        summary: "Privacy essentials for operators and founders.",
        features: ["Individual VPN access", "Trusted endpoints", "Core privacy controls"]
      },
      {
        id: "siteLockVpn-professional",
        name: "Professional",
        price: 34,
        summary: "Secure team access for operational workflows.",
        features: ["Team seat management", "Usage visibility", "Priority support"]
      },
      {
        id: "siteLockVpn-enterprise",
        name: "Enterprise",
        price: 89,
        summary: "Managed secure access at organization scale.",
        features: ["Policy guidance", "Expanded seat provisioning", "Security onboarding"]
      }
    ]
  },
  {
    id: "siteMonitoring",
    name: "Site & Server Monitoring",
    category: "Reliability",
    eyebrow: "Stay ahead",
    tagline: "See incidents before customers do with premium uptime and health monitoring.",
    description:
      "Monitor critical pages, servers, and service dependencies with proactive alerts and a reliability-first operating rhythm.",
    imageLabel: "Monitoring Command Center",
    highlights: ["Uptime alerts", "Server health views", "Incident visibility"],
    benefits: [
      "Reduce downtime surprises with proactive awareness.",
      "Create confidence across launch, campaign, and support windows.",
      "Back your premium brand experience with operational transparency."
    ],
    tiers: [
      {
        id: "siteMonitoring-starter",
        name: "Starter",
        price: 25,
        summary: "Foundational health monitoring for key systems.",
        features: ["Core uptime checks", "Email alerts", "Weekly summary"]
      },
      {
        id: "siteMonitoring-professional",
        name: "Professional",
        price: 69,
        summary: "Operational visibility for growing digital properties.",
        features: ["Multi-endpoint checks", "Escalation alerts", "Response playbook guidance"]
      },
      {
        id: "siteMonitoring-enterprise",
        name: "Enterprise",
        price: 179,
        summary: "High-context monitoring for mission-critical experiences.",
        features: ["Advanced alert routing", "Priority reviews", "Reliability consultation"]
      }
    ]
  },
  {
    id: "websiteSecurity",
    name: "Website Security",
    category: "Protection",
    eyebrow: "Secure every layer",
    tagline: "Shield your site, applications, and brand trust with modern website defense.",
    description:
      "Add proactive protection across traffic, forms, assets, and customer journeys with security services built for modern business risk.",
    imageLabel: "Protection Matrix",
    highlights: ["Threat hardening", "Brand trust", "Protective controls"],
    benefits: [
      "Reduce exposure across public-facing digital touchpoints.",
      "Support business continuity with layered protections.",
      "Reassure customers with visible security posture improvements."
    ],
    tiers: [
      {
        id: "websiteSecurity-starter",
        name: "Starter",
        price: 45,
        summary: "Practical security hardening for small teams.",
        features: ["Security baseline audit", "Recommended protections", "Essential safeguards"]
      },
      {
        id: "websiteSecurity-professional",
        name: "Professional",
        price: 109,
        summary: "Balanced defense for active marketing and sales sites.",
        features: ["Expanded threat review", "Managed hardening checklist", "Priority guidance"]
      },
      {
        id: "websiteSecurity-enterprise",
        name: "Enterprise",
        price: 289,
        summary: "Premium security operations for critical digital infrastructure.",
        features: ["Advanced review cadence", "Incident readiness", "Executive security reporting"]
      }
    ]
  },
  {
    id: "websiteBackup",
    name: "Website Backup",
    category: "Recovery & Resilience",
    eyebrow: "Recover instantly",
    tagline: "Preserve business continuity with resilient backup and restore workflows.",
    description:
      "Protect critical site content, configurations, and digital assets with premium backup coverage designed to reduce downtime and stress.",
    imageLabel: "Resilience Vault",
    highlights: ["Fast recovery", "Version coverage", "Operational resilience"],
    benefits: [
      "Recover from incidents without rebuilding from zero.",
      "Create confidence during updates, campaigns, and migrations.",
      "Strengthen your operational resilience posture."
    ],
    tiers: [
      {
        id: "websiteBackup-starter",
        name: "Starter",
        price: 18,
        summary: "Core backup protection for lean properties.",
        features: ["Scheduled backups", "Basic restore support", "Core retention"]
      },
      {
        id: "websiteBackup-professional",
        name: "Professional",
        price: 55,
        summary: "Reliable recovery for active websites and marketing stacks.",
        features: ["Expanded retention", "Priority restore support", "Recovery verification"]
      },
      {
        id: "websiteBackup-enterprise",
        name: "Enterprise",
        price: 145,
        summary: "Premium continuity planning for essential digital operations.",
        features: ["Advanced recovery cadence", "High-priority restore workflows", "Operational recovery guidance"]
      }
    ]
  },
  {
    id: "nordVpn",
    name: "NordVPN",
    category: "Remote Security",
    eyebrow: "Trusted connectivity",
    tagline: "Give teams and operators secure, trusted connectivity for high-value digital work.",
    description:
      "Enable secure remote workflows, privacy-first operations, and brand-safe connectivity standards with a premium VPN stack.",
    imageLabel: "Global Secure Routing",
    highlights: ["Secure connectivity", "Remote work readiness", "Trust-first operations"],
    benefits: [
      "Support travel, remote work, and distributed vendor access securely.",
      "Reduce risk across high-value administrative workflows.",
      "Extend the premium security experience beyond the website itself."
    ],
    tiers: [
      {
        id: "nordVpn-starter",
        name: "Starter",
        price: 14,
        summary: "Trusted privacy for individual operators.",
        features: ["Personal secure access", "Global endpoint coverage", "Core setup help"]
      },
      {
        id: "nordVpn-professional",
        name: "Professional",
        price: 36,
        summary: "A secure access baseline for small teams.",
        features: ["Team-ready provisioning", "Admin visibility", "Priority onboarding"]
      },
      {
        id: "nordVpn-enterprise",
        name: "Enterprise",
        price: 94,
        summary: "Managed secure connectivity for advanced organizations.",
        features: ["Expanded seat planning", "Operational rollout support", "Security review assistance"]
      }
    ]
  }
];

export function getServiceById(id: string) {
  return serviceCatalog.find((service) => service.id === id);
}
