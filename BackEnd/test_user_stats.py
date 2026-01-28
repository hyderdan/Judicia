from main import app
from fastapi.testclient import TestClient

client = TestClient(app)
user_id = 2

try:
    response = client.get(f"/user/stats/{user_id}")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print(f"Stats: {response.json()}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Exception: {e}")
