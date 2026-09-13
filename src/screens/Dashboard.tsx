import type { ReactNode } from "react";
import { Icon } from "../components/Icon";
import { t } from "../i18n";
import { IconButton, formatDateShort, getTemplateIcon } from "../shared";
import type { Language } from "../i18n";
import type { RepositoryState, Ecomap, Template } from "../domain/model";
import type { ThemeMode } from "../shared";

export function Dashboard({
  language,
  themeMode,
  repoState,
  onNew,
  onOpen,
  onOpenDocument,
  onTemplate,
  onSettings,
  onLanguage,
  onTheme,
}: {
  language: Language;
  themeMode: ThemeMode;
  repoState: RepositoryState;
  onNew: () => void;
  onOpen: () => void;
  onOpenDocument: (document: Ecomap) => void;
  onTemplate: (template: Template) => void;
  onSettings: () => void;
  onLanguage: () => void;
  onTheme: () => void;
}): ReactNode {
  const recent = [...repoState.ecomaps]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);

  return (
    <div className="dashboard-screen">
      {/* Header */}
      <header className="dashboard-header">
        <div className="brand">
          <div className="brand-mark">
            <Icon name="trama" size={28} />
          </div>
          <div>
            <strong>TRAMA</strong>
            <span>{t(language, "tagline")}</span>
          </div>
        </div>

        {/* Feature badges — privacy pillars */}
        <div className="feature-badges">
          <span className="feature-badge">
            <Icon name="shield" size={12} />
            {language === "es" ? "Local-first" : "Local-first"}
          </span>
          <span className="feature-badge">
            <Icon name="close" size={11} />
            {language === "es" ? "Sin cuenta" : "No account"}
          </span>
          <span className="feature-badge">
            <Icon name="shield" size={12} />
            {language === "es" ? "Sin conexión requerida" : "Works offline"}
          </span>
        </div>

        <div className="header-actions">
          <button className="quiet-button" onClick={onLanguage}>{language.toUpperCase()}</button>
          <IconButton
            icon={themeMode === "dark" ? "sun" : "moon"}
            label={themeMode === "dark" ? t(language, "lightMode") : t(language, "darkMode")}
            onClick={onTheme}
          />
          <IconButton icon="settings" label={t(language, "settings")} onClick={onSettings} />
        </div>
      </header>

      <main className="dashboard-main">
        {/* Welcome */}
        <section className="welcome-block">
          <p className="eyebrow">
            {language === "es" ? "ESPACIO DE TRABAJO LOCAL" : "LOCAL WORKSPACE"}
          </p>
          <h1>
            {language === "es" ? "Hola, ¿qué te gustaría hacer hoy?" : "Hello, what would you like to do today?"}
          </h1>
          <p>{t(language, "dashboardIntro")}</p>
        </section>

        {/* Primary actions */}
        <section className="dashboard-actions">
          <button className="primary-action" onClick={onNew}>
            <span className="action-icon"><Icon name="add" size={25} /></span>
            <span>
              <strong>{t(language, "newEcomap")}</strong>
              <small>{language === "es" ? "Comenzar con una persona o familia" : "Start with a person or family"}</small>
            </span>
            <Icon name="arrow" />
          </button>
          <button className="secondary-action" onClick={onOpen}>
            <Icon name="folder" size={20} />
            <span>
              <strong>{t(language, "openEcomap")}</strong>
              <small>.trama · {t(language, "localOnly")}</small>
            </span>
          </button>
        </section>

        {/* Recent documents */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t(language, "recent")}</p>
              <h2>{language === "es" ? "Documentos recientes" : "Recent documents"}</h2>
            </div>
            <span className="section-count">{recent.length}</span>
          </div>
          {recent.length ? (
            <div className="recent-list">
              {recent.map((item) => (
                <button
                  className="recent-row"
                  key={item.id}
                  onClick={() => onOpenDocument(item)}
                >
                  <span className="recent-file"><Icon name="file" size={18} /></span>
                  <span className="recent-copy">
                    <strong>{item.title}</strong>
                    <small>
                      {item.center.label} · {item.systems.length}{" "}
                      {language === "es" ? "sistemas" : "systems"}
                    </small>
                  </span>
                  <time className="recent-date">{formatDateShort(item.updatedAt, language)}</time>
                  <Icon name="chevron" size={16} />
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-panel">
              <Icon name="file" size={25} />
              <p>{t(language, "noRecent")}</p>
            </div>
          )}
        </section>

        {/* Templates */}
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{t(language, "templates")}</p>
              <h2>{language === "es" ? "Puntos de partida" : "Starting points"}</h2>
            </div>
          </div>
          <div className="template-grid">
            {repoState.templates.map((template) => (
              <button
                className="template-card"
                key={template.id}
                onClick={() => onTemplate(template)}
              >
                <span className="template-card-icon">
                  <Icon name={getTemplateIcon(template.name)} size={24} />
                </span>
                <strong>{template.name}</strong>
                <small>{template.description}</small>
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <span>TRAMA 0.1 · AGPL-3.0-only</span>
        <span>{t(language, "privacy")}: {t(language, "localOnly")}</span>
      </footer>
    </div>
  );
}
