// Adds beach, marina, and billboard details to the world.
(function () {
  let scene, rand = () => CS.random();
  const standard = (color, extra) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .82 }, extra || {}));
  function add(geometry, material, x, y, z, parent) {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z); (parent || scene).add(mesh); return mesh;
  }
  function umbrella(x, z) {
    const colors = [0xe85f49, 0xf3d16a, 0x3a8c88];
    add(new THREE.CylinderGeometry(.07, .09, 2.3, 6), standard(0xeee0bd), x, 1.15, z);
    const canopy = add(new THREE.ConeGeometry(2.2, .75, 8), standard(colors[Math.floor(rand() * colors.length)]), x, 2.5, z); canopy.rotation.y = rand() * Math.PI;
  }
  function lounger(x, z, yaw) {
    const group = new THREE.Group(); group.position.set(x, .28, z); group.rotation.y = yaw; scene.add(group);
    add(new THREE.BoxGeometry(1.15, .12, 2.15), standard(rand() < .5 ? 0x328b88 : 0xe9a252), 0, .18, 0, group);
    for (const dx of [-.48, .48]) { const leg = add(new THREE.BoxGeometry(.08, .78, .08), standard(0xeee0bd), dx, 0, 0, group); leg.rotation.x = .32; add(new THREE.BoxGeometry(.08, .78, .08), standard(0xeee0bd), dx, -.05, -.72, group).rotation.x = -.35; }
  }
  function boat(x, z, yaw, color) {
    const group = new THREE.Group(); group.position.set(x, -.05, z); group.rotation.y = yaw; scene.add(group);
    add(new THREE.ConeGeometry(1, 5.4, 4), standard(color), 0, .15, 0, group).rotation.x = Math.PI / 2;
    add(new THREE.BoxGeometry(1.5, .85, 1.5), standard(0xf0dfbd), 0, .7, -.2, group);
    add(new THREE.CylinderGeometry(.045, .055, 4.2, 5), standard(0x553f30), 0, 2.7, .35, group);
    add(new THREE.BoxGeometry(.05, 2.1, 1.5), standard(0xf4e8cd), .45, 2.9, .35, group);
  }
  function billboard(x, z, text, color) {
    const group = new THREE.Group(); group.position.set(x, 0, z); scene.add(group);
    for (const dx of [-2.1, 2.1]) add(new THREE.BoxGeometry(.28, 6.5, .3), standard(0x66513b), dx, 3.25, 0, group);
    const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 180; const c = canvas.getContext('2d');
    c.fillStyle = color; c.fillRect(0, 0, 512, 180); c.strokeStyle = '#f7e2ad'; c.lineWidth = 10; c.strokeRect(8, 8, 496, 164);
    c.fillStyle = '#fff2cf'; c.font = 'bold 48px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 256, 94);
    const map = new THREE.CanvasTexture(canvas); map.encoding = THREE.sRGBEncoding;
    add(new THREE.BoxGeometry(10, 3.6, .35), standard(0xffffff, { map, roughness: 1 }), 0, 7.5, 0, group);
  }
  function build(world) {
    scene = world; rand = typeof CS.random === 'function' ? CS.random : CS.rng(7);
    add(new THREE.BoxGeometry(1200, .12, 54), standard(0xd9bd87), 0, -.1, 542);
    for (let i = 0; i < 10; i++) { const x = -165 + i * 36, z = 552 + rand() * 28; umbrella(x, z); lounger(x - 3.2, z + 3.2, .12); lounger(x + 3.1, z + 3.5, -.12); }
    boat(-48, 755, .08, 0x327c84); boat(-25, 790, -.16, 0xd9664d); boat(16, 760, .18, 0xe3b84d);
    billboard(-68, 477, 'SERENA COLA', '#a63e35'); billboard(88, 477, 'HOTEL SOL', '#207e79'); billboard(-90, 605, 'PIER 9', '#284e67'); billboard(105, 582, 'CAFE MAR', '#b8643e');
  }
  CS.landmarks = { build };
}());
