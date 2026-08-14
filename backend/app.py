from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_db_connection

app = Flask(__name__)
CORS(app)

# --- Marks API ---

@app.route('/api/marks', methods=['GET'])
def get_marks():
    conn = get_db_connection()
    # Join with students and subjects to get names
    marks = conn.execute('''
        SELECT m.*, s.name as student_name, sub.subject_name 
        FROM marks m
        JOIN students s ON m.student_id = s.id
        JOIN subjects sub ON m.subject_id = sub.id
    ''').fetchall()
    conn.close()
    return jsonify([dict(ix) for ix in marks])

@app.route('/api/marks', methods=['POST'])
def add_marks():
    data = request.json
    internal = float(data.get('internal_marks', 0))
    external = float(data.get('external_marks', 0))
    
    # Calculation
    total = internal + external
    percentage = total # Since total is 100
    grade = 'F'
    if percentage >= 90: grade = 'A+'
    elif percentage >= 80: grade = 'A'
    elif percentage >= 70: grade = 'B+'
    elif percentage >= 60: grade = 'B'
    elif percentage >= 50: grade = 'C'
    elif percentage >= 40: grade = 'D'
    
    pass_fail = 'Pass' if percentage >= 40 else 'Fail'

    conn = get_db_connection()
    try:
        # Check duplicate
        exists = conn.execute('SELECT 1 FROM marks WHERE student_id = ? AND subject_id = ?', 
                             (data['student_id'], data['subject_id'])).fetchone()
        if exists:
            conn.close()
            return jsonify({'error': 'Marks record for this student and subject already exists.'}), 400

        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO marks (student_id, subject_id, internal_marks, external_marks, total_marks, percentage, grade, pass_fail)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (data['student_id'], data['subject_id'], internal, external, total, percentage, grade, pass_fail))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Marks added successfully'}), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/marks/<int:id>', methods=['PUT'])
def update_marks(id):
    data = request.json
    internal = float(data.get('internal_marks', 0))
    external = float(data.get('external_marks', 0))
    
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
    try:
        conn.execute('''
            UPDATE marks SET student_id=?, subject_id=?, internal_marks=?, external_marks=?, total_marks=?, percentage=?, grade=?, pass_fail=?
            WHERE id=?
        ''', (data['student_id'], data['subject_id'], internal, external, total, percentage, grade, pass_fail, id))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Marks updated successfully'})
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 400

@app.route('/api/marks/<int:id>', methods=['DELETE'])
def delete_marks(id):
    conn = get_db_connection()
    conn.execute('DELETE FROM marks WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Marks deleted successfully'})

# [Keep existing routes for students, subjects, and dashboard]
# ... (I will append the existing routes here)
