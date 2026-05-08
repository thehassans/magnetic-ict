import { NextRequest, NextResponse } from "next/server";

// ── Simple in-process knowledge base for RAG responses ──
const KNOWLEDGE_BASE = `
# Magnetic ICT — Company Knowledge Base

## About
Magnetic ICT is an advanced ICT solutions company offering e-commerce platforms, digital marketing automation, AI-powered tools, VPS hosting, and business intelligence software. We serve SMBs and enterprise clients across the GCC region (UAE, KSA, Qatar, Bahrain, Kuwait, Oman) and beyond.

## Core Products & Services

### Magnetic Commerce
A fully integrated e-commerce and logistics management platform with:
- Multi-country order management (UAE, KSA, Bahrain, Oman, Kuwait, Qatar, India, Pakistan, Jordan, USA, UK)
- Real-time driver tracking and delivery management
- Comprehensive admin panel with 12 modules:
  1. Dashboard – Business command center with country-first controls and global view
  2. Orders – Online and in-house order management
  3. Product – Inhouse products and product detail management
  4. Amount Office – Financial hub: Total Amount, Daily Reports, Driver Settlement, Manager Finances, Agent Amounts & History, Driver Amounts, Manager Salary, Dropshipper Earnings, Investor Earnings
  5. Inbox – WhatsApp Inbox and WhatsApp Connect integration
  6. Create – Manage Agents, Managers, Partners, Drivers, Dropshippers, Investors, Commissioners, Confirmers, Customers
  7. Commerce – Driver Stock, Label Settings, Website Settings, Coupons, Cashback Offers, Warehouses, Shipments, Expense Management
  8. Web Designer – Categories, Home Headline, Home Header, Product Headline, Home Banners, Home Mini Banners, Brands, Explore More
  9. Insights – Track Drivers, Business Reports, Driver Reports, Profit & Loss, Campaigns, Finances, Website Modification
  10. Configuration – System-wide settings
  11. Support – Customer support tools
  12. Branding – Brand management
- Mobile apps on App Store (iOS) and Google Play (Android)
- Multi-role system: Owner, Agent, Manager, Partner, Driver, Dropshipper, Investor, Commissioner, Confirmer, Customer

### Magnetic Social Bot
- WhatsApp, Facebook, Instagram, and Messenger automation
- AI-powered auto-replies and knowledge base RAG system
- Guided Meta API connection without token setup
- Memory window: last 10 messages retained for human-like flow
- Business knowledge upload (PDF, DOCX, TXT)

### Magnetic Face Search
- AI-powered facial recognition search engine
- Identifies matching profiles across social platforms

### Magnetic VPS Hosting
- Scalable virtual private servers
- GCC-region data centers
- Full root access, SSD storage

## Free Tools

### AI Detection Tool
- Upload image or video to detect if it's AI-generated
- Returns: Verdict, Confidence score, Signal analysis
- Supports: JPEG, PNG, MP4, MOV and more

### Image Conversion Tool
- Convert between JPG, PNG, WebP, AVIF, GIF, TIFF
- Resize with custom width, height, quality settings
- Instant download of processed image

### Video Downloader
- Download videos from YouTube, Instagram, Facebook
- MP4 (video) and MP3 (audio) output
- Quality selection from available formats

## Pricing Model
- Magnetic Commerce: Subscription-based, monthly or annual plans
- VPS Hosting: Starting from competitive GCC pricing
- Free tools: No charge, unlimited use
- Custom enterprise packages available on request

## Contact & Support
- Support portal: magnetic-ict.com/support
- WhatsApp integration via Magnetic Social Bot
- GCC business hours: Sun–Thu 9AM–6PM GST

## Technology Stack
- Next.js frontend with TypeScript
- PostgreSQL database with Prisma ORM
- AI integrations: Google Gemini, custom forensics
- Mobile: React Native (iOS & Android)
- Infrastructure: Vercel + custom VPS
`;

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

function buildSystemPrompt() {
  return `You are "Ask Magnetic", the official AI assistant for Magnetic ICT.
You answer questions based ONLY on the knowledge base provided below.
If a question is outside the knowledge base, say: "I don't have specific information about that, but our support team at magnetic-ict.com/support can help you."
Be concise, friendly, and professional. Format responses clearly. Never make up facts.

KNOWLEDGE BASE:
${KNOWLEDGE_BASE}`;
}

