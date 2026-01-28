from main import app
from fastapi.testclient import TestClient

client = TestClient(app)

try:
    response = client.get("/police-stations")
    print(f"Status Code: {response.status_code}")
    if response.status_code != 200:
        print(f"Response Body: {response.text}")
    else:
        print(f"Data: {response.json()}")
except Exception as e:
    print(f"Exception: {e}")
