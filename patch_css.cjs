const fs = require('fs');

let css = fs.readFileSync('src/App_old.css', 'utf8');

// Replace the entire :root block
const newRoot = `:root {
  --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
  --font-serif: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif; /* No serif for macOS */
  
  --surface: #f5f5f7;
  --surface-strong: #ffffff;
  --ink: #1d1d1f;
  --muted: #86868b;
  --line: #e5e5ea;
  
  --accent: #007aff;
  --accent-strong: #006ae6;
  --accent-soft: #e6f2ff;
  
  --warm: #ff9500;
  --danger: #ff3b30;
  
  --category-health: #34c759;
  --category-edu: #5856d6;
  --category-work: #ff9500;
  
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
}`;

css = css.replace(/:root\s*\{[^}]+\}/, newRoot);

// Replace .theme-dark block
const newDark = `.theme-dark {
  --surface: #282828;
  --surface-strong: #1e1e1e;
  --ink: #f5f5f7;
  --muted: #98989d;
  --line: #38383a;
  
  --accent: #0a84ff;
  --accent-strong: #409cff;
  --accent-soft: rgba(10, 132, 255, 0.15);
}`;

css = css.replace(/\.theme-dark\s*\{[^}]+\}/, newDark);

// Add truncation fixes
css += `
/* macOS Aesthetics & Fixes */
button { font-family: var(--font-sans); }
.recent-row { min-width: 0; overflow: hidden; }
.recent-copy strong { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.recent-copy small { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.editor-header h1 { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px; font-weight: 500; }
.system-item span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.brand strong { font-weight: 600; letter-spacing: -0.01em; }
`;

fs.writeFileSync('src/App.css', css);
