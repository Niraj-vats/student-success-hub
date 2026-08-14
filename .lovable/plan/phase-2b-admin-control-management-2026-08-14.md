# Phase 2B: Admin Control & Management

Goal: Centralize management authority for the Admin role. Implement Admin-only backend protection, user management UI, and enhanced dashboard statistics.

## Technical Details

### Backend (Python/Flask)
1. **Admin Authorization**:
    - Add `admin_required` decorator in `backend/app.py`.
2. **Protect Management APIs**:
    - Apply `@admin_required` to POST/PUT/DELETE for:
        - Departments
        - Classes
        - Teachers
        - Teacher Assignments
3. **User Management APIs**:
    - Implement GET/POST/PUT/DELETE for `/api/users`.
    - `POST /api/users` for creating Teacher/Student logins (linked to existing profiles).
    - `PUT /api/users/<id>/status` to toggle `is_active`.
    - `PUT /api/users/<id>/password` for reset.
    - Password storage via `werkzeug.security` hashing.
4. **Enhanced Stats API**:
    - Update `get_dashboard_stats` to include totals for teachers, departments, classes, and users.
5. **Safe Deletion**:
    - Add dependency checks before deleting Departments, Classes, or Teachers.

### Database (SQLite)
1. **Schema Update**:
    - Ensure `users` table has `is_active` (boolean, default true).
2. **Migration**:
    - Add `is_active` to `users` if missing.

### Frontend (HTML/JS)
1. **User Management**:
    - Create `frontend/users.html` and `frontend/js/users.js`.
2. **Admin Guard**:
    - Update `frontend/js/auth-check.js` to include an `adminOnly` check.
3. **Dashboard Update**:
    - Update `frontend/index.html` and `frontend/js/app.js` with new stats and "Administration" links.
4. **Sidebar Navigation**:
    - Add "Users" link to the sidebar in all HTML files.

## User Review Required

> [!IMPORTANT]
> The admin-only restrictions will block Teachers and Students from managing fundamental data. Are you ready to enforce this shift in control?

- **Default Admin**: `admin` / `admin123` will remain the primary entry point.
- **Safe Delete**: Deletion will be rejected if dependencies exist (e.g., cannot delete a department with active students).
