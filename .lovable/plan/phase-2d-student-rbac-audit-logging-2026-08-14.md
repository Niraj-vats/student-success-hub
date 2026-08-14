# Phase 2D: Student RBAC & Audit Logging

Implement Role-Based Access Control for Students to ensure they only access their own data, and create a comprehensive Audit Logging system for all critical actions.

## User Review Required

> [!IMPORTANT]
> The plan follows a strict "Backend First" security model. I will be modifying `backend/app.py` significantly to enforce ownership checks.

- **Student RBAC**: Students will only be able to see their own profile, marks, attendance, performance, and results. Management links will be hidden from their sidebar.
- **Audit Logs**: Every CREATE, UPDATE, DELETE operation will be recorded in a new `audit_logs` table, along with LOGIN/LOGOUT events.
- **Admin Management**: Admins will gain a new "Audit Logs" page to monitor system activity.

## Proposed Changes

### Database
- Update `backend/schema.sql` to include the `audit_logs` table.
- Create `backend/migrate_phase_2d.py` to add the table to the existing database.

### Backend (Python Flask)
- Implement `student_required` decorator (which allows Admin, Teacher, and authorized Student).
- Implement `log_audit` helper function to record actions.
- Update all CRUD endpoints (Students, Subjects, Marks, Attendance, Departments, Classes, Assignments, Users) to call `log_audit`.
- Implement ownership enforcement in `backend/app.py`:
  - `GET /api/students/<id>`: Allow Student only if it's their own ID.
  - `GET /api/marks`: Filter by `student_id` if the user is a Student.
  - `GET /api/attendance`: Filter by `student_id` if the user is a Student.
  - `GET /api/performance/<id>`: Allow Student only if it's their own ID.
  - `GET /api/results/<id>`: Allow Student only if it's their own ID.
- Add `GET /api/audit-logs` endpoint (Admin only).

### Frontend (HTML/JS)
- **Navigation**: Update `frontend/js/auth-check.js` to dynamically hide sidebar links based on roles (Admin vs Teacher vs Student).
- **Dashboard**: Update `frontend/js/app.js` to show student-specific stats when logged in as a Student.
- **Student Views**: Ensure `marks.js`, `attendance.js`, etc., handle the student role by hiding action buttons (Add/Edit/Delete).
- **Audit Logs**: 
  - Create `frontend/audit-logs.html`.
  - Create `frontend/js/audit-logs.js`.

## Technical Details

- **Audit Log Table Schema**:
  ```sql
  CREATE TABLE audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      username TEXT,
      role TEXT,
      action TEXT,
      table_name TEXT,
      record_id INTEGER,
      description TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
  );
  ```
- **Security**: The backend will never trust `student_id` provided by the frontend for student-role requests; it will always use `session.get('student_id')`.
- **Build**: No new libraries will be added. All code remains Vanilla JS and Flask.

## Verification Plan

### Automated Tests
- Run a security audit script (Python) to verify:
  - Student A cannot access Student B's details/marks/attendance.
  - Student cannot perform POST/PUT/DELETE on any academic records.
  - Teacher cannot access audit logs.
  - Audit logs are created on login/logout and CRUD actions.

### Manual Verification
- Login as Student: Check sidebar visibility and dashboard stats.
- Login as Admin: Check audit logs page functionality.
- Run `npm run build` to ensure project integrity.
