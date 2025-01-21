import requests
import json
from datetime import datetime
import time

BASE_URL = "http://localhost:8006"
access_token = None

def print_test(name, response):
    print(f"\n=== Testing {name} ===")
    print(f"Status Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")
    return response.json() if response.status_code < 400 else None

def test_auth():
    global access_token
    print("\n=== Authentication Tests ===")

    # Test registration
    print("\n=== Testing Register ===")
    register_data = {
        "email": "test@example.com",
        "username": "testuser",
        "full_name": "Test User",
        "password": "testpass123"
    }
    response = requests.post(f"{BASE_URL}/api/auth/register", json=register_data)
    user = print_test("Register", response)
    if not user:
        print("Registration failed! Stopping tests.")
        return False

    # Test login
    print("\n=== Testing Login ===")
    login_data = {
        "email": "test@example.com",
        "password": "testpass123"
    }
    response = requests.post(f"{BASE_URL}/api/auth/login/json", json=login_data)
    token = print_test("Login", response)
    if not token:
        print("Login failed! Stopping tests.")
        return False
    
    access_token = token["access_token"]
    return True

def test_users():
    global access_token
    print("\n=== User Tests ===")

    # Test get current user
    print("\n=== Testing Get Current User ===")
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    user = print_test("Get Current User", response)
    if not user:
        print("Failed to get user! Stopping tests.")
        return False

    return True

def test_accounts():
    global access_token
    print("\n=== Account Tests ===")

    # Test creating an account
    print("\n=== Testing Create Account ===")
    account_data = {
        "name": "Test Account",
        "type": "bank",
        "currency": "USD",
        "description": "Test account for API testing"
    }
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.post(f"{BASE_URL}/api/accounts/", json=account_data, headers=headers)
    account = print_test("Create Account", response)
    if not account:
        print("Failed to create account! Stopping tests.")
        return False

    # Test getting all accounts
    print("\n=== Testing Get All Accounts ===")
    response = requests.get(f"{BASE_URL}/api/accounts/", headers=headers)
    accounts = print_test("Get All Accounts", response)
    if not accounts:
        print("Failed to get accounts! Stopping tests.")
        return False

    return True

def test_categories():
    global access_token
    print("\n=== Category Tests ===")

    # Test creating a category
    print("\n=== Testing Create Category ===")
    category_data = {
        "name": "Test Category",
        "description": "Test category for API testing"
    }
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.post(f"{BASE_URL}/api/categories/", json=category_data, headers=headers)
    category = print_test("Create Category", response)
    if not category:
        print("Failed to create category! Stopping tests.")
        return False

    # Test getting all categories
    print("\n=== Testing Get All Categories ===")
    response = requests.get(f"{BASE_URL}/api/categories/", headers=headers)
    categories = print_test("Get All Categories", response)
    if not categories:
        print("Failed to get categories! Stopping tests.")
        return False

    return True

def test_transactions():
    global access_token
    print("\n=== Transaction Tests ===")

    # Test creating a transaction
    print("\n=== Testing Create Transaction ===")
    transaction_data = {
        "amount": 100.0,
        "type": "income",
        "description": "Test transaction",
        "account_id": 1,
        "category_id": 1,
        "date": datetime.utcnow().isoformat()
    }
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.post(f"{BASE_URL}/api/transactions/", json=transaction_data, headers=headers)
    transaction = print_test("Create Transaction", response)
    if not transaction:
        print("Failed to create transaction! Stopping tests.")
        return False

    # Test getting all transactions
    print("\n=== Testing Get All Transactions ===")
    response = requests.get(f"{BASE_URL}/api/transactions/", headers=headers)
    transactions = print_test("Get All Transactions", response)
    if not transactions:
        print("Failed to get transactions! Stopping tests.")
        return False

    return True

def main():
    # Reset database tables
    if not test_auth():
        print("Authentication failed! Stopping tests.")
        return

    if not test_users():
        print("User tests failed! Stopping tests.")
        return

    if not test_accounts():
        print("Account tests failed! Stopping tests.")
        return

    if not test_categories():
        print("Category tests failed! Stopping tests.")
        return

    if not test_transactions():
        print("Failed to test transactions! Stopping tests.")
        return

    print("\nAll tests completed successfully!")

if __name__ == "__main__":
    main()
