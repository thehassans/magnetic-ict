const fs = require('fs');
let content = fs.readFileSync('src/components/admin/admin-settings-client.tsx', 'utf8');

// 1. Add import
content = content.replace(
  'import { TrustedPartnersEditor } from "@/components/admin/trusted-partners-editor";',
  'import { TrustedPartnersEditor } from "@/components/admin/trusted-partners-editor";\nimport { DomainTldEditor } from "@/components/admin/domain-tld-editor";'
);

// 2. Remove comPrice, netPrice, orgPrice, ioPrice, defaultPrice inputs
content = content.replace(/<Input label="\.com yearly price"[\s\S]*?<Input label="Fallback yearly price".*?\/>/g, "");

// 3. Add DomainTldEditor below defaultNameservers
content = content.replace(
  /<\/textarea>\s*<\/label>/,
  '</textarea>\n          </label>\n          <DomainTldEditor tlds={domainState.tlds || []} onChange={(tlds) => setDomainState(current => ({ ...current, tlds }))} />'
);

fs.writeFileSync('src/components/admin/admin-settings-client.tsx', content);
