import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { TableWrapper, Th, Td, EmptyRow } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  students,
  subjects,
  marksOfStudent,
  getSubject,
  totalOf,
  gradeOf,
  resultOf,
} from "@/data/demo";

export const Route = createFileRoute("/marks")({
  head: () => ({
    meta: [
      { title: "Marks | Academic Management System" },
      { name: "description", content: "Enter and review internal, external and total marks with grades per subject." },
      { property: "og:title", content: "Marks | Academic Management System" },
      { property: "og:description", content: "Subject-wise internal and external marks entry." },
    ],
  }),
  component: MarksPage,
});

function MarksPage() {
  const [studentId, setStudentId] = useState(students[0]!.id);
  const [internal, setInternal] = useState("");
  const [external, setExternal] = useState("");

  const student = students.find((s) => s.id === studentId)!;
  const semesterSubjects = subjects.filter((s) => s.semester === student.semester);
  const [subjectCode, setSubjectCode] = useState(semesterSubjects[0]?.code ?? "");

  const total = (Number(internal) || 0) + (Number(external) || 0);
  const rows = marksOfStudent(studentId);

  return (
    <>
      <PageHeader
        title="Marks"
        description="Record internal and external marks for a student and subject."
        breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "Marks" }]}
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Marks Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <select
                id="student"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  const next = students.find((s) => s.id === e.target.value)!;
                  const first = subjects.find((sub) => sub.semester === next.semester);
                  setSubjectCode(first?.code ?? "");
                }}
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.roll})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Input id="semester" value={`Semester ${student.semester}`} readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <select
                id="subject"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={subjectCode}
                onChange={(e) => setSubjectCode(e.target.value)}
              >
                {semesterSubjects.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="internal">Internal Marks (out of 40)</Label>
              <Input
                id="internal"
                type="number"
                min={0}
                max={40}
                value={internal}
                onChange={(e) => setInternal(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="external">External Marks (out of 60)</Label>
              <Input
                id="external"
                type="number"
                min={0}
                max={60}
                value={external}
                onChange={(e) => setExternal(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total">Total Marks</Label>
              <Input id="total" value={total} readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Input id="grade" value={gradeOf(total)} readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Result Status</Label>
              <Input id="status" value={resultOf(total)} readOnly />
            </div>

            <div className="flex items-end">
              <Button type="submit" className="w-full sm:w-auto">
                Save Marks
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <h2 className="mb-3 text-sm font-semibold text-foreground">
        Recorded marks — {student.name}
      </h2>
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
          {rows.length === 0 && <EmptyRow colSpan={7} text="No marks recorded for this student." />}
          {rows.map((m) => {
            const rowTotal = totalOf(m);
            return (
              <tr key={m.subjectCode}>
                <Td className="font-medium">{m.subjectCode}</Td>
                <Td>{getSubject(m.subjectCode)?.name}</Td>
                <Td>{m.internal}</Td>
                <Td>{m.external}</Td>
                <Td className="font-medium">{rowTotal}</Td>
                <Td>{gradeOf(rowTotal)}</Td>
                <Td>
                  <StatusBadge tone={resultOf(rowTotal) === "Pass" ? "success" : "danger"}>
                    {resultOf(rowTotal)}
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
