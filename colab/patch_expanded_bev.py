import json

nb_path = 'colab/its_perception_pipeline.ipynb'
with open(nb_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

for cell in nb['cells']:
    if cell['cell_type'] != 'code':
        continue
        
    source = "".join(cell['source'])
    
    if "cv2.warpPerspective(median_bg_img" in source and "world_bounds =" in source:
        # Update world bounds
        source = source.replace(
            "world_bounds = {'minX': -50.0, 'maxX': 50.0, 'minZ': -50.0, 'maxZ': 50.0}",
            "world_bounds = {'minX': -150.0, 'maxX': 150.0, 'minZ': -150.0, 'maxZ': 150.0}"
        )
        
        # Update BEV mapping
        old_bev = """# 1000x1000 BEV texture covering the -50m to +50m ground plane
dst_bev_pts = np.float32([[0, 0], [1000, 0], [1000, 1000], [0, 1000]])
H_bev = cv2.getPerspectiveTransform(SRC_POINTS, dst_bev_pts)
bev_img = cv2.warpPerspective(median_bg_img, H_bev, (1000, 1000))"""

        new_bev = """# Expanded 1500x1500 BEV texture covering -150m to +150m ground plane
# SRC_POINTS (-50 to +50) now map to the center 500-1000 pixel region
dst_bev_pts = np.float32([[500, 500], [1000, 500], [1000, 1000], [500, 1000]])
H_bev = cv2.getPerspectiveTransform(SRC_POINTS, dst_bev_pts)
bev_img = cv2.warpPerspective(median_bg_img, H_bev, (1500, 1500))"""
        
        source = source.replace(old_bev, new_bev)
        
        cell['source'] = [line + '\n' for line in source.split('\n')][:-1]

with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=2)

print("Updated colab successfully.")
