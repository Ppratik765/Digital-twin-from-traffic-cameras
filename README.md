# 3D Intelligent Transport System (ITS) Digital Twin

A production-grade 3D Digital Twin system for traffic surveillance. This project processes the AIC22 CityFlow dataset video using YOLOv8 and ByteTrack to extract vehicle trajectories, maps them to a 3D real-world coordinate space using a homography matrix, and visualizes the results side-by-side in a Three.js interactive web application.

## Directory Structure

- `colab/`: Contains the Jupyter notebook to run the perception pipeline.
- `frontend/`: Contains the Vite + Three.js application.

## 1. Running the Perception Pipeline

The backend pipeline is computationally intensive and should be run on a GPU-enabled environment like Google Colab.

1. Upload `colab/its_perception_pipeline.ipynb` to Google Colab.
2. Ensure you have a Kaggle account. The notebook will prompt you for your `KAGGLE_USERNAME` and `KAGGLE_KEY` to download the dataset.
3. Run all cells in the notebook.
4. Once processing is complete, download `feed.mp4` and `scene_data.json` from the Colab file explorer.

## 2. Running the 3D Frontend

1. Move the generated files into the frontend directory:
   - Place `scene_data.json` into `frontend/public/data/`
   - Place `feed.mp4` into `frontend/public/videos/`

2. Open a terminal in the `frontend/` directory and install dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser to the local address provided by Vite (usually `http://localhost:3000`).

## Features
- **Split-Screen UI**: View the raw video with 2D bounding boxes alongside the interactive 3D WebGL reconstruction.
- **Continuous Interpolation**: Achieves fluid 60+ FPS in the 3D scene by interpolating position and heading (LERP/SLERP) between discrete video frame detections.
- **Multiple Views**: Switch between Perspective, Top-Down, and Driver Cam views.
- **Interactive Inspection**: Click on any vehicle in the 3D scene to view its live telemetry (speed, heading, coordinates).
