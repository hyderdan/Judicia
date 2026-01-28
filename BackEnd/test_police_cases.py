from main import app
from fastapi.testclient import TestClient

client = TestClient(app)
police_id = 3 # Adjust to a known police user ID if necessary

try:
    response = client.get(f"/police/cases/{police_id}")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        cases = response.json()
        print(f"Number of cases found: {len(cases)}")
        if cases:
            print(f"First case title: {cases[0]['title']}")
            print(f"Filed by: {cases[0].get('user_name', 'Unknown')}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Exception: {e}")
