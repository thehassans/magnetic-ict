const fs = require('fs');
let content = fs.readFileSync('src/lib/platform-settings.ts', 'utf8');
const tlds = require('./scratch_tlds.json');

content = content.replace(
  /comPrice: 14\.99,\s*netPrice: 16\.99,\s*orgPrice: 15\.99,\s*ioPrice: 49\.99,\s*defaultPrice: 19\.99/g,
  "tlds: " + JSON.stringify(tlds, null, 4)
);

content = content.replace(
  /comPrice: Number\(value\.comPrice\) \|\| defaultDomainProviderConfig\.comPrice,\s*netPrice: Number\(value\.netPrice\) \|\| defaultDomainProviderConfig\.netPrice,\s*orgPrice: Number\(value\.orgPrice\) \|\| defaultDomainProviderConfig\.orgPrice,\s*ioPrice: Number\(value\.ioPrice\) \|\| defaultDomainProviderConfig\.ioPrice,\s*defaultPrice: Number\(value\.defaultPrice\) \|\| defaultDomainProviderConfig\.defaultPrice/g,
  "tlds: Array.isArray(value.tlds) ? value.tlds : defaultDomainProviderConfig.tlds"
);

fs.writeFileSync('src/lib/platform-settings.ts', content);
