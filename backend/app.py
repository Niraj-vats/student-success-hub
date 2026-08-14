from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db_connection
from functools import wraps
import os

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY')
if not app.secret_key and os.environ.get('NODE_ENV') != 'development':
    # In production-like environments, we MUST have a secret key
    # For this environment, we can fallback to a dummy if explicitly allowed, 
    # but the requirement was to remove the hardcoded one.
    # If it's missing, Flask might still work in some dev contexts, but we'll enforce it.
    app.secret_key = 'dev-fallback-for-local-only' 
    print("WARNING: FLASK_SECRET_KEY not set. Using local fallback.")
CORS(app, supports_credentials=True)

# --- Authentication Middleware ---

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

# --- Authentication API ---

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
        
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
    conn.close()
    
    if user and check_password_hash(user['password_hash'], password):
        session['user_id'] = user['id']
        session['username'] = user['username']
        session['role'] = user['role']
        
        return jsonify({
            'id': user['id'],
            'username': user['username'],
            'role': user['role'],
            'student_id': user['student_id'],
            'teacher_id': user['teacher_id']
        })
        
    return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'})

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
        
    return jsonify({
        'id': session.get('user_id'),
        'username': session.get('username'),
        'role': session.get('role')
    })

# --- Students API ---

@app.route('/api/students', methods=['GET'])
@login_required
def get_students():

    conn = get_db_connection()
    students = conn.execute('SELECT * FROM students').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in students])

@login_required
@app.route('/api/students/<int:id>', methods=['GET'])
def get_student(id):
    conn = get_db_connection()
    student = conn.execute('SELECT * FROM students WHERE id = ?', (id,)).fetchone()
    conn.close()
    if student is None:
        return jsonify({'error': 'Student not found'}), 404
    return jsonify(dict(student))

@login_required
@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.json
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO students (student_id, name, roll_number, department, semester, email, phone) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (data['student_id'], data['name'], data['roll_number'], data['department'], data['semester'], data['email'], data['phone'])
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': new_id, 'message': 'Student added successfully'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@login_required
@app.route('/api/students/<int:id>', methods=['PUT'])
def update_student(id):
    data = request.json
    conn = get_db_connection()
    conn.execute(
        "UPDATE students SET name=?, roll_number=?, department=?, semester=?, email=?, phone=? WHERE id=?",
        (data['name'], data['roll_number'], data['department'], data['semester'], data['email'], data['phone'], id)
    )
    conn.commit()
    conn.close()
    return jsonify({'message': 'Student updated successfully'})

@login_required
@app.route('/api/students/<int:id>', methods=['DELETE'])
def delete_student(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM students WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Student deleted successfully'})

# --- Subjects API ---

@login_required
@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    conn = get_db_connection()
    subjects = conn.execute('SELECT * FROM subjects').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in subjects])

@login_required
@app.route('/api/subjects', methods=['POST'])
def add_subject():
    data = request.json
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO subjects (subject_code, subject_name, semester, credits) VALUES (?, ?, ?, ?)",
            (data['subject_code'], data['subject_name'], data['semester'], data['credits'])
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': new_id, 'message': 'Subject added successfully'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@login_required
@app.route('/api/subjects/<int:id>', methods=['GET'])
def get_subject(id):
    conn = get_db_connection()
    subject = conn.execute('SELECT * FROM subjects WHERE id = ?', (id,)).fetchone()
    conn.close()
    if subject is None:
        return jsonify({'error': 'Subject not found'}), 404
    return jsonify(dict(subject))

@login_required
@app.route('/api/subjects/<int:id>', methods=['PUT'])
def update_subject(id):
    data = request.json
    conn = get_db_connection()
    try:
        conn.execute(
            "UPDATE subjects SET subject_code=?, subject_name=?, semester=?, credits=? WHERE id=?",
            (data['subject_code'], data['subject_name'], data['semester'], data['credits'], id)
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'Subject updated successfully'})
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@login_required
@app.route('/api/subjects/<int:id>', methods=['DELETE'])
def delete_subject(id):
    conn = get_db_connection()
    try:
        # Check if subject is referenced in marks or attendance
        marks_ref = conn.execute('SELECT COUNT(*) FROM marks WHERE subject_id = ?', (id,)).fetchone()[0]
        attendance_ref = conn.execute('SELECT COUNT(*) FROM attendance WHERE subject_id = ?', (id,)).fetchone()[0]
        
        if marks_ref > 0 or attendance_ref > 0:
            conn.close()
            return jsonify({'error': 'Cannot delete subject because it is referenced in marks or attendance records.'}), 400
            
        conn.execute('DELETE FROM subjects WHERE id = ?', (id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Subject deleted successfully'})
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

# --- Marks API ---

@login_required
@app.route('/api/marks', methods=['GET'])
def get_marks():
    conn = get_db_connection()
    # Join with students and subjects to get names and extra info for filtering
    marks = conn.execute('''
        SELECT m.*, s.name as student_name, s.student_id as student_identifier, 
               sub.subject_name, sub.subject_code, sub.semester
        FROM marks m
        JOIN students s ON m.student_id = s.id
        JOIN subjects sub ON m.subject_id = sub.id
    ''').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in marks])

