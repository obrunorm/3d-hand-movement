import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160/build/three.module.js";

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

// Add cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0xfffafa });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Light
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(3, 3, 3);
scene.add(light);

camera.position.z = 3;

function animate() {
  renderer.render(scene, camera);
}

animate();

// Resize handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
