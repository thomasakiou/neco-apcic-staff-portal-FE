import json

def compare_final_endpoints(file1, file2):
    try:
        def get_final(filename):
            with open(filename, 'r') as f:
                data = json.load(f)
            paths = data.get('paths', {})
            return {p: paths[p] for p in paths if 'final' in p}

        d1 = get_final(file1)
        d2 = get_final(file2)
        
        all_paths = set(d1.keys()) | set(d2.keys())
        
        for p in sorted(all_paths):
            if p in d1 and p in d2:
                if d1[p] == d2[p]:
                    print(f"{p}: Identical")
                else:
                    print(f"{p}: DIFFERENT")
            elif p in d1:
                print(f"{p}: Only in {file1}")
            else:
                print(f"{p}: Only in {file2}")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    compare_final_endpoints('openapi.json', 'latest_openapi.json')