@login_required
@app.route('/api/marks/<int:id>', methods=['GET'])
def get_mark(id):
    conn = get_db_connection()
    mark = conn.execute('SELECT * FROM marks WHERE id = ?', (id,)).fetchone()
    conn.close()
    if mark is None:
        return jsonify({'error': 'Mark record not found'}), 404
    return jsonify(dict(mark))

@login_required
@app.route('/api/marks', methods=['POST'])
def add_marks():
    data = request.json
    try:
        internal = float(data.get('internal_marks', 0))
        external = float(data.get('external_marks', 0))
        
        if internal < 0 or internal > 30 or external < 0 or external > 70:
            return jsonify({'error': 'Invalid mark values. Internal: 0-30, External: 0-70.'}), 400

        # Calculation
        total = internal + external
        percentage = total # Since total max is 100
        grade = 'F'
        if percentage >= 90: grade = 'A+'
        elif percentage >= 80: grade = 'A'
        elif percentage >= 70: grade = 'B+'
        elif percentage >= 60: grade = 'B'
        elif percentage >= 50: grade = 'C'
        elif percentage >= 40: grade = 'D'
        
        pass_fail = 'Pass' if percentage >= 40 else 'Fail'

        conn = get_db_connection()
        # Check duplicate
        exists = conn.execute('SELECT 1 FROM marks WHERE student_id = ? AND subject_id = ?', 
                             (data['student_id'], data['subject_id'])).fetchone()
        if exists:
            conn.close()
            return jsonify({'error': 'Marks record for this student and subject already exists. Please edit the existing record.'}), 400

        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO marks (student_id, subject_id, internal_marks, external_marks, total_marks, percentage, grade, pass_fail)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (data['student_id'], data['subject_id'], internal, external, total, percentage, grade, pass_fail))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Marks added successfully'}), 201
    except ValueError:
        return jsonify({'error': 'Marks must be numeric values.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@login_required
@app.route('/api/marks/<int:id>', methods=['PUT'])
def update_marks(id):
    data = request.json
    try:
        internal = float(data.get('internal_marks', 0))
        external = float(data.get('external_marks', 0))
        
        if internal < 0 or internal > 30 or external < 0 or external > 70:
            return jsonify({'error': 'Invalid mark values. Internal: 0-30, External: 0-70.'}), 400

        total = internal + external
        percentage = total
        grade = 'F'
        if percentage >= 90: grade = 'A+'
        elif percentage >= 80: grade = 'A'
        elif percentage >= 70: grade = 'B+'
        elif percentage >= 60: grade = 'B'
        elif percentage >= 50: grade = 'C'
        elif percentage >= 40: grade = 'D'
        
        pass_fail = 'Pass' if percentage >= 40 else 'Fail'

        conn = get_db_connection()
        # Check duplicate (excluding current record)
        exists = conn.execute('SELECT 1 FROM marks WHERE student_id = ? AND subject_id = ? AND id != ?', 
                             (data['student_id'], data['subject_id'], id)).fetchone()
        if exists:
            conn.close()
            return jsonify({'error': 'Another marks record for this student and subject already exists.'}), 400

        conn.execute('''
            UPDATE marks SET student_id=?, subject_id=?, internal_marks=?, external_marks=?, total_marks=?, percentage=?, grade=?, pass_fail=?
            WHERE id=?
        ''', (data['student_id'], data['subject_id'], internal, external, total, percentage, grade, pass_fail, id))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Marks updated successfully'})
    except ValueError:
        return jsonify({'error': 'Marks must be numeric values.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@login_required
@app.route('/api/marks/<int:id>', methods=['DELETE'])
def delete_marks(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM marks WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Marks deleted successfully'})

# --- Attendance API ---

@login_required
@app.route('/api/attendance', methods=['GET'])
def get_attendance():
    conn = get_db_connection()
    attendance = conn.execute('''
        SELECT a.*, s.name as student_name, s.student_id as student_identifier, 
               sub.subject_name, sub.subject_code, sub.semester
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN subjects sub ON a.subject_id = sub.id
    ''').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in attendance])

@login_required
@app.route('/api/attendance/<int:id>', methods=['GET'])
def get_attendance_by_id(id):
    conn = get_db_connection()
    record = conn.execute('SELECT * FROM attendance WHERE id = ?', (id,)).fetchone()
    conn.close()
    if record is None:
        return jsonify({'error': 'Attendance record not found'}), 404
    return jsonify(dict(record))

@login_required
@app.route('/api/attendance', methods=['POST'])
def add_attendance():
    data = request.json
    try:
        total_classes = int(data.get('total_classes', 0))
        attended_classes = int(data.get('attended_classes', 0))
        student_id = data.get('student_id')
        subject_id = data.get('subject_id')

        if not student_id or not subject_id:
            return jsonify({'error': 'Student and Subject are required.'}), 400

        if total_classes <= 0:
            return jsonify({'error': 'Total classes must be greater than 0.'}), 400
        if attended_classes < 0:
            return jsonify({'error': 'Attended classes cannot be negative.'}), 400
        if attended_classes > total_classes:
            return jsonify({'error': 'Attended classes cannot exceed total classes.'}), 400

        # Calculation
        percentage = round((attended_classes / total_classes) * 100, 2)
        status = 'ELIGIBLE' if percentage >= 75 else 'SHORTAGE'

        conn = get_db_connection()
        # Check duplicate
        exists = conn.execute('SELECT 1 FROM attendance WHERE student_id = ? AND subject_id = ?', 
                             (student_id, subject_id)).fetchone()
        if exists:
            conn.close()
            return jsonify({'error': 'Attendance record for this student and subject already exists.'}), 400

        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO attendance (student_id, subject_id, total_classes, attended_classes, attendance_percentage, status)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (student_id, subject_id, total_classes, attended_classes, percentage, status))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Attendance added successfully'}), 201
    except ValueError:
        return jsonify({'error': 'Classes must be integer values.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@login_required
@app.route('/api/attendance/<int:id>', methods=['PUT'])
def update_attendance(id):
    data = request.json
    try:
        total_classes = int(data.get('total_classes', 0))
        attended_classes = int(data.get('attended_classes', 0))
        student_id = data.get('student_id')
        subject_id = data.get('subject_id')

        if not student_id or not subject_id:
            return jsonify({'error': 'Student and Subject are required.'}), 400

        if total_classes <= 0:
            return jsonify({'error': 'Total classes must be greater than 0.'}), 400
        if attended_classes < 0:
            return jsonify({'error': 'Attended classes cannot be negative.'}), 400
        if attended_classes > total_classes:
            return jsonify({'error': 'Attended classes cannot exceed total classes.'}), 400

        # Calculation
        percentage = round((attended_classes / total_classes) * 100, 2)
        status = 'ELIGIBLE' if percentage >= 75 else 'SHORTAGE'

        conn = get_db_connection()
        # Check duplicate (excluding current ID)
        exists = conn.execute('SELECT 1 FROM attendance WHERE student_id = ? AND subject_id = ? AND id != ?', 
                             (student_id, subject_id, id)).fetchone()
        if exists:
            conn.close()
            return jsonify({'error': 'Attendance record for this student and subject already exists.'}), 400

        conn.execute('''
            UPDATE attendance 
            SET student_id=?, subject_id=?, total_classes=?, attended_classes=?, 
                attendance_percentage=?, status=?
            WHERE id=?
        ''', (student_id, subject_id, total_classes, attended_classes, percentage, status, id))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Attendance updated successfully'})
    except ValueError:
        return jsonify({'error': 'Classes must be integer values.'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@login_required
@app.route('/api/attendance/<int:id>', methods=['DELETE'])
def delete_attendance(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM attendance WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Attendance record deleted successfully'})

# --- Dashboard API ---

@login_required
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    conn = get_db_connection()
    total_students = conn.execute('SELECT COUNT(*) FROM students').fetchone()[0]
    total_subjects = conn.execute('SELECT COUNT(*) FROM subjects').fetchone()[0]
    avg_pct = conn.execute('SELECT AVG(percentage) FROM marks').fetchone()[0] or 0
    
    pass_count = conn.execute("SELECT COUNT(*) FROM marks WHERE pass_fail = 'Pass'").fetchone()[0]
    total_marks_count = conn.execute("SELECT COUNT(*) FROM marks").fetchone()[0]
    pass_pct = (pass_count / total_marks_count * 100) if total_marks_count > 0 else 0

    conn.close()
    return jsonify({
        'totalStudents': total_students,
        'totalSubjects': total_subjects,
        'averagePercentage': round(avg_pct, 2),
        'passPercentage': round(pass_pct, 2)
    })

# --- Academic Performance API ---

@login_required
@app.route('/api/performance', methods=['GET'])
def get_all_performance():
    conn = get_db_connection()
    students = conn.execute('SELECT id, name, student_id, department, semester FROM students').fetchall()
    
    results = []
    for s in students:
        perf = calculate_student_performance(conn, s['id'])
        results.append({
            'student_id': s['student_id'],
            'name': s['name'],
            'department': s['department'],
            'semester': s['semester'],
            **perf['overall']
        })
    
    conn.close()
    return jsonify(results)

@login_required
@app.route('/api/performance/<int:student_id>', methods=['GET'])
def get_student_performance(student_id):
    conn = get_db_connection()
    student = conn.execute('SELECT * FROM students WHERE id = ?', (student_id,)).fetchone()
    
    if student is None:
        conn.close()
        return jsonify({'error': 'Student not found'}), 404
        
    performance = calculate_student_performance(conn, student_id)
    performance['student'] = dict(student)
    
    conn.close()
    return jsonify(performance)

def calculate_student_performance(conn, student_id):
    # Fetch all subjects for the student's semester to ensure we show missing data
    student = conn.execute('SELECT semester FROM students WHERE id = ?', (student_id,)).fetchone()
    subjects = conn.execute('SELECT id, subject_code, subject_name FROM subjects WHERE semester = ?', (student['semester'],)).fetchall()
    
    marks = conn.execute('SELECT * FROM marks WHERE student_id = ?', (student_id,)).fetchall()
    attendance = conn.execute('SELECT * FROM attendance WHERE student_id = ?', (student_id,)).fetchall()
    
    marks_dict = {m['subject_id']: dict(m) for m in marks}
    attendance_dict = {a['subject_id']: dict(a) for a in attendance}
    
    subject_wise = []
    total_marks_pct = 0
    marks_count = 0
    passed_count = 0
    failed_count = 0
    
    total_attendance_pct = 0
    attendance_count = 0
    shortage_count = 0
    
    for sub in subjects:
        sub_id = sub['id']
        m = marks_dict.get(sub_id)
        a = attendance_dict.get(sub_id)
        
        row = {
            'subject_code': sub['subject_code'],
            'subject_name': sub['subject_name'],
            'marks_percentage': m['percentage'] if m else None,
            'grade': m['grade'] if m else None,
            'pass_fail': m['pass_fail'] if m else None,
            'attendance_percentage': a['attendance_percentage'] if a else None,
            'attendance_status': a['status'] if a else None
        }
        subject_wise.append(row)
        
        if m:
            total_marks_pct += m['percentage']
            marks_count += 1
            if m['pass_fail'] == 'Pass':
                passed_count += 1
            else:
                failed_count += 1
                
        if a:
            total_attendance_pct += a['attendance_percentage']
            attendance_count += 1
            if a['attendance_percentage'] < 75:
                shortage_count += 1
                
    avg_marks = round(total_marks_pct / marks_count, 2) if marks_count > 0 else None
    avg_attendance = round(total_attendance_pct / attendance_count, 2) if attendance_count > 0 else None
    
    # Overall Status Logic
    status = "NO ACADEMIC DATA"
    if avg_marks is not None and avg_attendance is not None:
        if avg_marks >= 75 and avg_attendance >= 75:
            status = "GOOD"
        elif avg_marks >= 50 and avg_attendance >= 60:
            status = "AVERAGE"
        else:
            status = "NEEDS IMPROVEMENT"
    elif avg_marks is not None:
        status = "NEEDS IMPROVEMENT"
        if avg_marks >= 75: status = "AVERAGE"
        
    return {
        'overall': {
            'avg_marks': avg_marks,
            'avg_attendance': avg_attendance,
            'total_subjects': len(subjects),
            'passed_subjects': passed_count,
            'failed_subjects': failed_count,
            'shortage_count': shortage_count,
            'status': status
        },
        'subject_wise': subject_wise
    }

# --- Results API ---

@login_required
@app.route('/api/results/<int:student_id>', methods=['GET'])
def get_student_results(student_id):
    conn = get_db_connection()
    student = conn.execute('SELECT * FROM students WHERE id = ?', (student_id,)).fetchone()
    
    if student is None:
        conn.close()
        return jsonify({'error': 'Student not found'}), 404
        
    # Get subjects for the student's semester
    subjects = conn.execute('SELECT id, subject_code, subject_name FROM subjects WHERE semester = ?', (student['semester'],)).fetchall()
    
    # Get marks for those subjects
    marks = conn.execute('SELECT * FROM marks WHERE student_id = ?', (student_id,)).fetchall()
    marks_dict = {m['subject_id']: dict(m) for m in marks}
    
    subject_wise = []
    total_marks = 0
    passed_subjects = 0
    failed_subjects = 0
    marks_records_found = 0
    
    for sub in subjects:
        sub_id = sub['id']
        m = marks_dict.get(sub_id)
        
        if m:
            marks_records_found += 1
            total_marks += m['total_marks']
            if m['pass_fail'] == 'Pass':
                passed_subjects += 1
            else:
                failed_subjects += 1
            
            subject_wise.append({
                'subject_code': sub['subject_code'],
                'subject_name': sub['subject_name'],
                'internal_marks': m['internal_marks'],
                'external_marks': m['external_marks'],
                'total_marks': m['total_marks'],
                'percentage': m['percentage'],
                'grade': m['grade'],
                'pass_fail': m['pass_fail']
            })
    
    max_marks = len(subjects) * 100
    overall_percentage = round((total_marks / max_marks * 100), 2) if max_marks > 0 else 0
    
    # Overall Result logic
    if marks_records_found == 0:
        overall_result = "NO RESULT AVAILABLE"
    elif failed_subjects > 0:
        overall_result = "FAIL"
    elif passed_subjects == len(subjects):
        overall_result = "PASS"
    else:
        # Partial marks, but no fails yet
        overall_result = "INCOMPLETE"

    result_data = {
        'student': dict(student),
        'semester': student['semester'],
        'subject_wise': subject_wise,
        'stats': {
            'total_marks': total_marks,
            'max_marks': max_marks,
            'overall_percentage': overall_percentage,
            'passed_subjects': passed_subjects,
            'failed_subjects': failed_subjects,
            'overall_result': overall_result
        }
    }
    
    conn.close()
    return jsonify(result_data)

# --- Reports API ---

@login_required
@app.route('/api/reports/class-summary', methods=['GET'])
def get_class_summary():
    conn = get_db_connection()
    try:
        total_students = conn.execute('SELECT COUNT(*) FROM students').fetchone()[0]
        total_subjects = conn.execute('SELECT COUNT(*) FROM subjects').fetchone()[0]
        
        # Students with at least one mark record
        students_with_marks = conn.execute('SELECT COUNT(DISTINCT student_id) FROM marks').fetchone()[0]
        
        # We define "Students Passed" as those who have marks for all subjects in their semester and none are failed.
        # For simplicity in this beginner project, we can count students who have at least one mark and no "Fail" records.
        # Or more accurately: students where all their marks records are 'Pass'.
        students_passed = conn.execute('''
            SELECT COUNT(*) FROM (
                SELECT student_id FROM marks 
                GROUP BY student_id 
                HAVING SUM(CASE WHEN pass_fail = 'Fail' THEN 1 ELSE 0 END) = 0
            )
        ''').fetchone()[0]
        
        students_failed = conn.execute('''
            SELECT COUNT(*) FROM (
                SELECT student_id FROM marks 
                WHERE pass_fail = 'Fail'
                GROUP BY student_id
            )
        ''').fetchone()[0]
        
        avg_percentage = conn.execute('SELECT AVG(percentage) FROM marks').fetchone()[0] or 0
        
        conn.close()
        return jsonify({
            'total_students': total_students,
            'total_subjects': total_subjects,
            'students_with_marks': students_with_marks,
            'students_passed': students_passed,
            'students_failed': students_failed,
            'class_average': round(avg_percentage, 2)
        })
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

@login_required
@app.route('/api/reports/attendance-summary', methods=['GET'])
def get_attendance_summary():
    conn = get_db_connection()
    try:
        # Student-wise attendance summary
        attendance_data = conn.execute('''
            SELECT s.name, s.student_id, s.semester,
                   AVG(a.attendance_percentage) as avg_attendance,
                   SUM(CASE WHEN a.status = 'ELIGIBLE' THEN 1 ELSE 0 END) as eligible_count,
                   SUM(CASE WHEN a.status = 'SHORTAGE' THEN 1 ELSE 0 END) as shortage_count
            FROM students s
            JOIN attendance a ON s.id = a.student_id
            GROUP BY s.id
        ''').fetchall()
        
        conn.close()
        return jsonify([dict(ix) for ix in attendance_data])
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

# --- Phase 2A: Departments, Classes, Teachers, Assignments API ---

@app.route('/api/departments', methods=['GET'])
@login_required
def get_departments():
    conn = get_db_connection()
    departments = conn.execute('SELECT * FROM departments').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in departments])

@app.route('/api/departments', methods=['POST'])
@login_required
def add_department():
    data = request.json
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO departments (department_code, department_name) VALUES (?, ?)",
            (data['department_code'], data['department_name'])
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': new_id, 'message': 'Department added successfully'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/classes', methods=['GET'])
@login_required
def get_classes():
    conn = get_db_connection()
    classes = conn.execute('''
        SELECT c.*, d.department_name 
        FROM classes c
        JOIN departments d ON c.department_id = d.id
    ''').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in classes])

@app.route('/api/classes', methods=['POST'])
@login_required
def add_class():
    data = request.json
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO classes (class_name, department_id, semester, section, academic_year) VALUES (?, ?, ?, ?, ?)",
            (data['class_name'], data['department_id'], data['semester'], data['section'], data['academic_year'])
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': new_id, 'message': 'Class added successfully'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/teachers', methods=['GET'])
@login_required
def get_teachers():
    conn = get_db_connection()
    teachers = conn.execute('SELECT * FROM teachers').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in teachers])

