import json

def compare_schemas(filename):
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        
        paths = data.get('paths', {})
        components = data.get('components', {})
        schemas = components.get('schemas', {})

        def get_schema_from_ref(ref):
            if not ref: return None
            schema_name = ref.split('/')[-1]
            return schemas.get(schema_name)

        def get_path_response_schema(path):
            op = paths.get(path, {}).get('get', {})
            content = op.get('responses', {}).get('200', {}).get('content', {})
            if 'application/json' in content:
                schema_ref = content['application/json'].get('schema', {}).get('$ref')
                return schema_ref
            return None

        relevant_paths = [
            '/api/staff-portal/me/posting',
            '/api/staff-portal/me/hod-posting',
            '/api/final-posting',
            '/api/hod-final-posting'
        ]

        print("Endpoint Response Schemas:")
        for path in relevant_paths:
            ref = get_path_response_schema(path)
            print(f"{path}: {ref}")
            
        # Compare StaffPortalPostingListResponse vs FinalPostingListResponse
        s1 = get_schema_from_ref(get_path_response_schema('/api/staff-portal/me/posting'))
        s2 = get_schema_from_ref(get_path_response_schema('/api/final-posting'))
        
        # Save schemas for inspection
        with json_out := open('posting_item_comparison.json', 'w'):
            json.dump({
                "staff_portal_posting": s1,
                "final_posting": s2
            }, json_out, indent=2)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    compare_schemas('openapi.json')
