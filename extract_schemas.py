import json
import sys

with open('g:/Projects/neco-apcic-manager/neco-apcic-staff-portal-FE/openapi.json', 'r') as f:
    data = json.load(f)

schemas = data.get('components', {}).get('schemas', {})
targets = [
    'StaffPortalAPCResponse',
    'StaffPortalHODAPCResponse',
    'StaffPortalDriversAPCResponse',
    'StaffPortalTypsettingAPCResponse'
]

results = {}
for target in targets:
    if target in schemas:
        results[target] = schemas[target]
    else:
        # Try to find similar names if not exact match (for typos)
        for name in schemas:
            if target.lower() in name.lower() or name.lower() in target.lower():
                results[name] = schemas[name]

print(json.dumps(results, indent=2))
