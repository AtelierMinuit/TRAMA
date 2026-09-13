const fs = require('fs');
let content = fs.readFileSync('src/screens/Editor/Editor.tsx', 'utf8');

// 1. Remove the old editor-header
content = content.replace(/<div className="editor-header">.*?<\/div>\s*\{\/\* Editor Body \*\/\}/s, '{/* Editor Body */}');

// 2. Inject the floating toolbar inside editor-body, after the canvas
const floatingToolbar = `
        {/* Floating Toolbar */}
        <div className="floating-toolbar">
          <IconButton icon="back" label="Deshacer" onClick={onUndo} disabled={past.length === 0} />
          <IconButton icon="forward" label="Rehacer" onClick={onRedo} disabled={future.length === 0} />
          <div className="toolbar-divider" />
          <IconButton icon="add" label="Conectar" onClick={onConnect} active={isConnecting} />
          <IconButton icon="grid" label="Organizar" onClick={onOrganize} />
          <div className="toolbar-divider" />
          <button className="primary-button" style={{ borderRadius: 20, padding: '8px 16px' }} onClick={onSave}>
            <Icon name="save" size={16} /> Guardar
          </button>
          <IconButton icon="more" label="Opciones" onClick={onSaveAs} />
        </div>
      </div>`;

content = content.replace(/<\/aside>\s*<\/div>\s*<\/div>\s*\);\s*\}/s, `</aside>${floatingToolbar}\n    </div>\n  );\n}`);

fs.writeFileSync('src/screens/Editor/Editor.tsx', content);
