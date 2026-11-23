(function () {
  const cars = [], cfg = CS.config, materials = {};
  const material = (color, extra) => { const key=String(color); if(!materials[key]) materials[key]=new THREE.MeshStandardMaterial(Object.assign({color,roughness:.58,metalness:.12},extra||{})); return materials[key]; };
  function createCar(type,color) {
    type=type||'sedan'; const car=new THREE.Group(); car.userData.type=type; car.userData.speed=0; car.userData.steer=0; car.userData.wheels=[];
    const paint=material(color||[0xc54435,0x16a1a2,0xe0a735,0x344f79,0xeee4ce,0x674d84][Math.floor(CS.random()*6)]);
    const size=type==='van'?[2.15,4.25]:type==='pickup'?[2.1,4.4]:type==='hatchback'?[1.9,3.5]:[2,4];
    const body=new THREE.Mesh(new THREE.BoxGeometry(size[0],.78,size[1]),paint); body.position.y=.82; body.castShadow=true; car.add(body);
    const cabin=new THREE.Mesh(new THREE.BoxGeometry(type==='van'?1.9:1.62,type==='van'?1.05:.76,type==='van'?2.8:2.05),material(type==='van'?paint.color:0x243941)); cabin.position.set(0,type==='van'?1.62:1.53,-.12); cabin.castShadow=true; car.add(cabin);
    if(type==='pickup'){const bed=new THREE.Mesh(new THREE.BoxGeometry(1.78,.38,1.3),material(0x475257));bed.position.set(0,1.26,1.28);car.add(bed);}
    const glass=material(0x25434c,{metalness:.3,roughness:.25});
    for(const z of [-.82,.68]){const pane=new THREE.Mesh(new THREE.BoxGeometry(1.48,.48,.035),glass);pane.position.set(0,1.61,z);car.add(pane);}
    const chrome=material(0xb8b6aa,{metalness:.7,roughness:.32});
    for(const z of [-2.05,2.05]){const bumper=new THREE.Mesh(new THREE.BoxGeometry(size[0]+.12,.18,.16),chrome);bumper.position.set(0,.53,z);car.add(bumper);}
    const wheels=[];
    for(const x of [-.98,.98]) for(const z of [-1.28,1.28]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.39,.39,.28,12),material(0x1c2021));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.45,z);car.add(wheel);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.3,10),chrome);hub.rotation.z=Math.PI/2;hub.position.copy(wheel.position);car.add(hub);wheels.push(wheel);}
    const headMat=material(0xffe5ae,{emissive:0xffc45b,emissiveIntensity:.65}), tailMat=material(0xf04436,{emissive:0x8c120c,emissiveIntensity:.5});
    for(const x of [-.65,.65]){const head=new THREE.Mesh(new THREE.BoxGeometry(.43,.2,.08),headMat);head.position.set(x,.96,-size[1]/2-.02);car.add(head);const tail=new THREE.Mesh(new THREE.BoxGeometry(.4,.23,.08),tailMat);tail.position.set(x,.94,size[1]/2+.02);car.add(tail);}
    if(type==='interceptor'){const base=new THREE.Mesh(new THREE.BoxGeometry(1.25,.13,.38),material(0x171e24));base.position.y=2.02;car.add(base);const a=new THREE.Mesh(new THREE.BoxGeometry(.5,.18,.32),material(0xf02538,{emissive:0xf00017,emissiveIntensity:1.5})),b=new THREE.Mesh(new THREE.BoxGeometry(.5,.18,.32),material(0x236bff,{emissive:0x144fff,emissiveIntensity:1.5}));a.position.set(-.3,2.17,0);b.position.set(.3,2.17,0);car.add(a,b);car.userData.lightbar=[a,b];}
    car.userData.wheels=wheels;car.userData.steerWheels=wheels.slice(0,2);return car;
  }
  function update(car,controls,dt){const data=car.userData,forward=new THREE.Vector3(0,0,-1).applyQuaternion(car.quaternion),throttle=controls.throttle||0,brake=controls.brake?1:0,handbrake=controls.handbrake?1:0;data.speed+=throttle*cfg.car.accel*dt;if(brake)data.speed-=Math.sign(data.speed)*cfg.car.accel*1.3*dt;data.speed=THREE.MathUtils.clamp(data.speed,-cfg.car.topSpeed*.35,cfg.car.topSpeed);data.speed*=Math.pow(handbrake?.992:.985,dt*60);data.steer=controls.steer||0;car.rotation.y+=data.steer*cfg.car.steer*Math.min(1,Math.abs(data.speed)/8)*dt*Math.sign(data.speed||1)*(handbrake?1.5:1);forward.set(0,0,-1).applyQuaternion(car.quaternion);const next=car.position.clone().addScaledVector(forward,data.speed*dt);let hit=false;for(const a of CS.city.colliders)if(next.x>a.minX-1&&next.x<a.maxX+1&&next.z>a.minZ-1&&next.z<a.maxZ+1){hit=true;break;}if(hit)data.speed*=-.15;else car.position.copy(next);data.wheels.forEach(w=>w.rotation.x+=data.speed*dt/.42);data.steerWheels.forEach(w=>w.rotation.y=data.steer*.35);}
  function spawnParkedCars(scene,count){const colors=[0xc54435,0x16a1a2,0xe0a735,0x344f79,0xeee4ce,0x674d84];for(let i=0;i<count;i++){const p=CS.city.randomRoadPoint(),type=['sedan','hatchback','pickup','taxi','van'][i%5],car=createCar(type,colors[i%colors.length]);car.position.set(p.x+12,0,p.z+12);scene.add(car);cars.push(car);}}
  function nearestCar(pos,maxDist){let best=null,distance=maxDist;cars.forEach(car=>{const d=car.position.distanceTo(pos);if(d<distance){best=car;distance=d;}});return best;}
  CS.vehicles={createCar,update,spawnParkedCars,nearestCar,get cars(){return cars;}};
}());