function buildSimpleResponse(message: string): string {
  const lower = message.toLowerCase();

  // Simple keyword matching for quick RAG-like responses
  if (lower.includes("service") || lower.includes("offer") || lower.includes("product")) {
    return "Magnetic ICT offers:\n\n• **Magnetic Commerce** — Full e-commerce & logistics platform with admin panel, driver tracking, and multi-country support\n• **Magnetic Social Bot** — WhatsApp/Facebook/Instagram automation with AI replies\n• **Magnetic Face Search** — AI facial recognition\n• **Magnetic VPS Hosting** — Scalable cloud servers\n\n**Free Tools:** AI Detection, Image Conversion, Video Downloader\n\nVisit magnetic-ict.com/services for full details.";
  }
  if (lower.includes("commerce") && (lower.includes("how") || lower.includes("work") || lower.includes("feature"))) {
    return "**Magnetic Commerce** is a complete e-commerce + logistics platform with:\n\n• 12 admin modules (Dashboard, Orders, Amount Office, Inbox, Create, Commerce, Web Designer, Insights, etc.)\n• Multi-country support (UAE, KSA, Qatar, Bahrain, Kuwait, Oman, and more)\n• Real-time driver tracking\n• Multi-role management: Agents, Managers, Drivers, Dropshippers, Investors\n• iOS & Android mobile apps\n• WhatsApp integration via Inbox module\n• Financial reporting, settlement, and P&L";
  }
  if (lower.includes("admin") || lower.includes("panel") || lower.includes("module")) {
    return "The **Magnetic Commerce Admin Panel** has 12 modules:\n\n1. **Dashboard** — Business command center, global view\n2. **Orders** — Online & in-house orders\n3. **Product** — Product catalog management\n4. **Amount Office** — Full financials: settlements, salaries, earnings\n5. **Inbox** — WhatsApp integration\n6. **Create** — Add Agents, Managers, Drivers, etc.\n7. **Commerce** — Coupons, warehouses, shipping, expenses\n8. **Web Designer** — Website content management\n9. **Insights** — Tracking, reports, P&L, campaigns\n10. **Configuration** — System settings\n11. **Support** — Customer support tools\n12. **Branding** — Brand identity management";
  }
  if (lower.includes("price") || lower.includes("pricing") || lower.includes("cost") || lower.includes("package")) {
    return "**Pricing at Magnetic ICT:**\n\n• **Magnetic Commerce**: Subscription-based plans (monthly & annual). Contact us for custom pricing.\n• **VPS Hosting**: Competitive GCC-region rates. Pricing varies by server specs.\n• **Free Tools**: AI Detection, Image Conversion, and Video Downloader are completely free.\n• **Enterprise packages** are available on request.\n\nContact our team at magnetic-ict.com/support for a personalized quote.";
  }
  if (lower.includes("start") || lower.includes("begin") || lower.includes("sign up") || lower.includes("register")) {
    return "**Getting started with Magnetic ICT:**\n\n1. Visit **magnetic-ict.com** and browse our services\n2. Sign up for a free account to access free tools immediately\n3. For Magnetic Commerce or Social Bot, contact our team for onboarding\n4. Our team assists with setup, training, and integration\n\nSupport is available at magnetic-ict.com/support or via WhatsApp.";
  }
  if (lower.includes("whatsapp") || lower.includes("social bot") || lower.includes("bot") || lower.includes("inbox")) {
    return "**Magnetic Social Bot** provides:\n\n• WhatsApp, Facebook, Instagram & Messenger automation\n• AI-powered auto-replies using your knowledge base\n• Guided Meta connection (no manual token setup)\n• Memory window: retains last 10 messages for natural flow\n• Upload your business docs (PDF, DOCX, TXT) as FAQs\n• Available in your dashboard under Social Bot";
  }
  if (lower.includes("ai detection") || lower.includes("detect") || lower.includes("fake")) {
    return "The **AI Detection Tool** is a free service that:\n\n• Analyzes images and videos for AI-generation signals\n• Returns a verdict: Likely Synthetic, Possibly Synthetic, or Likely Authentic\n• Shows confidence score and the strongest detection clue\n• Supports JPG, PNG, MP4, MOV and more\n\nTry it at magnetic-ict.com/services/aiDetection";
  }
  if (lower.includes("download") || lower.includes("youtube") || lower.includes("instagram") || lower.includes("video")) {
    return "The **Video Downloader** is a free tool that:\n\n• Downloads from YouTube, Instagram, and Facebook\n• Supports MP4 (video) and MP3 (audio)\n• Auto-detects the platform when you paste a link\n• Lets you choose video quality before downloading\n\nTry it at magnetic-ict.com/services/videoDownloader";
  }
  if (lower.includes("hosting") || lower.includes("vps") || lower.includes("server")) {
    return "**Magnetic VPS Hosting** offers:\n\n• Scalable virtual private servers\n• GCC-region data centers for low latency\n• Full root access and SSD storage\n• Competitive pricing for businesses in the GCC\n\nVisit magnetic-ict.com/services/magneticVpsHosting for plans.";
  }
  if (lower.includes("contact") || lower.includes("support") || lower.includes("help") || lower.includes("team")) {
    return "**Contact Magnetic ICT:**\n\n• Support portal: magnetic-ict.com/support\n• WhatsApp automation via Magnetic Social Bot\n• Business hours: Sunday–Thursday, 9AM–6PM GST\n\nOur team is happy to assist with any questions or custom requirements.";
  }

  return "Thank you for your question! Based on our knowledge base, I can help with information about Magnetic ICT's services including Magnetic Commerce, Social Bot, VPS Hosting, AI Detection, Image Conversion, and Video Downloader.\n\nCould you be more specific about what you'd like to know? Or visit magnetic-ict.com/support to connect with our team directly.";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      message?: string;
      history?: HistoryMessage[];
    };

    const message = body.message?.trim();
    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // Try to use Gemini if available, otherwise use local knowledge base
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (geminiApiKey) {
      try {
        const systemPrompt = buildSystemPrompt();
        const history = (body.history ?? []).slice(-10); // last 10 messages for context

        const contents = [
          ...history.map((msg) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          })),
          { role: "user", parts: [{ text: message }] },
        ];

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents,
              generationConfig: { temperature: 0.4, maxOutputTokens: 600 },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = (await geminiRes.json()) as {
            candidates?: { content?: { parts?: { text?: string }[] } }[];
          };
          const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return NextResponse.json({ reply });
          }
        }
      } catch {
        // Fall through to local KB
      }
    }

    // Local knowledge base fallback
    const reply = buildSimpleResponse(message);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Internal error." }, { status: 500 });
  }
}
