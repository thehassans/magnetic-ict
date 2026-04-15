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

const allServiceCatalog: CatalogService[] = [
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
    id: "imageConversion",
    name: "Image Conversion",
    category: "Creative Utilities",
    eyebrow: "Free file utility",
    tagline: "Convert JPG, PNG, and WebP files instantly while resizing images for web, social, and product workflows.",
    description:
      "Launch a polished free image utility that lets users upload a file, convert it across popular formats, resize dimensions, and download the processed asset in seconds.",
    imageLabel: "Instant Conversion Studio",
    highlights: ["JPG, PNG, and WebP output", "Custom resize controls", "Fast browser-to-download workflow"],
    benefits: [
      "Give visitors a useful free tool they can access without checkout friction.",
      "Support quick format conversion for websites, marketplaces, and social media publishing.",
      "Resize assets before download so files are ready for performance and design requirements."
    ],
    tiers: [
      {
        id: "imageConversion-starter",
        name: "Starter",
        price: 0,
        summary: "Free instant conversion for JPG, PNG, and WebP files.",
        features: ["Upload a single image", "Convert between popular web formats", "Download the processed file"]
      },
      {
        id: "imageConversion-professional",
        name: "Professional",
        price: 0,
        summary: "Free resizing controls for custom dimensions and output quality.",
        features: ["Set width and height", "Maintain aspect ratio or force dimensions", "Tune export quality"]
      },
      {
        id: "imageConversion-enterprise",
        name: "Enterprise",
        price: 0,
        summary: "Free polished workflow for previews, conversion, and download delivery.",
        features: ["Before-and-after preview", "Instant download handoff", "No payment required"]
      }
    ]
  },
  {
    id: "aiDetection",
    name: "AI Detection",
    category: "AI Media Forensics",
    eyebrow: "Synthetic media analysis",
    tagline: "Upload an image or video and inspect whether it appears AI-generated using media forensics, sampled-frame analysis, and Gemini-assisted reasoning.",
    description:
      "Launch a premium AI detection workspace where users can upload images or short videos, review forensic indicators, inspect confidence scoring, and understand why content looks synthetic or authentic.",
    imageLabel: "Media Authenticity Lab",
    highlights: ["Image and video support", "Forensic signal scoring", "Confidence-backed decision summary"],
    benefits: [
      "Let visitors check suspicious images or videos inside a polished trust-first workflow.",
      "Combine metadata, compression, frame sampling, and AI reasoning into one readable result.",
      "Present clear findings, confidence levels, and signals instead of a black-box yes-or-no answer."
    ],
    tiers: [
      {
        id: "aiDetection-starter",
        name: "Starter",
        price: 0,
        summary: "Free authenticity checks for a single uploaded image or short video.",
        features: ["Image or video upload", "Confidence score", "Plain-language verdict"]
      },
      {
        id: "aiDetection-professional",
        name: "Professional",
        price: 0,
        summary: "Free forensic breakdown with metadata, signal cards, and reasoning highlights.",
        features: ["Metadata review", "Frame-sample analysis", "Synthetic signal explanation"]
      },
      {
        id: "aiDetection-enterprise",
        name: "Enterprise",
        price: 0,
        summary: "Free premium experience with side-by-side insights and downloadable evidence summary.",
        features: ["Premium analysis UI", "Evidence panel", "No checkout required"]
      }
    ]
  },
  {
    id: "videoDownloader",
    name: "Video Downloader",
    category: "Media Utilities",
    eyebrow: "Universal save flow",
    tagline: "Paste YouTube, Instagram, or Facebook links and download available audio or video outputs in the format and quality you want.",
    description:
      "Offer a polished downloader experience where users paste a supported video link, preview the media, choose MP4 or MP3 output, select available quality options, and save the file cleanly.",
    imageLabel: "Premium Download Console",
    highlights: ["YouTube, Instagram, and Facebook", "MP4 or MP3 output", "Quality-aware download selection"],
    benefits: [
      "Turn a common user need into a premium utility that drives repeat visits.",
      "Give users a clear format and quality selection flow instead of a cluttered downloader UI.",
      "Support fast previews, direct downloads, and clean feedback for unsupported or restricted links."
    ],
    tiers: [
      {
        id: "videoDownloader-starter",
        name: "Starter",
        price: 0,
        summary: "Free link analysis with preview, source details, and available download formats.",
        features: ["Paste supported URL", "Preview title and thumbnail", "Inspect available outputs"]
      },
      {
        id: "videoDownloader-professional",
        name: "Professional",
        price: 0,
        summary: "Free quality selection for MP4 video and MP3 audio downloads.",
        features: ["MP4 quality options", "MP3 conversion", "Source-aware format choices"]
      },
      {
        id: "videoDownloader-enterprise",
        name: "Enterprise",
        price: 0,
        summary: "Free premium download workflow built for speed, clarity, and cross-platform support.",
        features: ["Clean downloader UX", "Cross-platform link support", "No payment required"]
      }
    ]
  },
  {
    id: "magneticSocialBot",
    name: "Magnetic Social Bot",
    category: "AI Messaging Automation",
    eyebrow: "Social command center",
    tagline: "Run WhatsApp, Instagram, and Messenger conversations from one AI-assisted inbox with business-specific RAG context.",
    description:
      "Deploy a multi-channel social chatbot system with Gemini responses, business knowledge retrieval, onboarding workflows, and a unified operator inbox for WhatsApp, Instagram, and Messenger.",
    imageLabel: "Unified Messaging Command Center",
    highlights: ["WhatsApp, Instagram, and Messenger", "Gemini plus RAG responses", "AI or manual control per thread"],
    benefits: [
      "Reply across major Meta messaging channels from one workspace instead of juggling separate apps.",
      "Ground answers in uploaded business documents so the bot responds with brand-specific context.",
      "Let operators take over any thread instantly while preserving AI memory for the last 5 to 10 messages."
    ],
    tiers: [
      {
        id: "magneticSocialBot-starter",
        name: "Starter",
        price: 149,
        summary: "1 Social Media Chatbot (Basic)",
        features: ["1 active social chatbot", "Unified inbox access", "Gemini replies with business knowledge base"]
      },
      {
        id: "magneticSocialBot-professional",
        name: "Professional",
        price: 299,
        summary: "2 Social Media Chatbots (Pro)",
        features: ["2 active social chatbots", "Per-thread AI or manual mode", "Meta channel onboarding workspace"]
      },
      {
        id: "magneticSocialBot-enterprise",
        name: "Enterprise",
        price: 599,
        summary: "All-in-One (Unlimited)",
        features: ["Unlimited chatbot scale", "Priority automation control", "Advanced team-ready command center"]
      }
    ]
  },
  {
    id: "magneticFaceSearch",
    name: "Magnetic Face Search",
    category: "AI Vision & Search",
    eyebrow: "Biometric search roadmap",
    tagline: "Design a premium facial search platform with compliant data pipelines, vector search, and high-trust UX.",
    description:
      "Plan and scope a privacy-conscious face search platform with licensed image ingestion, face preprocessing, vector indexing, premium upload-to-search UX, and backend orchestration designed for consent, retention controls, and policy alignment.",
    imageLabel: "Biometric Search Command Layer",
    highlights: ["Licensed-source ingestion", "Vector similarity search", "Premium scanning UX"],
    benefits: [
      "Turn a complex biometric product concept into a phased technical roadmap with clear architecture decisions.",
      "Align product strategy around licensed sources, consent workflows, deletion policies, and operational governance from day one.",
      "Package premium web UX, AI service boundaries, and search performance targets into one delivery plan."
    ],
    tiers: [
      {
        id: "magneticFaceSearch-starter",
        name: "Starter",
        price: 299,
        summary: "Discovery and architecture planning for a compliant face search MVP.",
        features: [
          "Product and data-flow roadmap",
          "Licensed-source ingestion strategy",
          "Embedding and vector search recommendations"
        ]
      },
      {
        id: "magneticFaceSearch-professional",
        name: "Professional",
        price: 899,
        summary: "Detailed UX, backend, and AI system design for launch-ready execution.",
        features: [
          "Upload-to-search UX specification",
          "FastAPI, queue, and worker architecture",
          "Privacy, deletion, and compliance controls"
        ]
      },
      {
        id: "magneticFaceSearch-enterprise",
        name: "Enterprise",
        price: 2499,
        summary: "Executive-grade biometric search delivery plan with operational guardrails.",
        features: [
          "Scalable indexing and retrieval architecture",
          "Security and policy review pack",
          "Implementation advisory for engineering teams"
        ]
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

export const liveServiceCatalogKeys = [
  "ssl",
  "professionalEmail",
  "websiteSecurity",
  "websiteBuilder",
  "seoTools",
  "websiteBackup",
  "emailServices",
  "siteLockVpn",
  "nordVpn",
  "imageConversion",
  "siteMonitoring",
  "aiDetection",
  "videoDownloader",
  "magneticSocialBot",
  "magneticFaceSearch"
] as const satisfies ReadonlyArray<ServiceMenuKey>;

const liveServiceCatalogKeySet = new Set<ServiceMenuKey>(liveServiceCatalogKeys);

export const serviceCatalog: CatalogService[] = allServiceCatalog.filter((service) => liveServiceCatalogKeySet.has(service.id));

export function getServiceById(id: string) {
  return serviceCatalog.find((service) => service.id === id);
}
