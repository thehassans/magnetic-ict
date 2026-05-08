import re

with open('src/components/ui/simple-animated-testimonials.tsx', 'r') as f:
    content = f.read()

# isDark ? "text-white" : "text-slate-950" -> text-slate-950 dark:text-white
def replacer(match):
    prefix = match.group(1)
    dark_classes = match.group(2)
    light_classes = match.group(3)
    
    # Combine them
    if not light_classes.strip():
        combined = ' '.join([f'dark:{c}' for c in dark_classes.split()])
    else:
        combined = light_classes + ' ' + ' '.join([f'dark:{c}' for c in dark_classes.split()])
    
    return f'{prefix}"{combined}"'

# We're looking for patterns like: cn(..., isDark ? "dark-class" : "light-class")
# or just isDark ? "..." : "..."
pattern = r'(cn\([^,]+,\s*)isDark\s*\?\s*"([^"]+)"\s*:\s*"([^"]*)"\)'
content = re.sub(pattern, replacer, content)

# Also handle bare ternary: isDark ? "a" : "b"
def bare_replacer(match):
    dark_classes = match.group(1)
    light_classes = match.group(2)
    if not light_classes.strip():
        combined = ' '.join([f'dark:{c}' for c in dark_classes.split()])
    else:
        combined = light_classes + ' ' + ' '.join([f'dark:{c}' for c in dark_classes.split()])
    return f'"{combined}"'

pattern2 = r'isDark\s*\?\s*"([^"]+)"\s*:\s*"([^"]*)"'
content = re.sub(pattern2, bare_replacer, content)

with open('src/components/ui/simple-animated-testimonials.tsx', 'w') as f:
    f.write(content)
