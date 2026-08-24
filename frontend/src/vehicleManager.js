import * as THREE from 'three';

export class VehicleManager {
  constructor(scene) {
    this.scene = scene;
    this.vehicles = new Map(); // id -> THREE.Group
    this.materials = {
      car: new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3, metalness: 0.7 }), // Blue
      truck: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5, metalness: 0.2 }), // Orange
      bus: new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6, metalness: 0.1 }), // Green
      motorcycle: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.8 }), // Red
      glass: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.8 }),
      headlight: new THREE.MeshBasicMaterial({ color: 0xe0f2fe }),
      taillight: new THREE.MeshBasicMaterial({ color: 0xff0000 })
    };
  }

  createVehicleMesh(className) {
    const group = new THREE.Group();
    let bodyGeo, bodyMesh, roofGeo, roofMesh;

    // Simple procedural geometries based on class
    switch (className) {
      case 'truck':
      case 'bus':
        bodyGeo = new THREE.BoxGeometry(2.5, 3, 8);
        bodyMesh = new THREE.Mesh(bodyGeo, this.materials[className] || this.materials.truck);
        bodyMesh.position.y = 1.5;
        bodyMesh.castShadow = true;
        group.add(bodyMesh);
        break;
      case 'motorcycle':
        bodyGeo = new THREE.BoxGeometry(0.6, 1.2, 2);
        bodyMesh = new THREE.Mesh(bodyGeo, this.materials.motorcycle);
        bodyMesh.position.y = 0.6;
        bodyMesh.castShadow = true;
        group.add(bodyMesh);
        break;
      case 'car':
      default:
        // Chassis
        bodyGeo = new THREE.BoxGeometry(2, 1, 4);
        bodyMesh = new THREE.Mesh(bodyGeo, this.materials.car);
        bodyMesh.position.y = 0.7; // slightly off ground for wheels
        bodyMesh.castShadow = true;
        
        // Cabin
        roofGeo = new THREE.BoxGeometry(1.6, 0.8, 2);
        roofMesh = new THREE.Mesh(roofGeo, this.materials.glass);
        roofMesh.position.y = 1.6;
        roofMesh.position.z = -0.2;
        roofMesh.castShadow = true;

        // Headlights
        const hGeo = new THREE.PlaneGeometry(0.4, 0.2);
        const h1 = new THREE.Mesh(hGeo, this.materials.headlight);
        h1.position.set(0.6, 0.8, 2.01);
        const h2 = new THREE.Mesh(hGeo, this.materials.headlight);
        h2.position.set(-0.6, 0.8, 2.01);

        // Taillights
        const tGeo = new THREE.PlaneGeometry(0.4, 0.2);
        const t1 = new THREE.Mesh(tGeo, this.materials.taillight);
        t1.position.set(0.6, 0.9, -2.01);
        t1.rotation.y = Math.PI;
        const t2 = new THREE.Mesh(tGeo, this.materials.taillight);
        t2.position.set(-0.6, 0.9, -2.01);
        t2.rotation.y = Math.PI;

        group.add(bodyMesh);
        group.add(roofMesh);
        group.add(h1);
        group.add(h2);
        group.add(t1);
        group.add(t2);
        break;
    }

    // Add user data for raycasting
    group.userData = { isVehicle: true, className };
    return group;
  }

  updateVehicles(frameData, nextFrameData, progress) {
    const currentIds = new Set(frameData.map(v => v.id));

    // Remove stale vehicles
    for (const [id, vehicle] of this.vehicles.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(vehicle);
        this.vehicles.delete(id);
      }
    }

    // Add/Update current vehicles
    for (const vData of frameData) {
      let vehicle = this.vehicles.get(vData.id);
      if (!vehicle) {
        vehicle = this.createVehicleMesh(vData.class_name);
        vehicle.userData.id = vData.id;
        this.scene.add(vehicle);
        this.vehicles.set(vData.id, vehicle);
      }

      vehicle.userData.data = vData;

      // Find next state for interpolation
      const nextVData = nextFrameData ? nextFrameData.find(v => v.id === vData.id) : null;

      if (nextVData) {
        // LERP Position
        vehicle.position.x = THREE.MathUtils.lerp(vData.x, nextVData.x, progress);
        vehicle.position.z = THREE.MathUtils.lerp(vData.z, nextVData.z, progress);

        // SLERP Rotation (Heading)
        // Assuming angle 0 means moving along positive X. Note cityflow X_w/Z_w might have different orientation.
        // We negate yaw to match threejs rotation if needed, or adjust axis.
        const q1 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -vData.yaw);
        
        // Handle wrap-around for yaw interpolation
        let nextYaw = nextVData.yaw;
        if (nextYaw - vData.yaw > Math.PI) nextYaw -= Math.PI * 2;
        if (nextYaw - vData.yaw < -Math.PI) nextYaw += Math.PI * 2;

        const q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -nextYaw);
        
        vehicle.quaternion.slerpQuaternions(q1, q2, progress);
      } else {
        // No interpolation
        vehicle.position.set(vData.x, 0, vData.z);
        vehicle.rotation.y = -vData.yaw;
      }
    }
  }

  getVehicleById(id) {
    return this.vehicles.get(id);
  }
}
