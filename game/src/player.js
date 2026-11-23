(function () {
  let mesh,camera,yaw=0,pitch=.28,inCar=null,phase=0; const position=new THREE.Vector3(0,0,18),legs=[],arms=[];
  const material=(color)=>new THREE.MeshStandardMaterial({color,roughness:.8});
  function limb(parent,geo,color,x,y,z){const m=new THREE.Mesh(geo,material(color));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
  function create(scene){mesh=new THREE.Group();mesh.scale.setScalar(1.08);
    limb(mesh,new THREE.CylinderGeometry(.34,.43,.82,10),0x16a4a1,0,1.25,0);
    limb(mesh,new THREE.SphereGeometry(.28,12,10),0xb97958,0,1.95,0);
    limb(mesh,new THREE.SphereGeometry(.285,10,6),0x25272a,0,2.13,0);
    for(const x of [-.2,.2]){const leg=limb(mesh,new THREE.BoxGeometry(.22,.78,.25),0x26313a,x,.43,0);legs.push(leg);const arm=limb(mesh,new THREE.CylinderGeometry(.105,.105,.72,8),0x159391,x*2.5,1.24,0);arm.rotation.z=x<0?-.12:.12;arms.push(arm);}
    mesh.position.copy(position);scene.add(mesh);
  }
  function setCamera(v){camera=v;}
  function update(dt,input){const mouse=input.consumeMouse();yaw-=mouse.x*.0025;pitch=THREE.MathUtils.clamp(pitch+mouse.y*.002,CS.config.camera.minPitch,CS.config.camera.maxPitch);const axis=input.axis();
    if(input.pressed('keye')){if(inCar){position.copy(inCar.position);position.x+=2.5;inCar=null;mesh.visible=true;}else{inCar=CS.vehicles.nearestCar(position,4);if(inCar)mesh.visible=false;}}
    if(inCar){CS.vehicles.update(inCar,{throttle:-axis.z,steer:axis.x,brake:input.isDown('space'),handbrake:input.isDown('space')},dt);position.copy(inCar.position);}else{const speed=input.isDown('shift')?CS.config.player.run:CS.config.player.walk,forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));position.addScaledVector(forward,-axis.z*speed*dt);position.addScaledVector(right,axis.x*speed*dt);position.x=THREE.MathUtils.clamp(position.x,-590,590);position.z=THREE.MathUtils.clamp(position.z,-590,590);mesh.position.copy(position);mesh.rotation.y=yaw;phase+=Math.hypot(axis.x,axis.z)*dt*9;legs.forEach((leg,i)=>leg.rotation.x=Math.sin(phase+i*Math.PI)*Math.min(.6,Math.hypot(axis.x,axis.z)*.5));arms.forEach((arm,i)=>arm.rotation.x=-Math.sin(phase+i*Math.PI)*.38);mesh.position.y=Math.hypot(axis.x,axis.z)>.1?Math.abs(Math.sin(phase*2))*.045:0;}
    const target=position.clone().add(new THREE.Vector3(0,1.5,0)),distance=CS.config.camera.distance,horizontal=Math.cos(pitch)*distance;camera.position.set(target.x+Math.sin(yaw)*horizontal,target.y+Math.sin(pitch)*distance,target.z+Math.cos(yaw)*horizontal);camera.lookAt(target);
  }
  CS.player={create,update,setCamera,setPose:function(x,z,car){position.set(x,0,z);inCar=car||null;if(mesh){mesh.position.copy(position);mesh.visible=!inCar;}},setView:function(a,b){yaw=a;pitch=b;},get state(){return{position,pos:position,inCar,yaw,pitch};}};
}());
