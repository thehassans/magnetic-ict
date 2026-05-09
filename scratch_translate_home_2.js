const fs = require('fs');

const pathEN = 'messages/en.json';
const pathAR = 'messages/ar.json';

const en = JSON.parse(fs.readFileSync(pathEN, 'utf8'));
const ar = JSON.parse(fs.readFileSync(pathAR, 'utf8'));

// Update Landing in EN
if (!en.Landing) en.Landing = {};
en.Landing.globalServiceNetwork = "Magnetic ICT global tool network";
en.Landing.globalDigitalServices = "Global Digital Tools";
en.Landing.liveServices = "Live tools";
en.Landing.prioritySupport = "Priority support";
en.Landing.opsUptimeTarget = "Ops uptime target";
en.Landing.domainSearch = "Domain search";
en.Landing.checkDomainInstantly = "Check your domain instantly";
en.Landing.domainSearchDescription = "Search domain availability directly from the homepage and continue into the full checkout flow.";
en.Landing.searchDomainButton = "Search domain";

// Update Landing in AR
if (!ar.Landing) ar.Landing = {};
ar.Landing.globalServiceNetwork = "شبكة أدوات Magnetic ICT العالمية";
ar.Landing.globalDigitalServices = "الأدوات الرقمية العالمية";
ar.Landing.liveServices = "الأدوات المباشرة";
ar.Landing.prioritySupport = "دعم الأولوية";
ar.Landing.opsUptimeTarget = "هدف وقت تشغيل العمليات";
ar.Landing.domainSearch = "البحث عن النطاق";
ar.Landing.checkDomainInstantly = "تحقق من نطاقك فوراً";
ar.Landing.domainSearchDescription = "ابحث عن توفر النطاق مباشرة من الصفحة الرئيسية وتابع إلى عملية الدفع الكاملة.";
ar.Landing.searchDomainButton = "البحث عن النطاق";

fs.writeFileSync(pathEN, JSON.stringify(en, null, 2));
fs.writeFileSync(pathAR, JSON.stringify(ar, null, 2));

console.log("Landing and Hero Translations Updated!");
