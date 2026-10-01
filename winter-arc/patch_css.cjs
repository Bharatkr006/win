const fs = require('fs');
const css = `@import 'tailwindcss';

@theme {
  --color-green-deep: #194029;
  --color-green-mid: #2e8548;
  --color-green-pale: #edF5ef;
  --color-green-gray: #7d9385;
  --color-border-soft: #e3ebe6;

  --color-heat-empty: #e3ebe6;
  --color-heat-1: #c9e0d1;
  --color-heat-2: #80b996;
  --color-heat-3: #4da06a;
  --color-heat-4: #2e8548;
  --color-heat-5: #194029;

  --color-surface: #ffffff;
  --color-background: #F7FAF8;
  --color-text: #1a221d;
  --color-text-muted: #7d9385;
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
}

body {
  font-family: var(--font-sans);
  background-color: var(--color-background);
  color: var(--color-text);
  background-image: 
    radial-gradient(circle at top right, rgba(46, 133, 72, 0.08) 0%, transparent 60%),
    radial-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px);
  background-size: 100% 100%, 20px 20px;
}
`;
fs.writeFileSync('src/index.css', css);
