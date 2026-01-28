from main import app
from fastapi.testclient import TestClient

client = TestClient(app)

user_id = 2 # Based on previous view_db output

try:
    response = client.get(f"/user/profile/{user_id}")
    print(f"Status Code: {response.status_code}")
    if response.status_code != 200:
        print(f"Response Body: {response.text}")
    else:
        print(f"Data: {response.json()}")
except Exception as e:
    print(f"Exception: {e}")
