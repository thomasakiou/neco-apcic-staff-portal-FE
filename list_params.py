import json

def list_params(filename, path):
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        paths = data.get('paths', {})
        if path in paths:
            op = paths[path].get('get', {})
            params = op.get('parameters', [])
            print(f"Parameters for {path}:")
            print(json.dumps(params, indent=2))
        else:
            print(f"Path {path} not found")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_params('openapi.json', '/api/final-posting')
    print("\n")
    list_params('openapi.json', '/api/hod-final-posting')
