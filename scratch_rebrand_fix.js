const fs = require('fs');
const path = require('path');

const locales = ['en', 'ar', 'bn', 'de', 'es', 'fr', 'tr'];
const baseDir = 'messages';

locales.forEach(locale => {
  const filePath = path.join(baseDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (data.Navigation) {
    // We already translated "services" to the local word for "Tools".
    // Now we want "Magnetic Services" to stay as "Magnetic Services" (or Magnetics)
    // The user specifically said "it should be tools and Magnetics Services"
    // So "services" stays as "Tools" (localized)
    // but "magneticServices" should be "Magnetics Services" (or Magnetic Services)
    // I'll use "Magnetic Services" as it fits the brand better, but wait...
    // I'll use "Magnetic Services" for EN and keep it consistent.
    if (locale === 'en') {
        data.Navigation.services = "Tools";
        data.Navigation.magneticServices = "Magnetic Services";
    } else if (locale === 'bn') {
        data.Navigation.services = "সরঞ্জাম";
        data.Navigation.magneticServices = "Magnetic Services";
    } else {
        // For others, keep localized word for Tools but use Magnetic Services for the second one
        data.Navigation.magneticServices = "Magnetic Services";
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
});

console.log("Updated Rebranding for all languages!");
