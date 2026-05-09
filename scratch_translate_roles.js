const fs = require('fs');

const pathEN = 'messages/en.json';
const pathAR = 'messages/ar.json';

const en = JSON.parse(fs.readFileSync(pathEN, 'utf8'));
const ar = JSON.parse(fs.readFileSync(pathAR, 'utf8'));

if (!en.Reviews) en.Reviews = {};
if (!ar.Reviews) ar.Reviews = {};

const rolesA = [
  "eCommerce Owner", "Startup Founder", "Blogger", "Agency Director", "Marketing Manager",
  "Product Manager", "CTO", "SaaS Founder", "Dev Lead", "Freelancer"
];

const rolesA_AR = [
  "صاحب متجر إلكتروني", "مؤسس شركة ناشئة", "مدون", "مدير وكالة", "مدير تسويق",
  "مدير منتج", "مدير تكنولوجيا", "مؤسس SaaS", "قائد فريق تطوير", "مستقل"
];

const rolesB = [
  "Full Stack Dev", "E-Commerce Head", "Startup CEO", "Content Creator", "Backend Engineer",
  "Project Manager", "Dropshipper", "Brand Manager", "Data Analyst", "Podcast Host"
];

const rolesB_AR = [
  "مطور فول ستاك", "رئيس التجارة الإلكترونية", "الرئيس التنفيذي للشركة الناشئة", "صانع محتوى", "مهندس بايك إند",
  "مدير مشروع", "دروبشيبر", "مدير علامة تجارية", "محلل بيانات", "مضيف بودكاست"
];

en.Reviews.rolesA = rolesA;
en.Reviews.rolesB = rolesB;
ar.Reviews.rolesA = rolesA_AR;
ar.Reviews.rolesB = rolesB_AR;

fs.writeFileSync(pathEN, JSON.stringify(en, null, 2));
fs.writeFileSync(pathAR, JSON.stringify(ar, null, 2));

console.log("Updated Review Roles JSON!");
