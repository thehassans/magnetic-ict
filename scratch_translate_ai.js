const fs = require('fs');

const pathEN = 'messages/en.json';
const pathAR = 'messages/ar.json';

const en = JSON.parse(fs.readFileSync(pathEN, 'utf8'));
const ar = JSON.parse(fs.readFileSync(pathAR, 'utf8'));

if (!en.ServicesDetail) en.ServicesDetail = {};
en.ServicesDetail.aiDetectionDescription = "Upload any image or video — our forensic engine analyzes authenticity signals and gives you a clear verdict.";

if (!ar.ServicesDetail) ar.ServicesDetail = {};
ar.ServicesDetail.aiDetectionDescription = "قم بتحميل أي صورة أو مقطع فيديو - يقوم محركنا الجنائي بتحليل إشارات الأصالة ويعطيك حكماً واضحاً.";

fs.writeFileSync(pathEN, JSON.stringify(en, null, 2));
fs.writeFileSync(pathAR, JSON.stringify(ar, null, 2));

console.log("AI Detection Description Updated!");
