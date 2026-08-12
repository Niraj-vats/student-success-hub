import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TableWrapper, Th, Td } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  students,
  marksOfStudent,
  getSubject,
  totalOf,
  gradeOf,
  resultOf,
  overallPercent,
  overallResult,
} from "@/data/demo";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results | Academic Management System" },
      { name: "description", content: "View subject-wise result summary with total marks, percentage, grade and pass status." },
      { property: "og:title", content: "Results | Academic Management System" },
      { property: "og:description", content: "Semester result summary for each student." },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const [studentId, setStudentId] = useState(students[0]!.id);
  const student = students.find((s) => s.id === studentId)!;
  const rows = marksOfStudent(studentId);
  const grandTotal = rows.reduce((sum, r) => sum + totalOf(r), 0);
  const maxTotal = rows.length * 100;
  const percent = overallPercent(studentId);
  const status = overallResult(studentId);

  return (
    <>
      <PageHeader
        title="Results"
        description="Consolidated semester result summary."
        breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "Results" }]}
        actions={
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Result
          </Button>
        }
      />

      <Card className="mb-5">
        <CardContent className="p-5">
          <div className="max-w-md space-y-2">
            <Label htmlFor="result-student">Select student</Label>
            <select
              id="result-student"
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statement of Marks</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Student Name" value={student.name} />
            <Info label="Student ID" value={student.id} />
            <Info label="Roll Number" value={student.roll} />
            <Info label="Department" value={student.department} />
            <Info label="Semester" value={String(student.semester)} />
            <Info label="Email" value={student.email} />
          </dl>

          <TableWrapper>
            <thead>
              <tr>
                <Th>Subject Code</Th>
                <Th>Subject Name</Th>
                <Th>Internal</Th>
                <Th>External</Th>
                <Th>Total</Th>
                <Th>Grade</Th>
                <Th>Result</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => {
                const total = totalOf(m);
                return (
                  <tr key={m.subjectCode}>
                    <Td className="font-medium">{m.subjectCode}</Td>
                    <Td>{getSubject(m.subjectCode)?.name}</Td>
                    <Td>{m.internal}</Td>
                    <Td>{m.external}</Td>
                    <Td className="font-medium">{total}</Td>
                    <Td>{gradeOf(total)}</Td>
                    <Td>
                      <StatusBadge tone={resultOf(total) === "Pass" ? "success" : "danger"}>
                        {resultOf(total)}
                      </StatusBadge>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </TableWrapper>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Info label="Total Marks" value={`${grandTotal} / ${maxTotal}`} />
            <Info label="Percentage" value={`${percent}%`} />
            <Info label="Grade" value={gradeOf(percent)} />
            <div>
              <p className="text-xs text-muted-foreground">Result Status</p>
              <div className="mt-1">
                <StatusBadge tone={status === "Pass" ? "success" : "danger"}>{status}</StatusBadge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
