interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const SIZE = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-10 h-10 border-[3px]",
};

export default function LoadingSpinner({
  size = "md",
  label,
}: LoadingSpinnerProps) {
  return (
    <output
      className="flex flex-col items-center gap-3"
      aria-label={label ?? "Cargando"}
    >
      <div
        className={`${SIZE[size]} rounded-full border-primary/20 border-t-primary animate-spin`}
        aria-hidden="true"
      />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </output>
  );
}
