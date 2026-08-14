import sqlite3
import os
import sys

# Add parent directory to path to import database.py
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import get_db_connection

def migrate():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("Starting Phase 2A migration...")
    
    # 1. Create new tables
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        department_code TEXT UNIQUE NOT NULL,
        department_name TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        class_name TEXT NOT NULL,
        department_id INTEGER NOT NULL,
        semester INTEGER NOT NULL,
        section TEXT NOT NULL,
        academic_year TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
        UNIQUE(department_id, semester, section, academic_year)
    )
    ''')
    
    # 2. Update students table (add class_id)
    # Check if column exists
    cursor.execute("PRAGMA table_info(students)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'class_id' not in columns:
        print("Adding class_id to students table...")
        cursor.execute("ALTER TABLE students ADD COLUMN class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL")
    
    # 3. Update teachers table (add teacher_code)
    cursor.execute("PRAGMA table_info(teachers)")
    columns = [col[1] for col in cursor.fetchall()]
    if 'teacher_code' not in columns:
        print("Adding teacher_code to teachers table...")
        cursor.execute("ALTER TABLE teachers ADD COLUMN teacher_code TEXT UNIQUE")
    
    # 4. Create teacher_assignments table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS teacher_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teacher_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        assigned_by INTEGER,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE(teacher_id, class_id, subject_id)
    )
    ''')
    
    # 5. Insert demo data for Phase 2A if empty
    cursor.execute("SELECT COUNT(*) FROM departments")
    if cursor.fetchone()[0] == 0:
        print("Inserting demo departments...")
        departments = [
            ('CSE', 'Computer Science & Engineering'),
            ('ECE', 'Electronics & Communication Engineering'),
            ('ME', 'Mechanical Engineering')
        ]
        cursor.executemany("INSERT INTO departments (department_code, department_name) VALUES (?, ?)", departments)
        
        # Get CSE dept id
        cursor.execute("SELECT id FROM departments WHERE department_code = 'CSE'")
        cse_id = cursor.fetchone()[0]
        
        print("Inserting demo classes...")
        classes = [
            ('CSE-6-A', cse_id, 6, 'A', '2026-27'),
            ('CSE-6-B', cse_id, 6, 'B', '2026-27')
        ]
        cursor.executemany("INSERT INTO classes (class_name, department_id, semester, section, academic_year) VALUES (?, ?, ?, ?, ?)", classes)
        
        # Link existing CSE students to the new class
        cursor.execute("SELECT id FROM classes WHERE class_name = 'CSE-6-A'")
        class_a_id = cursor.fetchone()[0]
        
        cursor.execute("UPDATE students SET class_id = ? WHERE department = 'Computer Science'", (class_a_id,))
        
        # Seed some teachers with codes if they don't have them
        cursor.execute("SELECT id FROM teachers WHERE teacher_code IS NULL")
        teachers_without_code = cursor.fetchall()
        for idx, (t_id,) in enumerate(teachers_without_code):
            cursor.execute("UPDATE teachers SET teacher_code = ? WHERE id = ?", (f'T{1000 + idx}', t_id))
            
        # Add new demo teachers if none exist
        cursor.execute("SELECT COUNT(*) FROM teachers")
        if cursor.fetchone()[0] == 0:
            teachers = [
                ('T1001', 'Dr. Alan Turing', 'alan@example.com', 'CSE'),
                ('T1002', 'Dr. Grace Hopper', 'grace@example.com', 'CSE')
            ]
            cursor.executemany("INSERT INTO teachers (teacher_code, name, email, department) VALUES (?, ?, ?, ?)", teachers)
            
            # Create user accounts for these teachers (password: teacher123)
            from werkzeug.security import generate_password_hash
            pw_hash = generate_password_hash('teacher123')
            
            cursor.execute("SELECT id, name FROM teachers")
            new_teachers = cursor.fetchall()
            for t_id, t_name in new_teachers:
                username = t_name.lower().replace(' ', '').replace('.', '')
                cursor.execute("INSERT OR IGNORE INTO users (username, password_hash, role, teacher_id) VALUES (?, ?, 'Teacher', ?)",
                               (username, pw_hash, t_id))

    conn.commit()
    conn.close()
    print("Phase 2A migration completed successfully.")

if __name__ == '__main__':
    migrate()
