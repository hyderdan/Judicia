import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_login():
    print("Testing Login Endpoint...")
    
    # Payload matching the screenshot/user attempt
    payload = {
        "email": "hyder.danish369@gmail.com",
        "password": "wrongpassword", # Using wrong password intentionally to expect 401, if it hangs it's an issue
        "role": "user"
    }

    # Test 1: No trailing slash
    try:
        print(f"Attempting POST {BASE_URL}/login")
        response = requests.post(f"{BASE_URL}/login", json=payload, timeout=5)
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Error accessing /login: {e}")

    print("-" * 20)

    # Test 2: With trailing slash
    try:
        print(f"Attempting POST {BASE_URL}/login/")
        response = requests.post(f"{BASE_URL}/login/", json=payload, timeout=5)
        print(f"Response Status: {response.status_code}")
        print(f"Response Body: {response.text}")
    except Exception as e:
        print(f"Error accessing /login/: {e}")

if __name__ == "__main__":
    test_login()