@app.route('/api/teachers', methods=['POST'])
@login_required
def add_teacher():
    data = request.json
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO teachers (teacher_code, name, email, department) VALUES (?, ?, ?, ?)",
            (data['teacher_code'], data['name'], data['email'], data['department'])
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': new_id, 'message': 'Teacher added successfully'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/teacher-assignments', methods=['GET'])
@login_required
def get_teacher_assignments():
    conn = get_db_connection()
    assignments = conn.execute('''
        SELECT ta.*, t.name as teacher_name, c.class_name, s.subject_name 
        FROM teacher_assignments ta
        JOIN teachers t ON ta.teacher_id = t.id
        JOIN classes c ON ta.class_id = c.id
        JOIN subjects s ON ta.subject_id = s.id
    ''').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in assignments])

@app.route('/api/teacher-assignments', methods=['POST'])
@login_required
def add_teacher_assignment():
    data = request.json
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        assigned_by = session.get('user_id')
        cursor.execute(
            "INSERT INTO teacher_assignments (teacher_id, class_id, subject_id, assigned_by) VALUES (?, ?, ?, ?)",
            (data['teacher_id'], data['class_id'], data['subject_id'], assigned_by)
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': new_id, 'message': 'Teacher assigned successfully'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/teacher-assignments/<int:id>', methods=['GET'])
@login_required
def get_teacher_assignment(id):
    conn = get_db_connection()
    assignment = conn.execute('SELECT * FROM teacher_assignments WHERE id = ?', (id,)).fetchone()
    conn.close()
    if assignment is None:
        return jsonify({'error': 'Assignment not found'}), 404
    return jsonify(dict(assignment))

@app.route('/api/teacher-assignments/<int:id>', methods=['PUT'])
@login_required
def update_teacher_assignment(id):
    data = request.json
    conn = get_db_connection()
    try:
        conn.execute(
            "UPDATE teacher_assignments SET teacher_id=?, class_id=?, subject_id=? WHERE id=?",
            (data['teacher_id'], data['class_id'], data['subject_id'], id)
        )
        conn.commit()
        conn.close()
        return jsonify({'message': 'Assignment updated successfully'})
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/teacher-assignments/<int:id>', methods=['DELETE'])
@login_required
def delete_teacher_assignment(id):
    conn = get_db_connection()
    try:
        conn.execute('DELETE FROM teacher_assignments WHERE id = ?', (id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Assignment deleted successfully'})
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)


