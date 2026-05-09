const fs = require('fs');

const pathEN = 'messages/en.json';
const pathAR = 'messages/ar.json';

const en = JSON.parse(fs.readFileSync(pathEN, 'utf8'));
const ar = JSON.parse(fs.readFileSync(pathAR, 'utf8'));

if (!en.Landing) en.Landing = {};
en.Landing.verifiedDeveloper = "Verified Developer";

if (!ar.Landing) ar.Landing = {};
ar.Landing.verifiedDeveloper = "مطور تم التحقق منه";

if (!en.ServicesDetail) en.ServicesDetail = {};
en.ServicesDetail.freeDownloader = "Free downloader";
en.ServicesDetail.downloaderDescription = "Paste any YouTube, Instagram, or Facebook link — we detect the platform instantly and let you pick your quality.";
en.ServicesDetail.freeForensicScan = "Free forensic scan";
en.ServicesDetail.forensicScanDescription = "Scan any URL for suspicious redirects, malware signals, and security risks before you visit.";

if (!ar.ServicesDetail) ar.ServicesDetail = {};
ar.ServicesDetail.freeDownloader = "أداة تنزيل مجانية";
ar.ServicesDetail.downloaderDescription = "الصق أي رابط YouTube أو Instagram أو Facebook - نكتشف المنصة على الفور ونتيح لك اختيار الجودة.";
ar.ServicesDetail.freeForensicScan = "فحص جنائي مجاني";
ar.ServicesDetail.forensicScanDescription = "افحص أي عنوان URL بحثاً عن عمليات إعادة التوجيه المشبوهة وإشارات البرامج الضارة والمخاطر الأمنية قبل الزيارة.";

fs.writeFileSync(pathEN, JSON.stringify(en, null, 2));
fs.writeFileSync(pathAR, JSON.stringify(ar, null, 2));

console.log("Final UI Translations Updated!");
