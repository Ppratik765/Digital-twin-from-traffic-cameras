import * as THREE from 'three';

export class VehicleManager {
  constructor(scene) {
    this.scene = scene;
    this.vehicles = new Map(); // id -> THREE.Group
    this.materials = {
      carBody: new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3, metalness: 0.7 }), // Blue
      truckBody: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5, metalness: 0.2 }), // Orange
      truckTrailer: new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.7, metalness: 0.1 }), // White
      glass: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9 }),
      wheel: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9, metalness: 0.1 }),
      rim: new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4, metalness: 0.8 }),
      headlight: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      taillight: new THREE.MeshBasicMaterial({ color: 0xff0000 })
    };
  }

  createWheel(radius, thickness) {
    const wheelGroup = new THREE.Group();
    // Tire
    const tireGeo = new THREE.CylinderGeometry(radius, radius, thickness, 16);
    const tire = new THREE.Mesh(tireGeo, this.materials.wheel);
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);
    
    // Rim
    const rimGeo = new THREE.CylinderGeometry(radius * 0.6, radius * 0.6, thickness + 0.02, 8);
    const rim = new THREE.Mesh(rimGeo, this.materials.rim);
    rim.rotation.x = Math.PI / 2;
    wheelGroup.add(rim);
    return wheelGroup;
  }

  createVehicleMesh(className) {
    const group = new THREE.Group();
    group.userData = { isVehicle: true, className, wheels: [] };

    // To fix sliding: yaw=0 means moving along +X axis.
    // So the vehicle's front points towards +X. Length is along X, width along Z.

    if (className === 'truck' || className === 'bus') {
      // TRUCK CABIN
      const cabGeo = new THREE.BoxGeometry(3, 2.5, 2.5);
      const cab = new THREE.Mesh(cabGeo, this.materials.truckBody);
      cab.position.set(3, 2.25, 0); // Front is +X
      cab.castShadow = true;
      group.add(cab);

      // TRAILER
      const trailerGeo = new THREE.BoxGeometry(7, 3.5, 2.6);
      const trailer = new THREE.Mesh(trailerGeo, this.materials.truckTrailer);
      trailer.position.set(-2, 2.75, 0);
      trailer.castShadow = true;
      group.add(trailer);

      // CABIN WINDOW
      const winGeo = new THREE.PlaneGeometry(0.5, 1.2);
      const win = new THREE.Mesh(winGeo, this.materials.glass);
      win.position.set(4.51, 2.5, 0);
      win.rotation.y = Math.PI / 2;
      group.add(win);

      // TRUCK WHEELS (6 wheels: 2 front cab, 4 rear trailer)
      const wRadius = 0.6;
      const wThick = 0.4;
      const wheelPositions = [
        [3, -1.25], [3, 1.25], // Cab front
        [-2.5, -1.25], [-2.5, 1.25], // Trailer mid
        [-4.5, -1.25], [-4.5, 1.25]  // Trailer rear
      ];
      
      wheelPositions.forEach(p => {
        const w = this.createWheel(wRadius, wThick);
        w.position.set(p[0], wRadius, p[1]);
        group.add(w);
        group.userData.wheels.push({ mesh: w, radius: wRadius });
      });

    } else {
      // CAR CHASSIS
      const bodyGeo = new THREE.BoxGeometry(4.5, 1, 2);
      const body = new THREE.Mesh(bodyGeo, this.materials.carBody);
      body.position.set(0, 0.9, 0);
      body.castShadow = true;
      group.add(body);

      // CAR CABIN
      const roofGeo = new THREE.BoxGeometry(2.2, 0.8, 1.8);
      const roof = new THREE.Mesh(roofGeo, this.materials.glass);
      roof.position.set(-0.2, 1.8, 0); // slightly back
      roof.castShadow = true;
      group.add(roof);

      // HEADLIGHTS (Facing +X)
      const hGeo = new THREE.PlaneGeometry(0.2, 0.3);
      const h1 = new THREE.Mesh(hGeo, this.materials.headlight);
      h1.position.set(2.26, 1.1, 0.6);
      h1.rotation.y = Math.PI / 2;
      const h2 = new THREE.Mesh(hGeo, this.materials.headlight);
      h2.position.set(2.26, 1.1, -0.6);
      h2.rotation.y = Math.PI / 2;
      group.add(h1);
      group.add(h2);

      // TAILLIGHTS (Facing -X)
      const tGeo = new THREE.PlaneGeometry(0.2, 0.3);
      const t1 = new THREE.Mesh(tGeo, this.materials.taillight);
      t1.position.set(-2.26, 1.1, 0.6);
      t1.rotation.y = -Math.PI / 2;
      const t2 = new THREE.Mesh(tGeo, this.materials.taillight);
      t2.position.set(-2.26, 1.1, -0.6);
      t2.rotation.y = -Math.PI / 2;
      group.add(t1);
      group.add(t2);

      // CAR WHEELS
      const wRadius = 0.4;
      const wThick = 0.3;
      const wheelPositions = [
        [1.5, 1], [1.5, -1],
        [-1.5, 1], [-1.5, -1]
      ];
      
      wheelPositions.forEach(p => {
        const w = this.createWheel(wRadius, wThick);
        w.position.set(p[0], wRadius, p[1]);
        group.add(w);
        group.userData.wheels.push({ mesh: w, radius: wRadius });
      });
    }

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

      const nextVData = nextFrameData ? nextFrameData.find(v => v.id === vData.id) : null;

      const prevPos = vehicle.position.clone();

      if (nextVData) {
        // LERP Position
        vehicle.position.x = THREE.MathUtils.lerp(vData.x, nextVData.x, progress);
        vehicle.position.z = THREE.MathUtils.lerp(vData.z, nextVData.z, progress);

        // SLERP Rotation (Heading)
        const q1 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -vData.yaw);
        
        let nextYaw = nextVData.yaw;
        if (nextYaw - vData.yaw > Math.PI) nextYaw -= Math.PI * 2;
        if (nextYaw - vData.yaw < -Math.PI) nextYaw += Math.PI * 2;

        const q2 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -nextYaw);
        
        vehicle.quaternion.slerpQuaternions(q1, q2, progress);
      } else {
        vehicle.position.set(vData.x, 0, vData.z);
        vehicle.rotation.y = -vData.yaw;
      }

      // Animate wheels based on actual distance moved
      const moved = prevPos.distanceTo(vehicle.position);
      
      // If distance is too large (spawn glitch), don't spin wheels crazy fast
      if (moved < 5) {
        vehicle.userData.wheels.forEach(w => {
          w.mesh.rotation.z -= moved / w.radius; 
        });
      }
    }
  }

  getVehicleById(id) {
    return this.vehicles.get(id);
  }
}
