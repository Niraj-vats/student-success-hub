import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'database.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def is_teacher_authorized(teacher_id, class_id=None, subject_id=None):
    conn = get_db_connection()
    query = "SELECT 1 FROM teacher_assignments WHERE teacher_id = ?"
    params = [teacher_id]
    
    if class_id:
        query += " AND class_id = ?"
        params.append(class_id)
    if subject_id:
        query += " AND subject_id = ?"
        params.append(subject_id)
        
    result = conn.execute(query, params).fetchone()
    conn.close()
    return result is not None

def get_authorized_classes(teacher_id):
    conn = get_db_connection()
    classes = conn.execute('''
        SELECT DISTINCT class_id FROM teacher_assignments WHERE teacher_id = ?
    ''', (teacher_id,)).fetchall()
    conn.close()
    return [c['class_id'] for c in classes]

def get_authorized_subjects(teacher_id, class_id=None):
    conn = get_db_connection()
    query = "SELECT DISTINCT subject_id FROM teacher_assignments WHERE teacher_id = ?"
    params = [teacher_id]
    if class_id:
        query += " AND class_id = ?"
        params.append(class_id)
    
    subjects = conn.execute(query, params).fetchall()
    conn.close()
    return [s['subject_id'] for s in subjects]
