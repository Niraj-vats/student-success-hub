from database import get_db_connection, init_db
import os

def seed_data():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Clear existing data
    cursor.execute("DELETE FROM attendance")
    cursor.execute("DELETE FROM marks")
    cursor.execute("DELETE FROM subjects")
    cursor.execute("DELETE FROM students")

    # Sample Students
    students = [
        ('S1001', 'John Doe', '2023CS01', 'Computer Science', 4, 'john@example.com', '9876543210'),
        ('S1002', 'Jane Smith', '2023CS02', 'Computer Science', 4, 'jane@example.com', '9876543211'),
        ('S1003', 'Mike Ross', '2023EE01', 'Electrical Engineering', 2, 'mike@example.com', '9876543212'),
        ('S1004', 'Rachel Zane', '2023EE02', 'Electrical Engineering', 2, 'rachel@example.com', '9876543213'),
        ('S1005', 'Harvey Specter', '2023ME01', 'Mechanical Engineering', 6, 'harvey@example.com', '9876543214')
    ]
    cursor.executemany(
        "INSERT INTO students (student_id, name, roll_number, department, semester, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)",
        students
    )

    # Sample Subjects
    subjects = [
        ('CS401', 'Data Structures', 4, 4),
        ('CS402', 'Algorithms', 4, 4),
        ('EE201', 'Circuit Theory', 2, 3),
        ('ME601', 'Thermodynamics', 6, 4),
        ('GEN101', 'Professional Ethics', 2, 2)
    ]
    cursor.executemany(
        "INSERT INTO subjects (subject_code, subject_name, semester, credits) VALUES (?, ?, ?, ?)",
        subjects
    )

    # Get IDs for students and subjects to create marks and attendance
    cursor.execute("SELECT id, semester FROM students")
    student_rows = cursor.fetchall()
    cursor.execute("SELECT id, subject_code, semester FROM subjects")
    subject_rows = cursor.fetchall()

    def get_grade(percentage):
        if percentage >= 90: return 'A+'
        if percentage >= 80: return 'A'
        if percentage >= 70: return 'B+'
        if percentage >= 60: return 'B'
        if percentage >= 50: return 'C'
        if percentage >= 40: return 'D'
        return 'F'

    # Add Marks and Attendance for each student in their relevant subjects
    for s_id, s_sem in student_rows:
        relevant_subjects = [sub for sub in subject_rows if sub[2] == s_sem]
        for sub_id, sub_code, sub_sem in relevant_subjects:
            # Marks
            internal = 25.0
            external = 60.0
            total = internal + external
            pct = (total / 100.0) * 100
            grade = get_grade(pct)
            pass_fail = 'Pass' if pct >= 40 else 'Fail'
            
            cursor.execute(
                "INSERT INTO marks (student_id, subject_id, internal_marks, external_marks, total_marks, percentage, grade, pass_fail) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                (s_id, sub_id, internal, external, total, pct, grade, pass_fail)
            )

            # Attendance
            total_c = 40
            attended = 35 if s_id % 2 == 0 else 28
            att_pct = (attended / total_c) * 100
            status = 'Normal' if att_pct >= 75 else 'Low'
            
            cursor.execute(
                "INSERT INTO attendance (student_id, subject_id, total_classes, attended_classes, attendance_percentage, status) VALUES (?, ?, ?, ?, ?, ?)",
                (s_id, sub_id, total_c, attended, att_pct, status)
            )

    conn.commit()
    conn.close()
    print("Database seeded successfully.")

if __name__ == '__main__':
    init_db()
    seed_data()
