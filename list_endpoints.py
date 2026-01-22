import json
import os

path = 'g:/Projects/neco-apcic-manager/neco-apcic-staff-portal-FE/openapi.json'
with open(path, 'r') as f:
    data = json.load(f)

results = []
for path, details in data['paths'].items():
    if not isinstance(details, dict): continue
    for method, info in details.items():
        if isinstance(info, dict) and 'tags' in info and 'Staff Portal' in info['tags']:
            results.append(f"{method.upper()} {path} ({info.get('summary', '')})")

with open('endpoints_list.txt', 'w') as f:
    f.write('\n'.join(results))
print(f"Written {len(results)} endpoints to endpoints_list.txt")
