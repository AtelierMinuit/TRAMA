import { type ReactNode, useEffect, useRef } from "react";
import { Icon } from "../components/Icon";
import { IconButton, FormField, DiffList, formatDate, STANDARD_RELATIONSHIP_OPTIONS, EXTENDED_RELATIONSHIP_OPTIONS, FLOW_OPTIONS, relationshipLabel, flowLabel } from "../shared";
import { t } from "../i18n";
import type { Language } from "../i18n";
import type { 
  Template, 
  CenterRepresentation, 
  Ecomap, 
  RelationshipType,
  StandardRelationshipType,
  ExtendedRelationshipType, 
  EnergyFlow, 
  Snapshot 
} from "../domain/model";
import type { ExportFormat } from "../infrastructure/exporter";
import type { EcomapDiff } from "../domain/compare";

const TEMPLATE_ICONS: Record<string, string> = {
  "Persona": "👤",
  "Familia": "🏠",
  "Adolescente": "🎒",
  "Persona mayor": "🌿",
  "Red": "🤝",
  "Ingreso": "📋",
};

function getTemplateIcon(name: string): string {
  for (const [key, icon] of Object.entries(TEMPLATE_ICONS)) {
    if (name.startsWith(key)) return icon;
  }
  return "📄";
}

// ─── Modal Frame ─────────────────────────────────────────────────────────────

