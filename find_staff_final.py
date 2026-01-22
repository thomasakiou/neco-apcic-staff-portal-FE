import json

def find_staff_final_paths(filename):
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        paths = data.get('paths', {})
        found = False
        for path, details in sorted(paths.items()):
            if 'final' in path:
                for method, op in details.items():
                    if method not in ['get', 'post', 'put', 'delete', 'patch']: continue
                    security = op.get('security', [])
                    for sec in security:
                        if 'OAuth2PasswordBearer' in sec:
                            print(f"FOUND: {method.upper()} {path}")
                            found = True
        if not found:
            print("No 'final' paths found with OAuth2PasswordBearer security.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_staff_final_paths('openapi.json')
