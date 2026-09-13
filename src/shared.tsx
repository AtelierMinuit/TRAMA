import { type ReactNode } from "react";
import { Icon, type IconName } from "./components/Icon";
import type { StandardRelationshipType, ExtendedRelationshipType, SourceType, VerificationStatus, EnergyFlow, RelationshipType } from "./domain/model";
import { t, flowMessageKey, relationMessageKey, sourceMessageKey } from "./i18n";

export type Screen = "dashboard" | "editor" | "settings";
export type ThemeMode = "system" | "light" | "dark" | "monochrome";
export type SaveState = "saved" | "saving" | "unsaved" | "error";
export type Modal = "new" | "connection" | "export" | "snapshots" | "compare" | null;
export type Selection =
  | { kind: "center"; id: string }
  | { kind: "system"; id: string }
  | { kind: "connection"; id: string }
  | null;

export const STANDARD_RELATIONSHIP_OPTIONS: StandardRelationshipType[] = [
  "strong", "moderate", "weak", "stressful", "conflictual", "broken",
];
export const EXTENDED_RELATIONSHIP_OPTIONS: ExtendedRelationshipType[] = [
  "enmeshed", "distant", "ambivalent", "cutoff", "abusive",
  "mandated", "dependent", "estranged", "coercive", "emerging",
];
export const SOURCE_OPTIONS: SourceType[] = [
  "documented_fact", "client_report", "caregiver_report", "third_party_report",
  "professional_observation", "professional_inference", "working_hypothesis", "unknown",
];
export const VERIFICATION_OPTIONS: VerificationStatus[] = [
  "unverified", "verified", "needs_review", "disputed",
];
export const FLOW_OPTIONS: EnergyFlow[] = [
  "toward_center", "away_from_center", "mutual", "none",
];

export function IconButton({
  icon,
  label,
  onClick,
  disabled = false,
  active = false,
}: {
  icon: IconName;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}): ReactNode {
  return (
    <button
      className={`icon-button${active ? " is-active" : ""}`}
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon name={icon} />
    </button>
  );
}

export function FormField({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}): ReactNode {
  return (
    <label className="form-field">
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

export function DiffList({
  language,
  title,
  items,
  render,
}: {
  language: any;
  title: string;
  items: string[];
  render?: (value: string) => string;
}): ReactNode {
  return (
    <div className="diff-section">
      <h4>{title} <span>{items.length}</span></h4>
      {items.length
        ? <ul>{items.map((v) => <li key={v}>{render ? render(v) : v}</li>)}</ul>
        : <p className="muted">{language === "es" ? "Sin cambios" : "No changes"}</p>}
    </div>
  );
}

export function formatDate(iso: string, language: any): string {
  try {
    return new Intl.DateTimeFormat(
      language === "es" ? "es-CL" : "en-US",
      { dateStyle: "medium", timeStyle: "short" },
    ).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatDateShort(iso: string, language: any): string {
  try {
    return new Intl.DateTimeFormat(
      language === "es" ? "es-CL" : "en-US",
      { dateStyle: "short" },
    ).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function sourceLabel(language: any, source: SourceType | undefined): string {
  return t(language, sourceMessageKey(source ?? "unknown"));
}
export function flowLabel(language: any, flow: EnergyFlow): string {
  return t(language, flowMessageKey(flow));
}
export function relationshipLabel(language: any, relation: RelationshipType): string {
  return t(language, relationMessageKey(relation));
}


const TEMPLATE_ICONS: Record<string, IconName> = {
  "Persona": "user",
  "Familia": "home",
  "Adolescente": "user",
  "Persona mayor": "user",
  "Red": "users",
  "Ingreso": "file-text",
};

export function getTemplateIcon(name: string): IconName {
  for (const [key, icon] of Object.entries(TEMPLATE_ICONS)) {
    if (name.startsWith(key)) return icon;
  }
  return "file-text";
}

export function getCategoryIconName(keyOrCategory: string): IconName {
  switch (keyOrCategory) {
    case "family":
    case "extended_family":
      return "home";
    case "friends_peers":
    case "friends":
      return "users";
    case "work":
      return "briefcase";
    case "education":
      return "education";
    case "health":
    case "care":
      return "heart";
    case "mental_health":
    case "mental-health":
      return "mental-health";
    case "finance":
    case "financial":
      return "finance";
    case "transport":
      return "transport";
    case "legal":
    case "justice":
      return "legal";
    case "recreation":
      return "recreation";
    case "community":
    case "organizations":
      return "community";
    case "religion":
      return "religion";
    default:
      return "file";
  }
}
