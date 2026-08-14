import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'database.db')

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("Starting Phase 2C migration...")
    
    try:
        # Add ownership columns to marks
        cursor.execute("ALTER TABLE marks ADD COLUMN created_by INTEGER REFERENCES users(id)")
        cursor.execute("ALTER TABLE marks ADD COLUMN updated_by INTEGER REFERENCES users(id)")
        print("Added ownership columns to marks table.")
    except sqlite3.OperationalError:
        print("Ownership columns already exist in marks table.")

    try:
        # Add ownership columns to attendance
        cursor.execute("ALTER TABLE attendance ADD COLUMN created_by INTEGER REFERENCES users(id)")
        cursor.execute("ALTER TABLE attendance ADD COLUMN updated_by INTEGER REFERENCES users(id)")
        print("Added ownership columns to attendance table.")
    except sqlite3.OperationalError:
        print("Ownership columns already exist in attendance table.")

    conn.commit()
    conn.close()
    print("Migration completed successfully.")

if __name__ == '__main__':
    migrate()
