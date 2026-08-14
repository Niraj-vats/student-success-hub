from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db_connection
import os

app = Flask(__name__)
CORS(app)

# --- Students API ---

@app.route('/api/students', methods=['GET'])
def get_students():
    conn = get_db_connection()
    students = conn.execute('SELECT * FROM students').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in students])

@app.route('/api/students/<int:id>', methods=['GET'])
def get_student(id):
    conn = get_db_connection()
    student = conn.execute('SELECT * FROM students WHERE id = ?', (id,)).fetchone()
    conn.close()
    if student is None:
        return jsonify({'error': 'Student not found'}), 404
    return jsonify(dict(student))

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

@app.route('/api/students/<int:id>', methods=['DELETE'])
def delete_student(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM students WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Student deleted successfully'})

# --- Subjects API ---

@app.route('/api/subjects', methods=['GET'])
def get_subjects():
    conn = get_db_connection()
    subjects = conn.execute('SELECT * FROM subjects').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in subjects])

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

# --- Dashboard API ---

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)
