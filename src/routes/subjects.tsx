import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { TableWrapper, Th, Td, EmptyRow } from "@/components/DataTable";
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
import { subjects, semesters, departments } from "@/data/demo";

export const Route = createFileRoute("/subjects")({
  head: () => ({
    meta: [
      { title: "Subjects | Academic Management System" },
      { name: "description", content: "Manage subject codes, names, semesters and credits for each department." },
      { property: "og:title", content: "Subjects | Academic Management System" },
      { property: "og:description", content: "Subject catalogue with semester and credit details." },
    ],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const [search, setSearch] = useState("");
  const [semester, setSemester] = useState("all");
  const [open, setOpen] = useState(false);

  const filtered = subjects.filter((s) => {
    const matchSearch = `${s.code} ${s.name}`.toLowerCase().includes(search.toLowerCase());
    const matchSem = semester === "all" || String(s.semester) === semester;
    return matchSearch && matchSem;
  });

  return (
    <>
      <PageHeader
        title="Subjects"
        description="Subjects offered across semesters and departments."
        breadcrumbs={[{ label: "Dashboard", to: "/" }, { label: "Subjects" }]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Subject</DialogTitle>
                <DialogDescription>Demo form — data is not saved yet.</DialogDescription>
              </DialogHeader>
              <form
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setOpen(false);
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="code">Subject Code</Label>
                  <Input id="code" placeholder="CS506" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sname">Subject Name</Label>
                  <Input id="sname" placeholder="Cloud Computing" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ssem">Semester</Label>
                  <select id="ssem" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {semesters.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input id="credits" type="number" min={1} max={6} placeholder="4" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="sdept">Department</Label>
                  <select id="sdept" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {departments.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <DialogFooter className="sm:col-span-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Subject</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="mb-5">
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="subject-search">Search</Label>
            <Input
              id="subject-search"
              placeholder="Subject code or name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject-sem">Semester</Label>
            <select
              id="subject-sem"
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
            <Th>Subject Code</Th>
            <Th>Subject Name</Th>
            <Th>Semester</Th>
            <Th>Credits</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && <EmptyRow colSpan={5} text="No subjects match your filters." />}
          {filtered.map((s) => (
            <tr key={s.code} className="hover:bg-muted/40">
              <Td className="font-medium">{s.code}</Td>
              <Td>{s.name}</Td>
              <Td>{s.semester}</Td>
              <Td>{s.credits}</Td>
              <Td>
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" aria-label={`Edit ${s.code}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label={`Delete ${s.code}`}>
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
