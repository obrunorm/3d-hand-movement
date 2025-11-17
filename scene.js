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

// Bigger cube
const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);

// Better reflective material
const material = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.1,   // lower roughness → more reflection
  metalness: 0.8,   // metallic look
  clearcoat: 1.0,   // glossy surface
  clearcoatRoughness: 0.05
});

const cube = new THREE.Mesh(geometry, material);
cube.position.x = 1.5; // move to the right
scene.add(cube);

// Stronger light to enhance reflections
const light = new THREE.PointLight(0xffffff, 2);
light.position.set(4, 4, 4);
scene.add(light);

// Slight ambient light
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

camera.position.z = 4;

function animate() {
  requestAnimationFrame(animate);

  cube.rotation.y += 0.01;
  cube.rotation.x += 0.01;

  renderer.render(scene, camera);
}

animate();

// Resize handling
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
