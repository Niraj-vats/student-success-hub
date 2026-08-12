import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TableWrapper, Th, Td, EmptyRow } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { students, departments, semesters } from "@/data/demo";

export const Route = createFileRoute("/students/")({
  head: () => ({
    meta: [
      { title: "Students | Academic Management System" },
      { name: "description", content: "Search, filter and manage student records by department and semester." },
      { property: "og:title", content: "Students | Academic Management System" },
      { property: "og:description", content: "Manage student records, departments and semesters." },
    ],
  }),
  component: StudentsPage,
});

function StudentsPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [semester, setSemester] = useState("all");
  const [open, setOpen] = useState(false);

  const filtered = students.filter((s) => {
    const text = `${s.name} ${s.id} ${s.roll} ${s.email}`.toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());
    const matchDept = department === "all" || s.department === department;
    const matchSem = semester === "all" || String(s.semester) === semester;
    return matchSearch && matchDept && matchSem;
  });

  return (
    <>
      <PageHeader
        title="Students"
        description="All enrolled students with department and semester details."
        breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "Students" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Student</DialogTitle>
                <DialogDescription>
                  This form is for demonstration only. Data is not saved yet.
                </DialogDescription>
              </DialogHeader>
              <form
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setOpen(false);
                }}
              >
                <Field id="studentId" label="Student ID" placeholder="STU1011" />
                <Field id="name" label="Name" placeholder="Full name" />
                <Field id="roll" label="Roll Number" placeholder="CS21-005" />
                <div className="space-y-2">
                  <Label htmlFor="dept">Department</Label>
                  <select id="dept" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {departments.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sem">Semester</Label>
                  <select id="sem" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {semesters.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <Field id="email" label="Email" type="email" placeholder="name@example.edu" />
                <Field id="phone" label="Phone" placeholder="+91 90000 00000" />
                <DialogFooter className="sm:col-span-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Student</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="mb-5">
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="search">Search student</Label>
            <Input
              id="search"
              placeholder="Name, ID, roll number or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filter-dept">Department</Label>
            <select
              id="filter-dept"
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
            <Label htmlFor="filter-sem">Semester</Label>
            <select
              id="filter-sem"
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
        </CardContent>
      </Card>

      <TableWrapper>
        <thead>
          <tr>
            <Th>Student ID</Th>
            <Th>Name</Th>
            <Th>Roll Number</Th>
            <Th>Department</Th>
            <Th>Semester</Th>
            <Th>Email</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && <EmptyRow colSpan={8} text="No students match your filters." />}
          {filtered.map((s) => (
            <tr key={s.id} className="hover:bg-muted/40">
              <Td className="font-medium">{s.id}</Td>
              <Td>{s.name}</Td>
              <Td>{s.roll}</Td>
              <Td>{s.department}</Td>
              <Td>{s.semester}</Td>
              <Td className="text-muted-foreground">{s.email}</Td>
              <Td>
                <StatusBadge tone={s.status === "Active" ? "success" : "danger"}>{s.status}</StatusBadge>
              </Td>
              <Td>
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon" aria-label={`View ${s.name}`}>
                    <Link to="/students/$studentId" params={{ studentId: s.id }}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={`Edit ${s.name}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={`Delete ${s.name}`}>
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    </>
  );
}

function Field({
  id,
  label,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} placeholder={placeholder} />
    </div>
  );
}
