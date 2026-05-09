const fs = require('fs');
const path = require('path');

const newKeys = {
  "Domains": {
    "heroEyebrow": "Domain Registration",
    "heroTitle": "Find your perfect domain name",
    "heroDescription": "Search across hundreds of extensions. Instant availability checking powered by {providerLabel}.",
    "searchPlaceholder": "yourname.com or just yourname",
    "searchButton": "Search",
    "searchingButton": "Searching...",
    "statusAvailable": "Available",
    "statusTaken": "Taken",
    "statusUnknown": "Unknown",
    "featurePrivacyTitle": "WHOIS Privacy",
    "featurePrivacyDesc": "Keep personal info protected",
    "featureSslTitle": "SSL Ready",
    "featureSslDesc": "Free SSL with every domain",
    "featureDnsTitle": "Instant DNS",
    "featureDnsDesc": "Propagates in minutes"
  }
};

const messagesDir = path.join(__dirname, 'messages');
const locales = ['en', 'fr', 'ar', 'de', 'es', 'tr', 'bn'];

locales.forEach(locale => {
  const filePath = path.join(messagesDir, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Deep merge newKeys into data
    if (!data.Domains) data.Domains = {};
    for (const [key, value] of Object.entries(newKeys.Domains)) {
      if (!data.Domains[key]) {
        data.Domains[key] = value;
      }
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${locale}.json`);
  }
});
