import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  students,
  marksOfStudent,
  getSubject,
  totalOf,
  overallPercent,
  attendancePercent,
} from "@/data/demo";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "Performance | Academic Management System" },
      { name: "description", content: "Analyse a student's overall percentage, best and weakest subjects and attendance." },
      { property: "og:title", content: "Performance | Academic Management System" },
      { property: "og:description", content: "Subject-wise performance overview for each student." },
    ],
  }),
  component: PerformancePage,
});

function PerformancePage() {
  const [studentId, setStudentId] = useState(students[0]!.id);
  const student = students.find((s) => s.id === studentId)!;
  const rows = marksOfStudent(studentId).map((m) => ({
    code: m.subjectCode,
    name: getSubject(m.subjectCode)?.name ?? m.subjectCode,
    total: totalOf(m),
  }));

  const sorted = [...rows].sort((a, b) => b.total - a.total);
  const best = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const average = rows.length ? Math.round(rows.reduce((sum, r) => sum + r.total, 0) / rows.length) : 0;

  return (
    <>
      <PageHeader
        title="Performance"
        description="Subject-wise academic performance for a selected student."
        breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "Performance" }]}
      />

      <Card className="mb-5">
        <CardContent className="p-5">
          <div className="max-w-md space-y-2">
            <Label htmlFor="perf-student">Select student</Label>
            <select
              id="perf-student"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.roll})
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Overall Percentage" value={`${overallPercent(studentId)}%`} />
        <Metric label="Average Marks" value={String(average)} />
        <Metric label="Best Subject" value={best ? `${best.code} (${best.total})` : "—"} />
        <Metric label="Weakest Subject" value={weakest ? `${weakest.code} (${weakest.total})` : "—"} />
        <Metric label="Attendance" value={`${attendancePercent(studentId)}%`} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Subject-wise Performance — {student.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {rows.length === 0 && <p className="text-sm text-muted-foreground">No marks recorded yet.</p>}
          {rows.map((r) => (
            <div key={r.code}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-foreground">
                  {r.code} — {r.name}
                </span>
                <span className="font-medium text-foreground">{r.total}/100</span>
              </div>
              {/* Simple lightweight bar visualization (no chart library) */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${r.total < 40 ? "bg-danger" : "bg-primary"}`}
                  style={{ width: `${r.total}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
