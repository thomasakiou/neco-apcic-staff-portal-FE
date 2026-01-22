import json

def get_endpoint_details(filename, target_paths):
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        paths = data.get('paths', {})
        results = {}
        for path in target_paths:
            if path in paths:
                results[path] = paths[path]
        
        with open('final_endpoint_details.json', 'w') as out:
            json.dump(results, out, indent=2)
        print(f"Details for {len(results)} paths written to final_endpoint_details.json")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_endpoint_details('openapi.json', ['/api/final-posting', '/api/hod-final-posting'])
