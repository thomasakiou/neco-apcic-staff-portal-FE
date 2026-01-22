import json

def find_me_final_paths(filename):
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        paths = data.get('paths', {})
        print("Paths containing 'me' and 'final':")
        for path in sorted(paths.keys()):
            if 'me' in path and 'final' in path:
                print(path)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_me_final_paths('openapi.json')
