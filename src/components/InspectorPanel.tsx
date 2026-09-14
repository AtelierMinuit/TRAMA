import React, { useState, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import type { Language } from "../i18n";
import type {
  Ecomap,
  Category,
  SystemNode,
  Connection,
  StandardRelationshipType,
  EnergyFlow,
} from "../domain/model";
import {
  STANDARD_RELATIONSHIP_OPTIONS,
  FLOW_OPTIONS,
  relationshipLabel,
  flowLabel,
  formatDateShort,
  type Selection,
} from "../shared";

export interface InspectorPanelProps {
  language: Language;
  document: Ecomap;
  categories: Category[];
  selection: Selection;
  selectedSystem: SystemNode | null;
  selectedConnection: Connection | null;
  onSelect: (selection: Selection) => void;
  onUpdateCenter: (patch: { label?: string; description?: string; notes?: string }) => void;
  onUpdateSystem: (patch: Partial<SystemNode>) => void;
  onUpdateConnection: (patch: Partial<Connection>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onOpenReport: () => void;
  onOpenSnapshots: () => void;
}

const COLOR_SWATCHES = [
  "#3b82f6", // Blue
  "#8b5cf6", // Lavender / Violet
  "#ec4899", // Pink
  "#f97316", // Terracotta / Orange
  "#f59e0b", // Yellow / Amber
  "#06b6d4", // Cyan
  "#10b981", // Mint / Green
  "#64748b", // Slate
];

export function InspectorPanel({
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
  onOpenReport,
  onOpenSnapshots,
}: InspectorPanelProps): ReactNode {
  const isSpanish = language === "es";

  // Tab: "node" | "relation" | "note" | "document"
  const [activeTab, setActiveTab] = useState<"node" | "relation" | "note" | "document">(
    selectedConnection ? "relation" : selectedSystem ? "node" : "node"
  );

  const isCenter = !selection || (selection.kind === "system" && selection.id === document.center.id);
  const activeCategory = selectedSystem
    ? categories.find((c) => c.id === selectedSystem.categoryId)
    : null;

  const [currentColor, setCurrentColor] = useState(activeCategory?.accent || "#3b82f6");

  // Mock notes and snapshots for the node (or from document)
  const nodeNotes = [
    { id: "1", title: "Entrevista inicial", date: "3 nov 2024" },
    { id: "2", title: "Observación profesional", date: "5 nov 2024" },
  ];

  const nodeSnapshots = [
    { id: "s1", name: "Estado inicial", date: "1 nov 2024" },
    { id: "s2", name: "Tras reunión escolar", date: "10 nov 2024" },
    { id: "s3", name: "Situación actual", date: "15 nov 2024" },
  ];

  return (
    <aside className="desktop-inspector-panel">
      {/* Top Tab Bar */}
      <div className="inspector-tabs-header" role="tablist">
        <button
          className={`inspector-tab-btn ${activeTab === "node" ? "is-active" : ""}`}
          onClick={() => setActiveTab("node")}
        >
          {isSpanish ? "Nodo" : "Node"}
        </button>
        <button
          className={`inspector-tab-btn ${activeTab === "relation" ? "is-active" : ""}`}
          onClick={() => setActiveTab("relation")}
        >
          {isSpanish ? "Relación" : "Relation"}
        </button>
        <button
          className={`inspector-tab-btn ${activeTab === "note" ? "is-active" : ""}`}
          onClick={() => setActiveTab("note")}
        >
          {isSpanish ? "Nota" : "Note"}
        </button>
        <button
          className={`inspector-tab-btn ${activeTab === "document" ? "is-active" : ""}`}
          onClick={() => setActiveTab("document")}
        >
          {isSpanish ? "Documento" : "Doc"}
        </button>
      </div>

      <div className="inspector-scroll-area">
        {/* TAB 1: NODO / CENTRO */}
        {activeTab === "node" && (
          <div className="inspector-section-group">
            {/* Sección Información */}
            <div className="inspector-section">
              <div className="inspector-section-title-row">
                <span className="inspector-section-title">
                  {isSpanish ? "Información" : "Information"}
                </span>
                <Icon name="chevron" size={14} className="inspector-chevron" />
              </div>

              {/* Node Avatar Header */}
              <div className="node-avatar-block">
                <div
                  className="node-avatar-circle"
                  style={{
                    borderColor: isCenter ? "#3b82f6" : currentColor,
                    background: `${isCenter ? "#3b82f6" : currentColor}15`,
                    color: isCenter ? "#3b82f6" : currentColor,
                  }}
                >
                  <Icon name={isCenter ? "user" : "community"} size={26} />
                </div>
              </div>

              {/* Form Fields */}
              <div className="inspector-form-grid">
                <div className="inspector-field">
                  <label>{isSpanish ? "Nombre" : "Name"}</label>
                  <input
                    className="inspector-input"
                    value={isCenter ? document.center.label : selectedSystem?.label || ""}
                    onChange={(e) => {
                      if (isCenter) {
                        onUpdateCenter({ label: e.target.value });
                      } else {
                        onUpdateSystem({ label: e.target.value });
                      }
                    }}
                    placeholder={isCenter ? "Carlos" : "Nombre del sistema..."}
                  />
                </div>

                <div className="inspector-field">
                  <label>{isSpanish ? "Tipo" : "Type"}</label>
                  <select
                    className="inspector-select"
                    value={isCenter ? "central" : "system"}
                    disabled={isCenter}
                  >
                    <option value="central">{isSpanish ? "Persona (central)" : "Person (central)"}</option>
                    <option value="system">{isSpanish ? "Sistema externo" : "External system"}</option>
                  </select>
                </div>

                {!isCenter && (
                  <div className="inspector-field">
                    <label>{isSpanish ? "Categoría" : "Category"}</label>
                    <select
                      className="inspector-select"
                      value={selectedSystem?.categoryId}
                      onChange={(e) => onUpdateSystem({ categoryId: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="inspector-field">
                  <label>{isSpanish ? "Descripción" : "Description"}</label>
                  <textarea
                    className="inspector-textarea"
                    rows={3}
                    maxLength={500}
                    value={isCenter ? document.center.description : selectedSystem?.description || ""}
                    onChange={(e) => {
                      if (isCenter) {
                        onUpdateCenter({ description: e.target.value });
                      } else {
                        onUpdateSystem({ description: e.target.value });
                      }
                    }}
                    placeholder={
                      isCenter
                        ? "Adolescente, 15 años. Vive con madre y hermana..."
                        : "Detalles del sistema..."
                    }
                  />
                  <div className="inspector-char-count">
                    {(isCenter ? document.center.description : selectedSystem?.description || "").length}/500
                  </div>
                </div>
              </div>
            </div>

            {/* Sección Apariencia */}
            <div className="inspector-section">
              <span className="inspector-section-title">{isSpanish ? "Apariencia" : "Appearance"}</span>

              {/* Color Swatches */}
              <div className="color-swatches-row">
                {COLOR_SWATCHES.map((color) => (
                  <button
                    key={color}
                    className={`color-swatch-circle ${currentColor === color ? "is-active" : ""}`}
                    style={{ background: color }}
                    onClick={() => setCurrentColor(color)}
                    title={color}
                  />
                ))}
              </div>

              {/* Icon Selector Button */}
              <div className="appearance-icon-row">
                <span className="appearance-icon-label">{isSpanish ? "Icono" : "Icon"}</span>
                <div className="appearance-icon-picker">
                  <div className="icon-preview-box">
                    <Icon name={isCenter ? "user" : "community"} size={16} />
                  </div>
                  <button className="inspector-secondary-btn" onClick={() => undefined}>
                    {isSpanish ? "Cambiar" : "Change"}
                  </button>
                </div>
              </div>
            </div>

            {/* Sección Notas */}
            <div className="inspector-section">
              <div className="inspector-section-title-row">
                <span className="inspector-section-title">
                  {isSpanish ? `Notas (${nodeNotes.length})` : `Notes (${nodeNotes.length})`}
                </span>
                <button className="inspector-action-link">+ {isSpanish ? "Añadir" : "Add"}</button>
              </div>

              <div className="inspector-notes-list">
                {nodeNotes.map((note) => (
                  <div key={note.id} className="inspector-note-card">
                    <div className="inspector-note-icon">
                      <Icon name="file-text" size={14} />
                    </div>
                    <div className="inspector-note-content">
                      <strong>{note.title}</strong>
                      <small>{note.date}</small>
                    </div>
                    <button className="inspector-dots-btn">···</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sección Snapshots */}
            <div className="inspector-section">
              <div className="inspector-section-title-row">
                <span className="inspector-section-title">
                  {isSpanish ? `Snapshots (${nodeSnapshots.length})` : `Snapshots (${nodeSnapshots.length})`}
                </span>
                <button className="inspector-action-link" onClick={onOpenSnapshots}>
                  {isSpanish ? "Ver todos" : "View all"}
                </button>
              </div>

              <div className="inspector-snapshots-list">
                {nodeSnapshots.map((snap) => (
                  <div key={snap.id} className="inspector-snapshot-row">
                    <Icon name="history" size={14} className="inspector-snap-icon" />
                    <div className="inspector-snap-content">
                      <strong>{snap.name}</strong>
                      <small>{snap.date}</small>
                    </div>
                    <button className="inspector-dots-btn">···</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Duplicate & Delete actions for system node */}
            {!isCenter && selectedSystem && (
              <div className="inspector-section inspector-actions-row">
                <button className="inspector-secondary-btn" onClick={onDuplicate}>
                  <Icon name="file" size={14} /> {isSpanish ? "Duplicar" : "Duplicate"}
                </button>
                <button className="inspector-danger-btn" onClick={onDelete}>
                  <Icon name="trash" size={14} /> {isSpanish ? "Eliminar" : "Delete"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RELACIÓN */}
        {activeTab === "relation" && (
          <div className="inspector-section-group">
            {selectedConnection ? (
              <div className="inspector-section">
                <span className="inspector-section-title">
                  {isSpanish ? "Calidad del Vínculo" : "Relationship Type"}
                </span>

                <div className="inspector-field">
                  <label>{isSpanish ? "Etiqueta en el mapa" : "Label"}</label>
                  <input
                    className="inspector-input"
                    value={selectedConnection.label}
                    onChange={(e) => onUpdateConnection({ label: e.target.value })}
                    placeholder={isSpanish ? "Ej: Apoyo emocional, Conflicto..." : "e.g. Emotional support..."}
                  />
                </div>

                <div className="inspector-field">
                  <label>{isSpanish ? "Tipo de vínculo" : "Type"}</label>
                  <select
                    className="inspector-select"
                    value={selectedConnection.relationshipType}
                    onChange={(e) =>
                      onUpdateConnection({ relationshipType: e.target.value as StandardRelationshipType })
                    }
                  >
                    {STANDARD_RELATIONSHIP_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {relationshipLabel(language, opt)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="inspector-field">
                  <label>{isSpanish ? "Flujo de energía" : "Energy flow"}</label>
                  <select
                    className="inspector-select"
                    value={selectedConnection.energyFlow}
                    onChange={(e) =>
                      onUpdateConnection({ energyFlow: e.target.value as EnergyFlow })
                    }
                  >
                    {FLOW_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {flowLabel(language, opt)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="inspector-actions-row" style={{ marginTop: 16 }}>
                  <button className="inspector-danger-btn" onClick={onDelete}>
                    <Icon name="trash" size={14} /> {isSpanish ? "Eliminar vínculo" : "Delete connection"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="inspector-empty-state">
                <p className="muted">
                  {isSpanish
                    ? "Selecciona un vínculo en el mapa para editar sus propiedades."
                    : "Select a connection to edit its properties."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: NOTAS GENERALES */}
        {activeTab === "note" && (
          <div className="inspector-section-group">
            <div className="inspector-section">
              <span className="inspector-section-title">{isSpanish ? "Notas del Caso" : "Case Notes"}</span>
              <div className="inspector-notes-list">
                {nodeNotes.map((note) => (
                  <div key={note.id} className="inspector-note-card">
                    <div className="inspector-note-icon">
                      <Icon name="file-text" size={14} />
                    </div>
                    <div className="inspector-note-content">
                      <strong>{note.title}</strong>
                      <small>{note.date}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DOCUMENTO & DIAGNÓSTICO ECOLÓGICO */}
        {activeTab === "document" && (
          <div className="inspector-section-group">
            <div className="inspector-section">
              <span className="inspector-section-title">
                {isSpanish ? "Diagnóstico Ecológico" : "Ecological Diagnosis"}
              </span>

              {/* Hartman Matrix Stats Card */}
              <div className="inspector-diagnosis-card">
                <div className="diagnosis-pill support">
                  <strong>
                    {
                      document.connections.filter(
                        (c) => c.relationshipType === "strong" || c.relationshipType === "moderate"
                      ).length
                    }
                  </strong>
                  <small>{isSpanish ? "Apoyos" : "Supports"}</small>
                </div>

                <div className="diagnosis-pill stress">
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
                  <small>{isSpanish ? "Estresores" : "Stressors"}</small>
                </div>

                <div className="diagnosis-pill systems">
                  <strong>{document.systems.length}</strong>
                  <small>{isSpanish ? "Sistemas" : "Systems"}</small>
                </div>
              </div>

              <button className="inspector-report-btn" onClick={onOpenReport}>
                <Icon name="file-text" size={15} />
                <span>{isSpanish ? "Informe Oficial A4 / PDF" : "Official Report A4 / PDF"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
