const fs = require('fs');

const pathEN = 'messages/en.json';
const pathAR = 'messages/ar.json';

const en = JSON.parse(fs.readFileSync(pathEN, 'utf8'));
const ar = JSON.parse(fs.readFileSync(pathAR, 'utf8'));

// Updates to EN
if(!en.Landing) en.Landing = {};
en.Landing.lovedByDevelopers = "Loved by Developers";
en.Landing.lovedByDevelopersDesc = "Real feedback from developers and operators across South Asia.";
en.Landing.viewAllReviews = "View all 5,218 reviews";
en.Navigation.services = "Tools"; // Change Services to Tools
en.Navigation.magneticServices = "Magnetic Tools";
en.Navigation.servicesMenuEyebrow = "Tool catalog";
en.Navigation.servicesMenuTitle = "Magnetic digital infrastructure & growth tools";
en.Navigation.allServices = "All tools";
en.Pages.servicesEyebrow = "Tool universe";
en.Pages.servicesTitle = "Curated infrastructure, security, and growth tools.";
en.Pages.servicesDescription = "Explore a curated catalog built to help businesses secure, optimize, and scale their digital operations with confidence.";

// Updates to AR
if(!ar.Landing) ar.Landing = {};
ar.Landing.lovedByDevelopers = "محبوب من قبل المطورين";
ar.Landing.lovedByDevelopersDesc = "آراء حقيقية من المطورين والمشغلين في جميع أنحاء جنوب آسيا.";
ar.Landing.viewAllReviews = "عرض جميع المراجعات البالغ عددها 5,218";
ar.Navigation.services = "الأدوات";
ar.Navigation.magneticServices = "أدوات Magnetic";
ar.Navigation.servicesMenuEyebrow = "كتالوج الأدوات";
ar.Navigation.servicesMenuTitle = "البنية التحتية الرقمية وأدوات النمو من Magnetic";
ar.Navigation.allServices = "جميع الأدوات";
ar.Pages.servicesEyebrow = "عالم الأدوات";
ar.Pages.servicesTitle = "أدوات البنية التحتية والأمن والنمو المنسقة.";
ar.Pages.servicesDescription = "استكشف كتالوجًا منسقًا مصممًا لمساعدة الشركات على تأمين عملياتها الرقمية وتحسينها وتوسيع نطاقها بثقة.";

fs.writeFileSync(pathEN, JSON.stringify(en, null, 2));
fs.writeFileSync(pathAR, JSON.stringify(ar, null, 2));

console.log("Updated JSON files!");
