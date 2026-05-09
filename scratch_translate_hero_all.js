const fs = require('fs');
const path = require('path');

const locales = ['de', 'es', 'fr', 'tr'];
const baseDir = 'messages';

const translations = {
  de: {
    Landing: {
      globalServiceNetwork: "Globales Magnetic ICT Tool-Netzwerk",
      globalDigitalServices: "Globale digitale Tools",
      description: "Moderne digitale Tools für Wachstum, Vertrauen und Geschwindigkeit.",
      domainSearch: "Domain-Suche",
      checkDomainInstantly: "Prüfen Sie Ihre Domain sofort",
      domainSearchDescription: "Suchen Sie direkt auf der Startseite nach der Verfügbarkeit von Domains und fahren Sie mit dem vollständigen Checkout-Flow fort.",
      searchDomainButton: "Domain suchen",
      liveServices: "Live-Tools",
      prioritySupport: "Prioritärer Support",
      opsUptimeTarget: "Ops-Uptime-Ziel",
      lovedByDevelopers: "Beliebt bei Entwicklern",
      lovedByDevelopersDesc: "Echtes Feedback von Entwicklern und Betreibern in ganz Südasien.",
      viewAllReviews: "Alle 5.218 Bewertungen ansehen"
    }
  },
  es: {
    Landing: {
      globalServiceNetwork: "Red global de herramientas de Magnetic ICT",
      globalDigitalServices: "Herramientas digitales globales",
      description: "Herramientas digitales modernas diseñadas para el crecimiento, la confianza y la velocidad.",
      domainSearch: "Búsqueda de dominios",
      checkDomainInstantly: "Compruebe su dominio al instante",
      domainSearchDescription: "Busque la disponibilidad del dominio directamente desde la página de inicio y continúe con el flujo de pago completo.",
      searchDomainButton: "Buscar dominio",
      liveServices: "Herramientas en vivo",
      prioritySupport: "Soporte prioritario",
      opsUptimeTarget: "Objetivo de tiempo de actividad",
      lovedByDevelopers: "Amado por los desarrolladores",
      lovedByDevelopersDesc: "Comentarios reales de desarrolladores y operadores de todo el sur de Asia.",
      viewAllReviews: "Ver las 5.218 reseñas"
    }
  },
  fr: {
    Landing: {
      globalServiceNetwork: "Réseau mondial d'outils Magnetic ICT",
      globalDigitalServices: "Outils numériques mondiaux",
      description: "Des outils numériques modernes conçus pour la croissance, la confiance et la vitesse.",
      domainSearch: "Recherche de domaine",
      checkDomainInstantly: "Vérifiez votre domaine instantanément",
      domainSearchDescription: "Recherchez la disponibilité du domaine directement depuis la page d'accueil et poursuivez le flux de paiement complet.",
      searchDomainButton: "Rechercher un domaine",
      liveServices: "Outils en direct",
      prioritySupport: "Support prioritaire",
      opsUptimeTarget: "Objectif de disponibilité",
      lovedByDevelopers: "Aimé par les développeurs",
      lovedByDevelopersDesc: "Retours réels de développeurs et d'opérateurs de toute l'Asie du Sud.",
      viewAllReviews: "Voir les 5 218 avis"
    }
  },
  tr: {
    Landing: {
      globalServiceNetwork: "Magnetic ICT küresel araç ağı",
      globalDigitalServices: "Küresel Dijital Araçlar",
      description: "Büyüme, güven ve hız için tasarlanmış modern dijital araçlar.",
      domainSearch: "Alan adı arama",
      checkDomainInstantly: "Alan adınızı anında kontrol edin",
      domainSearchDescription: "Alan adı uygunluğunu doğrudan ana sayfadan arayın ve tam ödeme akışına devam edin.",
      searchDomainButton: "Alan adı ara",
      liveServices: "Canlı araçlar",
      prioritySupport: "Öncelikli destek",
      opsUptimeTarget: "Operasyon çalışma süresi hedefi",
      lovedByDevelopers: "Geliştiriciler tarafından sevildi",
      lovedByDevelopersDesc: "Güney Asya genelindeki geliştiricilerden ve operatörlerden gerçek geri bildirimler.",
      viewAllReviews: "Tüm 5.218 incelemeyi görüntüle"
    }
  }
};

locales.forEach(locale => {
  const filePath = path.join(baseDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const t = translations[locale];

  if (!data.Landing) data.Landing = {};
  Object.assign(data.Landing, t.Landing);

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
});

console.log("Updated Hero Translations for all remaining languages!");
