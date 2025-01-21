import requests

def get_routes():
    response = requests.get("http://localhost:8000/openapi.json")
    paths = response.json()["paths"]
    print("\nAvailable Routes:")
    for path in sorted(paths.keys()):
        methods = list(paths[path].keys())
        print(f"{path}: {', '.join(methods)}")

if __name__ == "__main__":
    get_routes()
