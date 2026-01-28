from database import SessionLocal
from models import Case, User, Evidence
import json

def view_db():
    db = SessionLocal()
    try:
        cases = db.query(Case).all()
        if not cases:
            print("No cases found in the database.")
            return

        print("-" * 50)
        print(f"{'ID':<5} | {'Title':<20} | {'User':<15} | {'Status':<10}")
        print("-" * 50)
        
        for c in cases:
            user_name = c.user.name if c.user else "Unknown"
            print(f"{c.id:<5} | {c.title[:20]:<20} | {user_name:<15} | {c.status:<10}")
            
            # Show details
            print(f"  Description: {c.description[:100]}...")
            print(f"  Incident Date: {c.incident_date}")
            print(f"  Police Station: {c.police.name if c.police else 'Not Assigned'}")
            
            evidence_count = len(c.evidence)
            print(f"  Evidence Count: {evidence_count}")
            for ev in c.evidence:
                print(f"    - [{ev.file_type}] {ev.file_path}")
            print("-" * 30)

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    view_db()
