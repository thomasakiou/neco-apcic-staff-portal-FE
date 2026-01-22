import json

def list_oauth2_paths(filename):
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        paths = data.get('paths', {})
        results = []
        for path, details in sorted(paths.items()):
            for method, op in details.items():
                if method not in ['get', 'post', 'put', 'delete', 'patch']: continue
                security = op.get('security', [])
                for sec in security:
                    if 'OAuth2PasswordBearer' in sec:
                        results.append(f"{method.upper()} {path}")
        
        with open('all_staff_paths.txt', 'w') as out:
            for line in results:
                out.write(line + '\n')
        print(f"Found {len(results)} methods with staff portal security. Written to all_staff_paths.txt")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_oauth2_paths('openapi.json')
