from main import app
from fastapi.testclient import TestClient

client = TestClient(app)

# Use a non-existent case ID to verify 404
case_id = 999999 

try:
    response = client.delete(f"/user/cases/{case_id}")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Exception: {e}")
