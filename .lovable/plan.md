# Project Rebuild Plan

## Goal
Rebuild the "Student Academic & Performance Management System" using a simpler stack: HTML/CSS/Vanilla JS (Frontend), Python/Flask (Backend), and SQLite (Database). This prioritizes developer understanding and simplicity over complex frameworks.

## 1. Backend Implementation (Python/Flask/SQLite)
- **Database Schema**: Create `backend/schema.sql` with tables for `students`, `subjects`, `marks`, and `attendance`.
- **Database Helper**: Create `backend/database.py` for SQLite connection and basic queries.
- **Flask Application**: Create `backend/app.py` with REST API endpoints for all CRUD operations.
- **Seeding**: Create `backend/seed.py` to populate the database with initial demo data.

## 2. Frontend Implementation (HTML/CSS/Vanilla JS)
- **Layout**: Create a single `index.html` (or separate pages as requested) with a common CSS file.
- **Components**: Use simple HTML/CSS for the Sidebar, Header, Cards, and Tables.
- **State Management**: Use Vanilla JS to fetch data from the Flask API and update the DOM.
- **Modules**:
    - `frontend/index.html` (Dashboard)
    - `frontend/students.html` (Student Management)
    - `frontend/subjects.html` (Subject Management)
    - `frontend/marks.html` (Marks Entry)
    - `frontend/attendance.html` (Attendance Tracker)
    - `frontend/performance.html` (Visual Reports)
    - `frontend/results.html` (Student Result Card)
    - `frontend/reports.html` (Consolidated Reports)

## 3. Deployment / Integration
- Configure the Vite dev server to serve the static frontend and proxy API requests to Flask.
- Alternatively, provide a simple way to run the project with Python.

## 4. Cleanup
- Remove `src/` directory (React/TypeScript).
- Remove `package.json` dependencies related to React/TanStack.
- Simplify the project root.

## Technical Details
- **Frontend**: Vanilla JS (fetch API), Tailwind CSS (via CDN or simple CSS).
- **Backend**: Flask, Flask-CORS, SQLite3.
- **Architecture**: Simple Client-Server model.

## Folder Structure
```text
/
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── schema.sql
│   └── seed.py
├── frontend/
│   ├── index.html
│   ├── students.html
│   ├── ... (other pages)
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js
│       ├── students.js
│       └── ... (other scripts)
├── data/ (SQLite db file)
└── README.md
```
