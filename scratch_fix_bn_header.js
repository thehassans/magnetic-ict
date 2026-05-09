const fs = require('fs');

const pathBN = 'messages/bn.json';
const bn = JSON.parse(fs.readFileSync(pathBN, 'utf8'));

// Fix Navigation translations
if (bn.Navigation) {
  bn.Navigation.magneticServices = "ম্যাগনেটিক পরিষেবা"; // Magnetics Services
  bn.Navigation.support = "সহায়তা"; // Support
  bn.Navigation.domainCart = "ডোমেইন কার্ট";
  bn.Navigation.customerStories = "গ্রাহক গল্প";
  bn.Navigation.trustedEcosystem = "বিশ্বস্ত ইকোসিস্টেম";
}

// Fix Footer translations (ensure they are all Bengali)
if (bn.Footer) {
  bn.Footer.platform = "প্ল্যাটফর্ম";
  bn.Footer.company = "কোম্পানি";
  bn.Footer.support = "সহায়তা";
  bn.Footer.dashboard = "ড্যাশবোর্ড";
}

fs.writeFileSync(pathBN, JSON.stringify(bn, null, 2));
console.log("Bengali Header/Footer Fixed!");
