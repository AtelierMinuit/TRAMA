import { useDocumentContext } from "../../context/DocumentContext";
import { toSchemaTexDsl } from "../../adapters/schematex";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject, type CSSProperties } from "react";
import { SchematexDiagram } from "schematex/react";
import type { ViewportController } from "schematex/interactive";
import { Icon } from "../../components/Icon";
import { 
  IconButton, FormField, 
  STANDARD_RELATIONSHIP_OPTIONS, EXTENDED_RELATIONSHIP_OPTIONS, 
  FLOW_OPTIONS, VERIFICATION_OPTIONS, SOURCE_OPTIONS,
  sourceLabel, relationshipLabel, flowLabel,
  type Selection, type SaveState, getTemplateIcon, getCategoryIconName
} from "../../shared";
import { CommandPalette } from "../../components/CommandPalette";
import { ContextMenu, type ContextMenuState } from "../../components/ContextMenu";
import { ClinicalReportModal } from "../../modals/ClinicalReportModal";
import { renderSchemaTex } from "../../adapters/schematex";
import { t } from "../../i18n";
import type { Language } from "../../i18n";
import type {
  Category,
  CenterRepresentation,
  Connection,
  Ecomap,
  EnergyFlow,
  ExtendedRelationshipType,
  Provenance,
  RelationshipType,
  SourceType,
  StandardRelationshipType,
  SystemNode,
  Template,
  VerificationStatus
} from "../../domain/model";

