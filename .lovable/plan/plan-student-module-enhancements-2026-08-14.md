# Plan: Student Module Enhancements

Complete the Student Module with search, filtering, and a dedicated details page while maintaining the requested simple tech stack.

## User Review Required

> [!IMPORTANT]
> - I will add a search bar and filter dropdowns to the top of the Students page.
> - The search will be client-side (no new backend API needed).
> - Student Details will be a new page fetching data from the existing Flask endpoint.

## Proposed Changes

### 1. Student Search and Filter (Frontend)
- Update `frontend/students.html` to include search input and filter selects (Department, Semester).
- Modify `frontend/js/students.js` to implement `filterStudents()` function.
- Store the full student list in a local variable after fetching to enable fast client-side filtering.

### 2. Student Details Page (Frontend)
- Create `frontend/student-details.html` with a clean profile layout.
- Create `frontend/js/student-details.js` to:
    - Parse `id` from URL query parameters.
    - Fetch student data from `/api/students/<id>`.
    - Display profile info and placeholders for Marks/Attendance.
    - Handle errors (404, network issues).

### 3. Navigation (Frontend)
- Update `frontend/js/students.js` to add a "View" button to each row in the student table.
- Link the "View" button to `student-details.html?id=<id>`.

### 4. Backend (Backend)
- No changes expected for `backend/app.py` as it already supports `GET /api/students/<id>`.

## Technical Details
- **Stack**: HTML5, CSS3, Vanilla JS (ES Modules), Python 3.x (Flask), SQLite3.
- **Search Logic**: Case-insensitive substring match on multiple fields.
- **Filter Logic**: Exact match for Semester/Department (if selected).
- **Responsiveness**: Use existing CSS grid/flexbox patterns to ensure the new details page works on mobile.
