import json

json_path = 'frontend/public/data/scene_data.json'
with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

data['meta']['world_bounds'] = {
    'minX': -150.0,
    'maxX': 150.0,
    'minZ': -150.0,
    'maxZ': 150.0
}

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, separators=(',', ':'))

print("Updated scene_data.json")
