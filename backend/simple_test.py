import requests

def test_root():
    response = requests.get("http://localhost:8000")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

def test_docs():
    response = requests.get("http://localhost:8000/docs")
    print(f"Status Code: {response.status_code}")
    print(f"Response available: {'openapi.json' in response.text}")

if __name__ == "__main__":
    print("\nTesting root endpoint...")
    test_root()
    print("\nTesting docs endpoint...")
    test_docs()
