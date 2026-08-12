// Demo data for the Student Academic & Performance Management System.
// All names and details are fictional. Replace with API calls later.

export type Student = {
  id: string; // Student ID e.g. STU1001
  name: string;
  roll: string;
  department: string;
  semester: number;
  email: string;
  phone: string;
  status: "Active" | "Inactive";
  joined: string;
};

export type Subject = {
  code: string;
  name: string;
  semester: number;
  credits: number;
  department: string;
};

export type Mark = {
  studentId: string;
  subjectCode: string;
  internal: number; // out of 40
  external: number; // out of 60
};

export type Attendance = {
  studentId: string;
  subjectCode: string;
  totalClasses: number;
  attended: number;
};

export const departments = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
];

export const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

export const academicYears = ["2024-2025", "2025-2026", "2026-2027"];

export const students: Student[] = [
  { id: "STU1001", name: "Aarav Mehta", roll: "CS21-001", department: "Computer Science", semester: 5, email: "aarav.mehta@example.edu", phone: "+91 90000 10001", status: "Active", joined: "2026-07-14" },
  { id: "STU1002", name: "Isha Kulkarni", roll: "CS21-002", department: "Computer Science", semester: 5, email: "isha.kulkarni@example.edu", phone: "+91 90000 10002", status: "Active", joined: "2026-07-14" },
  { id: "STU1003", name: "Rohan Deshmukh", roll: "IT21-011", department: "Information Technology", semester: 5, email: "rohan.deshmukh@example.edu", phone: "+91 90000 10003", status: "Active", joined: "2026-07-16" },
  { id: "STU1004", name: "Meera Nair", roll: "IT21-012", department: "Information Technology", semester: 3, email: "meera.nair@example.edu", phone: "+91 90000 10004", status: "Active", joined: "2026-07-18" },
  { id: "STU1005", name: "Kabir Sharma", roll: "EC21-021", department: "Electronics", semester: 3, email: "kabir.sharma@example.edu", phone: "+91 90000 10005", status: "Inactive", joined: "2026-07-20" },
  { id: "STU1006", name: "Ananya Rao", roll: "EC21-022", department: "Electronics", semester: 5, email: "ananya.rao@example.edu", phone: "+91 90000 10006", status: "Active", joined: "2026-07-21" },
  { id: "STU1007", name: "Vivaan Patil", roll: "ME21-031", department: "Mechanical", semester: 3, email: "vivaan.patil@example.edu", phone: "+91 90000 10007", status: "Active", joined: "2026-07-25" },
  { id: "STU1008", name: "Sanya Gupta", roll: "ME21-032", department: "Mechanical", semester: 5, email: "sanya.gupta@example.edu", phone: "+91 90000 10008", status: "Active", joined: "2026-07-28" },
  { id: "STU1009", name: "Dev Malhotra", roll: "CS21-003", department: "Computer Science", semester: 3, email: "dev.malhotra@example.edu", phone: "+91 90000 10009", status: "Active", joined: "2026-08-01" },
  { id: "STU1010", name: "Tara Iyer", roll: "CS21-004", department: "Computer Science", semester: 5, email: "tara.iyer@example.edu", phone: "+91 90000 10010", status: "Active", joined: "2026-08-04" },
];

export const subjects: Subject[] = [
  { code: "CS501", name: "Database Management Systems", semester: 5, credits: 4, department: "Computer Science" },
  { code: "CS502", name: "Operating Systems", semester: 5, credits: 4, department: "Computer Science" },
  { code: "CS503", name: "Computer Networks", semester: 5, credits: 3, department: "Computer Science" },
  { code: "CS504", name: "Software Engineering", semester: 5, credits: 3, department: "Computer Science" },
  { code: "CS505", name: "Web Technologies", semester: 5, credits: 3, department: "Computer Science" },
  { code: "CS301", name: "Data Structures", semester: 3, credits: 4, department: "Computer Science" },
  { code: "CS302", name: "Discrete Mathematics", semester: 3, credits: 3, department: "Computer Science" },
  { code: "CS303", name: "Digital Electronics", semester: 3, credits: 3, department: "Electronics" },
  { code: "CS304", name: "Object Oriented Programming", semester: 3, credits: 4, department: "Information Technology" },
];

