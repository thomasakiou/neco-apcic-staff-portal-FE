import json

def get_staff_posting_details(filename):
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        paths = data.get('paths', {})
        results = {}
        target_paths = [
            '/api/staff-portal/me/posting',
            '/api/staff-portal/me/hod-posting'
        ]
        for path in target_paths:
            if path in paths:
                results[path] = paths[path]
        
        with open('staff_posting_details.json', 'w') as out:
            json.dump(results, out, indent=2)
        print(f"Details for {len(results)} paths written to staff_posting_details.json")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_staff_posting_details('openapi.json')
