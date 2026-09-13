import type { ReactNode } from "react";
import {
  FileText, Users, FolderOpen, Plus, Save, RotateCcw, RotateCw,
  LayoutGrid, History, Settings, MoreVertical, Trash2, ArrowRight,
  Sun, Moon, ChevronRight, Check, X, Shield, Activity, Network,
  House, Building, Building2, Briefcase, User, Heart, BookOpen, GraduationCap,
  Scale, Bus, Coffee, Wallet, TreePine, Map, MessageSquare, ZoomIn, ZoomOut,
  Maximize, Download, Link
} from "lucide-react";

export type IconName =
  | "file" | "users" | "folder" | "add" | "save" | "back" | "forward"
  | "grid" | "history" | "settings" | "more" | "trash" | "arrow"
  | "sun" | "moon" | "chevron" | "check" | "close" | "shield" | "trama"
  | "user" | "home" | "briefcase" | "heart" | "file-text"
  | "education" | "mental-health" | "legal" | "recreation" | "community"
  | "finance" | "transport" | "religion" | "zoom-in" | "zoom-out" | "fit" | "download" | "link";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 18, className = "" }: IconProps): ReactNode {
  const props = { size, className: `lucide-icon \${className}`, strokeWidth: 1.5 };

  switch (name) {
    case "file": return <FileText {...props} />;
    case "file-text": return <FileText {...props} />;
    case "users": return <Users {...props} />;
    case "folder": return <FolderOpen {...props} />;
    case "add": return <Plus {...props} />;
    case "save": return <Save {...props} />;
    case "back": return <RotateCcw {...props} />;
    case "forward": return <RotateCw {...props} />;
    case "grid": return <LayoutGrid {...props} />;
    case "history": return <History {...props} />;
    case "settings": return <Settings {...props} />;
    case "more": return <MoreVertical {...props} />;
    case "trash": return <Trash2 {...props} />;
    case "arrow": return <ArrowRight {...props} />;
    case "sun": return <Sun {...props} />;
    case "moon": return <Moon {...props} />;
    case "chevron": return <ChevronRight {...props} />;
    case "check": return <Check {...props} />;
    case "close": return <X {...props} />;
    case "shield": return <Shield {...props} />;
    case "trama": return <Network {...props} />;
    case "user": return <User {...props} />;
    case "home": return <House {...props} />;
    case "briefcase": return <Briefcase {...props} />;
    case "heart": return <Heart {...props} />;
    case "education": return <GraduationCap {...props} />;
    case "mental-health": return <Activity {...props} />;
    case "legal": return <Scale {...props} />;
    case "recreation": return <Coffee {...props} />;
    case "community": return <Building2 {...props} />;
    case "finance": return <Wallet {...props} />;
    case "transport": return <Bus {...props} />;
    case "religion": return <BookOpen {...props} />;
    case "zoom-in": return <ZoomIn {...props} />;
    case "zoom-out": return <ZoomOut {...props} />;
    case "fit": return <Maximize {...props} />;
    case "download": return <Download {...props} />;
    case "link": return <Link {...props} />;
    default: return <FileText {...props} />;
  }
}
