const fs = require('fs');

const pathAR = 'messages/ar.json';
const ar = JSON.parse(fs.readFileSync(pathAR, 'utf8'));

if(!ar.Testimonials) ar.Testimonials = {};
ar.Testimonials.dev0 = "يبدو التعامل مع MagneticICT وكأنك تعمل مع مهندسين كبار يفهمون ضغط التسليم في جنوب آسيا. الجودة المعمارية والسرعة جعلت دورة إطلاقنا أكثر سلاسة بكثير.";
ar.Testimonials.dev1 = "جودة واجهة المستخدم متميزة حقًا. تمكنا من الانتقال من المتطلبات الأولية إلى إنتاج مصقول دون فقدان الاستجابة أو إمكانية الوصول.";
ar.Testimonials.dev2 = "أكثر ما أثار إعجابي هو الانضباط الهندسي. تم التعامل مع النشر وتكامل الدفع وعمليات الإدارة باحترافية عالية.";
ar.Testimonials.dev3 = "بالنسبة للفرق الإقليمية سريعة الحركة، الوضوح مهم. قدمت MagneticICT تفكيراً قوياً في المنتج وتنفيذاً موثوقاً.";
ar.Testimonials.dev4 = "تم التعامل مع الأمن والرؤية التشغيلية وأدوات الإدارة النظيفة كاهتمامات من الدرجة الأولى. وفر ذلك الكثير من الوقت.";

fs.writeFileSync(pathAR, JSON.stringify(ar, null, 2));

const pathEN = 'messages/en.json';
const en = JSON.parse(fs.readFileSync(pathEN, 'utf8'));

if(!en.Testimonials) en.Testimonials = {};
en.Testimonials.dev0 = "MagneticICT feels like working with senior engineers who understand delivery pressure in South Asia. The handoff quality, architecture, and speed all made our release cycle much smoother.";
en.Testimonials.dev1 = "The UI quality is genuinely premium. We were able to move from rough requirements to polished production flows without losing responsiveness, accessibility, or design consistency.";
en.Testimonials.dev2 = "What impressed me most was the engineering discipline. Deployment, payment integration, and admin operations were handled with the kind of structure I expect from experienced product teams.";
en.Testimonials.dev3 = "For fast-moving regional teams, clarity matters. MagneticICT delivered strong product thinking, reliable implementation, and a far better customer-facing experience than we had before.";
en.Testimonials.dev4 = "Security, operational visibility, and clean admin tooling were all treated as first-class concerns. That saved us real time and reduced a lot of manual support work after launch.";

fs.writeFileSync(pathEN, JSON.stringify(en, null, 2));
console.log("Written Testimonials");
