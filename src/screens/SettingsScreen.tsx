import { type ReactNode, useState, useEffect } from "react";
import { Icon } from "../components/Icon";
import { t } from "../i18n";
import { nowIso } from "../domain/model";
import { createId } from "../domain/model";
import type { Language } from "../i18n";
import type { Category } from "../domain/model";
import { FormField, type ThemeMode } from "../shared";

function CategoryManager({
  language,
  categories,
  onSave,
}: {
  language: Language;
  categories: Category[];
  onSave: (categories: Category[]) => void;
}): ReactNode {
  const [draft, setDraft] = useState<Category[]>(() =>
    [...categories].sort((a, b) => a.orderIndex - b.orderIndex),
  );
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    setDraft([...categories].sort((a, b) => a.orderIndex - b.orderIndex));
  }, [categories]);

  const update = (id: string, patch: Partial<Category>) =>
    setDraft((current) => current.map((c) => c.id === id ? { ...c, ...patch } : c));

  const move = (index: number, direction: -1 | 1) =>
    setDraft((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((c, i) => ({ ...c, orderIndex: i }));
    });

  const add = () => {
    const label = newLabel.trim();
    if (!label) return;
    const now = nowIso();
    const id = createId();
    setDraft((current) => [
      ...current,
      {
        id,
        workspaceId: current[0]?.workspaceId ?? "workspace-local",
        key: `custom_${id.slice(0, 8)}`,
        label,
        schematexCategory: "other",
        icon: "•",
        visualStyle: "outline",
        accent: "#747474",
        hidden: false,
        orderIndex: current.length,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    setNewLabel("");
  };

  return (
    <section className="settings-card category-manager">
      <div className="category-manager-header">
        <div>
          <p className="eyebrow">{language === "es" ? "CATÁLOGO PROFESIONAL" : "PROFESSIONAL CATALOG"}</p>
          <h2>{language === "es" ? "Categorías" : "Categories"}</h2>
          <p>
            {language === "es"
              ? "Edita etiquetas, orden, iconos y estilos; la semántica no depende solo del color."
              : "Edit labels, order, icons, and styles; semantics do not depend on color alone."}
          </p>
        </div>
        <button className="primary-button" onClick={() => onSave(draft)}>
          {language === "es" ? "Guardar categorías" : "Save categories"}
        </button>
      </div>

      <div className="category-manager-add">
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.currentTarget.value)}
          placeholder={language === "es" ? "Nueva categoría" : "New category"}
          onKeyDown={(e) => { if (e.key === "Enter") add(); }}
        />
        <button className="secondary-action" onClick={add}>
          {language === "es" ? "Añadir" : "Add"}
        </button>
      </div>

      <div className="category-manager-list">
        {draft.map((category, index) => (
          <div
            className={`category-manager-row${category.hidden ? " is-hidden" : ""}`}
            key={category.id}
          >
            <span className="category-order">{index + 1}</span>
            <input
              aria-label={`${language === "es" ? "Nombre" : "Name"}: ${category.label}`}
              value={category.label}
              onChange={(e) => update(category.id, { label: e.currentTarget.value })}
            />
            <input
              className="category-icon-input"
              aria-label={`${language === "es" ? "Icono" : "Icon"}: ${category.label}`}
              value={category.icon}
              maxLength={2}
              onChange={(e) => update(category.id, { icon: e.currentTarget.value })}
            />
            <select
              aria-label={`${language === "es" ? "Estilo" : "Style"}: ${category.label}`}
              value={category.visualStyle}
              onChange={(e) => update(category.id, { visualStyle: e.currentTarget.value as Category["visualStyle"] })}
            >
              <option value="solid">{language === "es" ? "Sólido" : "Solid"}</option>
              <option value="outline">{language === "es" ? "Contorno" : "Outline"}</option>
              <option value="hatched">{language === "es" ? "Trama" : "Hatched"}</option>
            </select>
            <input
              className="category-color-input"
              type="color"
              aria-label={`${language === "es" ? "Color" : "Color"}: ${category.label}`}
              value={category.accent}
              onChange={(e) => update(category.id, { accent: e.currentTarget.value })}
            />
            <label className="category-hide">
              <input
                type="checkbox"
                checked={category.hidden}
                onChange={(e) => update(category.id, { hidden: e.currentTarget.checked })}
              />
              {language === "es" ? "Oculta" : "Hidden"}
            </label>
            <button
              className="icon-button"
              aria-label={language === "es" ? "Subir categoría" : "Move category up"}
              onClick={() => move(index, -1)}
              disabled={index === 0}
            >
              <Icon name="chevron" size={14} />
            </button>
            <button
              className="icon-button"
              aria-label={language === "es" ? "Bajar categoría" : "Move category down"}
              onClick={() => move(index, 1)}
              disabled={index === draft.length - 1}
            >
              <Icon name="chevron" size={14} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SettingsScreen({
  language,
  themeMode,
  categories,
  setThemeMode,
  onSaveCategories,
  onBack,
  onLanguage,
}: {
  language: Language;
  themeMode: ThemeMode;
  categories: Category[];
  setThemeMode: (mode: ThemeMode) => void;
  onSaveCategories: (categories: Category[]) => void;
  onBack: () => void;
  onLanguage: () => void;
}): ReactNode {
  return (
    <div className="settings-screen">
      <header className="editor-header">
        <button className="back-button" onClick={onBack}>
          <Icon name="back" size={18} />
          {language === "es" ? "Volver" : "Back"}
        </button>
        <div className="header-title">
          <strong>{t(language, "settings")}</strong>
        </div>
        <button className="quiet-button" onClick={onLanguage}>{language.toUpperCase()}</button>
      </header>

      <main className="settings-main">
        <p className="eyebrow">TRAMA 0.1</p>
        <h1>{t(language, "privacy")}</h1>
        <p className="settings-lead">{t(language, "privacyCopy")}</p>

        <div className="settings-grid">
          <section className="settings-card">
            <Icon name="shield" size={23} />
            <h2>{t(language, "localOnly")}</h2>
            <p>{t(language, "privacyCopy")}</p>
            <dl>
              <div>
                <dt>{language === "es" ? "Documentos" : "Documents"}</dt>
                <dd>{language === "es" ? "SQLite local y archivos .trama elegidos por ti" : "Local SQLite and user-selected .trama files"}</dd>
              </div>
              <div>
                <dt>{language === "es" ? "Red" : "Network"}</dt>
                <dd>{language === "es" ? "Sin requests HTTP propios" : "No own HTTP requests"}</dd>
              </div>
              <div>
                <dt>{language === "es" ? "Datos de muestra" : "Sample data"}</dt>
                <dd>{language === "es" ? "Solo fixtures ficticios" : "Fictional fixtures only"}</dd>
              </div>
            </dl>
          </section>

          <section className="settings-card">
            <Icon name="settings" size={23} />
            <h2>{language === "es" ? "Apariencia" : "Appearance"}</h2>
            <FormField label={language === "es" ? "Tema" : "Theme"}>
              <select value={themeMode} onChange={(e) => setThemeMode(e.currentTarget.value as ThemeMode)}>
                <option value="system">{language === "es" ? "Sistema" : "System"}</option>
                <option value="light">{t(language, "lightMode")}</option>
                <option value="dark">{t(language, "darkMode")}</option>
                <option value="monochrome">{t(language, "monochrome")}</option>
              </select>
            </FormField>
            <p className="field-hint">
              {language === "es"
                ? "El modo monocromo mantiene las relaciones legibles sin depender del color."
                : "Monochrome mode keeps relationships legible without relying on color."}
            </p>
          </section>

          <section className="settings-card warning-card">
            <Icon name="shield" size={23} />
            <h2>{language === "es" ? "Cifrado interno" : "Internal encryption"}</h2>
            <p>{t(language, "encryptionCopy")}</p>
            <span className="status-chip status-warning">
              {language === "es" ? "Pendiente antes de datos reales" : "Pending before real data"}
            </span>
          </section>
        </div>

        <CategoryManager language={language} categories={categories} onSave={onSaveCategories} />
      </main>
    </div>
  );
}
