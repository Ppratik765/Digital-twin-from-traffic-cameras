import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class DigitalTwinScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87ceeb); // Light blue sky
    this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.005); // Atmospheric fog
    
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

    // Environment
    this.setupEnvironment();

    // Interaction Raycaster
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Resize handler
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupEnvironment() {
    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    hemiLight.position.set(0, 200, 0);
    this.scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(100, 150, 50);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 500;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    dirLight.shadow.bias = -0.0005;
    this.scene.add(dirLight);

    // Build the high-fidelity procedural intersection
    // this.env = new DigitalTwinEnvironment(this.scene); -> Removed in favor of BEV mapping
  }

  loadEnvironment(meta) {
    if (!meta || !meta.world_bounds) return;

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
        // Depending on OpenCV vs ThreeJS UV mapping, we might need to flip Y
        // OpenCV warpPerspective outputs image where origin is top-left, 
        // ThreeJS expects origin at bottom-left. Let's assume standard behavior first.
        bevTexture.colorSpace = THREE.SRGBColorSpace;
        
        material = new THREE.MeshStandardMaterial({
            map: bevTexture,
            roughness: 0.8,
            metalness: 0.1
        });
    } else {
        material = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });
    }

    const ground = new THREE.Mesh(planeGeo, material);
    ground.rotation.x = -Math.PI / 2; // Flat on XZ plane
    ground.position.set(centerX, 0, centerZ);
    ground.receiveShadow = true;
    
    // Rotate texture if needed because BEV top-down image represents Z as vertical, X as horizontal
    // but Three.js PlaneGeometry maps X to width and Y to height.
    // We will verify the orientation. 
    this.scene.add(ground);
  }

  setupCameraView(viewType, targetPosition = new THREE.Vector3(0, 0, 0)) {
    switch (viewType) {
      case 'perspective':
        this.camera.position.set(0, 40, 60);
        break;
      case 'topdown':
        this.camera.position.set(targetPosition.x, 100, targetPosition.z);
        break;
      case 'driver':
        this.camera.position.set(targetPosition.x, 2, targetPosition.z - 10);
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
