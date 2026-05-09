const fs = require('fs');

const pathEN = 'messages/en.json';
const pathAR = 'messages/ar.json';

const en = JSON.parse(fs.readFileSync(pathEN, 'utf8'));
const ar = JSON.parse(fs.readFileSync(pathAR, 'utf8'));

if (!en.Reviews) en.Reviews = {};
if (!ar.Reviews) ar.Reviews = {};

const reviewsA = [
  "Migrated from another host and the difference is night and day. Absolutely incredible.",
  "The cloud servers are blazing fast. Perfect for our growing business needs.",
  "Simple setup and great performance. My blog loads instantly. Love it!",
  "We host 50+ client sites here. Never had any issues. Premium quality service.",
  "Incredible speed and reliability. Our campaigns run smoothly every time.",
  "Seamless integration with our workflow. Highly recommended to everyone!",
  "Enterprise-grade security and performance. Best investment we have made.",
  "Onboarding was smooth and the support team is exceptional. 10 out of 10.",
  "The uptime is stellar. Our SLA has never been breached since switching.",
  "Affordable pricing for the level of quality they deliver. Outstanding."
];

const reviewsB = [
  "API documentation is superb. Had my integration running in under an hour.",
  "Our Ramadan campaign handled record traffic without a single hiccup.",
  "Switched three businesses over. Every single one performs better now.",
  "My audience has grown 3x since my site started loading this fast.",
  "Server response times are consistently under 50ms. Phenomenal.",
  "The dashboard gives full visibility into everything. Great UX.",
  "Magnetic Commerce doubled my conversion rate. I can't believe the difference.",
  "Our brand identity is perfectly reflected across every channel. Superb.",
  "The analytics suite is powerful. Real-time insights changed how we operate.",
  "My media site handles thousands of concurrent listeners without breaking a sweat."
];

const reviewsA_AR = [
  "انتقلت من مضيف آخر والفرق هو الليل والنهار. مذهل تماما.",
  "السحابة سريعة للغاية. مثالي لاحتياجات أعمالنا المتنامية.",
  "إعداد بسيط وأداء رائع. مدونتي يتم تحميلها على الفور. أحببت ذلك!",
  "نحن نستضيف أكثر من 50 موقعا للعملاء هنا. لم نواجه أي مشاكل أبدا. خدمة عالية الجودة.",
  "سرعة وموثوقية مذهلة. حملاتنا تسير بسلاسة في كل مرة.",
  "تكامل سلس مع سير عملنا. نوصي به بشدة للجميع!",
  "أمان وأداء على مستوى المؤسسات. أفضل استثمار قمنا به.",
  "كان الانضمام سلسا وفريق الدعم استثنائي. 10 من 10.",
  "وقت التشغيل ممتاز. لم يتم خرق اتفاقية مستوى الخدمة الخاصة بنا أبدا منذ التبديل.",
  "أسعار معقولة لمستوى الجودة الذي يقدمونه. بارز."
];

const reviewsB_AR = [
  "توثيق واجهة برمجة التطبيقات رائع. تم تشغيل تكاملي في أقل من ساعة.",
  "تعاملت حملة رمضان الخاصة بنا مع حركة مرور قياسية دون أي خلل.",
  "قمت بتبديل ثلاثة شركات. كل واحدة منها تؤدي بشكل أفضل الآن.",
  "نما جمهورنا بمقدار 3 أضعاف منذ أن بدأ موقعي في التحميل بهذه السرعة.",
  "أوقات استجابة الخادم باستمرار أقل من 50 مللي ثانية. ظاهرة.",
  "لوحة القيادة تعطي رؤية كاملة لكل شيء. تجربة مستخدم رائعة.",
  "ضاعفت Magnetic Commerce معدل التحويل الخاص بي. لا أستطيع أن أصدق الفرق.",
  "تنعكس هوية علامتنا التجارية بشكل مثالي عبر كل قناة. رائع.",
  "مجموعة التحليلات قوية. غيرت الرؤى في الوقت الفعلي طريقة عملنا.",
  "موقع الوسائط الخاص بي يتعامل مع آلاف المستمعين المتزامنين دون أي عناء."
];

en.Reviews.rowA = reviewsA;
en.Reviews.rowB = reviewsB;
ar.Reviews.rowA = reviewsA_AR;
ar.Reviews.rowB = reviewsB_AR;

fs.writeFileSync(pathEN, JSON.stringify(en, null, 2));
fs.writeFileSync(pathAR, JSON.stringify(ar, null, 2));

console.log("Updated Reviews JSON!");