export function ModalFrame({
  title,
  children,
  onClose,
  size = "regular",
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  size?: "regular" | "wide";
}): ReactNode {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (globalThis.document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (globalThis.document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };
    
    firstElement?.focus();
    
    window.addEventListener("keydown", handleTab);
    return () => window.removeEventListener("keydown", handleTab);
  }, []);

  return (
    <div className="modal-backdrop">
      <div
        ref={modalRef}
        className={`modal-card${size === "wide" ? " modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <IconButton icon="close" label="Cerrar modal" onClick={onClose} />
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Modals ──────────────────────────────────────────────────────────────────

export function NewDocumentModal({
  language,
  title,
  setTitle,
  representation,
  setRepresentation,
  templates,
  onCancel,
  onCreate,
  onTemplate,
}: {
  language: Language;
  title: string;
  setTitle: (value: string) => void;
  representation: CenterRepresentation;
  setRepresentation: (value: CenterRepresentation) => void;
  templates: Template[];
  onCancel: () => void;
  onCreate: () => void;
  onTemplate: (template: Template) => void;
}): ReactNode {
  return (
    <ModalFrame title={t(language, "newDocument")} onClose={onCancel}>
      <div className="modal-content">
        <FormField label={t(language, "documentName")}>
          <input autoFocus value={title} onChange={(e) => setTitle(e.currentTarget.value)} />
        </FormField>
        <FormField label={t(language, "centerType")}>
          <div className="segmented-control">
            <button
              className={representation === "single_person" ? "is-selected" : ""}
              onClick={() => setRepresentation("single_person")}
            >
              {t(language, "person")}
            </button>
            <button
              className={representation === "family_unit" ? "is-selected" : ""}
              onClick={() => setRepresentation("family_unit")}
            >
              {t(language, "family")}
            </button>
          </div>
        </FormField>
        <div className="modal-actions">
          <button className="quiet-button" onClick={onCancel}>{t(language, "cancel")}</button>
          <button className="primary-button" onClick={onCreate}>{t(language, "create")}</button>
        </div>
        <div className="modal-divider">
          <span>{language === "es" ? "o usa una plantilla original" : "or use an original template"}</span>
        </div>
        <div className="modal-template-list">
          {templates.map((template) => (
            <button key={template.id} onClick={() => onTemplate(template)}>
              <span className="template-glyph" style={{ fontSize: "18px" }}>
                {getTemplateIcon(template.name)}
              </span>
              <span>
                <strong>{template.name}</strong>
                <small>{template.description}</small>
              </span>
              <Icon name="arrow" size={15} />
            </button>
          ))}
        </div>
      </div>
    </ModalFrame>
  );
}

export function ConnectionModal({
  language,
  document,
  draft,
  setDraft,
  onCancel,
  onCreate,
}: {
  language: Language;
  document: Ecomap;
  draft: {
    source: string;
    target: string;
    relationship: RelationshipType;
    flow: EnergyFlow;
    label: string;
  };
  setDraft: (draft: {
    source: string;
    target: string;
    relationship: RelationshipType;
    flow: EnergyFlow;
    label: string;
  }) => void;
  onCancel: () => void;
  onCreate: () => void;
}): ReactNode {
  const elements = [
    { id: document.center.id, label: document.center.label },
    ...document.systems.map((s) => ({ id: s.id, label: s.label })),
  ];
  return (
    <ModalFrame title={t(language, "connect")} onClose={onCancel}>
      <div className="modal-content">
        <p className="modal-lead">
          {language === "es"
            ? "Define la relación como datos estructurados. El flujo no cambia el tipo de vínculo."
            : "Define the tie as structured data. Flow does not change relationship type."}
        </p>
        <div className="two-column">
          <FormField label={language === "es" ? "Origen" : "Source"}>
            <select
              value={draft.source}
              onChange={(e) => setDraft({ ...draft, source: e.currentTarget.value })}
            >
              {elements.map((el) => <option key={el.id} value={el.id}>{el.label}</option>)}
            </select>
          </FormField>
          <FormField label={language === "es" ? "Destino" : "Target"}>
            <select
              value={draft.target}
              onChange={(e) => setDraft({ ...draft, target: e.currentTarget.value })}
            >
              {elements.map((el) => <option key={el.id} value={el.id}>{el.label}</option>)}
            </select>
          </FormField>
        </div>
        <FormField label={t(language, "standard")}>
          <select
            value={
              STANDARD_RELATIONSHIP_OPTIONS.includes(draft.relationship as StandardRelationshipType)
                ? draft.relationship
                : ""
            }
            onChange={(e) =>
              setDraft({ ...draft, relationship: e.currentTarget.value as RelationshipType })
            }
          >
            <option value="" disabled>
              {language === "es" ? "Selecciona una relación" : "Select a relationship"}
            </option>
            {STANDARD_RELATIONSHIP_OPTIONS.map((r) => (
              <option key={r} value={r}>{relationshipLabel(language, r)}</option>
            ))}
          </select>
        </FormField>
        <FormField label={t(language, "extended")}>
          <select
            value={
              EXTENDED_RELATIONSHIP_OPTIONS.includes(draft.relationship as ExtendedRelationshipType)
                ? draft.relationship
                : ""
            }
            onChange={(e) =>
              setDraft({ ...draft, relationship: e.currentTarget.value as RelationshipType })
            }
          >
            <option value="" disabled>
              {language === "es" ? "Perfil extendido opcional" : "Optional extended profile"}
            </option>
            {EXTENDED_RELATIONSHIP_OPTIONS.map((r) => (
              <option key={r} value={r}>{relationshipLabel(language, r)}</option>
            ))}
          </select>
        </FormField>
        <FormField label={t(language, "flow")}>
          <select
            value={draft.flow}
            onChange={(e) => setDraft({ ...draft, flow: e.currentTarget.value as EnergyFlow })}
          >
            {FLOW_OPTIONS.map((flow) => (
              <option key={flow} value={flow}>{flowLabel(language, flow)}</option>
            ))}
          </select>
        </FormField>
        <FormField label={language === "es" ? "Etiqueta" : "Label"}>
          <input
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.currentTarget.value })}
          />
        </FormField>
        <div className="modal-actions">
          <button className="quiet-button" onClick={onCancel}>{t(language, "cancel")}</button>
          <button
            className="primary-button"
            disabled={!draft.source || !draft.target || draft.source === draft.target}
            onClick={onCreate}
          >
            {t(language, "connect")}
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}

export function ExportModal({
  language,
  format,
  setFormat,
  includeLegend,
  setIncludeLegend,
  whiteBackground,
  setWhiteBackground,
  onCancel,
  onExport,
}: {
  language: Language;
  format: ExportFormat;
  setFormat: (format: ExportFormat) => void;
  includeLegend: boolean;
  setIncludeLegend: (value: boolean) => void;
  whiteBackground: boolean;
  setWhiteBackground: (value: boolean) => void;
  onCancel: () => void;
  onExport: () => void;
}): ReactNode {
  return (
    <ModalFrame title={t(language, "exportTitle")} onClose={onCancel}>
      <div className="modal-content">
        <FormField label={t(language, "fileFormat")}>
          <div className="format-grid">
            {(["svg", "png", "pdf"] as ExportFormat[]).map((item) => (
              <button
                key={item}
                className={format === item ? "is-selected" : ""}
                onClick={() => setFormat(item)}
              >
                <strong>{item.toUpperCase()}</strong>
                <small>
                  {item === "svg"
                    ? (language === "es" ? "Vectorial" : "Vector")
                    : item === "png" ? "Retina 2×" : "Documento"}
                </small>
              </button>
            ))}
          </div>
        </FormField>
        <label className="check-row">
          <input
            type="checkbox"
            checked={includeLegend}
            onChange={(e) => setIncludeLegend(e.currentTarget.checked)}
          />
          {t(language, "includeLegend")}
        </label>
        {format === "png" ? (
          <label className="check-row">
            <input
              type="checkbox"
              checked={whiteBackground}
              onChange={(e) => setWhiteBackground(e.currentTarget.checked)}
            />
            {whiteBackground ? t(language, "whiteBackground") : t(language, "transparentBackground")}
          </label>
        ) : null}
        <p className="modal-lead">
          {language === "es"
            ? "Se utilizará un diálogo nativo Guardar como y se confirmará la escritura antes de mostrar el resultado."
            : "A native Save As dialog will be used and the write will be confirmed before showing the result."}
        </p>
        <div className="modal-actions">
          <button className="quiet-button" onClick={onCancel}>{t(language, "cancel")}</button>
          <button className="primary-button" onClick={onExport}>
            <Icon name="download" size={16} />
            {t(language, "export")}
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}

export function SnapshotsModal({
  language,
  snapshots,
  snapshotName,
  setSnapshotName,
  snapshotReason,
  setSnapshotReason,
  onCancel,
  onCreate,
  onRestore,
  onDuplicate,
  onCompare,
}: {
  language: Language;
  snapshots: Snapshot[];
  snapshotName: string;
  setSnapshotName: (value: string) => void;
  snapshotReason: string;
  setSnapshotReason: (value: string) => void;
  onCancel: () => void;
  onCreate: () => void;
  onRestore: (snapshot: Snapshot) => void;
  onDuplicate: (snapshot: Snapshot) => void;
  onCompare: () => void;
}): ReactNode {
  return (
    <ModalFrame title={t(language, "history")} onClose={onCancel} size="wide">
      <div className="modal-content">
        <div className="snapshot-create">
          <div>
            <p className="eyebrow">{t(language, "createSnapshot")}</p>
            <div className="two-column">
              <FormField label={t(language, "snapshotName")}>
                <input
                  value={snapshotName}
                  onChange={(e) => setSnapshotName(e.currentTarget.value)}
                  placeholder={language === "es" ? "Ej. Primera entrevista" : "e.g. First interview"}
                />
              </FormField>
              <FormField label={t(language, "snapshotReason")}>
                <input
                  value={snapshotReason}
                  onChange={(e) => setSnapshotReason(e.currentTarget.value)}
                />
              </FormField>
            </div>
          </div>
          <button className="primary-button" onClick={onCreate}>
            <Icon name="save" size={16} />
            {t(language, "createSnapshot")}
          </button>
        </div>
        <div className="modal-divider">
          <span>{language === "es" ? "Versiones guardadas localmente" : "Locally saved versions"}</span>
        </div>
        {snapshots.length ? (
          <div className="snapshot-list">
            {snapshots.map((snapshot) => (
              <div className="snapshot-row" key={snapshot.id}>
                <span className="snapshot-mark"><Icon name="history" size={17} /></span>
                <span className="snapshot-copy">
                  <strong>{snapshot.name}</strong>
                  <small>
                    {formatDate(snapshot.snapshotAt, language)}
                    {snapshot.reason ? ` · ${snapshot.reason}` : ""}
                  </small>
                </span>
                <span className="snapshot-actions">
                  <button onClick={() => onRestore(snapshot)}>{t(language, "restore")}</button>
                  <button onClick={() => onDuplicate(snapshot)}>
                    {language === "es" ? "Nuevo" : "New"}
                  </button>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-panel">
            <Icon name="history" size={25} />
            <p>{t(language, "noSnapshots")}</p>
          </div>
        )}
        <div className="modal-actions">
          <button className="quiet-button" onClick={onCompare} disabled={snapshots.length < 2}>
            <Icon name="grid" size={16} />
            {t(language, "compare")}
          </button>
          <button className="quiet-button" onClick={onCancel}>{t(language, "close")}</button>
        </div>
      </div>
    </ModalFrame>
  );
}

export function CompareModal({
  language,
  snapshots,
  compareA,
  setCompareA,
  compareB,
  setCompareB,
  diff,
  onCancel,
}: {
  language: Language;
  snapshots: Snapshot[];
  compareA: string;
  setCompareA: (value: string) => void;
  compareB: string;
  setCompareB: (value: string) => void;
  diff: EcomapDiff | null;
  onCancel: () => void;
}): ReactNode {
  return (
    <ModalFrame title={t(language, "compare")} onClose={onCancel} size="wide">
      <div className="modal-content">
        <div className="two-column">
          <FormField label="Versión A">
            <select value={compareA} onChange={(e) => setCompareA(e.currentTarget.value)}>
              <option value="">—</option>
              {snapshots.map((s) => (
                <option key={s.id} value={s.id}>{s.name} · {formatDate(s.snapshotAt, language)}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Versión B">
            <select value={compareB} onChange={(e) => setCompareB(e.currentTarget.value)}>
              <option value="">—</option>
              {snapshots.map((s) => (
                <option key={s.id} value={s.id}>{s.name} · {formatDate(s.snapshotAt, language)}</option>
              ))}
            </select>
          </FormField>
        </div>
        {diff ? (
          <div className="diff-grid">
            <DiffList
              language={language}
              title={language === "es" ? "Sistemas agregados" : "Systems added"}
              items={diff.systemsAdded.map((s) => s.id)}
              render={(id) => diff.systemsAdded.find((s) => s.id === id)?.label ?? id}
            />
            <DiffList
              language={language}
              title={language === "es" ? "Sistemas eliminados" : "Systems removed"}
              items={diff.systemsRemoved.map((s) => s.id)}
              render={(id) => diff.systemsRemoved.find((s) => s.id === id)?.label ?? id}
            />
            <DiffList
              language={language}
              title={language === "es" ? "Vínculos agregados" : "Ties added"}
              items={diff.connectionsAdded.map((c) => c.id)}
            />
            <DiffList
              language={language}
              title={language === "es" ? "Vínculos eliminados" : "Ties removed"}
              items={diff.connectionsRemoved.map((c) => c.id)}
            />
            <DiffList
              language={language}
              title={language === "es" ? "Cambio de vínculo" : "Relationship changes"}
              items={diff.relationshipChanges.map((c) => c.id)}
              render={(id) => {
                const change = diff.relationshipChanges.find((item) => item.id === id);
                return change ? `${change.before} → ${change.after}` : id;
              }}
            />
            <DiffList
              language={language}
              title={language === "es" ? "Cambio de flujo" : "Flow changes"}
              items={diff.flowChanges.map((c) => c.id)}
              render={(id) => {
                const change = diff.flowChanges.find((item) => item.id === id);
                return change ? `${change.before} → ${change.after}` : id;
              }}
            />
            <DiffList
              language={language}
              title={language === "es" ? "Cambio de categoría" : "Category changes"}
              items={diff.categoryChanges.map((c) => c.id)}
            />
          </div>
        ) : (
          <div className="empty-panel">
            <Icon name="grid" size={25} />
            <p>{t(language, "compareEmpty")}</p>
          </div>
        )}
        <div className="modal-actions">
          <button className="quiet-button" onClick={onCancel}>{t(language, "close")}</button>
        </div>
      </div>
    </ModalFrame>
  );
}
