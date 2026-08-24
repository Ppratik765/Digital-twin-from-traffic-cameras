import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DigitalTwinEnvironment } from './environment.js';

export class DigitalTwinScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x93c5fd); // Vivid realistic sky blue
    this.scene.fog = new THREE.FogExp2(0x93c5fd, 0.0035); // Atmospheric horizon haze
    
    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      42,
      this.container.clientWidth / this.container.clientHeight,
      0.5,
      1200
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
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.03; // Don't go below ground
    this.controls.minDistance = 10;
    this.controls.maxDistance = 500;

    // Environment
    this.setupEnvironment();

    // Interaction Raycaster
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Ground BEV mesh reference
    this.groundMesh = null;

    // Resize handler
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupEnvironment() {
    // Ambient / Hemisphere light
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x445544, 0.7);
    hemiLight.position.set(0, 300, 0);
    this.scene.add(hemiLight);

    // Key Directional Sunlight
    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.6);
    dirLight.position.set(120, 160, 90);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 220;
    dirLight.shadow.camera.bottom = -220;
    dirLight.shadow.camera.left = -220;
    dirLight.shadow.camera.right = 220;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 600;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    dirLight.shadow.bias = -0.0003;
    this.scene.add(dirLight);

    // Secondary fill light for soft shadows
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.4);
    fillLight.position.set(-100, 80, -100);
    this.scene.add(fillLight);

    // Build the complete 3D procedural environment (terrain, roads, signals, houses, trees)
    this.env = new DigitalTwinEnvironment(this.scene);
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
    
    // Load BEV Texture
    const textureLoader = new THREE.TextureLoader();
    let material;
    if (meta.bev_texture) {
      const bevTexture = textureLoader.load('/' + meta.bev_texture);
      bevTexture.colorSpace = THREE.SRGBColorSpace;
      
      material = new THREE.MeshStandardMaterial({
        map: bevTexture,
        roughness: 0.85,
        metalness: 0.05,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
      });
    } else {
      material = new THREE.MeshStandardMaterial({ color: 0x2b2e33, roughness: 0.85 });
    }

    this.groundMesh = new THREE.Mesh(planeGeo, material);
    this.groundMesh.rotation.x = -Math.PI / 2; // Flat on XZ plane
    this.groundMesh.position.set(centerX, 0.01, centerZ); // Slightly elevated above base asphalt to avoid z-fighting
    this.groundMesh.receiveShadow = true;
    
    this.scene.add(this.groundMesh);
  }

  setupCameraView(viewType, targetPosition = new THREE.Vector3(0, 0, 0)) {
    switch (viewType) {
      case 'perspective':
        // Natural elevated overview matching intersection angle
        this.camera.position.set(0, 55, 75);
        break;
      case 'topdown':
        this.camera.position.set(targetPosition.x, 110, targetPosition.z);
        break;
      case 'driver':
        this.camera.position.set(targetPosition.x, 3.2, targetPosition.z - 12);
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
