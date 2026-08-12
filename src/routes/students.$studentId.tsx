import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { TableWrapper, Th, Td } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getStudent,
  getSubject,
  marksOfStudent,
  attendanceOfStudent,
  totalOf,
  gradeOf,
  resultOf,
  overallPercent,
  overallResult,
  attendancePercent,
} from "@/data/demo";

export const Route = createFileRoute("/students/$studentId")({
  head: () => ({
    meta: [
      { title: "Student Details | Academic Management System" },
      { name: "description", content: "Student profile with marks, attendance, percentage, grade and result status." },
      { property: "og:title", content: "Student Details | Academic Management System" },
      { property: "og:description", content: "Full academic profile for an individual student." },
    ],
  }),
  component: StudentDetails,
});

function StudentDetails() {
  const { studentId } = Route.useParams();
  const student = getStudent(studentId);

  if (!student) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Student not found.</p>
          <Button asChild className="mt-4">
            <Link to="/students">Back to Students</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const studentMarks = marksOfStudent(student.id);
  const percent = overallPercent(student.id);
  const result = overallResult(student.id);

  return (
    <>
      <PageHeader
        title={student.name}
        description={`${student.roll} · ${student.department} · Semester ${student.semester}`}
        breadcrumbs={[
          { label: "Dashboard", to: "/" },
          { label: "Students", to: "/students" },
          { label: student.name },
        ]}
        actions={
          <Button asChild variant="outline">
            <Link to="/students">Back to list</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                {student.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <div>
                <p className="font-medium text-foreground">{student.name}</p>
                <StatusBadge tone={student.status === "Active" ? "success" : "danger"}>
                  {student.status}
                </StatusBadge>
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <Row label="Student ID" value={student.id} />
              <Row label="Roll Number" value={student.roll} />
              <Row label="Department" value={student.department} />
              <Row label="Semester" value={String(student.semester)} />
              <Row label="Email" value={student.email} />
              <Row label="Phone" value={student.phone} />
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Academic Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Summary label="Overall Percentage" value={`${percent}%`} />
            <Summary label="Overall Grade" value={gradeOf(percent)} />
            <Summary label="Attendance" value={`${attendancePercent(student.id)}%`} />
            <Summary label="Result Status" value={result} />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Subject-wise Marks</CardTitle>
        </CardHeader>
        <CardContent>
          <TableWrapper>
            <thead>
              <tr>
                <Th>Subject Code</Th>
                <Th>Subject Name</Th>
                <Th>Internal (40)</Th>
                <Th>External (60)</Th>
                <Th>Total (100)</Th>
                <Th>Grade</Th>
                <Th>Result</Th>
              </tr>
            </thead>
            <tbody>
              {studentMarks.map((m) => {
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
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Attendance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <TableWrapper>
            <thead>
              <tr>
                <Th>Subject</Th>
                <Th>Total Classes</Th>
                <Th>Attended</Th>
                <Th>Percentage</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {attendanceOfStudent(student.id).map((a) => {
                const pct = Math.round((a.attended / a.totalClasses) * 100);
                return (
                  <tr key={a.subjectCode}>
                    <Td>
                      {a.subjectCode} — {getSubject(a.subjectCode)?.name}
                    </Td>
                    <Td>{a.totalClasses}</Td>
                    <Td>{a.attended}</Td>
                    <Td className="font-medium">{pct}%</Td>
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
        </CardContent>
      </Card>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
