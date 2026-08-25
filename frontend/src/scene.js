import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class DigitalTwinScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = new THREE.Scene();
    
    // 1. Smart City Dark Mode & Horizon Fog
    this.scene.background = new THREE.Color('#0f172a');
    this.scene.fog = new THREE.Fog('#0f172a', 60, 250);
    
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      45,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.setupCameraView('perspective');

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground

    // Ground mesh reference
    this.groundMesh = null;

    // Environment & Base Planes
    this.setupEnvironment();

    // Interaction Raycaster
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Resize handler
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupEnvironment() {
    // 5. Lighting Adjustments for Dark Mode
    const hemiLight = new THREE.HemisphereLight(0x94a3b8, 0x0f172a, 0.6);
    hemiLight.position.set(0, 200, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(80, 120, 60);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 80;
    dirLight.shadow.camera.bottom = -80;
    dirLight.shadow.camera.left = -80;
    dirLight.shadow.camera.right = 80;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 400;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // 2. The "Infinite" Asphalt Base Plane at y = 0.0
    const baseGeo = new THREE.PlaneGeometry(2000, 2000);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.95,
      metalness: 0.05
    });
    const basePlane = new THREE.Mesh(baseGeo, baseMat);
    basePlane.rotation.x = -Math.PI / 2;
    basePlane.position.set(0, 0.0, 0);
    basePlane.receiveShadow = true;
    this.scene.add(basePlane);

    // 4. Infinite Grid Helper at y = 0.05
    const gridHelper = new THREE.GridHelper(2000, 200, '#334155', '#1e293b');
    gridHelper.position.set(0, 0.05, 0);
    this.scene.add(gridHelper);

    // 4b. Procedural "concrete fallback" plane at y = 0.08.
    // Sits beneath the real extended photo texture (added in loadEnvironment,
    // at y = 0.1) and above the dark neon grid (y = 0.05). The real texture
    // is loaded with transparent: true, so wherever it is transparent
    // (outside the segmented ground area, or outside the source video frame
    // entirely) this plane shows through instead of bare dark grid — the
    // scene reads as continuous road/ground everywhere near the camera,
    // with a graceful, intentionally-lower-fidelity extension beyond that.
    const concreteGeo = new THREE.PlaneGeometry(300, 300);
    const concreteMat = new THREE.MeshStandardMaterial({
      map: this.createProceduralConcreteTexture(),
      roughness: 0.95,
      metalness: 0.0
    });
    const concretePlane = new THREE.Mesh(concreteGeo, concreteMat);
    concretePlane.rotation.x = -Math.PI / 2;
    concretePlane.position.set(0, 0.08, 0);
    concretePlane.receiveShadow = true;
    this.scene.add(concretePlane);
  }

  createProceduralConcreteTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base concrete tone sampled from the real feed.mp4 pavement (light grey)
    ctx.fillStyle = '#8d8d87';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle per-pixel noise so it doesn't read as a flat color fill
    const imgData = ctx.getImageData(0, 0, 512, 512);
    for (let i = 0; i < imgData.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 14;
      imgData.data[i] += n;
      imgData.data[i + 1] += n;
      imgData.data[i + 2] += n;
    }
    ctx.putImageData(imgData, 0, 0);

    // Faint expansion-joint grid lines, echoing the real concrete slab seams
    ctx.strokeStyle = 'rgba(60,60,55,0.35)';
    ctx.lineWidth = 2;
    const step = 64;
    for (let x = 0; x <= 512; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 512); ctx.stroke();
    }
    for (let y = 0; y <= 512; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(20, 20);
    return tex;
  }

  loadEnvironment(meta) {
    if (!meta || !meta.world_bounds) return;

    if (this.groundMesh) {
      this.scene.remove(this.groundMesh);
      this.groundMesh = null;
    }

    const bounds = meta.world_bounds;
    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxZ - bounds.minZ;
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerZ = (bounds.minZ + bounds.maxZ) / 2;

    const planeGeo = new THREE.PlaneGeometry(width, height);
    
    // 3. Intersection Texture Layering (Positioned at y = 0.1 to prevent Z-fighting)
    const textureLoader = new THREE.TextureLoader();
    let material;
    if (meta.bev_texture) {
      const bevTexture = textureLoader.load('/' + meta.bev_texture);
      bevTexture.colorSpace = THREE.SRGBColorSpace;
      
      material = new THREE.MeshStandardMaterial({
        map: bevTexture,
        roughness: 0.8,
        metalness: 0.1,
        transparent: true
      });
    } else {
      material = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 });
    }

    this.groundMesh = new THREE.Mesh(planeGeo, material);
    this.groundMesh.rotation.x = -Math.PI / 2; // Flat on XZ plane
    this.groundMesh.position.set(centerX, 0.1, centerZ); // Placed at y = 0.1
    this.groundMesh.receiveShadow = true;
    
    this.scene.add(this.groundMesh);
  }

  setupCameraView(viewType, targetPosition = new THREE.Vector3(0, 0, 0)) {
    switch (viewType) {
      case 'perspective':
        this.camera.position.set(0, 50, 70);
        break;
      case 'topdown':
        this.camera.position.set(targetPosition.x, 100, targetPosition.z);
        break;
      case 'driver':
        this.camera.position.set(targetPosition.x, 3, targetPosition.z - 12);
        break;
    }
    this.camera.lookAt(targetPosition);
    if (this.controls) {
      this.controls.target.copy(targetPosition);
    }
  }

  onWindowResize() {
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }

  render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
