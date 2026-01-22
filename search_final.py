import json
import os

path = 'g:/Projects/neco-apcic-manager/neco-apcic-staff-portal-FE/openapi.json'
with open(path, 'r') as f:
    data = json.load(f)

results = []
for path, details in data['paths'].items():
    if not isinstance(details, dict): continue
    for method, info in details.items():
        if isinstance(info, dict):
            text = str(info.get('summary', '')) + ' ' + str(info.get('description', ''))
            if 'final' in text.lower():
                results.append(f"{method.upper()} {path} ({info.get('summary', '')})")

with open('final_search_results.txt', 'w') as f:
    f.write('\n'.join(results))
print(f"Written {len(results)} matches to final_search_results.txt")
