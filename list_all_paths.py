import json

def list_paths(filename):
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        paths = data.get('paths', {})
        print(f"Total paths found: {len(paths)}")
        with open('all_paths.txt', 'w') as out:
            for path in sorted(paths.keys()):
                out.write(path + '\n')
        print("All paths written to all_paths.txt")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_paths('openapi.json')
