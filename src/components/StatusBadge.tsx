type Tone = "success" | "warning" | "danger" | "neutral";

const toneClasses: Record<Tone, string> = {
  success: "bg-success-muted text-success",
  warning: "bg-warning-muted text-warning",
  danger: "bg-danger-muted text-danger",
  neutral: "bg-muted text-muted-foreground",
};

export function StatusBadge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

export function resultTone(status: string): Tone {
  if (status === "Pass" || status === "Active" || status === "Good") return "success";
  if (status === "Fail" || status === "Inactive") return "danger";
  if (status === "Low" || status === "Shortage") return "warning";
  return "neutral";
}
