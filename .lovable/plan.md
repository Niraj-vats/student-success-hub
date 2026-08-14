# Phase 2A: Database Foundation and Admin Management UI

The goal of Phase 2A is to establish a robust database foundation for relationships between Admins, Teachers, Departments, Classes, Subjects, and Students, along with the necessary CRUD interfaces and APIs.

## User Review Required

> [!IMPORTANT]
> The existing `teachers` table will be updated to include `teacher_code` and `email` as unique identifiers. Existing academic data (Students, Marks, Attendance) will be preserved, and students will be optionally linked to new classes.

## Proposed Changes

### Database & Backend
- **Schema Migration**:
    - Update `teachers` table: Add `teacher_code` (UNIQUE), `email` (UNIQUE), and ensure consistency.
    - Create `departments` table: `id`, `department_code` (UNIQUE), `department_name` (UNIQUE).
    - Create `classes` table: `id`, `class_name`, `department_id`, `semester`, `section`, `academic_year`. Add UNIQUE constraint on `(department_id, semester, section, academic_year)`.
    - Create `teacher_assignments` table: `id`, `teacher_id`, `class_id`, `subject_id`, `assigned_at`, `assigned_by`. Add UNIQUE constraint on `(teacher_id, class_id, subject_id)`.
    - Update `students` table: Add `class_id` (FOREIGN KEY → `classes.id`).
- **Flask APIs**:
    - Implement GET/POST for `/api/departments`, `/api/classes`, `/api/teachers`.
    - Implement full CRUD (GET/POST/PUT/DELETE) for `/api/teacher-assignments`.
    - All APIs will use parameterized queries and require an authenticated session.
- **Seeding**: Add minimal demo data for Departments, Classes, and Teacher Assignments.

### Frontend UI
- **New Management Pages**:
    - `frontend/departments.html` & `js/departments.js`: CRUD for departments.
    - `frontend/classes.html` & `js/classes.js`: CRUD for classes.
    - `frontend/teachers.html` & `js/teachers.js`: CRUD for teachers.
    - `frontend/teacher-assignments.html` & `js/teacher-assignments.js`: CRUD for assigning teachers to class-subject combinations.
- **Navigation**: Update the sidebar across all pages to include links to the new management sections.
- **Form Handling**: Use dynamic dropdowns for selecting Teachers, Classes, and Subjects in assignment forms.

### Security & Verification
- **Strict Read-Only Audit**:
    - Verify migration success and data preservation.
    - Test all new APIs for correct error handling and authentication checks.
    - Ensure `npm run build` succeeds.
    - Confirm no plaintext passwords or security regressions.

## Technical Details
- **Architecture**: Vanilla JS (fetch) ↔ Flask ↔ SQLite.
- **Data Integrity**: Enforce foreign key constraints in SQLite.
- **Build**: Ensure all new JS files are loaded as ES modules to satisfy the Vite build process.