// Marks are generated from a small fixed table so demo data stays stable.
const markSeed: Record<string, number[]> = {
  STU1001: [34, 52, 31, 48, 36, 55, 30, 46, 33, 50],
  STU1002: [30, 44, 28, 41, 32, 47, 29, 43, 31, 45],
  STU1003: [26, 36, 24, 33, 27, 38, 25, 35, 28, 37],
  STU1006: [36, 56, 35, 54, 37, 57, 34, 52, 36, 55],
  STU1008: [22, 28, 20, 26, 24, 30, 21, 27, 23, 29],
  STU1010: [32, 48, 30, 45, 33, 50, 31, 47, 34, 49],
  STU1004: [28, 40, 30, 43, 27, 39, 29, 42, 26, 38],
  STU1005: [18, 24, 20, 22, 19, 26, 17, 23, 21, 25],
  STU1007: [30, 46, 28, 44, 31, 48, 29, 45, 30, 47],
  STU1009: [33, 51, 32, 49, 34, 53, 31, 47, 35, 52],
};

export const marks: Mark[] = students.flatMap((student) => {
  const seed = markSeed[student.id] ?? [25, 35, 25, 35, 25, 35, 25, 35, 25, 35];
  const studentSubjects = subjects.filter((s) => s.semester === student.semester);
  return studentSubjects.map((subject, index) => ({
    studentId: student.id,
    subjectCode: subject.code,
    internal: seed[(index * 2) % seed.length],
    external: seed[(index * 2 + 1) % seed.length],
  }));
});

export const attendance: Attendance[] = students.flatMap((student, sIndex) => {
  const studentSubjects = subjects.filter((s) => s.semester === student.semester);
  return studentSubjects.map((subject, index) => {
    const totalClasses = 50;
    const attended = 50 - ((sIndex * 3 + index * 5) % 20);
    return { studentId: student.id, subjectCode: subject.code, totalClasses, attended };
  });
});

export const recentActivity = [
  { id: 1, text: "Internal marks uploaded for CS501 - Database Management Systems", time: "2 hours ago" },
  { id: 2, text: "Attendance updated for Semester 5, Computer Science", time: "5 hours ago" },
  { id: 3, text: "New student Tara Iyer added to Computer Science", time: "Yesterday" },
  { id: 4, text: "Semester 3 result summary generated", time: "2 days ago" },
  { id: 5, text: "Subject CS505 - Web Technologies created", time: "3 days ago" },
];

/* ---------- Simple helper functions ---------- */

export function getStudent(id: string) {
  return students.find((s) => s.id === id);
}

export function getSubject(code: string) {
  return subjects.find((s) => s.code === code);
}

export function totalOf(mark: Mark) {
  return mark.internal + mark.external;
}

export function gradeOf(total: number) {
  if (total >= 90) return "A+";
  if (total >= 80) return "A";
  if (total >= 70) return "B";
  if (total >= 60) return "C";
  if (total >= 50) return "D";
  if (total >= 40) return "E";
  return "F";
}

export function resultOf(total: number) {
  return total >= 40 ? "Pass" : "Fail";
}

export function marksOfStudent(studentId: string) {
  return marks.filter((m) => m.studentId === studentId);
}

export function attendanceOfStudent(studentId: string) {
  return attendance.filter((a) => a.studentId === studentId);
}

export function attendancePercent(studentId: string) {
  const rows = attendanceOfStudent(studentId);
  if (rows.length === 0) return 0;
  const total = rows.reduce((sum, r) => sum + r.totalClasses, 0);
  const attended = rows.reduce((sum, r) => sum + r.attended, 0);
  return Math.round((attended / total) * 100);
}

export function overallPercent(studentId: string) {
  const rows = marksOfStudent(studentId);
  if (rows.length === 0) return 0;
  const total = rows.reduce((sum, r) => sum + totalOf(r), 0);
  return Math.round(total / rows.length);
}

export function overallResult(studentId: string) {
  const rows = marksOfStudent(studentId);
  if (rows.length === 0) return "Pending";
  return rows.every((r) => totalOf(r) >= 40) ? "Pass" : "Fail";
}

export function averagePercentageAll() {
  const values = students.map((s) => overallPercent(s.id)).filter((v) => v > 0);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function passPercentageAll() {
  const graded = students.filter((s) => marksOfStudent(s.id).length > 0);
  const passed = graded.filter((s) => overallResult(s.id) === "Pass");
  return Math.round((passed.length / graded.length) * 100);
}

export function topStudents(count = 5) {
  return [...students]
    .filter((s) => marksOfStudent(s.id).length > 0)
    .sort((a, b) => overallPercent(b.id) - overallPercent(a.id))
    .slice(0, count);
}

export function studentsNeedingAttention() {
  return students.filter(
    (s) => overallPercent(s.id) < 50 || attendancePercent(s.id) < 75,
  );
}
