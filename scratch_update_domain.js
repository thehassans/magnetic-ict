const fs = require('fs');

let content = fs.readFileSync('src/components/domains/domain-search-client.tsx', 'utf8');

// Add import
content = content.replace(
  'import { useRouter } from "@/i18n/navigation";',
  'import { useRouter } from "@/i18n/navigation";\nimport { useTranslations } from "next-intl";'
);

// Add t hook
content = content.replace(
  'const router = useRouter();',
  'const t = useTranslations("Domains");\n  const router = useRouter();'
);

// Replace strings
content = content.replace('Domain Registration', '{t("heroEyebrow")}');
content = content.replace('Find your perfect', '{t("heroTitle")}');
content = content.replace('domain name', ''); // Handled by Title in the JSX, wait I'll replace carefully.

fs.writeFileSync('scratch_update_domain.js', content);
