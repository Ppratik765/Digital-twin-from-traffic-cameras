export class HUD {
  constructor() {
    this.statCount = document.getElementById('stat-count');
    this.statSpeed = document.getElementById('stat-speed');
    
    // Inspector Card
    this.inspectorCard = document.getElementById('inspector-card');
    this.inspectId = document.getElementById('inspect-id');
    this.inspectClass = document.getElementById('inspect-class');
    this.inspectSpeed = document.getElementById('inspect-speed');
    this.inspectX = document.getElementById('inspect-x');
    this.inspectZ = document.getElementById('inspect-z');
    this.inspectYaw = document.getElementById('inspect-yaw');

    // Canvas overlay for 2D bounding boxes
    this.overlayCanvas = document.getElementById('overlay-canvas');
    this.overlayCtx = this.overlayCanvas.getContext('2d');
    
    this.video = document.getElementById('feed-video');
    
    // Resize observer to keep canvas matching video dimensions exactly
    window.addEventListener('resize', this.resizeCanvas.bind(this));
    // Wait for video metadata to have intrinsic dimensions
    this.video.addEventListener('loadedmetadata', this.resizeCanvas.bind(this));
  }

  resizeCanvas() {
    // The canvas should match the actual rendered size of the video element
    const rect = this.video.getBoundingClientRect();
    this.overlayCanvas.width = rect.width;
    this.overlayCanvas.height = rect.height;
  }

  updateStats(activeCount, avgSpeed) {
    this.statCount.innerText = activeCount;
    this.statSpeed.innerText = avgSpeed.toFixed(1);
  }

  showInspector(vehicleData) {
    if (!vehicleData) {
      this.inspectorCard.classList.add('hidden');
      return;
    }
    this.inspectorCard.classList.remove('hidden');
    this.inspectId.innerText = vehicleData.id;
    this.inspectClass.innerText = vehicleData.class_name;
    this.inspectSpeed.innerText = vehicleData.speed_kmh.toFixed(1);
    this.inspectX.innerText = vehicleData.x.toFixed(2);
    this.inspectZ.innerText = vehicleData.z.toFixed(2);
    // Convert radians to degrees for display
    this.inspectYaw.innerText = (vehicleData.yaw * (180 / Math.PI)).toFixed(0);
  }

  hideInspector() {
    this.inspectorCard.classList.add('hidden');
  }

  drawOverlay(frameData, videoWidth, videoHeight) {
    // Clear canvas completely
    this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
    
    if (!frameData || !videoWidth || !videoHeight) return;

    // We need to scale from intrinsic video dimensions to displayed canvas dimensions
    const scaleX = this.overlayCanvas.width / videoWidth;
    const scaleY = this.overlayCanvas.height / videoHeight;

    this.overlayCtx.lineWidth = 2;
    this.overlayCtx.font = '12px Inter, sans-serif';

    const hiddenOverlayIds = new Set([1, 2, 3, 5]);

    frameData.forEach(v => {
      if (hiddenOverlayIds.has(v.id)) return;
      const [x1, y1, x2, y2] = v.bbox;
      
      const sx1 = x1 * scaleX;
      const sy1 = y1 * scaleY;
      const sx2 = x2 * scaleX;
      const sy2 = y2 * scaleY;
      
      const w = sx2 - sx1;
      const h = sy2 - sy1;

      // Color based on class
      let color = '#3b82f6'; // car (blue)
      if (v.class_name === 'truck') color = '#f59e0b';
      if (v.class_name === 'bus') color = '#10b981';
      if (v.class_name === 'motorcycle') color = '#ef4444';

      this.overlayCtx.strokeStyle = color;
      this.overlayCtx.strokeRect(sx1, sy1, w, h);

      // Label background
      this.overlayCtx.fillStyle = color;
      const label = `ID:${v.id} ${v.speed_kmh.toFixed(0)}km/h`;
      const textWidth = this.overlayCtx.measureText(label).width;
      this.overlayCtx.fillRect(sx1, sy1 - 20, textWidth + 8, 20);

      // Label text
      this.overlayCtx.fillStyle = '#ffffff';
      this.overlayCtx.fillText(label, sx1 + 4, sy1 - 5);
    });
  }
}
