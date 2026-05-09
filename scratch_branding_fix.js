const fs = require('fs');
const path = require('path');

const locales = ['en', 'ar', 'bn', 'de', 'es', 'fr', 'tr'];
const baseDir = 'messages';

locales.forEach(locale => {
  const filePath = path.join(baseDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (data.Navigation) {
    data.Navigation.magneticServices = "Magnetics Services";
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
});

console.log("Updated Magnetics Services branding!");
