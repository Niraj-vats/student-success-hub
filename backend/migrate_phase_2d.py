import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'database.db')

def migrate():
    conn = sqlite3.connect(DB_PATH)
    try:
        # Create audit_logs table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                username TEXT,
                role TEXT,
                action TEXT,
                table_name TEXT,
                record_id INTEGER,
                description TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        ''')
        
        # Ensure is_active exists in users (from Phase 2B, but good to check)
        cursor = conn.execute("PRAGMA table_info(users)")
        columns = [column[1] for column in cursor.fetchall()]
        if 'is_active' not in columns:
            conn.execute('ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1')
            
        conn.commit()
        print("Migration Phase 2D (Audit Logs) completed successfully.")
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    migrate()
