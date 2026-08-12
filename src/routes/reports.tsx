import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, CalendarCheck, Award, Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TableWrapper, Th, Td } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  students,
  departments,
  semesters,
  academicYears,
  overallPercent,
  attendancePercent,
  overallResult,
  gradeOf,
} from "@/data/demo";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports | Academic Management System" },
      { name: "description", content: "Generate performance, attendance and result reports filtered by department, semester and year." },
      { property: "og:title", content: "Reports | Academic Management System" },
      { property: "og:description", content: "Academic reports with department, semester and year filters." },
    ],
  }),
  component: ReportsPage,
});

type ReportType = "performance" | "attendance" | "result";

const reportOptions: { key: ReportType; title: string; description: string; icon: typeof FileText }[] = [
  { key: "performance", title: "Student Performance Report", description: "Percentage and grade per student", icon: FileText },
  { key: "attendance", title: "Attendance Report", description: "Overall attendance per student", icon: CalendarCheck },
  { key: "result", title: "Result Report", description: "Pass or fail status per student", icon: Award },
];

function ReportsPage() {
  const [report, setReport] = useState<ReportType>("performance");
  const [department, setDepartment] = useState("all");
  const [semester, setSemester] = useState("all");
  const [year, setYear] = useState(academicYears[1]!);

  const rows = students.filter(
    (s) =>
      (department === "all" || s.department === department) &&
      (semester === "all" || String(s.semester) === semester),
  );

  return (
    <>
      <PageHeader
        title="Reports"
        description="Generate academic reports using demo data."
        breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "Reports" }]}
        actions={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        {reportOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setReport(option.key)}
            className={`rounded-lg border p-5 text-left transition-colors ${
              report === option.key
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:bg-accent"
            }`}
          >
            <option.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-sm font-semibold text-foreground">{option.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
          </button>
        ))}
      </div>

      <Card className="mb-5">
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="rep-dept">Department</Label>
            <select
              id="rep-dept"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="all">All departments</option>
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rep-sem">Semester</Label>
            <select
              id="rep-sem"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              <option value="all">All semesters</option>
              {semesters.map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rep-year">Academic Year</Label>
            <select
              id="rep-year"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              {academicYears.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {reportOptions.find((o) => o.key === report)?.title} — {year}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TableWrapper>
            <thead>
              <tr>
                <Th>Student</Th>
                <Th>Roll Number</Th>
                <Th>Department</Th>
                <Th>Semester</Th>
                {report === "performance" && (
                  <>
                    <Th>Percentage</Th>
                    <Th>Grade</Th>
                  </>
                )}
                {report === "attendance" && (
                  <>
                    <Th>Attendance %</Th>
                    <Th>Status</Th>
                  </>
                )}
                {report === "result" && (
                  <>
                    <Th>Percentage</Th>
                    <Th>Result</Th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const pct = overallPercent(s.id);
                const att = attendancePercent(s.id);
                const res = overallResult(s.id);
                return (
                  <tr key={s.id}>
                    <Td className="font-medium">{s.name}</Td>
                    <Td>{s.roll}</Td>
                    <Td>{s.department}</Td>
                    <Td>{s.semester}</Td>
                    {report === "performance" && (
                      <>
                        <Td>{pct}%</Td>
                        <Td>{gradeOf(pct)}</Td>
                      </>
                    )}
                    {report === "attendance" && (
                      <>
                        <Td>{att}%</Td>
                        <Td>
                          <StatusBadge tone={att < 75 ? "warning" : "success"}>
                            {att < 75 ? "Shortage" : "Good"}
                          </StatusBadge>
                        </Td>
                      </>
                    )}
                    {report === "result" && (
                      <>
                        <Td>{pct}%</Td>
                        <Td>
                          <StatusBadge tone={res === "Pass" ? "success" : "danger"}>{res}</StatusBadge>
                        </Td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </TableWrapper>
        </CardContent>
      </Card>
    </>
  );
}
