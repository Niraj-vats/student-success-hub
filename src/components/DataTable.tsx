import type { ReactNode } from "react";

/** Simple wrapper that keeps tables readable and horizontally scrollable on mobile. */
export function TableWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[640px] text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={`whitespace-nowrap border-b border-border bg-muted/60 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <td className={`border-b border-border px-4 py-3 align-middle text-foreground ${className}`}>
      {children}
    </td>
  );
}

export function EmptyRow({ colSpan, text = "No records found." }: { colSpan: number; text?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-muted-foreground">
        {text}
      </td>
    </tr>
  );
}