// ─── Editor ──────────────────────────────────────────────────────────────────

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
  viewportRef: MutableRefObject<any>;
  onSettings: () => void;
  onLanguage: () => void;
  onTheme: () => void;
}) {
  const {
    document, past, future, selection, setSelection: onSelect,
    search, setSearch,
    undo: onUndo, redo: onRedo,
    updateCenter: onUpdateCenter, updateSystem, updateConnection,
    addSystem: onAddSystem, deleteSelected, duplicateSelected: onDuplicate,
    autoOrganize: onOrganize, saveState, repoState, commitDocument
  } = useDocumentContext();

  const onUpdateSystem = (patch: Partial<SystemNode>) => {
    if (selectedSystem) updateSystem(selectedSystem.id, patch);
  };
  const onUpdateConnection = (patch: Partial<Connection>) => {
    if (selectedConnection) updateConnection(selectedConnection.id, patch);
  };
  const onDelete = () => void deleteSelected(async (q) => window.confirm(q), t(language, "deleteConfirm"));
  const onUpdateTitle = (title: string) => { commitDocument((current) => ({ ...current, title })); };

  if (!document || !repoState) return null;

  const allCategories = repoState.categories;
  const templates = repoState.templates;
  const categories = allCategories.filter((c) => !c.hidden).sort((a, b) => a.orderIndex - b.orderIndex);
  
  const selectedSystem = selection?.kind === "system" ? document.systems.find((s) => s.id === selection.id) ?? null : null;
  const selectedConnection = selection?.kind === "connection" ? document.connections.find((c) => c.id === selection.id) ?? null : null;
  
  const projectionDsl = useMemo(() => toSchemaTexDsl(document, allCategories), [document, allCategories]);

  const [showAllSystems, setShowAllSystems] = useState(false);
  const [panelTab, setPanelTab] = useState<"systems" | "templates">("systems");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const projectionSvg = useMemo(() => {
    try {
      return renderSchemaTex(document, allCategories, effectiveDark ? "dark" : "light").svg;
    } catch {
      return "";
    }
  }, [document, allCategories, effectiveDark]);

  const filteredSystems = document.systems.filter((s) =>
    s.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="editor-screen">
      {/* Editor Header */}
      

      {/* Toolbar */}
      {/* Editor Body */}
      <div className="editor-body">
        {/* Left Panel — Systems / Templates */}
        <aside className="systems-panel">
          {/* Panel Tabs */}
          <div className="panel-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={panelTab === "systems"}
              className={`panel-tab${panelTab === "systems" ? " is-active" : ""}`}
              onClick={() => setPanelTab("systems")}
            >
              {t(language, "systems")}
              {document.systems.length > 0 && (
                <span className="notes-badge">{document.systems.length}</span>
              )}
            </button>
            <button
              role="tab"
              aria-selected={panelTab === "templates"}
              className={`panel-tab${panelTab === "templates" ? " is-active" : ""}`}
              onClick={() => setPanelTab("templates")}
            >
              {t(language, "templates")}
            </button>
          </div>

          {panelTab === "systems" ? (
            <>
              {/* System search */}
              <div className="system-search">
                <Icon name="file" size={14} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  placeholder={language === "es" ? "Filtrar sistemas" : "Filter systems"}
                  aria-label={language === "es" ? "Filtrar sistemas" : "Filter systems"}
                />
              </div>

              {/* Center node */}
              <button
                className={`center-list-item${selection?.kind === "center" ? " is-selected" : ""}`}
                onClick={() => onSelect({ kind: "center", id: document.center.id })}
              >
                <span className="center-symbol"><Icon name="trama" size={17} /></span>
                <span>
                  <strong>{document.center.label}</strong>
                  <small>
                    {document.center.representation === "family_unit"
                      ? t(language, "family")
                      : t(language, "person")}
                  </small>
                </span>
              </button>

              {/* Add by category */}
              <div className="category-list">
                {categories.map((category) => (
                  <button
                    className="category-add"
                    key={category.id}
                    onClick={() => onAddSystem(category)}
                  >
                    <span
                      className="category-icon"
                      style={{ "--category-accent": category.accent } as CSSProperties}
                    >
                      <Icon name={getCategoryIconName(category.key)} size={14} />
                    </span>
                    <span>{category.label}</span>
                    <Icon name="add" size={13} />
                  </button>
                ))}
              </div>

              {/* System list */}
              <div className="system-list-heading">
                <span>{language === "es" ? "En el mapa" : "On the map"}</span>
                <span>{filteredSystems.length}</span>
              </div>
              <div className="system-list">
                {filteredSystems.slice(0, showAllSystems ? undefined : 8).map((system) => {
                  const category = allCategories.find((item) => item.id === system.categoryId);
                  return (
                    <button
                      className={`system-list-item${
                        selection?.kind === "system" && selection.id === system.id ? " is-selected" : ""
                      }`}
                      key={system.id}
                      onClick={() => onSelect({ kind: "system", id: system.id })}
                    >
                      <span
                        className="node-dot"
                        style={{ "--category-accent": category?.accent ?? "#75807b" } as CSSProperties}
                      >
                        <Icon name={getCategoryIconName(category?.key ?? "")} size={13} />
                      </span>
                      <span>
                        <strong>{system.label}</strong>
                        <small>{category?.label ?? t(language, "category")}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
              {filteredSystems.length > 8 ? (
                <button
                  className="show-more"
                  onClick={() => setShowAllSystems((c) => !c)}
                >
                  {showAllSystems
                    ? (language === "es" ? "Mostrar menos" : "Show less")
                    : (language === "es"
                        ? `Mostrar ${filteredSystems.length - 8} más`
                        : `Show ${filteredSystems.length - 8} more`)}
                </button>
              ) : null}
            </>
          ) : (
            /* Templates tab */
            <div className="templates-panel-list">
              <p className="panel-templates-hint">
                {language === "es"
                  ? "Aplica una plantilla como punto de partida. Se añadirá al documento actual."
                  : "Apply a template as a starting point. It will be added to the current document."}
              </p>
              {templates.map((template) => (
                <button
                  key={template.id}
                  className="template-panel-item"
                  onClick={() => {/* future: apply template to current doc */}}
                  title={template.description}
                >
                  <span className="template-panel-icon"><Icon name={getTemplateIcon(template.name)} size={16} /></span>
                  <span>
                    <strong>{template.name}</strong>
                    <small>{template.description}</small>
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="panel-footer">
            <span className="privacy-inline">
              <Icon name="shield" size={14} />
              {t(language, "localOnly")}
            </span>
          </div>
        </aside>

        {/* Canvas */}
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
              viewport={{ initialFit: "contain", pan: true, pinch: true, wheelRequiresModifier: false }}
              viewportRef={viewportRef}
              className="schematex-host"
              onError={() => undefined}
            />
          </div>
        </main>

        {/* Right panel — Inspector */}
        <aside className="inspector-panel">
          <Inspector
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
            onCompare={onCompare}
            onOpenReport={() => setReportOpen(true)}
          />
        </aside>

        {/* Floating Header (Title & Status) */}
        <div className="floating-header">
          <div className="editor-brand">
            <div className="brand-mark small"><Icon name="trama" size={18} /></div>
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
            <span className={`save-dot ${saveState}`} />
            {statusLabel(language, saveState)}
          </span>
          <div className="toolbar-divider" style={{ height: 16 }} />
          <IconButton icon="download" label="Exportar" onClick={onExport} />
        </div>

        {/* Floating Toolbar (Tools) */}
        <div className="floating-toolbar">
          <button className="toolbar-button primary-connect" onClick={onConnect} disabled={document.systems.length === 0}>
            <Icon name="link" size={15} /> {t(language, "connect")}
          </button>
          <div className="toolbar-divider" />
          <IconButton icon="back" label="Deshacer" onClick={onUndo} disabled={past.length === 0} />
          <IconButton icon="forward" label="Rehacer" onClick={onRedo} disabled={future.length === 0} />
          <div className="toolbar-divider" />
          <IconButton icon="grid" label="Organizar" onClick={onOrganize} />
          <IconButton icon="history" label="Historial" onClick={onSnapshots} />
          <div className="toolbar-divider" />
          <IconButton icon="zoom-out" label="Alejar" onClick={() => viewportRef.current?.zoomOut()} />
          <button className="toolbar-button" onClick={() => viewportRef.current?.fit()} style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px' }}>
            FIT
          </button>
          <IconButton icon="zoom-in" label="Acercar" onClick={() => viewportRef.current?.zoomIn()} />
          <div className="toolbar-divider" />
          <button className="toolbar-button" onClick={() => setReportOpen(true)} title="Informe Oficial A4 / PDF">
            <Icon name="file-text" size={15} /> {language === "es" ? "Informe" : "Report"}
          </button>
          <button className="toolbar-button" onClick={() => setPaletteOpen(true)} title="Paleta de Comandos (⌘K)">
            <Icon name="file" size={15} /> ⌘K
          </button>
          <div className="toolbar-divider" />
          <button className="primary-button" onClick={onSave} style={{ borderRadius: 20, padding: '6px 14px', fontSize: 12 }}>
            <Icon name="save" size={15} /> Guardar
          </button>
          <IconButton icon="more" label="Opciones" onClick={onSaveAs} />
        </div>

        {/* Pro Suite Modals & Popovers */}
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
          projectionSvg={projectionSvg}
        />
      </div>
    </div>
  );
}

// ─── Inspector ───────────────────────────────────────────────────────────────

function Inspector({
  language,
  document,
  categories,
  selection,
  selectedSystem,
  selectedConnection,
  onSelect,
  onUpdateCenter,
  onUpdateSystem,
  onUpdateConnection,
  onDuplicate,
  onDelete,
  onCompare,
  onOpenReport,
}: {
  language: Language;
  document: Ecomap;
  categories: Category[];
  selection: Selection;
  selectedSystem: SystemNode | null;
  selectedConnection: Connection | null;
  onSelect: (selection: Selection) => void;
  onUpdateCenter: (patch: Partial<Ecomap["center"]>) => void;
  onUpdateSystem: (patch: Partial<SystemNode>) => void;
  onUpdateConnection: (patch: Partial<Connection>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onCompare: () => void;
  onOpenReport: () => void;
}): ReactNode {
  const [activeTab, setActiveTab] = useState<"props" | "notes">("props");

  // Reset tab on selection change
  useEffect(() => { setActiveTab("props"); }, [selection?.kind, (selection as { id?: string })?.id]);

  const selectionLabel =
    selection?.kind === "connection" ? t(language, "relationship")
      : selection?.kind === "system" ? t(language, "element")
      : selection?.kind === "center" ? (language === "es" ? "Centro" : "Center")
      : language === "es" ? "Sin selección" : "No selection";

  // Count notes for badge
  const notesCount =
    selectedSystem ? (selectedSystem.notes.trim() ? 1 : 0)
      : selectedConnection ? (selectedConnection.notes.trim() ? 1 : 0)
      : selection?.kind === "center" ? (document.center.notes.trim() ? 1 : 0)
      : 0;

  return (
    <div className="inspector-scroll">
      {/* Inspector heading */}
      <div className="panel-heading inspector-heading">
        <div>
          <p className="eyebrow">{t(language, "inspector")}</p>
          <h2>{selectionLabel}</h2>
        </div>
        {selection && selection.kind !== "center" ? (
          <IconButton icon="trash" label={t(language, "delete")} onClick={onDelete} />
        ) : null}
      </div>

      {/* Inspector tabs — only when there's a selection */}
      {selection ? (
        <div className="inspector-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === "props"}
            className={`inspector-tab${activeTab === "props" ? " is-active" : ""}`}
            onClick={() => setActiveTab("props")}
          >
            {language === "es" ? "Propiedades" : "Properties"}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "notes"}
            className={`inspector-tab${activeTab === "notes" ? " is-active" : ""}`}
            onClick={() => setActiveTab("notes")}
          >
            {language === "es" ? "Notas" : "Notes"}
            {notesCount > 0 && <span className="notes-badge">{notesCount}</span>}
          </button>
        </div>
      ) : null}

      {/* Properties tab content */}
      {activeTab === "props" ? (
        <>
          {selection?.kind === "center" ? (
            <CenterInspector language={language} document={document} onUpdate={onUpdateCenter} />
          ) : null}
          {selectedSystem ? (
            <SystemInspector
              language={language}
              system={selectedSystem}
              categories={categories}
              onUpdate={onUpdateSystem}
              onDuplicate={onDuplicate}
            />
          ) : null}
          {selectedConnection ? (
            <ConnectionInspector
              language={language}
              document={document}
              connection={selectedConnection}
              onSelect={onSelect}
              onUpdate={onUpdateConnection}
              onCompare={onCompare}
            />
          ) : null}
        </>
      ) : null}

      {/* Notes tab content */}
      {activeTab === "notes" && selection ? (
        <div className="inspector-form">
          <FormField label={t(language, "notes")}>
            {selection.kind === "center" ? (
              <textarea
                rows={8}
                value={document.center.notes}
                onChange={(e) => onUpdateCenter({ notes: e.currentTarget.value })}
                placeholder={language === "es" ? "Notas sobre el centro del ecomapa…" : "Notes about the ecomap center…"}
              />
            ) : selectedSystem ? (
              <textarea
                rows={8}
                value={selectedSystem.notes}
                onChange={(e) => onUpdateSystem({ notes: e.currentTarget.value })}
                placeholder={language === "es" ? "Notas sobre este sistema…" : "Notes about this system…"}
              />
            ) : selectedConnection ? (
              <textarea
                rows={8}
                value={selectedConnection.notes}
                onChange={(e) => onUpdateConnection({ notes: e.currentTarget.value })}
                placeholder={language === "es" ? "Notas sobre este vínculo…" : "Notes about this tie…"}
              />
            ) : null}
          </FormField>
        </div>
      ) : null}

      {/* Empty state — Ecological Diagnosis Balance Card */}
      {!selection ? (
        <>
          <div className="network-balance-card">
            <div className="network-balance-header">
              <Icon name="mental-health" size={16} />
              <span>{language === "es" ? "Diagnóstico Ecológico" : "Ecological Balance"}</span>
            </div>
            <div className="network-balance-stats">
              <div className="stat-pill support">
                <strong>
                  {
                    document.connections.filter(
                      (c) => c.relationshipType === "strong" || c.relationshipType === "moderate"
                    ).length
                  }
                </strong>
                <small>{language === "es" ? "Apoyos" : "Supports"}</small>
              </div>
              <div className="stat-pill stress">
                <strong>
                  {
                    document.connections.filter(
                      (c) =>
                        c.relationshipType === "stressful" ||
                        c.relationshipType === "conflictual" ||
                        c.relationshipType === "broken"
                    ).length
                  }
                </strong>
                <small>{language === "es" ? "Estresores" : "Stressors"}</small>
              </div>
              <div className="stat-pill systems">
                <strong>{document.systems.length}</strong>
                <small>{language === "es" ? "Sistemas" : "Systems"}</small>
              </div>
            </div>
            <button className="generate-report-btn" onClick={onOpenReport}>
              <Icon name="file-text" size={14} />
              <span>{language === "es" ? "Informe Oficial A4 / PDF" : "Official Report A4 / PDF"}</span>
            </button>
          </div>
          <ConnectionList language={language} document={document} onSelect={onSelect} />
        </>
      ) : null}
    </div>
  );
}

// ─── Connection List ─────────────────────────────────────────────────────────

function ConnectionList({
  language,
  document,
  onSelect,
}: {
  language: Language;
  document: Ecomap;
  onSelect: (selection: Selection) => void;
}): ReactNode {
  if (document.connections.length === 0) return null;
  const labelFor = (id: string) =>
    id === document.center.id
      ? document.center.label
      : document.systems.find((s) => s.id === id)?.label ?? "—";

  return (
    <div className="connection-list">
      <div className="connection-list-title">
        <span>{language === "es" ? "Vínculos en el mapa" : "Ties on the map"}</span>
        <span>{document.connections.length}</span>
      </div>
      {document.connections.map((connection) => (
        <button
          key={connection.id}
          onClick={() => onSelect({ kind: "connection", id: connection.id })}
        >
          <span>{labelFor(connection.sourceNodeId)}</span>
          <em>↔</em>
          <span>{labelFor(connection.targetNodeId)}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Inspector sub-forms ─────────────────────────────────────────────────────

function CenterInspector({
  language,
  document,
  onUpdate,
}: {
  language: Language;
  document: Ecomap;
  onUpdate: (patch: Partial<Ecomap["center"]>) => void;
}): ReactNode {
  return (
    <div className="inspector-form">
      <FormField label={t(language, "name")}>
        <input
          value={document.center.label}
          onChange={(e) => onUpdate({ label: e.currentTarget.value })}
        />
      </FormField>
      <FormField label={t(language, "centerType")}>
        <select
          value={document.center.representation}
          onChange={(e) => onUpdate({ representation: e.currentTarget.value as CenterRepresentation })}
        >
          <option value="single_person">{t(language, "person")}</option>
          <option value="family_unit">{t(language, "family")}</option>
          <option value="embedded_genogram" disabled>
            {language === "es" ? "Mini-genograma (roadmap)" : "Mini-genogram (roadmap)"}
          </option>
        </select>
      </FormField>
      <FormField label={t(language, "description")}>
        <textarea
          rows={3}
          value={document.center.description}
          onChange={(e) => onUpdate({ description: e.currentTarget.value })}
        />
      </FormField>
      <div className="inspector-section-title">{t(language, "source")}</div>
      <ProvenanceFields language={language} value={document.center} onChange={onUpdate} />
    </div>
  );
}

function SystemInspector({
  language,
  system,
  categories,
  onUpdate,
  onDuplicate,
}: {
  language: Language;
  system: SystemNode;
  categories: Category[];
  onUpdate: (patch: Partial<SystemNode>) => void;
  onDuplicate: () => void;
}): ReactNode {
  const selectedCategory = categories.find((c) => c.id === system.categoryId);

  return (
    <div className="inspector-form">
      <FormField label={t(language, "name")}>
        <input
          value={system.label}
          onChange={(e) => onUpdate({ label: e.currentTarget.value })}
        />
      </FormField>
      <FormField label={t(language, "category")}>
        <div className="category-select-row">
          {selectedCategory && (
            <span
              className="category-dot"
              style={{ "--category-accent": selectedCategory.accent } as CSSProperties}
            />
          )}
          <select
            value={system.categoryId}
            onChange={(e) => onUpdate({ categoryId: e.currentTarget.value })}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.label}</option>
            ))}
          </select>
        </div>
      </FormField>
      <FormField label={t(language, "prominence")}>
        <select
          value={system.size}
          onChange={(e) => onUpdate({ size: e.currentTarget.value as SystemNode["size"] })}
        >
          <option value="small">{language === "es" ? "Pequeña" : "Small"}</option>
          <option value="medium">{language === "es" ? "Media" : "Medium"}</option>
          <option value="large">{language === "es" ? "Grande" : "Large"}</option>
        </select>
      </FormField>
      <FormField label={t(language, "description")}>
        <textarea
          rows={3}
          value={system.description}
          onChange={(e) => onUpdate({ description: e.currentTarget.value })}
        />
      </FormField>
      <div className="inspector-section-title">{t(language, "source")}</div>
      <ProvenanceFields language={language} value={system} onChange={onUpdate} />
      <button className="secondary-full-button" onClick={onDuplicate}>
        <Icon name="file" size={16} />
        {t(language, "duplicate")}
      </button>
    </div>
  );
}

function ConnectionInspector({
  language,
  document,
  connection,
  onSelect,
  onUpdate,
  onCompare,
}: {
  language: Language;
  document: Ecomap;
  connection: Connection;
  onSelect: (selection: Selection) => void;
  onUpdate: (patch: Partial<Connection>) => void;
  onCompare: () => void;
}): ReactNode {
  const source =
    connection.sourceNodeId === document.center.id
      ? document.center.label
      : document.systems.find((s) => s.id === connection.sourceNodeId)?.label ?? "—";
  const target =
    connection.targetNodeId === document.center.id
      ? document.center.label
      : document.systems.find((s) => s.id === connection.targetNodeId)?.label ?? "—";

  return (
    <div className="inspector-form">
      <div className="connection-endpoints">
        <button
          onClick={() =>
            onSelect(
              connection.sourceNodeId === document.center.id
                ? { kind: "center", id: document.center.id }
                : { kind: "system", id: connection.sourceNodeId },
            )
          }
        >
          {source}
        </button>
        <Icon name="arrow" size={14} />
        <button
          onClick={() =>
            onSelect(
              connection.targetNodeId === document.center.id
                ? { kind: "center", id: document.center.id }
                : { kind: "system", id: connection.targetNodeId },
            )
          }
        >
          {target}
        </button>
      </div>

      <div className="inspector-section-title">{t(language, "relationship")}</div>
      <FormField label={t(language, "standard")}>
        <select
          value={
            STANDARD_RELATIONSHIP_OPTIONS.includes(
              connection.relationshipType as StandardRelationshipType,
            )
              ? connection.relationshipType
              : ""
          }
          onChange={(e) =>
            e.currentTarget.value && onUpdate({ relationshipType: e.currentTarget.value as RelationshipType })
          }
        >
          <option value="" disabled>
            {language === "es" ? "Selecciona un tipo estándar" : "Select a standard type"}
          </option>
          {STANDARD_RELATIONSHIP_OPTIONS.map((r) => (
            <option key={r} value={r}>{relationshipLabel(language, r)}</option>
          ))}
        </select>
      </FormField>
      <FormField label={t(language, "extended")}>
        <select
          value={
            EXTENDED_RELATIONSHIP_OPTIONS.includes(
              connection.relationshipType as ExtendedRelationshipType,
            )
              ? connection.relationshipType
              : ""
          }
          onChange={(e) =>
            e.currentTarget.value && onUpdate({ relationshipType: e.currentTarget.value as RelationshipType })
          }
        >
          <option value="" disabled>
            {language === "es" ? "Selecciona una extensión clínica" : "Select an extended profile"}
          </option>
          {EXTENDED_RELATIONSHIP_OPTIONS.map((r) => (
            <option key={r} value={r}>{relationshipLabel(language, r)}</option>
          ))}
        </select>
      </FormField>
      <FormField label={t(language, "flow")}>
        <select
          value={connection.energyFlow}
          onChange={(e) => onUpdate({ energyFlow: e.currentTarget.value as EnergyFlow })}
        >
          {FLOW_OPTIONS.map((flow) => (
            <option key={flow} value={flow}>{flowLabel(language, flow)}</option>
          ))}
        </select>
      </FormField>
      <FormField label={language === "es" ? "Etiqueta visible" : "Visible label"}>
        <input
          value={connection.label}
          onChange={(e) => onUpdate({ label: e.currentTarget.value })}
        />
      </FormField>
      <div className="inspector-section-title">{t(language, "source")}</div>
      <ProvenanceFields language={language} value={connection} onChange={onUpdate} />
      <div className="inspector-note">
        <Icon name="link" size={16} />
        {language === "es"
          ? "Tipo de vínculo y flujo se guardan por separado."
          : "Relationship type and energy flow are stored separately."}
      </div>
      <button className="secondary-full-button" onClick={onCompare}>
        <Icon name="history" size={16} />
        {t(language, "compare")}
      </button>
    </div>
  );
}


export function statusLabel(language: Language, state: SaveState): string {
  return t(
    language,
    state === "saving" ? "saving"
      : state === "unsaved" ? "unsaved"
      : state === "error" ? "saveError"
      : "saved",
  );
}

export function ProvenanceFields({
  language,
  value,
  onChange,
}: {
  language: Language;
  value: Provenance;
  onChange: (patch: Partial<Provenance>) => void;
}): ReactNode {
  return (
    <div className="provenance-fields">
      <FormField label={t(language, "source")}>
        <select
          value={value.sourceType ?? "unknown"}
          onChange={(e) => onChange({ sourceType: e.currentTarget.value as SourceType })}
        >
          {SOURCE_OPTIONS.map((src) => (
            <option key={src} value={src}>{sourceLabel(language, src)}</option>
          ))}
        </select>
      </FormField>
      <FormField label={t(language, "sourceDate")}>
        <input
          type="text"
          inputMode="numeric"
          placeholder={language === "es" ? "AAAA-MM-DD" : "YYYY-MM-DD"}
          value={value.sourceDate ?? ""}
          onChange={(e) => onChange({ sourceDate: e.currentTarget.value || undefined })}
        />
      </FormField>
      <FormField label={t(language, "verification")}>
        <select
          value={value.verificationStatus ?? "unverified"}
          onChange={(e) => onChange({ verificationStatus: e.currentTarget.value as VerificationStatus })}
        >
          {VERIFICATION_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {t(language, status === "unverified" ? "unverified"
                : status === "verified" ? "verified"
                : status === "needs_review" ? "needsReview"
                : "disputed")}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label={`${t(language, "source")} · ${language === "es" ? "contexto" : "context"}`}>
        <textarea
          rows={2}
          value={value.sourceNote ?? ""}
          onChange={(e) => onChange({ sourceNote: e.currentTarget.value })}
          placeholder={language === "es" ? "Contexto opcional de la fuente" : "Optional source context"}
        />
      </FormField>
    </div>
  );
}



