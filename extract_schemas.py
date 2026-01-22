import json

def extract_schemas(filename, schema_names):
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        
        schemas = data.get('components', {}).get('schemas', {})
        results = {}
        for name in schema_names:
            if name in schemas:
                results[name] = schemas[name]
            else:
                print(f"Schema {name} not found")
        
        with open('schemas_comparison.json', 'w') as out:
            json.dump(results, out, indent=2)
        print(f"Extracted {len(results)} schemas to schemas_comparison.json")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    schema_names = [
        'StaffPortalPostingListResponse',
        'StaffPortalPostingResponse',
        'FinalPostingListResponse',
        'FinalPostingResponse',
        'StaffPortalHODPostingListResponse',
        'StaffPortalHODPostingResponse',
        'HODFinalPostingListResponse',
        'HODFinalPostingResponse'
    ]
    extract_schemas('openapi.json', schema_names)
