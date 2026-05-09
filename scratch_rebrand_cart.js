const fs = require('fs');

const pathEN = 'messages/en.json';
const pathAR = 'messages/ar.json';

const en = JSON.parse(fs.readFileSync(pathEN, 'utf8'));
const ar = JSON.parse(fs.readFileSync(pathAR, 'utf8'));

// Rebranding Services -> Tools in EN
const rebrandEN = (obj) => {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].replace(/Services/g, 'Tools').replace(/services/g, 'tools').replace(/Service/g, 'Tool').replace(/service/g, 'tool');
    } else if (typeof obj[key] === 'object') {
      rebrandEN(obj[key]);
    }
  }
};

// Rebranding Services -> Tools in AR
// خدمات -> أدوات
// الخدمة -> الأداة
// خدمة -> أداة
const rebrandAR = (obj) => {
  for (let key in obj) {
    if (typeof obj[key] === 'string') {
      obj[key] = obj[key].replace(/خدمات/g, 'أدوات').replace(/خدمة/g, 'أداة').replace(/الخدمات/g, 'الأدوات').replace(/الخدمة/g, 'الأداة');
    } else if (typeof obj[key] === 'object') {
      rebrandAR(obj[key]);
    }
  }
};

rebrandEN(en);
rebrandAR(ar);

// Add missing translations for Cart Page
if (!en.Cart) en.Cart = {};
en.Cart.emptyTitle = "Your cart is empty";
en.Cart.emptyDescription = "Start with Magnetic VPS Hosting to experience the premium hosting, cart, and checkout flow.";
en.Cart.browseHosting = "Browse hosting plans";
en.Cart.browseTools = "Browse all tools";
en.Cart.shoppingCart = "Shopping cart";
en.Cart.cartDescription = "Review your selected tools, compare configuration details, and continue into the premium checkout flow.";
en.Cart.sslSecure = "SSL secure";
en.Cart.instantAccess = "Instant access";
en.Cart.protectedDelivery = "Protected delivery";

if (!ar.Cart) ar.Cart = {};
ar.Cart.emptyTitle = "سلة التسوق الخاصة بك فارغة";
ar.Cart.emptyDescription = "ابدأ بـ Magnetic VPS Hosting لتجربة الاستضافة المميزة وسلة التسوق وعملية الدفع.";
ar.Cart.browseHosting = "تصفح خطط الاستضافة";
ar.Cart.browseTools = "تصفح جميع الأدوات";
ar.Cart.shoppingCart = "سلة التسوق";
ar.Cart.cartDescription = "راجع الأدوات المختارة، وقارن تفاصيل التكوين، وتابع إلى عملية الدفع المميزة.";
ar.Cart.sslSecure = "SSL آمن";
ar.Cart.instantAccess = "وصول فوري";
ar.Cart.protectedDelivery = "تسليم محمي";

fs.writeFileSync(pathEN, JSON.stringify(en, null, 2));
fs.writeFileSync(pathAR, JSON.stringify(ar, null, 2));

console.log("Global Rebrand and Cart Translations Updated!");
