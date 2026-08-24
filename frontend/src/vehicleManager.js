import * as THREE from 'three';

export class VehicleManager {
  constructor(scene) {
    this.scene = scene;
    this.vehicles = new Map(); // id -> THREE.Group
    this.materials = {
      carBody: new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3, metalness: 0.7, transparent: true }), // Blue
      truckBody: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5, metalness: 0.2, transparent: true }), // Orange
      truckTrailer: new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.7, metalness: 0.1, transparent: true }), // White
      motoBody: new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3, metalness: 0.8, transparent: true }), // Green
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
    tire.rotation.x = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);
    
    const rimGeo = new THREE.CylinderGeometry(radius * 0.6, radius * 0.6, thickness + 0.02, 8);
    const rim = new THREE.Mesh(rimGeo, this.materials.rim.clone());
    rim.rotation.x = Math.PI / 2;
    wheelGroup.add(rim);
    return wheelGroup;
  }

  createVehicleMesh(className) {
    const group = new THREE.Group();
    group.userData = { isVehicle: true, className, wheels: [], targetOpacity: 1, currentOpacity: 0, markedForDeletion: false };

    let shadowScale = 1;

    if (className === 'truck' || className === 'bus') {
      shadowScale = 2.5;
      const cabGeo = new THREE.BoxGeometry(3, 2.5, 2.5);
      const cab = new THREE.Mesh(cabGeo, this.materials.truckBody.clone());
      cab.position.set(3, 2.25, 0); 
      cab.castShadow = true;
      group.add(cab);

      const trailerGeo = new THREE.BoxGeometry(7, 3.5, 2.6);
      const trailer = new THREE.Mesh(trailerGeo, this.materials.truckTrailer.clone());
      trailer.position.set(-2, 2.75, 0);
      trailer.castShadow = true;
      group.add(trailer);

      const winGeo = new THREE.PlaneGeometry(0.5, 1.2);
      const win = new THREE.Mesh(winGeo, this.materials.glass.clone());
      win.position.set(4.51, 2.5, 0);
      win.rotation.y = Math.PI / 2;
      group.add(win);

      const wRadius = 0.6;
      const wThick = 0.4;
      const wheelPositions = [
        [3, -1.25], [3, 1.25], 
        [-2.5, -1.25], [-2.5, 1.25], 
        [-4.5, -1.25], [-4.5, 1.25]  
      ];
      
      wheelPositions.forEach(p => {
        const w = this.createWheel(wRadius, wThick);
        w.position.set(p[0], wRadius, p[1]);
        group.add(w);
        group.userData.wheels.push({ mesh: w, radius: wRadius });
      });

    } else if (className === 'motorcycle' || className === 'bicycle') {
      shadowScale = 0.6;
      const bodyGeo = new THREE.BoxGeometry(2, 0.8, 0.6);
      const body = new THREE.Mesh(bodyGeo, this.materials.motoBody.clone());
      body.position.set(0, 0.7, 0);
      body.castShadow = true;
      group.add(body);

      const wRadius = 0.35;
      const wThick = 0.15;
      const wheelPositions = [[0.8, 0], [-0.8, 0]];
      
      wheelPositions.forEach(p => {
        const w = this.createWheel(wRadius, wThick);
        w.position.set(p[0], wRadius, p[1]);
        group.add(w);
        group.userData.wheels.push({ mesh: w, radius: wRadius });
      });
    } else {
      shadowScale = 1.2;
      const bodyGeo = new THREE.BoxGeometry(4.5, 1, 2);
      const body = new THREE.Mesh(bodyGeo, this.materials.carBody.clone());
      body.position.set(0, 0.9, 0);
      body.castShadow = true;
      group.add(body);

      const roofGeo = new THREE.BoxGeometry(2.2, 0.8, 1.8);
      const roof = new THREE.Mesh(roofGeo, this.materials.glass.clone());
      roof.position.set(-0.2, 1.8, 0); 
      roof.castShadow = true;
      group.add(roof);

      const hGeo = new THREE.PlaneGeometry(0.2, 0.3);
      const h1 = new THREE.Mesh(hGeo, this.materials.headlight.clone());
      h1.position.set(2.26, 1.1, 0.6);
      h1.rotation.y = Math.PI / 2;
      const h2 = new THREE.Mesh(hGeo, this.materials.headlight.clone());
      h2.position.set(2.26, 1.1, -0.6);
      h2.rotation.y = Math.PI / 2;
      group.add(h1);
      group.add(h2);

      const tGeo = new THREE.PlaneGeometry(0.2, 0.3);
      const t1 = new THREE.Mesh(tGeo, this.materials.taillight.clone());
      t1.position.set(-2.26, 1.1, 0.6);
      t1.rotation.y = -Math.PI / 2;
      const t2 = new THREE.Mesh(tGeo, this.materials.taillight.clone());
      t2.position.set(-2.26, 1.1, -0.6);
      t2.rotation.y = -Math.PI / 2;
      group.add(t1);
      group.add(t2);

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

    // Add AO shadow disc
    const shadowGeo = new THREE.PlaneGeometry(6 * shadowScale, 6 * shadowScale);
    const shadow = new THREE.Mesh(shadowGeo, this.shadowMaterial.clone());
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.05;
    group.add(shadow);
    group.userData.shadow = shadow;

    // Initial opacity 0
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

  updateVehicles(frameData, nextFrameData, progress) {
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

      if (nextVData) {
        vehicle.position.x = THREE.MathUtils.lerp(vData.x, nextVData.x, progress);
        vehicle.position.z = THREE.MathUtils.lerp(vData.z, nextVData.z, progress);

        // Smooth yaw is now provided by backend in vData.yaw and nextVData.yaw
        // Wait, the backend provides yaw, but it might wrap. 
        // We use backend yaw for stable heading. Since we unwrapped it in python, it's continuous!
        // We can just lerp the yaw directly.
        const yaw = THREE.MathUtils.lerp(vData.yaw, nextVData.yaw, progress);
        vehicle.rotation.y = yaw;
      } else {
        vehicle.position.set(vData.x, 0, vData.z);
        vehicle.rotation.y = vData.yaw;
      }

      // Animate wheels
      const moved = prevPos.distanceTo(vehicle.position);
      if (moved < 5) {
        vehicle.userData.wheels.forEach(w => {
          w.mesh.rotation.z -= moved / w.radius; 
        });
      }
    }

    // Fade opacity and remove deleted vehicles
    for (const [id, vehicle] of this.vehicles.entries()) {
      if (vehicle.userData.markedForDeletion) {
        vehicle.userData.currentOpacity = THREE.MathUtils.lerp(vehicle.userData.currentOpacity, 0, 0.1);
        if (vehicle.userData.currentOpacity < 0.05) {
          this.scene.remove(vehicle);
          this.vehicles.delete(id);
        } else {
          this.setGroupOpacity(vehicle, vehicle.userData.currentOpacity);
        }
      } else {
        vehicle.userData.currentOpacity = THREE.MathUtils.lerp(vehicle.userData.currentOpacity, 1.0, 0.1);
        this.setGroupOpacity(vehicle, vehicle.userData.currentOpacity);
      }
    }
  }

  getVehicleById(id) {
    return this.vehicles.get(id);
  }
}
