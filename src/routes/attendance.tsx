import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { TableWrapper, Th, Td, EmptyRow } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { students, subjects, semesters, attendance, getSubject, getStudent } from "@/data/demo";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance | Academic Management System" },
      { name: "description", content: "Track subject-wise attendance and highlight students below the 75% requirement." },
      { property: "og:title", content: "Attendance | Academic Management System" },
      { property: "og:description", content: "Subject-wise attendance records with shortage warnings." },
    ],
  }),
  component: AttendancePage,
});

function AttendancePage() {
  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState("all");
  const [subjectCode, setSubjectCode] = useState("all");

  const rows = attendance.filter((a) => {
    const student = getStudent(a.studentId)!;
    const matchSearch = `${student.name} ${student.roll} ${student.id}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchSem = semester === "all" || String(student.semester) === semester;
    const matchSubject = subjectCode === "all" || a.subjectCode === subjectCode;
    return matchSearch && matchSem && matchSubject;
  });

  return (
    <>
      <PageHeader
        title="Attendance"
        description="Attendance below 75% is flagged as a shortage."
        breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "Attendance" }]}
      />

      <Card className="mb-5">
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="att-search">Student search</Label>
            <Input
              id="att-search"
              placeholder="Name, roll number or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="att-sem">Semester</Label>
            <select
              id="att-sem"
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
            <Label htmlFor="att-subject">Subject</Label>
            <select
              id="att-subject"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
            >
              <option value="all">All subjects</option>
              {subjects.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.code} — {s.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <TableWrapper>
        <thead>
          <tr>
            <Th>Student</Th>
            <Th>Subject</Th>
            <Th>Total Classes</Th>
            <Th>Attended</Th>
            <Th>Attendance %</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <EmptyRow colSpan={6} text="No attendance records match your filters." />}
          {rows.map((a) => {
            const pct = Math.round((a.attended / a.totalClasses) * 100);
            const student = getStudent(a.studentId)!;
            return (
              <tr key={`${a.studentId}-${a.subjectCode}`} className="hover:bg-muted/40">
                <Td>
                  <span className="font-medium">{student.name}</span>
                  <span className="block text-xs text-muted-foreground">{student.roll}</span>
                </Td>
                <Td>
                  {a.subjectCode} — {getSubject(a.subjectCode)?.name}
                </Td>
                <Td>{a.totalClasses}</Td>
                <Td>{a.attended}</Td>
                <Td className={pct < 75 ? "font-medium text-warning" : "font-medium"}>{pct}%</Td>
                <Td>
                  <StatusBadge tone={pct < 75 ? "warning" : "success"}>
                    {pct < 75 ? "Shortage" : "Good"}
                  </StatusBadge>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </TableWrapper>
    </>
  );
}
