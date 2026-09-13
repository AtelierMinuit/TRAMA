import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

interface BadgeProps {
  icon?: IconName;
  iconSize?: number;
  children: ReactNode;
  variant?: "feature" | "status" | "warning";
}

const variantClass: Record<NonNullable<BadgeProps["variant"]>, string> = {
  feature: "feature-badge",
  status: "status-chip",
  warning: "status-chip status-warning",
};

export function Badge({ icon, iconSize = 12, children, variant = "feature" }: BadgeProps): ReactNode {
  return (
    <span className={variantClass[variant]}>
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
    </span>
  );
}
