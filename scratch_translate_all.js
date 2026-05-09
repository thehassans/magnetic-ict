const fs = require('fs');
const path = require('path');

const locales = ['bn', 'de', 'es', 'fr', 'tr'];
const baseDir = 'messages';

const en = JSON.parse(fs.readFileSync(path.join(baseDir, 'en.json'), 'utf8'));

const translations = {
  bn: {
    services: "সরঞ্জাম", // Tools
    magneticServices: "Magnetic সরঞ্জাম",
    allServices: "সমস্ত সরঞ্জাম",
    servicesMenuEyebrow: "সরঞ্জাম ক্যাটালগ",
    servicesMenuTitle: "Magnetic ডিজিটাল অবকাঠামো এবং বৃদ্ধি সরঞ্জাম",
    servicesEyebrow: "সরঞ্জাম মহাবিশ্ব",
    servicesTitle: "নির্বাচিত অবকাঠামো, নিরাপত্তা এবং বৃদ্ধি সরঞ্জাম।",
    lovedByDevelopers: "ডেভেলপারদের পছন্দের",
    viewAllReviews: "সব ৫,২১৮টি রিভিউ দেখুন",
    shoppingCart: "শপিং কার্ট",
    emptyTitle: "আপনার কার্ট খালি"
  },
  de: {
    services: "Tools",
    magneticServices: "Magnetic Tools",
    allServices: "Alle Tools",
    servicesMenuEyebrow: "Tool-Katalog",
    servicesMenuTitle: "Magnetic digitale Infrastruktur & Wachstums-Tools",
    servicesEyebrow: "Tool-Universum",
    servicesTitle: "Kuratierte Infrastruktur-, Sicherheits- und Wachstums-Tools.",
    lovedByDevelopers: "Beliebt bei Entwicklern",
    viewAllReviews: "Alle 5.218 Bewertungen ansehen",
    shoppingCart: "Warenkorb",
    emptyTitle: "Ihr Warenkorb ist leer"
  },
  es: {
    services: "Herramientas",
    magneticServices: "Herramientas de Magnetic",
    allServices: "Todas las herramientas",
    servicesMenuEyebrow: "Catálogo de herramientas",
    servicesMenuTitle: "Infraestructura digital y herramientas de crecimiento de Magnetic",
    servicesEyebrow: "Universo de herramientas",
    servicesTitle: "Herramientas seleccionadas de infraestructura, seguridad y crecimiento.",
    lovedByDevelopers: "Amado por los desarrolladores",
    viewAllReviews: "Ver las 5.218 reseñas",
    shoppingCart: "Carrito de compras",
    emptyTitle: "Tu carrito está vacío"
  },
  fr: {
    services: "Outils",
    magneticServices: "Outils Magnetic",
    allServices: "Tous les outils",
    servicesMenuEyebrow: "Catalogue d'outils",
    servicesMenuTitle: "Infrastructure numérique et outils de croissance Magnetic",
    servicesEyebrow: "Univers d'outils",
    servicesTitle: "Outils d'infrastructure, de sécurité et de croissance sélectionnés.",
    lovedByDevelopers: "Aimé par les développeurs",
    viewAllReviews: "Voir les 5 218 avis",
    shoppingCart: "Panier",
    emptyTitle: "Votre panier est vide"
  },
  tr: {
    services: "Araçlar",
    magneticServices: "Magnetic Araçları",
    allServices: "Tüm araçlar",
    servicesMenuEyebrow: "Araç kataloğu",
    servicesMenuTitle: "Magnetic dijital altyapı ve büyüme araçları",
    servicesEyebrow: "Araç evreni",
    servicesTitle: "Özenle seçilmiş altyapı, güvenlik ve büyüme araçları.",
    lovedByDevelopers: "Geliştiriciler tarafından sevildi",
    viewAllReviews: "Tüm 5.218 incelemeyi görüntüle",
    shoppingCart: "Alışveriş sepeti",
    emptyTitle: "Sepetiniz boş"
  }
};

locales.forEach(locale => {
  const filePath = path.join(baseDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const t = translations[locale];

  // Global Rebrand (Best effort replacement of "Service" -> "Tool" equivalents)
  const rebrand = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // We only do this if it's not a key we've already handled or if it's generic
        // For simplicity, we apply the English rebrand then override specific keys
        obj[key] = obj[key].replace(/Services/g, 'Tools').replace(/services/g, 'tools').replace(/Service/g, 'Tool').replace(/service/g, 'tool');
      } else if (typeof obj[key] === 'object') {
        rebrand(obj[key]);
      }
    }
  };
  rebrand(data);

  // Sync structure with EN (add all new keys from EN)
  const sync = (source, target) => {
    for (let key in source) {
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (!target[key]) target[key] = {};
        sync(source[key], target[key]);
      } else if (target[key] === undefined) {
        target[key] = source[key];
      }
    }
  };
  sync(en, data);

  // Apply specific translations
  if (data.Navigation) {
    data.Navigation.services = t.services;
    data.Navigation.magneticServices = t.magneticServices;
    data.Navigation.allServices = t.allServices;
    data.Navigation.servicesMenuEyebrow = t.servicesMenuEyebrow;
    data.Navigation.servicesMenuTitle = t.servicesMenuTitle;
  }
  if (data.Pages) {
    data.Pages.servicesEyebrow = t.servicesEyebrow;
    data.Pages.servicesTitle = t.servicesTitle;
  }
  if (data.Landing) {
    data.Landing.lovedByDevelopers = t.lovedByDevelopers;
    data.Landing.viewAllReviews = t.viewAllReviews;
  }
  if (data.Cart) {
    data.Cart.shoppingCart = t.shoppingCart;
    data.Cart.emptyTitle = t.emptyTitle;
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
});

console.log("Updated all other languages!");
