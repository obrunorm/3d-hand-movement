import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";

// ======== SCENE SETUP ========
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ======== CUBE ========
const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const material = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.1,
  metalness: 0.8,
  clearcoat: 1.0,
  clearcoatRoughness: 0.05
});
const cube = new THREE.Mesh(geometry, material);
cube.position.x = 1.5;
scene.add(cube);

// ======== LIGHT ========
const light = new THREE.PointLight(0xffffff, 2);
light.position.set(4, 4, 4);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

camera.position.z = 4;

// ======== ANIMATION LOOP ========
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// ======== RESIZE ========
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ======== FUNÇÕES PARA CADA MÃO ========

// Rotacionar cubo com a mão de movimento (esquerda)
export function updateCubeRotation(hand) {
  const x = hand[8].x; // indicador
  const y = hand[8].y;
  cube.rotation.y = (x - 0.5) * Math.PI * 2;
  cube.rotation.x = (y - 0.5) * Math.PI;
}

// Zoom com a mão de distância (direita) — invertido
export function updateCubeZoom(hand) {
  const dx = hand[4].x - hand[8].x; // polegar e indicador
  const dy = hand[4].y - hand[8].y;
  const distance = Math.sqrt(dx*dx + dy*dy);
  camera.position.z = 2 - distance * 5; // invertido: afastar aproxima
}
