import cv2
import numpy as np

video_path = 'frontend/public/videos/feed.mp4'

SRC_POINTS = np.array([
    [488, 414],   # Top-Left 
    [1441, 395],  # Top-Right
    [1917, 1067], # Bottom-Right 
    [261, 1072]   # Bottom-Left
], dtype=np.float32)

cap = cv2.VideoCapture(video_path)
total_bg_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
if total_bg_frames <= 0:
    total_bg_frames = 1955

print(f"Total frames: {total_bg_frames}")
frame_indices = np.random.choice(total_bg_frames, min(50, total_bg_frames), replace=False)
bg_frames = []
for idx in frame_indices:
    cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
    ret, frame = cap.read()
    if ret:
        bg_frames.append(frame)
cap.release()

if len(bg_frames) > 0:
    median_bg_img = np.median(bg_frames, axis=0).astype(np.uint8)
else:
    print("Error reading video frames")
    exit(1)

# Expanded 1500x1500 BEV texture covering -150m to +150m ground plane
# SRC_POINTS (-50 to +50) now map to the center 500-1000 pixel region
dst_bev_pts = np.float32([[500, 500], [1000, 500], [1000, 1000], [500, 1000]])
H_bev = cv2.getPerspectiveTransform(SRC_POINTS, dst_bev_pts)
bev_img = cv2.warpPerspective(median_bg_img, H_bev, (1500, 1500))

cv2.imwrite('frontend/public/textures/road_bev.png', bev_img)
print("Saved road_bev.png")
