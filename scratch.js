const fs = require('fs');

let content = fs.readFileSync('src/components/ui/simple-animated-testimonials.tsx', 'utf8');

// Replace standard isDark ? "..." : "..." ternaries inside cn()
content = content.replace(/cn\(([^,]+),\s*isDark\s*\?\s*"([^"]+)"\s*:\s*"([^"]*)"\)/g, (match, prefix, dark, light) => {
    let darkClasses = dark.split(' ').map(c => 'dark:' + c).join(' ');
    let lightClasses = light.trim();
    let combined = lightClasses ? (lightClasses + ' ' + darkClasses) : darkClasses;
    return `cn(${prefix}, "${combined}")`;
});

// Replace the multiline ternary at line 128
content = content.replace(/isDark\s*\n\s*\?\s*"([^"]+)"\s*\n\s*:\s*"([^"]+)",/g, (match, dark, light) => {
    let darkClasses = dark.split(' ').map(c => 'dark:' + c).join(' ');
    let lightClasses = light.trim();
    let combined = lightClasses ? (lightClasses + ' ' + darkClasses) : darkClasses;
    return `"${combined}",`;
});

// Remove `const isDark = theme === "dark";`
content = content.replace(/const isDark = theme === "dark";\n\s*/, '');

fs.writeFileSync('src/components/ui/simple-animated-testimonials.tsx', content);
