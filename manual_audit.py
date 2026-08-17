
import sys
import os
import json
import sqlite3

# Define DB path
DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'database.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def audit():
    print("--- PHASE 2D SECURITY MANUAL AUDIT ---")
    
    # 1. Inspect app.py secret key
    with open('backend/app.py', 'r') as f:
        content = f.read()
        if "app.secret_key = os.environ.get('FLASK_SECRET_KEY')" in content and "NODE_ENV" in content:
            print("Secret Key Protection: PASS (Found environment variable check and NODE_ENV logic)")
        else:
            print("Secret Key Protection: FAIL (Logic not found or incorrect)")

    # 2. Inspect Delete Marks Protection
    import re
    marks_delete = re.findall(r"@app\.route\('/api/marks/<int:id>', methods=\['DELETE'\]\)\ndef delete_marks\(id\):(.*?)(?=@app\.route|$)", content, re.DOTALL)
    if marks_delete:
        code = marks_delete[0]
        if "role == 'Student'" in code and "403" in code and "is_teacher_authorized" in code:
            print("Marks Delete Authorization: PASS (Enforces Student 403 and Teacher assignment check)")
        else:
            print("Marks Delete Authorization: FAIL (Missing proper authorization checks)")

    # 3. Inspect Delete Attendance Protection
    att_delete = re.findall(r"@app\.route\('/api/attendance/<int:id>', methods=\['DELETE'\]\)\ndef delete_attendance\(id\):(.*?)(?=@app\.route|$)", content, re.DOTALL)
    if att_delete:
        code = att_delete[0]
        if "role == 'Student'" in code and "403" in code and "is_teacher_authorized" in code:
            print("Attendance Delete Authorization: PASS (Enforces Student 403 and Teacher assignment check)")
        else:
            print("Attendance Delete Authorization: FAIL (Missing proper authorization checks)")

    # 4. Inspect Results Ownership Protection
    results_get = re.findall(r"@app\.route\('/api/results/<int:student_id>', methods=\['GET'\]\)\ndef get_student_results\(student_id\):(.*?)(?=@app\.route|$)", content, re.DOTALL)
    if results_get:
        code = results_get[0]
        if "elif role == 'Student':" in code and "student_id != session.get('student_id')" in code and "403" in code:
            print("Results Ownership Authorization: PASS (Enforces student session identity check)")
        else:
            print("Results Ownership Authorization: FAIL (Missing ownership verification for students)")

    # 5. Audit Logging Check
    if "log_audit('DELETE', 'marks'" in content and "log_audit('DELETE', 'attendance'" in content:
        print("Audit Logging for Deletion: PASS (Found log_audit calls in delete routes)")
    else:
        print("Audit Logging for Deletion: FAIL (Missing audit logs for deletion)")

if __name__ == "__main__":
    audit()
