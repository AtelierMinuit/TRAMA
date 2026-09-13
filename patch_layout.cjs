const fs = require('fs');

let css = fs.readFileSync('src/App.css', 'utf8');

const modernOverrides = `
/* =========================================
   TRAMA 2.0 MODERN UX OVERRIDES 
   ========================================= */
.editor-layout {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--window-bg);
}

.editor-header {
  display: none; /* Hide the old static header */
}

/* Canvas takes full screen */
.editor-body {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.canvas-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Floating Panels (Glassmorphism) */
.systems-panel, .inspector-panel {
  position: absolute;
  top: 24px;
  bottom: 24px;
  width: 280px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--sidebar-bg) 85%, transparent);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid color-mix(in srgb, var(--border-color) 50%, transparent);
  box-shadow: 0 12px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
  z-index: 10;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.systems-panel {
  left: 24px;
}

.inspector-panel {
  right: 24px;
}

/* Floating Toolbar */
.floating-toolbar {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  height: 56px;
  background: color-mix(in srgb, var(--content-bg) 90%, transparent);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid color-mix(in srgb, var(--border-color) 50%, transparent);
  border-radius: 28px;
  box-shadow: 0 16px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
  z-index: 20;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
}

.floating-toolbar .toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  margin: 0 8px;
}

/* Buttons in Floating Toolbar */
.floating-toolbar .icon-button {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  color: var(--text-primary);
}
.floating-toolbar .icon-button:hover {
  background: var(--accent-light);
  color: var(--accent-color);
  transform: scale(1.05);
}
.floating-toolbar .icon-button:active {
  transform: scale(0.95);
}

.lucide-icon {
  transition: all 0.2s ease;
}

/* Modern Dashboard */
.dashboard-header {
  border-bottom: none;
  background: transparent;
  padding: 32px 48px 16px;
}
.dashboard-content {
  padding: 16px 48px;
}
.recent-card {
  border-radius: 16px;
  background: color-mix(in srgb, var(--content-bg) 50%, transparent);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
}
.recent-card:hover {
  box-shadow: 0 12px 24px rgba(0,0,0,0.06);
  transform: translateY(-4px);
}
`;

fs.writeFileSync('src/App.css', css + modernOverrides);
