import React, {
  type ReactNode,
  useMemo,
  useState,
  type MutableRefObject,
} from "react";
import { SchematexDiagram } from "schematex/react";
import type { ViewportController } from "schematex/interactive";
import { toSchemaTexDsl, renderSchemaTex } from "../../adapters/schematex";
import { useDocumentContext } from "../../context/DocumentContext";
import { CommandPalette } from "../../components/CommandPalette";
import { ContextMenu, type ContextMenuState } from "../../components/ContextMenu";
import { ClinicalReportModal } from "../../modals/ClinicalReportModal";
import { DocumentHeader } from "../../components/DocumentHeader";
import { EditorToolbar } from "../../components/EditorToolbar";
import { BottomNotesDrawer } from "../../components/BottomNotesDrawer";
import { InspectorPanel } from "../../components/InspectorPanel";
import { Icon } from "../../components/Icon";
import type { Language } from "../../i18n";
import { t } from "../../i18n";
import type { SystemNode, Connection, Category } from "../../domain/model";

export function Editor({
  language,
  effectiveDark,
  onConnect,
  onExport,
  onClose,
  onSnapshots,
  onCompare,
  onSave,
  onSaveAs,
  viewportRef,
  onSettings,
  onLanguage,
  onTheme,
}: {
  language: Language;
  effectiveDark: boolean;
  onConnect: () => void;
  onExport: () => void;
  onClose: () => void;
  onSnapshots: () => void;
  onCompare: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  viewportRef: MutableRefObject<ViewportController | null>;
  onSettings: () => void;
  onLanguage: () => void;
  onTheme: () => void;
}) {
  const {
    document,
    past,
    future,
    selection,
    setSelection: onSelect,
    search,
    setSearch,
    undo: onUndo,
    redo: onRedo,
    updateCenter: onUpdateCenter,
    updateSystem,
    updateConnection,
    addSystem: onAddSystem,
    deleteSelected,
    duplicateSelected: onDuplicate,
    autoOrganize: onOrganize,
    saveState,
    repoState,
    commitDocument,
  } = useDocumentContext();

  const onUpdateSystem = (patch: Partial<SystemNode>) => {
    if (selectedSystem) updateSystem(selectedSystem.id, patch);
  };
  const onUpdateConnection = (patch: Partial<Connection>) => {
    if (selectedConnection) updateConnection(selectedConnection.id, patch);
  };
  const onDelete = () =>
    void deleteSelected(async (q) => window.confirm(q), t(language, "deleteConfirm"));
  const onUpdateTitle = (title: string) => {
    commitDocument((current) => ({ ...current, title }));
  };

  const allCategories = repoState?.categories ?? [];
  const categories = allCategories
    .filter((c) => !c.hidden)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const selectedSystem =
    document && selection?.kind === "system"
      ? document.systems.find((s) => s.id === selection.id) ?? null
      : null;
  const selectedConnection =
    document && selection?.kind === "connection"
      ? document.connections.find((c) => c.id === selection.id) ?? null
      : null;

  const projectionDsl = useMemo(
    () => (document ? toSchemaTexDsl(document, allCategories) : ""),
    [document, allCategories]
  );

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  // SVG for clinical A4 report (always rendered with light theme for paper printing)
  const reportSvg = useMemo(() => {
    try {
      return document ? renderSchemaTex(document, allCategories, "light").svg : "";
    } catch {
      return "";
    }
  }, [document, allCategories]);

  if (!document || !repoState) return null;

  const handleAddDefaultNode = () => {
    if (categories.length > 0) {
      setCategoryPickerOpen(true);
    }
  };

  return (
    <div className="desktop-editor-workspace">
      {/* 1. Document Header */}
      <DocumentHeader
        title={document.title}
        updatedAt={document.updatedAt}
        saveState={saveState}
        onUpdateTitle={onUpdateTitle}
        onBack={onClose}
        onExport={onExport}
        language={language}
      />

      {/* 2. Editor Toolbar */}
      <EditorToolbar
        language={language}
        onAddNode={handleAddDefaultNode}
        onConnect={onConnect}
        onToggleNotes={() => setNotesOpen(!notesOpen)}
        notesOpen={notesOpen}
        onFit={() => viewportRef.current?.fit()}
        onZoomIn={() => viewportRef.current?.zoomIn()}
        onZoomOut={() => viewportRef.current?.zoomOut()}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        onOrganize={onOrganize}
      />

      {/* Quick Category Picker Popover when clicking "Nodo" */}
      {categoryPickerOpen && (
        <div className="quick-category-popover">
          <div className="quick-category-header">
            <span>{language === "es" ? "Seleccionar Categoría" : "Select Category"}</span>
            <button
              className="quick-category-close"
              onClick={() => setCategoryPickerOpen(false)}
            >
              <Icon name="close" size={13} />
            </button>
          </div>
          <div className="quick-category-grid">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="quick-category-btn"
                onClick={() => {
                  onAddSystem(cat);
                  setCategoryPickerOpen(false);
                }}
              >
                <span
                  className="quick-category-dot"
                  style={{ background: cat.accent }}
                />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Main Workspace Grid: Canvas + Inspector */}
      <div className="editor-main-area">
        {/* Canvas Section */}
        <div className="canvas-wrapper">
          <main
            className="canvas-panel"
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, target: "canvas" });
            }}
          >
            <div
              className="canvas-stage"
              role="img"
              aria-label={`${t(language, "canvas")}: ${document.title}`}
            >
              <SchematexDiagram
                dsl={projectionDsl}
                type="ecomap"
                theme={effectiveDark ? "dark" : "light"}
                viewport={{
                  initialFit: "contain",
                  pan: true,
                  pinch: true,
                  wheelRequiresModifier: false,
                }}
                viewportRef={viewportRef}
                className="schematex-host"
                onError={() => undefined}
              />
            </div>

            {/* Bottom-left Floating Zoom Pill */}
            <div className="canvas-zoom-pill">
              <button
                className="zoom-pill-btn"
                onClick={() => viewportRef.current?.zoomOut()}
                title="Alejar"
              >
                −
              </button>
              <span className="zoom-pill-label" onClick={() => viewportRef.current?.fit()}>
                100%
              </span>
              <button
                className="zoom-pill-btn"
                onClick={() => viewportRef.current?.zoomIn()}
                title="Acercar"
              >
                +
              </button>
              <button
                className="zoom-pill-btn fit"
                onClick={() => viewportRef.current?.fit()}
                title="Ajustar al centro"
              >
                <Icon name="fit" size={12} />
              </button>
            </div>
          </main>

          {/* Bottom Contextual Notes Drawer */}
          <BottomNotesDrawer
            language={language}
            document={document}
            onUpdateDocumentNotes={(notes) => onUpdateCenter({ notes })}
            onClose={() => setNotesOpen(false)}
            open={notesOpen}
          />
        </div>

        {/* Right Inspector Panel */}
        <InspectorPanel
          language={language}
          document={document}
          categories={allCategories}
          selection={selection}
          selectedSystem={selectedSystem}
          selectedConnection={selectedConnection}
          onSelect={onSelect}
          onUpdateCenter={onUpdateCenter}
          onUpdateSystem={onUpdateSystem}
          onUpdateConnection={onUpdateConnection}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onOpenReport={() => setReportOpen(true)}
          onOpenSnapshots={onSnapshots}
        />
      </div>

      {/* Pro Suite Modals */}
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        categories={allCategories}
        language={language}
        onAddSystem={onAddSystem}
        onSave={onSave}
        onUndo={onUndo}
        onRedo={onRedo}
        onOrganize={onOrganize}
        onExport={onExport}
        onReport={() => setReportOpen(true)}
        onToggleTheme={onTheme}
        onToggleLanguage={onLanguage}
      />

      <ContextMenu
        menu={contextMenu}
        onClose={() => setContextMenu(null)}
        language={language}
        onOrganize={onOrganize}
        onFit={() => viewportRef.current?.fit()}
        onOpenCommandPalette={() => setPaletteOpen(true)}
      />

      <ClinicalReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        document={document}
        categories={allCategories}
        language={language}
        projectionSvg={reportSvg}
      />
    </div>
  );
}
