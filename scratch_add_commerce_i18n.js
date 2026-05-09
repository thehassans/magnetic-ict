const fs = require('fs');
const path = require('path');

const locales = ['en', 'ar', 'bn', 'de', 'es', 'fr', 'tr'];
const baseDir = 'messages';

const translations = {
  en: {
    MagneticCommerce: {
      eyebrow: "Commerce Operating System",
      headline: "Magnetic Commerce",
      description: "Clean commerce front, separate stakeholder panels, and connected website + iPhone + Android experiences.",
      openDemo: "Open live demo",
      viewRollout: "View rollout packages",
      panels: "Panels",
      surfaces: "Surfaces",
      coverage: "Coverage",
      mode: "Mode",
      commandCenterHeadline: "Your complete business command center.",
      commandCenterSubline: "12 modules, full financial visibility, multi-role management, and real-time operations — all from one panel.",
      modules: {
        dashboard: "Dashboard",
        orders: "Orders",
        product: "Product",
        amountOffice: "Amount Office",
        inbox: "Inbox",
        create: "Create",
        commerce: "Commerce",
        webDesigner: "Web Designer",
        insights: "Insights",
        support: "Support"
      }
    }
  },
  bn: {
    MagneticCommerce: {
      eyebrow: "কমার্স অপারেটিং সিস্টেম",
      headline: "ম্যাগনেটিক কমার্স",
      description: "ক্লিন কমার্স ফ্রন্ট, আলাদা স্টেকহোল্ডার প্যানেল এবং সংযুক্ত ওয়েবসাইট + আইফোন + অ্যান্ড্রয়েড অভিজ্ঞতা।",
      openDemo: "লাইভ ডেমো দেখুন",
      viewRollout: "রোলআউট প্যাকেজ দেখুন",
      panels: "প্যানেল",
      surfaces: "সারফেস",
      coverage: "কভারেজ",
      mode: "মোড",
      commandCenterHeadline: "আপনার সম্পূর্ণ ব্যবসায়িক কমান্ড সেন্টার।",
      commandCenterSubline: "১২টি মডিউল, সম্পূর্ণ আর্থিক স্বচ্ছতা, মাল্টি-রোল ম্যানেজমেন্ট এবং রিয়েল-টাইম অপারেশন — সবই একটি প্যানেল থেকে।",
      modules: {
        dashboard: "ড্যাশবোর্ড",
        orders: "অর্ডার",
        product: "প্রোডাক্ট",
        amountOffice: "অ্যামাউন্ট অফিস",
        inbox: "ইনবক্স",
        create: "তৈরি করুন",
        commerce: "কমার্স",
        webDesigner: "ওয়েব ডিজাইনার",
        insights: "ইনসাইটস",
        support: "সহায়তা"
      }
    }
  },
  ar: {
    MagneticCommerce: {
      eyebrow: "نظام تشغيل التجارة",
      headline: "Magnetic Commerce",
      description: "واجهة تجارة نظيفة، لوحات منفصلة لأصحاب المصلحة، وتجارب متصلة للموقع + آيفون + أندرويد.",
      openDemo: "افتح العرض المباشر",
      viewRollout: "عرض حزم الإطلاق",
      panels: "لوحات",
      surfaces: "واجهات",
      coverage: "تغطية",
      mode: "وضع",
      commandCenterHeadline: "مركز قيادة أعمالك الكامل.",
      commandCenterSubline: "12 وحدة، رؤية مالية كاملة، إدارة أدوار متعددة، وعمليات فورية - كل ذلك من لوحة واحدة.",
      modules: {
        dashboard: "لوحة التحكم",
        orders: "الطلبات",
        product: "المنتج",
        amountOffice: "مكتب المبالغ",
        inbox: "البريد الوارد",
        create: "إنشاء",
        commerce: "التجارة",
        webDesigner: "مصمم الويب",
        insights: "رؤى",
        support: "الدعم"
      }
    }
  }
};

locales.forEach(locale => {
  const filePath = path.join(baseDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const t = translations[locale] || translations.en;

  if (!data.MagneticCommerce) data.MagneticCommerce = {};
  Object.assign(data.MagneticCommerce, t.MagneticCommerce);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
});

console.log("Magnetic Commerce translations added to all languages!");
