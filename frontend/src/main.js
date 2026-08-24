import * as THREE from 'three';
import { DigitalTwinScene } from './scene.js';
import { VehicleManager } from './vehicleManager.js';
import { HUD } from './hud.js';

class App {
  constructor() {
    this.video = document.getElementById('feed-video');
    this.scene = new DigitalTwinScene('webgl-container');
    this.vehicleManager = new VehicleManager(this.scene.scene);
    this.hud = new HUD();
    
    this.sceneData = null;
    this.meta = null;
    this.currentFrame = 1;

    // Transport UI
    this.btnPlay = document.getElementById('btn-play');
    this.timeline = document.getElementById('timeline');
    this.timeCurrent = document.getElementById('time-current');
    this.timeTotal = document.getElementById('time-total');
    
    this.isPlaying = false;
    this.selectedVehicleId = null;

    this.init();
  }

  async init() {
    try {
      // Load scene data
      const response = await fetch('/data/scene_data.json');
      if (!response.ok) {
        throw new Error("Could not load scene data");
      }
      this.sceneData = await response.json();
      this.meta = this.sceneData.meta;
      
      this.scene.loadEnvironment(this.meta);

      this.timeline.max = this.meta.total_frames;
      this.updateTimeDisplay();

      // Setup initial canvas resize for overlay
      setTimeout(() => this.hud.resizeCanvas(), 500);

      this.bindEvents();
      
      // Start loop
      this.animate();
      
      console.log('App initialized', this.meta);
    } catch (err) {
      console.error('Failed to load scene data. Ensure scene_data.json is present in public/data/.', err);
      const hudTitle = document.querySelector('.hud-title');
      if (hudTitle) {
        hudTitle.innerHTML = 'ITS Digital Twin <span style="color: #ef4444; font-size: 0.8rem; margin-left: 1rem;">WAITING FOR DATA (Upload scene_data.json & feed.mp4)</span>';
      }
    }
  }

