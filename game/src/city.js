(function () {
  const cfg = CS.config, colliders = [], roads = [];
  let scene, rand = CS.rng(721), windowsMap = null; const signs = {};
  const mat = (color, extra) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.86 }, extra || {}));
  function box(parent, x, y, z, w, h, d, material, cast) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); mesh.castShadow = cast !== false; mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function windowTexture() {
    if (windowsMap) return windowsMap;
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 512;
    const c = canvas.getContext('2d'); c.fillStyle = '#bd8764'; c.fillRect(0, 0, 256, 512);
    for (let y = 14; y < 512; y += 38) for (let x = 12; x < 256; x += 34) {
      c.fillStyle = rand() > 0.38 ? ['#ffd99a', '#f6bd72', '#d7e2d9'][Math.floor(rand() * 3)] : '#253e4a';
      c.fillRect(x, y, 20, 25); c.fillStyle = 'rgba(255,238,198,.38)'; c.fillRect(x + 2, y + 2, 3, 21);
      c.fillStyle = '#a66c50'; c.fillRect(x - 2, y + 25, 24, 3);
    }
    const t = new THREE.CanvasTexture(canvas); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; windowsMap = t; return t;
  }
  const shopNames = ['CAFE SOL', 'HOTEL MARINA', 'PALMA BANK', 'TACOS DEL FARO', 'LUNA MARKET', 'AZUL FLOR'];
  function signTexture(text) {
    if (signs[text]) return signs[text];
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128; const c = canvas.getContext('2d');
    c.fillStyle = '#193640'; c.fillRect(0, 0, 512, 128); c.fillStyle = '#efbd72'; c.fillRect(7, 7, 498, 114);
    c.fillStyle = '#193640'; c.font = 'bold 42px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 256, 64);
    const t = new THREE.CanvasTexture(canvas); t.encoding = THREE.sRGBEncoding; signs[text] = t; return t;
  }
  function building(x, z, downtown) {
    const w = 12 + rand() * 17, d = 12 + rand() * 17, h = downtown ? 38 + rand() * 95 : 8 + rand() * 47;
    const color = cfg.palette.stucco[Math.floor(rand() * cfg.palette.stucco.length)];
    const wallMat = mat(color, { map: windowTexture() });
    box(scene, x, h / 2, z, w, h, d, wallMat);
    box(scene, x, h + 0.35, z, w + 1, 0.7, d + 1, mat(cfg.palette.roof));
    const parapet = mat(color);
    for (const side of [-1, 1]) { box(scene, x, h + 0.72, z + side * d / 2, w + 0.6, 0.55, 0.25, parapet); box(scene, x + side * w / 2, h + 0.72, z, 0.25, 0.55, d, parapet); }
    box(scene, x, 1.6, z, w + 0.12, 3.2, d + 0.12, mat(0xe6c698));
    box(scene, x, 3.4, z, w + 0.3, 0.45, d + 0.3, mat(['#d35f43','#327d7d','#dfa047'][Math.floor(rand()*3)]));
    if (rand() < 0.7) {
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(w - 1, 10), 1.35), new THREE.MeshBasicMaterial({ map: signTexture(shopNames[Math.floor(rand() * shopNames.length)]), side: THREE.DoubleSide }));
      sign.position.set(x, 4.65, z - d / 2 - 0.08); scene.add(sign);
      const awning = box(scene, x, 4.05, z - d / 2 - 0.7, Math.min(w, 10), 0.22, 1.5, mat(0xd65e45)); awning.rotation.x = -0.12;
    }
    if (rand() < 0.86) for (const side of [-1, 1]) for (let i = -1; i <= 1; i++) {
      const canopy = box(scene, x + i * w * 0.3, 5.3, z + side * (d / 2 + 0.08), w * 0.2, 0.16, 1.1, mat(i % 2 ? 0xf1d49a : 0x397d7b)); canopy.rotation.x = side * 0.06;
    }
    if (rand() < 0.6) {
      const unit = box(scene, x + (rand() - .5) * w * .4, h + 1.4, z + (rand() - .5) * d * .4, 2.8, 2, 2.1, mat(0x77766d));
      box(scene, unit.position.x, h + 2.45, unit.position.z, 3, .18, 2.3, mat(0x454b4b));
    }
    if (rand() < 0.14) { const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 2.8, 10), mat(0x638582)); tank.position.set(x + w * .25, h + 2, z); scene.add(tank); }
    colliders.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
  }
  function palm(x, z, scale) {
    const group = new THREE.Group(); group.position.set(x, 0, z); group.scale.setScalar(scale || 1); scene.add(group);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.28, .52, 9, 7), mat(0x805438)); trunk.position.y = 4.5; trunk.rotation.z = -0.08; trunk.castShadow = true; group.add(trunk);
    for (let i = 0; i < 9; i++) { const a = i * Math.PI * 2 / 9, leaf = new THREE.Mesh(new THREE.ConeGeometry(.62, 6.5, 5), mat(i % 2 ? 0x397955 : 0x4a8955)); leaf.position.set(Math.cos(a) * 2.25, 8.35 - (i % 3) * .12, Math.sin(a) * 2.25); leaf.rotation.z = Math.cos(a) * 1.1; leaf.rotation.x = Math.sin(a) * 1.1; leaf.castShadow = true; group.add(leaf); }
  }
  function roadProps() {
    const poleMat = mat(0x333b3c), lampMat = mat(0xffd88b, { emissive: 0xffae4a, emissiveIntensity: .65 });
    for (let x = -540; x <= 540; x += 120) for (let z = -480; z <= 360; z += 120) {
      for (const side of [-1, 1]) {
        const px = x + side * 12, pz = z + 12;
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(.1, .16, 7, 7), poleMat); pole.position.set(px, 3.5, pz); scene.add(pole);
        box(scene, px + side * .8, 6.8, pz, 1.7, .12, .16, poleMat);
        const head = new THREE.Mesh(new THREE.SphereGeometry(.24, 8, 6), lampMat); head.position.set(px + side * 1.55, 6.65, pz); scene.add(head);
      }
    }
  }
  function drawRoadGrid() {
    const asphalt = mat(0x30383a), dash = mat(0xe7d59d), curb = mat(0xc6b69b), sidewalk = mat(0xb5a58c), cross = mat(0xf1e8d2);
    for (let x = -540; x <= 540; x += 120) {
      roads.push({ x, vertical: true }); box(scene, x, .03, -50, 18, .06, 980, asphalt, false);
      for (let z = -525; z <= 435; z += 24) box(scene, x, .07, z, .28, .025, 8, dash, false);
      for (const side of [-1, 1]) { box(scene, x + side * 11.3, .12, -50, 4.5, .24, 980, sidewalk, false); box(scene, x + side * 9.15, .12, -50, .22, .25, 980, curb, false); }
      for (let z = -540; z <= 420; z += 120) for (let i = -5; i <= 5; i++) box(scene, x + i * 1.4, .085, z + 12, .8, .025, 5.5, cross, false);
    }
    for (let z = -540; z <= 420; z += 120) {
      roads.push({ z, vertical: false }); box(scene, 0, .04, z, 1200, .06, 18, asphalt, false);
      for (let x = -585; x <= 585; x += 24) box(scene, x, .08, z, 8, .025, .28, dash, false);
      for (const side of [-1, 1]) { box(scene, 0, .12, z + side * 11.3, 1200, .24, 4.5, sidewalk, false); box(scene, 0, .12, z + side * 9.15, 1200, .25, .22, curb, false); }
      for (let i = -5; i <= 5; i++) box(scene, 12 + i * 1.4, .085, z, 5.5, .025, .8, cross, false);
    }
  }
  function streetFurniture() {
    const benchWood = mat(0x805b42), iron = mat(0x343b3d), binMat = mat(0x38736c), hydrantMat = mat(0xb94432), signalMat = mat(0x252b2d);
    for (let i = 0; i < 36; i++) {
      const x = -520 + rand() * 1040, z = -520 + rand() * 900;
      if (rand() < .55) { box(scene,x,.55,z,1.8,.16,.48,benchWood); box(scene,x,.82,z-.2,1.8,.7,.12,benchWood); for(const dx of [-.68,.68]) box(scene,x+dx,.27,z,.12,.55,.45,iron); }
      if (rand() < .72) { const bin = new THREE.Mesh(new THREE.CylinderGeometry(.3,.34,.8,8),binMat); bin.position.set(x+2,.42,z); scene.add(bin); }
    }
    for(let x=-540;x<=540;x+=120) for(let z=-540;z<=420;z+=120) {
      const hydrant = new THREE.Mesh(new THREE.CylinderGeometry(.17,.23,.65,8),hydrantMat); hydrant.position.set(x+13,.38,z+13); scene.add(hydrant);
      if (Math.abs(x)<300 && Math.abs(z)<300) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,4.2,7),iron); pole.position.set(x-12,2.1,z-12); scene.add(pole);
        const head = new THREE.Mesh(new THREE.BoxGeometry(.65,.95,.4),signalMat); head.position.set(x-12,4.25,z-12); scene.add(head);
        for(let j=0;j<3;j++){const lamp=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),mat([0xd34535,0xe1bd43,0x43955c][j],{emissive:[0x681010,0x735a0d,0x174c25][j],emissiveIntensity:.35}));lamp.position.set(x-12,4.55-j*.3,z-11.78);scene.add(lamp);}
      }
    }
  }
  function build() {
    scene = new THREE.Scene(); scene.background = new THREE.Color(0xffbd86); scene.fog = new THREE.Fog(0xd9a17f, 650, 1550);
    scene.add(new THREE.HemisphereLight(0xffe6c1, 0x566b70, .9)); scene.add(new THREE.AmbientLight(0xffdfbf, .28));
    const sun = new THREE.DirectionalLight(0xffbd76, 1.45); sun.position.set(-230, 175, 430); sun.castShadow = true; sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left = sun.shadow.camera.bottom = -700; sun.shadow.camera.right = sun.shadow.camera.top = 700; sun.shadow.bias = -.0004; scene.add(sun);
    const skyGeo = new THREE.SphereGeometry(1900, 32, 24), pos = skyGeo.attributes.position, colors = [];
    for (let i = 0; i < pos.count; i++) { const t = Math.max(0, Math.min(1, (pos.getY(i) / 1900 + .05) / 1.05)); const c = new THREE.Color().setHSL(.075 - t * .025, .75 - t * .3, .48 + t * .27); colors.push(c.r,c.g,c.b); }
    skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors,3)); const sky = new THREE.Mesh(skyGeo,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide,fog:false})); scene.add(sky);
    const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(32,48),new THREE.MeshBasicMaterial({color:0xffe3a0,fog:false})); sunDisc.position.set(-220,105,900); sunDisc.lookAt(0,80,0); scene.add(sunDisc);
    box(scene, 0, -1, 0, 1200, 1, 1200, mat(cfg.palette.ground), false); drawRoadGrid();
    box(scene, 0, -.4, 495, 1200, .12, 50, mat(0xe1bb82), false);
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(1600,700,32,20).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x145767,roughness:.25,metalness:.18})); sea.position.set(0,-.22,865); sea.userData.animate = function(t){sea.position.y=-.22+Math.sin(t*.7)*.08;}; scene.add(sea);
    const glint = new THREE.Mesh(new THREE.PlaneGeometry(300,2),new THREE.MeshBasicMaterial({color:0xffd99a,transparent:true,opacity:.4})); glint.rotation.x=-Math.PI/2; glint.position.set(-90,-.16,740); scene.add(glint);
    for (let x=-510; x<=510; x+=40) for(let z=-490;z<=370;z+=40) if(rand()<.72) building(x+rand()*12-6,z+rand()*12-6, Math.abs(x)<150&&Math.abs(z)<150&&rand()<.35);
    // Coastal boulevard, promenade palms and street dressing.
    box(scene,0,.03,455,1200,.08,22,mat(0x30383a),false); for(let x=-580;x<580;x+=22) box(scene,x,.08,455,8,.025,.28,mat(0xe7d59d),false);
    for(let x=-550;x<=550;x+=32){ palm(x,430,.9+rand()*.2); palm(x,480,.85+rand()*.2); }
    for(let i=0;i<40;i++) palm(-555+rand()*1110, 300+rand()*90,.75+rand()*.5);
    roadProps(); streetFurniture();
    return scene;
  }
  function isOnRoad(x,z){return roads.some(r=>r.vertical?Math.abs(x-r.x)<9:Math.abs(z-r.z)<9)||Math.abs(z-455)<11;}
  function randomRoadPoint(rng){const r=rng||CS.random,vertical=r()<.5,line=Math.floor(r()*10)*120-540;return vertical?{x:line,z:-540+r()*960}:{x:-540+r()*1080,z:line};}
  CS.city={build,colliders,randomRoadPoint,isOnRoad,get roadGrid(){return roads;}};
}());
