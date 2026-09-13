const fs = require('fs');

let css = fs.readFileSync('src/App.css', 'utf8');

const additionalCSS = `
.editor-header, .editor-toolbar {
  display: none !important;
}

.floating-header {
  position: absolute;
  top: 24px;
  left: 320px; /* Right of the sidebar */
  height: 48px;
  background: color-mix(in srgb, var(--content-bg) 70%, transparent);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid color-mix(in srgb, var(--border-color) 50%, transparent);
  border-radius: 24px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
  z-index: 20;
  display: flex;
  align-items: center;
  padding: 0 16px 0 8px;
  gap: 12px;
}

.floating-header .editor-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.floating-header .brand-wordmark {
  background: none;
  border: none;
  font: 800 14px var(--font-sans);
  color: var(--text-primary);
  cursor: pointer;
}

.floating-header input {
  background: transparent;
  border: none;
  font: 600 14px var(--font-sans);
  color: var(--text-primary);
  outline: none;
  min-width: 200px;
}

.floating-header .save-state {
  font-size: 11px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 6px;
}
`;

fs.writeFileSync('src/App.css', css + additionalCSS);
