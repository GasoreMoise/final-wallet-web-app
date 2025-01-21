import requests
import json

base_url = "http://localhost:8000"

def test_register():
    url = f"{base_url}/api/auth/register"
    data = {
        "email": "test@example.com",
        "username": "testuser",
        "full_name": "Test User",
        "password": "Test123!"
    }
    headers = {
        "accept": "application/json",
        "Content-Type": "application/json"
    }
    response = requests.post(url, json=data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == "__main__":
    test_register()
