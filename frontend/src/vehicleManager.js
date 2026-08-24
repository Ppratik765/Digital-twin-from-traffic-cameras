import * as THREE from 'three';

export class VehicleManager {
  constructor(scene) {
    this.scene = scene;
    this.vehicles = new Map(); // id -> THREE.Group
    this.materials = {
      carBody: new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.25, metalness: 0.7, transparent: true }), // Deep metallic blue
      carBodyRed: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3, metalness: 0.6, transparent: true }), // Red
      carBodySilver: new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.2, metalness: 0.8, transparent: true }), // Silver
      carBodyBlack: new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.2, metalness: 0.9, transparent: true }), // Black
      truckBody: new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.35, metalness: 0.4, transparent: true }), // Emerald green semi cab
      truckTrailer: new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.6, metalness: 0.15, transparent: true }), // Clean white trailer
      motoBody: new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.3, metalness: 0.8, transparent: true }), // Sport red
      glass: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.05, metalness: 0.95, transparent: true, opacity: 0.9 }),
      wheel: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95, metalness: 0.05, transparent: true }),
      rim: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3, metalness: 0.9, transparent: true }),
      headlight: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }),
      taillight: new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true })
    };

    // Ambient Occlusion soft ground shadow texture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    const shadowTexture = new THREE.CanvasTexture(canvas);
    this.shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false });
  }

  createWheel(radius, thickness) {
    const wheelGroup = new THREE.Group();
    const tireGeo = new THREE.CylinderGeometry(radius, radius, thickness, 16);
    const tire = new THREE.Mesh(tireGeo, this.materials.wheel.clone());
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);
    
    const rimGeo = new THREE.CylinderGeometry(radius * 0.62, radius * 0.62, thickness + 0.04, 10);
    const rim = new THREE.Mesh(rimGeo, this.materials.rim.clone());
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);
    return wheelGroup;
  }

  createVehicleMesh(className, vehicleId = 0) {
    const group = new THREE.Group();
    group.userData = { isVehicle: true, className, wheels: [], currentOpacity: 0, markedForDeletion: false };

    let shadowScale = 1.0;

    // Distinct vehicle model generation (proportional to wide intersection lanes)
    if (className === 'truck' || className === 'bus') {
      shadowScale = 3.2;

      // 1. Semi-Truck Cabin (Front +Z)
      const cabGeo = new THREE.BoxGeometry(3.6, 3.6, 4.4);
      const cab = new THREE.Mesh(cabGeo, this.materials.truckBody.clone());
      cab.position.set(0, 3.0, 4.5);
      cab.castShadow = true;
      group.add(cab);

      // 2. Large Cargo Trailer (Rear -Z)
      const trailerGeo = new THREE.BoxGeometry(3.8, 5.0, 10.5);
      const trailer = new THREE.Mesh(trailerGeo, this.materials.truckTrailer.clone());
      trailer.position.set(0, 3.8, -3.2);
      trailer.castShadow = true;
      group.add(trailer);

      // Windshield
      const winGeo = new THREE.PlaneGeometry(2.6, 1.4);
      const win = new THREE.Mesh(winGeo, this.materials.glass.clone());
      win.position.set(0, 3.5, 6.72);
      group.add(win);

      // Headlights (+Z)
      const hGeo = new THREE.PlaneGeometry(0.5, 0.4);
      const h1 = new THREE.Mesh(hGeo, this.materials.headlight.clone());
      h1.position.set(1.2, 1.6, 6.72);
      const h2 = new THREE.Mesh(hGeo, this.materials.headlight.clone());
      h2.position.set(-1.2, 1.6, 6.72);
      group.add(h1);
      group.add(h2);

      // Taillights (-Z)
      const tGeo = new THREE.PlaneGeometry(0.5, 0.4);
      const t1 = new THREE.Mesh(tGeo, this.materials.taillight.clone());
      t1.position.set(1.2, 1.6, -8.47);
      t1.rotation.y = Math.PI;
      const t2 = new THREE.Mesh(tGeo, this.materials.taillight.clone());
      t2.position.set(-1.2, 1.6, -8.47);
      t2.rotation.y = Math.PI;
      group.add(t1);
      group.add(t2);

      // Heavy-Duty Truck Wheels (6 wheels)
      const wRadius = 0.85;
      const wThick = 0.55;
      const wheelPositions = [
        [-1.8, 4.5], [1.8, 4.5],   // Cab front
        [-1.8, -3.5], [1.8, -3.5], // Trailer mid
        [-1.8, -6.5], [1.8, -6.5]  // Trailer rear
      ];
      
      wheelPositions.forEach(p => {
        const w = this.createWheel(wRadius, wThick);
        w.position.set(p[0], wRadius, p[1]);
        group.add(w);
        group.userData.wheels.push({ mesh: w, radius: wRadius });
      });

    } else if (className === 'motorcycle' || className === 'bicycle') {
      shadowScale = 0.8;
      
      const bodyGeo = new THREE.BoxGeometry(0.9, 1.1, 2.8);
      const body = new THREE.Mesh(bodyGeo, this.materials.motoBody.clone());
      body.position.set(0, 0.9, 0);
      body.castShadow = true;
      group.add(body);

      // Headlight
      const hGeo = new THREE.PlaneGeometry(0.35, 0.35);
      const h = new THREE.Mesh(hGeo, this.materials.headlight.clone());
      h.position.set(0, 1.1, 1.42);
      group.add(h);

      // Taillight
      const tGeo = new THREE.PlaneGeometry(0.35, 0.35);
      const t = new THREE.Mesh(tGeo, this.materials.taillight.clone());
      t.position.set(0, 1.1, -1.42);
      t.rotation.y = Math.PI;
      group.add(t);

      // Wheels
      const wRadius = 0.5;
      const wThick = 0.22;
      const wheelPositions = [[0, 1.1], [0, -1.1]];
      
      wheelPositions.forEach(p => {
        const w = this.createWheel(wRadius, wThick);
        w.position.set(p[0], wRadius, p[1]);
        group.add(w);
        group.userData.wheels.push({ mesh: w, radius: wRadius });
      });

    } else {
      // Modern Suburban SUV / Sedan Car (Scaled up to 3.0m width, 6.2m length for visibility)
      shadowScale = 1.6;

      // Color variation based on vehicle ID
      const carPaints = [this.materials.carBody, this.materials.carBodySilver, this.materials.carBodyBlack, this.materials.carBodyRed];
      const paintMat = carPaints[Math.abs(vehicleId) % carPaints.length].clone();

      // Lower Chassis / Hood
      const bodyGeo = new THREE.BoxGeometry(3.0, 1.3, 6.2);
      const body = new THREE.Mesh(bodyGeo, paintMat);
      body.position.set(0, 1.15, 0);
      body.castShadow = true;
      group.add(body);

      // Cabin / Roof
      const roofGeo = new THREE.BoxGeometry(2.6, 1.1, 3.2);
      const roof = new THREE.Mesh(roofGeo, this.materials.glass.clone());
      roof.position.set(0, 2.3, -0.4);
      roof.castShadow = true;
      group.add(roof);

      // Headlights (+Z)
      const hGeo = new THREE.PlaneGeometry(0.5, 0.3);
      const h1 = new THREE.Mesh(hGeo, this.materials.headlight.clone());
      h1.position.set(0.95, 1.4, 3.11);
      const h2 = new THREE.Mesh(hGeo, this.materials.headlight.clone());
      h2.position.set(-0.95, 1.4, 3.11);
      group.add(h1);
      group.add(h2);

      // Taillights (-Z)
      const tGeo = new THREE.PlaneGeometry(0.5, 0.3);
      const t1 = new THREE.Mesh(tGeo, this.materials.taillight.clone());
      t1.position.set(0.95, 1.4, -3.11);
      t1.rotation.y = Math.PI;
      const t2 = new THREE.Mesh(tGeo, this.materials.taillight.clone());
      t2.position.set(-0.95, 1.4, -3.11);
      t2.rotation.y = Math.PI;
      group.add(t1);
      group.add(t2);

      // Car Wheels (4 wheels)
      const wRadius = 0.58;
      const wThick = 0.42;
      const wheelPositions = [
        [1.5, 1.9], [-1.5, 1.9],
        [1.5, -1.9], [-1.5, -1.9]
      ];
      
      wheelPositions.forEach(p => {
        const w = this.createWheel(wRadius, wThick);
        w.position.set(p[0], wRadius, p[1]);
        group.add(w);
        group.userData.wheels.push({ mesh: w, radius: wRadius });
      });
    }

    // Dynamic ground shadow disc
    const shadowGeo = new THREE.PlaneGeometry(6 * shadowScale, 6 * shadowScale);
    const shadow = new THREE.Mesh(shadowGeo, this.shadowMaterial.clone());
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.05;
    group.add(shadow);
    group.userData.shadow = shadow;

    // Initial opacity 0 for smooth fade-in
    this.setGroupOpacity(group, 0);

    return group;
  }

  setGroupOpacity(group, opacity) {
    group.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.opacity = opacity);
        } else {
          child.material.opacity = opacity;
        }
      }
    });
  }

  updateVehicles(frameData, nextFrameData, progress, meta) {
    const currentIds = new Set(frameData.map(v => v.id));

    // Mark vehicles for deletion if they are no longer in the frame
    for (const [id, vehicle] of this.vehicles.entries()) {
      if (!currentIds.has(id)) {
        vehicle.userData.markedForDeletion = true;
      } else {
        vehicle.userData.markedForDeletion = false;
      }
    }

    // Add/Update current vehicles
    for (const vData of frameData) {
      let vehicle = this.vehicles.get(vData.id);
      if (!vehicle) {
        vehicle = this.createVehicleMesh(vData.class_name, vData.id);
        vehicle.userData.id = vData.id;
        this.scene.add(vehicle);
        this.vehicles.set(vData.id, vehicle);
      }

      vehicle.userData.data = vData;

      const nextVData = nextFrameData ? nextFrameData.find(v => v.id === vData.id) : null;
      const prevPos = vehicle.position.clone();

      let interpolatedX, interpolatedZ, interpolatedYaw;

      if (nextVData) {
        interpolatedX = THREE.MathUtils.lerp(vData.x, nextVData.x, progress);
        interpolatedZ = THREE.MathUtils.lerp(vData.z, nextVData.z, progress);
        interpolatedYaw = THREE.MathUtils.lerp(vData.yaw, nextVData.yaw, progress);
      } else {
        interpolatedX = vData.x;
        interpolatedZ = vData.z;
        interpolatedYaw = vData.yaw;
      }

      // Check bounds
      const inBounds = (
        !meta || !meta.world_bounds || (
          interpolatedX >= meta.world_bounds.minX - 35 &&
          interpolatedX <= meta.world_bounds.maxX + 35 &&
          interpolatedZ >= meta.world_bounds.minZ - 35 &&
          interpolatedZ <= meta.world_bounds.maxZ + 35
        )
      );

      if (!inBounds) {
        vehicle.userData.markedForDeletion = true;
      }

      // Direct coordinate binding
      vehicle.position.x = interpolatedX;
      vehicle.position.z = interpolatedZ;
      vehicle.rotation.y = -interpolatedYaw + Math.PI / 2;

      // Animate wheels based on movement
      const moved = prevPos.distanceTo(vehicle.position);
      if (moved < 5) {
        vehicle.userData.wheels.forEach(w => {
          w.mesh.rotation.x += moved / w.radius;
        });
      }
    }

    // Fade opacity and remove deleted vehicles
    for (const [id, vehicle] of this.vehicles.entries()) {
      if (vehicle.userData.markedForDeletion) {
        vehicle.userData.currentOpacity = THREE.MathUtils.lerp(vehicle.userData.currentOpacity, 0, 0.15);
        if (vehicle.userData.currentOpacity < 0.05) {
          this.scene.remove(vehicle);
          this.vehicles.delete(id);
        } else {
          this.setGroupOpacity(vehicle, vehicle.userData.currentOpacity);
        }
      } else {
        vehicle.userData.currentOpacity = THREE.MathUtils.lerp(vehicle.userData.currentOpacity, 1.0, 0.15);
        this.setGroupOpacity(vehicle, vehicle.userData.currentOpacity);
      }
    }
  }

  getVehicleById(id) {
    return this.vehicles.get(id);
  }
}
