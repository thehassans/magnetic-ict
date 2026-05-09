const fs = require('fs');
const path = require('path');

const locales = ['en', 'ar', 'bn', 'de', 'es', 'fr', 'tr'];
const baseDir = 'messages';

const translations = {
  en: {
    Navigation: {
      company: "Company",
      customerStories: "Customer stories",
      customerStoriesDesc: "See how operators describe their delivery experience",
      trustedEcosystem: "Trusted ecosystem",
      trustedEcosystemDesc: "Partners and platforms behind the MagneticICT stack",
      access: "Access",
      domainCart: "Domain cart",
      magneticSocialBotDesc: "Open your Magnetic Social Bot workspace"
    },
    Newsletter: {
      title: "Newsletter",
      description: "Get occasional product, service, and operations updates from MagneticICT.",
      placeholder: "Enter your email",
      submitting: "Subscribing...",
      submit: "Subscribe",
      success: "Subscribed successfully.",
      error: "Unable to subscribe right now."
    },
    Footer: {
      rights: "© {year} MagneticICT. All rights reserved."
    },
    Landing: {
      verifiedReviews: "5,000+ Verified Reviews",
      lovedBy: "Loved by",
      customers: "Customers",
      totalReviews: "Total Reviews",
      averageRating: "Average Rating",
      uptimeSla: "Uptime SLA",
      activeCustomers: "Active Customers"
    },
    Services: {
      free: "Free",
      from: "From"
    }
  },
  bn: {
    Navigation: {
      company: "কোম্পানি",
      customerStories: "গ্রাহক গল্প",
      customerStoriesDesc: "অপারেটররা তাদের ডেলিভারি অভিজ্ঞতা কীভাবে বর্ণনা করে তা দেখুন",
      trustedEcosystem: "বিশ্বস্ত ইকোসিস্টেম",
      trustedEcosystemDesc: "ম্যাগনেটিক আইসিটি স্ট্যাকের পিছনে থাকা পার্টনার এবং প্ল্যাটফর্ম",
      access: "অ্যাক্সেস",
      domainCart: "ডোমেইন কার্ট",
      magneticSocialBotDesc: "আপনার ম্যাগনেটিক সোশ্যাল বট ওয়ার্কস্পেস খুলুন"
    },
    Newsletter: {
      title: "নিউজলেটার",
      description: "ম্যাগনেটিক আইসিটি থেকে মাঝে মাঝে প্রোডাক্ট, পরিষেবা এবং অপারেশনাল আপডেট পান।",
      placeholder: "আপনার ইমেল লিখুন",
      submitting: "সাবস্ক্রাইব করা হচ্ছে...",
      submit: "সাবস্ক্রাইব করুন",
      success: "সফলভাবে সাবস্ক্রাইব করা হয়েছে।",
      error: "এই মুহূর্তে সাবস্ক্রাইব করা সম্ভব নয়।"
    },
    Footer: {
      rights: "© {year} ম্যাগনেটিক আইসিটি। সর্বস্বত্ব সংরক্ষিত।"
    },
    Landing: {
      verifiedReviews: "৫,০০০+ যাচাইকৃত রিভিউ",
      lovedBy: "পছন্দের",
      customers: "গ্রাহকদের",
      totalReviews: "মোট রিভিউ",
      averageRating: "গড় রেটিং",
      uptimeSla: "আপটাইম এসএলএ",
      activeCustomers: "সক্রিয় গ্রাহক"
    },
    Services: {
      free: "ফ্রি",
      from: "থেকে"
    }
  },
  ar: {
    Navigation: {
      company: "الشركة",
      customerStories: "قصص العملاء",
      customerStoriesDesc: "تعرف على كيفية وصف المشغلين لتجربة التسليم الخاصة بهم",
      trustedEcosystem: "النظام البيئي الموثوق به",
      trustedEcosystemDesc: "الشركاء والمنصات خلف مجموعة MagneticICT",
      access: "الوصول",
      domainCart: "عربة الدومينات",
      magneticSocialBotDesc: "افتح مساحة عمل Magnetic Social Bot الخاصة بك"
    },
    Newsletter: {
      title: "النشرة الإخبارية",
      description: "احصل على تحديثات دورية للمنتجات والخدمات والعمليات من MagneticICT.",
      placeholder: "أدخل بريدك الإلكتروني",
      submitting: "جاري الاشتراك...",
      submit: "اشترك",
      success: "تم الاشتراك بنجاح.",
      error: "تعذر الاشتراك في الوقت الحالي."
    },
    Footer: {
      rights: "© {year} MagneticICT. جميع الحقوق محفوظة."
    },
    Landing: {
      verifiedReviews: "5,000+ مراجعة موثقة",
      lovedBy: "محبوب من قبل",
      customers: "العملاء",
      totalReviews: "إجمالي المراجعات",
      averageRating: "متوسط التقييم",
      uptimeSla: "اتفاقية مستوى الخدمة للوقت",
      activeCustomers: "العملاء النشطون"
    },
    Services: {
      free: "مجاني",
      from: "تبدأ من"
    }
  }
};

locales.forEach(locale => {
  const filePath = path.join(baseDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const t = translations[locale] || translations.en; // Fallback to EN for others for now

  if (!data.Navigation) data.Navigation = {};
  Object.assign(data.Navigation, t.Navigation);

  if (!data.Newsletter) data.Newsletter = {};
  Object.assign(data.Newsletter, t.Newsletter);

  if (!data.Footer) data.Footer = {};
  Object.assign(data.Footer, t.Footer);

  if (!data.Landing) data.Landing = {};
  Object.assign(data.Landing, t.Landing);

  if (!data.Services) data.Services = {};
  Object.assign(data.Services, t.Services);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
});

console.log("Global JSON updates for Header, Footer, and Sections complete!");
