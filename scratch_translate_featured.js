const fs = require('fs');

const pathEN = 'messages/en.json';
const pathAR = 'messages/ar.json';

const en = JSON.parse(fs.readFileSync(pathEN, 'utf8'));
const ar = JSON.parse(fs.readFileSync(pathAR, 'utf8'));

if (!en.FeaturedTestimonials) en.FeaturedTestimonials = {};
en.FeaturedTestimonials.item0_quote = "Transformed our entire e-commerce operations. The admin panel is incredibly powerful.";
en.FeaturedTestimonials.item1_quote = "The AI automation handles our entire customer support flow. Absolutely game-changing.";
en.FeaturedTestimonials.item2_quote = "Blazing fast servers with zero downtime. Best hosting decision we ever made.";
en.FeaturedTestimonials.item0_role = "CEO & Founder";
en.FeaturedTestimonials.item1_role = "CTO";
en.FeaturedTestimonials.item2_role = "CTO";

if (!ar.FeaturedTestimonials) ar.FeaturedTestimonials = {};
ar.FeaturedTestimonials.item0_quote = "حول عمليات التجارة الإلكترونية بالكامل لدينا. لوحة الإدارة قوية بشكل لا يصدق.";
ar.FeaturedTestimonials.item1_quote = "تتعامل أتمتة الذكاء الاصطناعي مع تدفق دعم العملاء بالكامل. مغير لقواعد اللعبة تماما.";
ar.FeaturedTestimonials.item2_quote = "خوادم سريعة للغاية مع وقت تعطل صفر. أفضل قرار استضافة اتخذناه على الإطلاق.";
ar.FeaturedTestimonials.item0_role = "الرئيس التنفيذي والمؤسس";
ar.FeaturedTestimonials.item1_role = "مدير تكنولوجيا المعلومات";
ar.FeaturedTestimonials.item2_role = "مدير تكنولوجيا المعلومات";

fs.writeFileSync(pathEN, JSON.stringify(en, null, 2));
fs.writeFileSync(pathAR, JSON.stringify(ar, null, 2));

console.log("Featured Testimonials Translations Updated!");
