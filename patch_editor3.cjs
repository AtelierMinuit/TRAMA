const fs = require('fs');

let content = fs.readFileSync('src/screens/Editor/Editor.tsx', 'utf8');

// 1. Remove editor-header and editor-toolbar completely
content = content.replace(/<header className="editor-header">.*?<\/header>/s, '');
content = content.replace(/<div className="editor-toolbar">.*?<\/div>\s*\{\/\* Editor Body \*\/\}/s, '{/* Editor Body */}');

// 2. Inject floating-header and floating-toolbar inside editor-body, after the canvas
const floatingElements = `
        {/* Floating Header (Title & Status) */}
        <div className="floating-header">
          <div className="editor-brand">
            <div className="brand-mark small"><Icon name="trama" size={20} /></div>
            <button className="brand-wordmark" onClick={onClose}>TRAMA</button>
          </div>
          <div className="toolbar-divider" style={{ height: 16 }} />
          <input
            id="doc-title-input"
            value={document.title}
            onChange={(e) => onUpdateTitle(e.currentTarget.value)}
            aria-label="Nombre del documento"
          />
          <span className="save-state">
            <span className={\`save-dot \${saveState}\`} />
            {statusLabel(language, saveState)}
          </span>
          <div className="toolbar-divider" style={{ height: 16 }} />
          <IconButton icon="download" label="Exportar" onClick={() => setModal("export")} />
        </div>

        {/* Floating Toolbar (Tools) */}
        <div className="floating-toolbar">
          <button className="toolbar-button primary-connect" onClick={onConnect} disabled={document.systems.length === 0} style={{ borderRadius: 20, padding: '6px 12px' }}>
            <Icon name="link" size={16} /> {t(language, "connect")}
          </button>
          <div className="toolbar-divider" />
          <IconButton icon="back" label="Deshacer" onClick={onUndo} disabled={past.length === 0} />
          <IconButton icon="forward" label="Rehacer" onClick={onRedo} disabled={future.length === 0} />
          <div className="toolbar-divider" />
          <IconButton icon="grid" label="Organizar" onClick={onOrganize} />
          <IconButton icon="history" label="Historial" onClick={onSnapshots} />
          <div className="toolbar-divider" />
          <button className="toolbar-button" onClick={onSave} style={{ borderRadius: 20, padding: '6px 12px', background: 'var(--accent-soft)', color: 'var(--accent-strong)' }}>
            <Icon name="save" size={16} /> Guardar
          </button>
          <IconButton icon="more" label="Opciones" onClick={onSaveAs} />
        </div>
`;

content = content.replace(/<\/aside>\s*<\/div>\s*<\/div>\s*\);\s*\}/s, `</aside>\n${floatingElements}\n      </div>\n    </div>\n  );\n}`);

fs.writeFileSync('src/screens/Editor/Editor.tsx', content);
