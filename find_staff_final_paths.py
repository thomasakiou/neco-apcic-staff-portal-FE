import json

def find_staff_final_paths(filename):
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        paths = data.get('paths', {})
        print("Paths containing 'staff-portal' and 'final':")
        for path in sorted(paths.keys()):
            if 'staff-portal' in path and 'final' in path:
                print(path)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_staff_final_paths('openapi.json')
