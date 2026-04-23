import sqlite3

def patch():
    try:
        conn = sqlite3.connect("dplog.db")
        c = conn.cursor()
        c.execute("ALTER TABLE store ADD COLUMN scrape_status VARCHAR(20) DEFAULT 'PENDING'")
        conn.commit()
        print("Column 'scrape_status' added successfully.")
    except Exception as e:
        print("Error:", e)
    finally:
        conn.close()

if __name__ == "__main__":
    patch()
