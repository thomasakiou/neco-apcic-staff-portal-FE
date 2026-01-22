import json

def list_final_details(filename):
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        paths = data.get('paths', {})
        print("Paths containing 'final' with tags and security:")
        for path, details in sorted(paths.items()):
            if 'final' in path:
                for method, op in details.items():
                    if method not in ['get', 'post', 'put', 'delete', 'patch']: continue
                    tags = op.get('tags', [])
                    security = op.get('security', [])
                    print(f"{method.upper()} {path} | Tags: {tags} | Security: {security}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_final_details('openapi.json')
