import { Button } from "@/components/ui/button";
import type React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    ocid?: string;
  };
  ocid?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  ocid,
}: EmptyStateProps) {
  return (
    <div
      data-ocid={ocid}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {icon && (
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="font-display font-semibold text-foreground text-base mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      )}
      {action && (
        <Button
          type="button"
          data-ocid={action.ocid}
          onClick={action.onClick}
          className="mt-4"
          variant="default"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
