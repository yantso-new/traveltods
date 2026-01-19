
import json

with open('destinations.json', 'r') as f:
    data = json.load(f)

destinations = {}
for dest in data['destinations']:
    if dest['type'] in ['CITY', 'REGION', 'COUNTRY']:
        name = dest['name'].lower()
        # Prefer CITY over REGION if duplicates, but here we just overwrite
        destinations[name] = dest['destinationId']

# Sort keys
sorted_keys = sorted(destinations.keys())

print("const KNOWN_DESTINATIONS: Record<string, number> = {")
for key in sorted_keys:
    print(f'    "{key}": {destinations[key]},')
print("};")
