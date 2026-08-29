# Traffic Digital Twin: Real-Time 3D ITS from Monocular Traffic Surveillance

A modular, production-grade 3D Intelligent Transportation System (ITS) Digital Twin that transforms standard monocular CCTV traffic camera footage into a real-time, interactive 3D WebGL reconstruction. The system combines deep learning object detection (YOLOv8), multi-object tracking (ByteTrack), transformer-based semantic segmentation (SegFormer), ground-plane homography projection, and a Three.js / Vite web visualizer.

---

## Video Demonstration

<!-- Replace the video/image link below with your screen recording or demonstration GIF -->
[![Traffic Digital Twin Demo](https://via.placeholder.com/1280x720.png?text=Traffic+Digital+Twin+Video+Demonstration+Placeholder)](https://github.com/Ppratik765/Digital-twin-from-traffic-cameras)

*A video demonstration showing side-by-side synchronized surveillance footage with 2D detection telemetry and interactive 3D scene reconstruction with real-time vehicle inspection.*

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Key Features](#key-features)
- [Perception Pipeline](#perception-pipeline)
  - [1. Vehicle Detection and Tracking](#1-vehicle-detection-and-tracking)
  - [2. Ground-Plane Homography Mapping](#2-ground-plane-homography-mapping)
  - [3. Trajectory Smoothing and Kinematics](#3-trajectory-smoothing-and-kinematics)
  - [4. AI-Driven BEV Orthophoto Generation](#4-ai-driven-bev-orthophoto-generation)
- [Frontend 3D Visualizer](#frontend-3d-visualizer)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Phase 1: Running the Colab Perception Pipeline](#phase-1-running-the-colab-perception-pipeline)
  - [Phase 2: Running the 3D Web Visualizer](#phase-2-running-the-3d-web-visualizer)
- [Mathematical Formulation](#mathematical-formulation)
- [License and Citation](#license-and-citation)

---

## System Architecture

The Traffic Digital Twin system operates in a two-tier decoupled architecture:

1. **Perception Engine (Python / Google Colab / PyTorch)**: Processes monocular surveillance video, tracks vehicles across frames, estimates real-world metric trajectories via perspective projection, and segments ground-level pavement.
2. **Interactive Digital Twin Engine (Vite / Three.js / JavaScript)**: Renders a synchronized 3D virtual environment with dynamic vehicle meshes, continuous trajectory interpolation (LERP/SLERP), environmental layering, and live telemetry inspection.

```
+-------------------------------------------------------------------+
|                        Surveillance Feed                          |
|             (AIC22 CityFlow Dataset / Monocular CCTV)             |
+---------------------------------+---------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                  Backend Perception Pipeline                      |
|                                                                   |
|   1. YOLOv8x Detection (FP16, 1280px high-resolution input)       |
|   2. ByteTrack Tracking (Custom 60-frame occlusion buffer)        |
|   3. 4-Point Homography Transformation (Pixel -> Metric World)     |
|   4. Savitzky-Golay Smoothing & Boundary-Aware Kinematics         |
|   5. SegFormer Ground Segmentation & BEV Orthophoto Synthesis    |
+---------------------------------+---------------------------------+
                                  |
            Outputs: feed.mp4, scene_data.json, road_bev.png
                                  |
                                  v
+-------------------------------------------------------------------+
|                   Frontend 3D Digital Twin                        |
|                                                                   |
|   - Synchronized Video & 3D WebGL Split-Screen                    |
|   - Multi-Layered Environment (BEV + Procedural Concrete + Grid)  |
|   - Interactive Vehicle Telemetry Inspection                     |
|   - Sub-Frame LERP / SLERP Motion Smoothing (60+ FPS)             |
|   - Complete Playback Scrubbing & Speed Multipliers               |
+-------------------------------------------------------------------+
```

---

## Key Features

- **Synchronized Split-Screen Interface**: Raw video playback with 2D bounding boxes and real-time velocity annotations alongside an interactive 3D WebGL reconstruction.
- **Deep Tracking Persistence**: ByteTrack tracking configured with extended temporal buffers to maintain track IDs during visual occlusions (trees, signal poles, overlapping traffic).
- **Metric Ground Homography**: Exact 4-point projective transformation mapping pixel-space detections to real-world metric coordinates in meters.
- **Kinematic Smoothing**: Boundary-aware Savitzky-Golay polynomial filtering and median despiking to eliminate edge-clipping velocity spikes.
- **AI-Generated Ground Texture**: Cityscapes-trained SegFormer semantic segmentation isolates road and sidewalk pavement from 50-frame median background imagery to create an expansive $240\text{m} \times 240\text{m}$ orthophoto.
- **Layered 3D Environment**: Multi-stage depth layering consisting of an infinite dark-mode base plane, procedural concrete expansion joints, and transparent orthophoto overlays.
- **Vehicle Classification and Modeling**: Dynamic 3D model generation for standard passenger cars, semi-trucks with multi-axle trailers, buses, and motorcycles with contact ambient occlusion shadows.
- **Interactive Telemetry Inspector**: Raycasting selection allows users to click on any active vehicle to inspect its unique ID, classification, live speed (km/h), world coordinates $(X, Z)$, and heading angle.
- **Transport Controls**: Full timeline scrubbing with play/pause toggles and variable speed playback (0.5x, 1.0x, 2.0x).

---

## Perception Pipeline

### 1. Vehicle Detection and Tracking
Detection utilizes the YOLOv8x architecture with half-precision floating-point (FP16) inference. Input frames are processed at $1280\text{px}$ resolution with a tuned confidence threshold ($0.15$) to detect small, distant vehicles near the horizon. Tracking is handled by ByteTrack with a 60-frame temporal buffer (`track_buffer: 60`), preserving track continuity across temporary occlusions.

### 2. Ground-Plane Homography Mapping
A 4-point planar homography matrix ($H$) is calculated from calibration coordinates on the road apron to a metric $[-50\text{m}, +50\text{m}]$ ground plane. The ground-contact point of each detected vehicle is extracted from the bottom-center of its bounding box $(u = \frac{x_1 + x_2}{2}, v = y_2)$ and projected to world coordinates $(X, Z)$.

### 3. Trajectory Smoothing and Kinematics
- **Boundary-Aware Filtering**: Detections touching image boundaries are flagged to prevent clipped bounding-box endpoints from inducing artificial velocity spikes.
- **Savitzky-Golay Filtering**: A 21-frame polynomial filter smooths coordinate trajectories without introducing spatial lag.
- **Heading (Yaw) Computation**: Vehicle rotation is computed from displacement vectors over a 3-frame window and unwrapped to ensure smooth, continuous rotation without modular boundary jumps ($-\pi$ to $+\pi$).
- **Velocity Estimation**: Speed is calculated over a 5-frame moving window with median-filter despiking.

### 4. AI-Driven BEV Orthophoto Generation
The background road texture is synthesized by extracting a temporal median across 50 video frames. A SegFormer semantic segmentation model (`nvidia/segformer-b0-finetuned-cityscapes-1024-1024`) isolates road, sidewalk, and terrain classes. The segmented mask is warped using the homography matrix onto a $2400 \times 2400\text{px}$ RGBA canvas covering $\pm 120\text{m}$, creating a bird's-eye-view (BEV) orthophoto.

---

## Frontend 3D Visualizer

The web visualizer is built with Vite and Three.js, designed for smooth rendering:

- **60+ FPS Frame Interpolation**: Linearly interpolates position and spherically interpolates rotation between discrete 10 FPS dataset frames.
- **Lighting and Shading**: Uses an ACESFilmic tone-mapped renderer with PCFSoft shadow maps, hemisphere ambient lighting, and directional sunlight.
- **Procedural Fallback Ground**: A $300\text{m} \times 300\text{m}$ procedural concrete plane with textured expansion joints sits beneath the orthophoto to ensure seamless visual continuity outside the camera's field of view.

---

## Directory Structure

```
its-digital-twin/
|-- colab/
|   `-- its_perception_pipeline.ipynb   # Perception pipeline notebook
|-- frontend/
|   |-- index.html                      # Main HTML entry point
|   |-- package.json                    # Node dependencies and scripts
|   |-- vite.config.js                  # Vite bundler configuration
|   |-- public/
|   |   |-- data/
|   |   |   `-- scene_data.json         # Exported vehicle telemetry data
|   |   |-- textures/
|   |   |   `-- road_bev.png            # 2400x2400 RGBA BEV road orthophoto
|   |   `-- videos/
|   |       `-- feed.mp4                # H.264 encoded surveillance video
|   `-- src/
|       |-- hud.js                      # 2D overlay and telemetry HUD manager
|       |-- main.js                     # Application loop and synchronization
|       |-- scene.js                    # Three.js scene, lighting, and camera
|       |-- style.css                   # Glassmorphism dark-mode UI styles
|       `-- vehicleManager.js           # 3D vehicle generation and kinematics
`-- README.md                           # Project documentation
```

---

## Getting Started

### Prerequisites

- **Python Environment**: Google Colab with GPU runtime (T4, V100, or A100 recommended).
- **Node.js Environment**: Node.js (v18.0.0 or higher) and npm.
- **Kaggle Account**: Required to download the AIC22 CityFlow dataset.

---

### Phase 1: Running the Colab Perception Pipeline

1. Open Google Colab and upload `colab/its_perception_pipeline.ipynb`.
2. Connect to a GPU runtime (`Runtime` > `Change runtime type` > `T4 GPU`).
3. Run **Cell 1** and **Cell 2** to install dependencies and authenticate with your Kaggle API credentials.
4. Run **Cell 3** to calculate the ground-plane homography and verify the calibration quadrilateral visualization (`calibration_check.png`).
5. Run **Cell 4** to execute YOLOv8 tracking, trajectory smoothing, SegFormer segmentation, and BEV generation.
6. Once execution finishes, download the three generated files from the Colab file explorer:
   - `feed.mp4`
   - `scene_data.json`
   - `road_bev.png`

---

### Phase 2: Running the 3D Web Visualizer

1. Move the three downloaded files into your local frontend directories:
   ```bash
   # Place scene telemetry data
   cp scene_data.json frontend/public/data/scene_data.json

   # Place BEV road texture
   cp road_bev.png frontend/public/textures/road_bev.png

   # Place surveillance video
   cp feed.mp4 frontend/public/videos/feed.mp4
   ```

2. Navigate into the `frontend/` directory and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local URL (typically `http://localhost:5173`).

---

## Mathematical Formulation

### Planar Homography Projection

A point in homogeneous image coordinates $\mathbf{x} = [u, v, 1]^T$ is mapped to ground-plane world coordinates $\mathbf{X} = [X, Z, 1]^T$ via a $3 \times 3$ projective matrix $H$:

$$\begin{bmatrix} X' \\ Z' \\ w \end{bmatrix} = H \begin{bmatrix} u \\ v \\ 1 \end{bmatrix} = \begin{bmatrix} h_{11} & h_{12} & h_{13} \\ h_{21} & h_{22} & h_{23} \\ h_{31} & h_{32} & h_{33} \end{bmatrix} \begin{bmatrix} u \\ v \\ 1 \end{bmatrix}$$

The metric coordinates on the ground plane are obtained by dehomogenizing:

$$X = \frac{X'}{w}, \quad Z = \frac{Z'}{w}$$

### Kinematics and Heading (Yaw)

Given smoothed discrete trajectory coordinates $(X_i, Z_i)$ at frame index $i$:

$$\text{Yaw}_i = \text{atan2}\left(Z_i - Z_{i-k}, X_i - X_{i-k}\right), \quad k = 3$$

$$\text{Velocity}_i = \frac{\sqrt{(X_i - X_{i-m})^2 + (Z_i - Z_{i-m})^2}}{\Delta t_m} \times 3.6 \quad [\text{km/h}], \quad m = 5$$

---

## License and Citation

This project is developed for educational and research purposes in Intelligent Transportation Systems and Computer Vision. 

- **Dataset**: AIC22 CityFlow Multi-Camera Tracking Dataset.
- **Detection and Tracking Models**: Ultralytics YOLOv8 and ByteTrack.
- **Segmentation Model**: SegFormer finetuned on Cityscapes (NVIDIA / Hugging Face).
