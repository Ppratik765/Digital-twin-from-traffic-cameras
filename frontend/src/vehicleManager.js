import * as THREE from 'three';

export class VehicleManager {
  constructor(scene) {
    this.scene = scene;
    this.vehicles = new Map(); // id -> THREE.Group
    this.materials = {
      carBody: new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3, metalness: 0.7, transparent: true }), // Blue
      truckBody: new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4, metalness: 0.3, transparent: true }), // Green semi-truck cab
      truckTrailer: new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.7, metalness: 0.1, transparent: true }), // White trailer
      motoBody: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.8, transparent: true }), // Red
      glass: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.1, metalness: 0.9, transparent: true }),
      wheel: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9, metalness: 0.1, transparent: true }),
      rim: new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.4, metalness: 0.8, transparent: true }),
      headlight: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true }),
      taillight: new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true })
    };

    // Create AO shadow texture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(0,0,0, 0.6)');
    gradient.addColorStop(1, 'rgba(0,0,0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    const shadowTexture = new THREE.CanvasTexture(canvas);
    this.shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, depthWrite: false });
  }

  createWheel(radius, thickness) {
    const wheelGroup = new THREE.Group();
    const tireGeo = new THREE.CylinderGeometry(radius, radius, thickness, 16);
    const tire = new THREE.Mesh(tireGeo, this.materials.wheel.clone());
    tire.rotation.z = Math.PI / 2; // Cylinder aligned with X axis (width of vehicle)
    tire.castShadow = true;
    wheelGroup.add(tire);
    
    const rimGeo = new THREE.CylinderGeometry(radius * 0.6, radius * 0.6, thickness + 0.02, 8);
    const rim = new THREE.Mesh(rimGeo, this.materials.rim.clone());
    rim.rotation.z = Math.PI / 2;
    wheelGroup.add(rim);
    return wheelGroup;
  }

  createVehicleMesh(className) {
    const group = new THREE.Group();
    group.userData = { isVehicle: true, className, wheels: [], currentOpacity: 0, markedForDeletion: false };
    group.scale.set(1.5, 1.5, 1.5); // 50% larger

    let shadowScale = 1;

    // Vehicle models are oriented facing +Z when rotation.y = 0
    if (className === 'truck' || className === 'bus') {
      shadowScale = 2.5;
      
      // Truck Cabin (Front +Z)
      const cabGeo = new THREE.BoxGeometry(2.5, 2.5, 3.0);
      const cab = new THREE.Mesh(cabGeo, this.materials.truckBody.clone());
      cab.position.set(0, 2.25, 3.0);
      cab.castShadow = true;
      group.add(cab);

      // Trailer (Rear -Z)
      const trailerGeo = new THREE.BoxGeometry(2.6, 3.5, 7.0);
      const trailer = new THREE.Mesh(trailerGeo, this.materials.truckTrailer.clone());
      trailer.position.set(0, 2.75, -2.0);
      trailer.castShadow = true;
      group.add(trailer);

      // Windshield
      const winGeo = new THREE.PlaneGeometry(1.8, 1.0);
      const win = new THREE.Mesh(winGeo, this.materials.glass.clone());
      win.position.set(0, 2.6, 4.51);
      group.add(win);

      // Headlights (+Z)
      const hGeo = new THREE.PlaneGeometry(0.3, 0.3);
      const h1 = new THREE.Mesh(hGeo, this.materials.headlight.clone());
      h1.position.set(0.8, 1.2, 4.51);
      const h2 = new THREE.Mesh(hGeo, this.materials.headlight.clone());
      h2.position.set(-0.8, 1.2, 4.51);
      group.add(h1);
      group.add(h2);

      // Taillights (-Z)
      const tGeo = new THREE.PlaneGeometry(0.3, 0.3);
      const t1 = new THREE.Mesh(tGeo, this.materials.taillight.clone());
      t1.position.set(0.8, 1.2, -5.51);
      t1.rotation.y = Math.PI;
      const t2 = new THREE.Mesh(tGeo, this.materials.taillight.clone());
      t2.position.set(-0.8, 1.2, -5.51);
      t2.rotation.y = Math.PI;
      group.add(t1);
      group.add(t2);

      // Truck Wheels (6 wheels)
      const wRadius = 0.6;
      const wThick = 0.4;
      const wheelPositions = [
        [-1.25, 3.0], [1.25, 3.0],   // Cab front
        [-1.25, -2.5], [1.25, -2.5], // Trailer mid
        [-1.25, -4.5], [1.25, -4.5]  // Trailer rear
      ];
      
      wheelPositions.forEach(p => {
        const w = this.createWheel(wRadius, wThick);
        w.position.set(p[0], wRadius, p[1]);
        group.add(w);
        group.userData.wheels.push({ mesh: w, radius: wRadius });
      });

    } else if (className === 'motorcycle' || className === 'bicycle') {
      shadowScale = 0.6;
      
      const bodyGeo = new THREE.BoxGeometry(0.6, 0.8, 2.0);
      const body = new THREE.Mesh(bodyGeo, this.materials.motoBody.clone());
      body.position.set(0, 0.7, 0);
      body.castShadow = true;
      group.add(body);

      // Headlight
      const hGeo = new THREE.PlaneGeometry(0.2, 0.2);
      const h = new THREE.Mesh(hGeo, this.materials.headlight.clone());
      h.position.set(0, 0.8, 1.01);
      group.add(h);

      // Taillight
      const tGeo = new THREE.PlaneGeometry(0.2, 0.2);
      const t = new THREE.Mesh(tGeo, this.materials.taillight.clone());
      t.position.set(0, 0.8, -1.01);
      t.rotation.y = Math.PI;
      group.add(t);

      // Motorcycle Wheels (2 wheels)
      const wRadius = 0.35;
      const wThick = 0.15;
      const wheelPositions = [[0, 0.8], [0, -0.8]];
      
      wheelPositions.forEach(p => {
        const w = this.createWheel(wRadius, wThick);
        w.position.set(p[0], wRadius, p[1]);
        group.add(w);
        group.userData.wheels.push({ mesh: w, radius: wRadius });
      });

    } else {
      // Default: Car
      shadowScale = 1.2;
      
      // Car Chassis
      const bodyGeo = new THREE.BoxGeometry(2.0, 0.9, 4.5);
      const body = new THREE.Mesh(bodyGeo, this.materials.carBody.clone());
      body.position.set(0, 0.85, 0);
      body.castShadow = true;
      group.add(body);

      // Car Cabin / Roof
      const roofGeo = new THREE.BoxGeometry(1.8, 0.8, 2.2);
      const roof = new THREE.Mesh(roofGeo, this.materials.glass.clone());
      roof.position.set(0, 1.7, -0.2);
      roof.castShadow = true;
      group.add(roof);

      // Headlights (+Z)
      const hGeo = new THREE.PlaneGeometry(0.3, 0.2);
      const h1 = new THREE.Mesh(hGeo, this.materials.headlight.clone());
      h1.position.set(0.6, 1.0, 2.26);
      const h2 = new THREE.Mesh(hGeo, this.materials.headlight.clone());
      h2.position.set(-0.6, 1.0, 2.26);
      group.add(h1);
      group.add(h2);

      // Taillights (-Z)
      const tGeo = new THREE.PlaneGeometry(0.3, 0.2);
      const t1 = new THREE.Mesh(tGeo, this.materials.taillight.clone());
      t1.position.set(0.6, 1.0, -2.26);
      t1.rotation.y = Math.PI;
      const t2 = new THREE.Mesh(tGeo, this.materials.taillight.clone());
      t2.position.set(-0.6, 1.0, -2.26);
      t2.rotation.y = Math.PI;
      group.add(t1);
      group.add(t2);

      // Car Wheels (4 wheels)
      const wRadius = 0.4;
      const wThick = 0.3;
      const wheelPositions = [
        [1.0, 1.5], [-1.0, 1.5],
        [1.0, -1.5], [-1.0, -1.5]
      ];
      
      wheelPositions.forEach(p => {
        const w = this.createWheel(wRadius, wThick);
        w.position.set(p[0], wRadius, p[1]);
        group.add(w);
        group.userData.wheels.push({ mesh: w, radius: wRadius });
      });
    }

    // Add AO shadow disc
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
        vehicle = this.createVehicleMesh(vData.class_name);
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
          interpolatedX >= meta.world_bounds.minX - 15 &&
          interpolatedX <= meta.world_bounds.maxX + 15 &&
          interpolatedZ >= meta.world_bounds.minZ - 15 &&
          interpolatedZ <= meta.world_bounds.maxZ + 15
        )
      );

      if (!inBounds) {
        vehicle.userData.markedForDeletion = true;
      }

      // Direct coordinate binding - DO NOT CLAMP OR OVERRIDE
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
