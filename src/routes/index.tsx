import { createFileRoute, Link } from "@tanstack/react-router";
import { Users, BookOpen, Percent, GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { TableWrapper, Th, Td } from "@/components/DataTable";
import { StatusBadge, resultTone } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  students,
  subjects,
  averagePercentageAll,
  passPercentageAll,
  topStudents,
  studentsNeedingAttention,
  overallPercent,
  attendancePercent,
  recentActivity,
} from "@/data/demo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard | Student Academic & Performance Management" },
      {
        name: "description",
        content:
          "Overview of students, subjects, average percentage and pass rate for the academic management system.",
      },
      { property: "og:title", content: "Dashboard | Student Academic Management" },
      {
        property: "og:description",
        content: "Track students, marks, attendance and academic results in one place.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const recent = [...students].slice(-5).reverse();
  const attention = studentsNeedingAttention();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Summary of academic performance across the institution."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Dashboard" }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={students.length} hint="Enrolled this year" icon={Users} />
        <StatCard label="Total Subjects" value={subjects.length} hint="Across all semesters" icon={BookOpen} />
        <StatCard label="Average Percentage" value={`${averagePercentageAll()}%`} hint="All students" icon={Percent} />
        <StatCard label="Pass Percentage" value={`${passPercentageAll()}%`} hint="Current results" icon={GraduationCap} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Students</CardTitle>
          </CardHeader>
          <CardContent>
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Student ID</Th>
                  <Th>Name</Th>
                  <Th>Department</Th>
                  <Th>Semester</Th>
                </tr>
              </thead>
              <tbody>
                {recent.map((s) => (
                  <tr key={s.id}>
                    <Td className="font-medium">{s.id}</Td>
                    <Td>
                      <Link to="/students/$studentId" params={{ studentId: s.id }} className="text-primary hover:underline">
                        {s.name}
                      </Link>
                    </Td>
                    <Td>{s.department}</Td>
                    <Td>{s.semester}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrapper>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Performing Students</CardTitle>
          </CardHeader>
          <CardContent>
            <TableWrapper>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Roll Number</Th>
                  <Th>Percentage</Th>
                  <Th>Attendance</Th>
                </tr>
              </thead>
              <tbody>
                {topStudents().map((s) => (
                  <tr key={s.id}>
                    <Td>{s.name}</Td>
                    <Td>{s.roll}</Td>
                    <Td className="font-medium">{overallPercent(s.id)}%</Td>
                    <Td>{attendancePercent(s.id)}%</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrapper>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Students Requiring Attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {attention.length === 0 && (
              <p className="text-sm text-muted-foreground">All students are performing within expectations.</p>
            )}
            {attention.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.roll} · {s.department}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge tone={overallPercent(s.id) < 50 ? "danger" : "neutral"}>
                    {overallPercent(s.id)}% marks
                  </StatusBadge>
                  <StatusBadge tone={attendancePercent(s.id) < 75 ? "warning" : "neutral"}>
                    {attendancePercent(s.id)}% attendance
                  </StatusBadge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Academic Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentActivity.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm text-foreground">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Status: <StatusBadge tone={resultTone("Active")}>Demo data</StatusBadge> — no backend connected yet.
      </p>
    </>
  );
}
