import { ReactNode } from "react";

export type IconName =
  | "add"
  | "arrow"
  | "back"
  | "check"
  | "chevron"
  | "close"
  | "download"
  | "file"
  | "folder"
  | "forward"
  | "grid"
  | "history"
  | "link"
  | "moon"
  | "more"
  | "save"
  | "settings"
  | "shield"
  | "sun"
  | "trama"
  | "trash"
  | "user"
  | "home"
  | "briefcase"
  | "heart"
  | "users"
  | "file-text"
  | "zoom-in"
  | "zoom-out";

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function Icon({ name, size = 18, strokeWidth = 1.7, label }: IconProps): ReactNode {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const paths: Record<IconName, ReactNode> = {
    add: <><path d="M12 5v14M5 12h14" {...common} /></>,
    arrow: <><path d="M5 12h13M13 7l5 5-5 5" {...common} /></>,
    back: <><path d="M19 12H5M11 6l-6 6 6 6" {...common} /></>,
    check: <><path d="m5 12 4 4L19 6" {...common} /></>,
    chevron: <><path d="m8 10 4 4 4-4" {...common} /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" {...common} /></>,
    download: <><path d="M12 4v11M7 11l5 5 5-5M5 20h14" {...common} /></>,
    file: <><path d="M6 3h8l4 4v14H6zM14 3v5h5" {...common} /></>,
    folder: <><path d="M3.5 6.5h6l1.8 2H20v9.8a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2z" {...common} /></>,
    forward: <><path d="M5 12h14M13 6l6 6-6 6" {...common} /></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1" {...common} /><rect x="14" y="4" width="6" height="6" rx="1" {...common} /><rect x="4" y="14" width="6" height="6" rx="1" {...common} /><rect x="14" y="14" width="6" height="6" rx="1" {...common} /></>,
    history: <><path d="M4 12a8 8 0 1 0 2.3-5.7M4 5v5h5M12 8v4l3 2" {...common} /></>,
    link: <><path d="M9 15 7.2 16.8a3 3 0 0 1-4.2-4.2l3-3a3 3 0 0 1 4.2 0M15 9l1.8-1.8a3 3 0 0 1 4.2 4.2l-3 3a3 3 0 0 1-4.2 0M8 16l8-8" {...common} /></>,
    moon: <><path d="M20 15.2A8.5 8.5 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z" {...common} /></>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="currentColor" /></>,
    save: <><path d="M5 4h12l2 2v14H5zM8 4v6h8V4M9 20v-6h6v6" {...common} /></>,
    settings: <><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" {...common} /><path d="m19 13 .1-1-.1-1 2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.7-1L14.6 3h-5.2l-.3 3.1a8 8 0 0 0-1.7 1L5 6.1 3 9.5l2 1.5-.1 1 .1 1-2 1.5L5 18l2.4-1a8 8 0 0 0 1.7 1l.3 3.1h5.2l.3-3.1a8 8 0 0 0 1.7-1l2.4 1 2-3.4z" {...common} /></>,
    shield: <><path d="M12 3 5 6v5c0 4.5 2.8 8 7 10 4.2-2 7-5.5 7-10V6z" {...common} /><path d="m9 12 2 2 4-4" {...common} /></>,
    sun: <><circle cx="12" cy="12" r="3.5" {...common} /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" {...common} /></>,
    trama: <><circle cx="12" cy="12" r="3" {...common} /><circle cx="4.5" cy="6" r="2" {...common} /><circle cx="19.5" cy="6" r="2" {...common} /><circle cx="5.5" cy="19" r="2" {...common} /><path d="m6.1 7.5 3.4 2.8M17.9 7.5l-3.4 2.8M7 17.7l3-3M17 17.7l-3-3" {...common} /></>,
    trash: <><path d="M5 7h14M10 11v6M14 11v6M8 7l.7-3h6.6l.7 3M7 7l.7 14h8.6L17 7" {...common} /></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" {...common} /><circle cx="12" cy="7" r="4" {...common} /></>,
    home: <><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" {...common} /><polyline points="9 22 9 12 15 12 15 22" {...common} /></>,
    briefcase: <><rect width="20" height="14" x="2" y="7" rx="2" ry="2" {...common} /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" {...common} /></>,
    heart: <><path d="M19 14l-7 7-7-7a5 5 0 0 1 7-7 5 5 0 0 1 7 7z" {...common} /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" {...common} /><circle cx="8.5" cy="7" r="4" {...common} /><polyline points="16 11 18 11 22 11" {...common} /><polyline points="19 8 19 14" {...common} /></>,
    "file-text": <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" {...common} /><polyline points="14 2 14 8 20 8" {...common} /><line x1="16" y1="13" x2="8" y2="13" {...common} /><line x1="16" y1="17" x2="8" y2="17" {...common} /><polyline points="10 9 9 9 8 9" {...common} /></>,
    "zoom-in": <><circle cx="10.5" cy="10.5" r="6" {...common} /><path d="m15 15 5 5M10.5 7.5v6M7.5 10.5h6" {...common} /></>,
    "zoom-out": <><circle cx="10.5" cy="10.5" r="6" {...common} /><path d="m15 15 5 5M7.5 10.5h6" {...common} /></>,
  };
  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-label={label}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={label ? "img" : undefined}
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}
