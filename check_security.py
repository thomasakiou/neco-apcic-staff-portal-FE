import json

def get_security_details(filename):
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        
        components = data.get('components', {})
        security_schemes = components.get('securitySchemes', {})
        print("Security Schemes:")
        print(json.dumps(security_schemes, indent=2))
        
        # Also check some specific endpoints
        paths = data.get('paths', {})
        relevant_paths = [
            '/api/staff-portal/me/posting',
            '/api/staff-portal/me/hod-posting',
            '/api/final-posting',
            '/api/hod-final-posting'
        ]
        
        print("\nEndpoint Security Requirements:")
        for path in relevant_paths:
            if path in paths:
                get_op = paths[path].get('get', {})
                security = get_op.get('security', 'No security defined')
                print(f"{path}: {security}")
            else:
                print(f"{path}: Path not found")
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_security_details('openapi.json')