  bindEvents() {
    // Play/Pause
    this.btnPlay.addEventListener('click', () => {
      if (this.video.paused) {
        this.video.play();
        this.isPlaying = true;
        this.btnPlay.innerHTML = '<i data-lucide="pause"></i>';
        if (window.lucide) window.lucide.createIcons();
      } else {
        this.video.pause();
        this.isPlaying = false;
        this.btnPlay.innerHTML = '<i data-lucide="play"></i>';
        if (window.lucide) window.lucide.createIcons();
      }
    });

    // Timeline Scrubbing
    this.timeline.addEventListener('input', (e) => {
      const frame = parseInt(e.target.value);
      this.currentFrame = frame;
      this.video.currentTime = frame / this.meta.fps;
      this.syncScene(); // force instant sync
    });

    // Video events
    this.video.addEventListener('timeupdate', () => {
      if (!this.timeline.matches(':active')) { // only update if not scrubbing manually
        this.currentFrame = Math.max(1, Math.floor(this.video.currentTime * this.meta.fps));
        this.timeline.value = this.currentFrame;
        this.updateTimeDisplay();
      }
    });

    this.video.addEventListener('play', () => this.isPlaying = true);
    this.video.addEventListener('pause', () => this.isPlaying = false);

    // Speed Controls
    document.querySelectorAll('.btn-speed').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-speed').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.video.playbackRate = parseFloat(e.target.dataset.speed);
      });
    });

    // View Controls
    document.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.btn-view').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        let targetPos = this.scene.controls.target.clone();
        if (this.selectedVehicleId) {
          const vData = this.sceneData.frames[this.currentFrame]?.find(v => v.id === this.selectedVehicleId);
          if (vData) targetPos = new THREE.Vector3(vData.x, 0, vData.z);
        }
        this.scene.setupCameraView(e.target.dataset.view, targetPos);
      });
    });

    // 3D Scene Interaction (Click to inspect)
    this.scene.renderer.domElement.addEventListener('pointerdown', (e) => {
      // Calculate mouse position in normalized device coordinates
      const rect = this.scene.container.getBoundingClientRect();
      this.scene.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.scene.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Raycast
      this.scene.raycaster.setFromCamera(this.scene.mouse, this.scene.camera);
      
      // Get all vehicle meshes
      const vehicles = Array.from(this.vehicleManager.vehicles.values());
      const intersects = this.scene.raycaster.intersectObjects(vehicles, true);

      if (intersects.length > 0) {
        // Find the root group of the intersected vehicle
        let object = intersects[0].object;
        while (object.parent && !object.userData.isVehicle) {
          object = object.parent;
        }
        
        if (object.userData.isVehicle) {
          this.selectedVehicleId = object.userData.id;
          // Look at it
          const vData = this.sceneData.frames[this.currentFrame]?.find(v => v.id === this.selectedVehicleId);
          if (vData) {
             const activeViewBtn = document.querySelector('.btn-view.active');
             if(activeViewBtn && activeViewBtn.dataset.view === 'driver') {
               this.scene.setupCameraView('driver', new THREE.Vector3(vData.x, 0, vData.z));
             } else {
               this.scene.controls.target.set(vData.x, 0, vData.z);
             }
          }
        }
      } else {
        this.selectedVehicleId = null;
        this.hud.hideInspector();
      }
    });
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  updateTimeDisplay() {
    this.timeCurrent.innerText = this.formatTime(this.video.currentTime);
    if (!isNaN(this.video.duration) && this.video.duration > 0) {
        this.timeTotal.innerText = this.formatTime(this.video.duration);
    } else if (this.meta) {
        this.timeTotal.innerText = this.formatTime(this.meta.total_frames / this.meta.fps);
    }
  }

  syncScene() {
    if (!this.sceneData || !this.meta) return;

    // Calculate current frame and progress to next frame for interpolation
    const exactFrame = this.video.currentTime * this.meta.fps + 1; // 1-indexed
    let frame1 = Math.floor(exactFrame);
    let progress = exactFrame - frame1;

    // Clamp
    if (frame1 < 1) frame1 = 1;
    if (frame1 > this.meta.total_frames) {
      frame1 = this.meta.total_frames;
      progress = 0;
    }

    let frame2 = frame1 + 1;
    if (frame2 > this.meta.total_frames) frame2 = this.meta.total_frames;

    const f1Data = this.sceneData.frames[frame1] || [];
    const f2Data = this.sceneData.frames[frame2] || [];

    // Update 3D Vehicles
    this.vehicleManager.updateVehicles(f1Data, f2Data, progress);

    // Update 2D Overlay (no interpolation, just use floor frame)
    this.hud.drawOverlay(f1Data, this.meta.resolution[0], this.meta.resolution[1]);

    // Update Stats
    let totalSpeed = 0;
    f1Data.forEach(v => totalSpeed += v.speed_kmh);
    const avgSpeed = f1Data.length > 0 ? totalSpeed / f1Data.length : 0;
    this.hud.updateStats(f1Data.length, avgSpeed);

    // Update Inspector
    if (this.selectedVehicleId) {
      const vData = f1Data.find(v => v.id === this.selectedVehicleId);
      if (vData) {
        this.hud.showInspector(vData);
        // Follow vehicle with camera if Driver Cam is active
        const activeViewBtn = document.querySelector('.btn-view.active');
        if(activeViewBtn && activeViewBtn.dataset.view === 'driver') {
          this.scene.setupCameraView('driver', new THREE.Vector3(vData.x, 0, vData.z));
        }
      } else {
        // Vehicle left the scene
        this.selectedVehicleId = null;
        this.hud.hideInspector();
      }
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    // Smooth sync during playback
    this.syncScene();
    
    // Render 3D scene
    this.scene.render();
  }
}

// Start app
window.onload = () => {
  new App();
};
