import * as THREE from './libs/three/three.module.js';
import { GLTFLoader } from './libs/three/GLTFLoader.js';


// ======== VARIÁVEL GLOBAL PARA O MODELO ========
let model = null;

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

// ======== GLTF MODEL LOADING ========
const loader = new GLTFLoader();
loader.load(
  "heart/heart.glb",
  function (gltf) {
    model = gltf.scene;

    model.scale.set(15, 15, 15);
    model.position.set(1.5, -1.0, 0);

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(model);
  },
  undefined,
  function (error) {
    console.error("Erro ao carregar GLTF:", error);
  }
);

// ======== LIGHTS ========
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

// ======== WINDOW RESIZE ========
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ======== HAND CONTROL FUNCTIONS ========

// Rotacionar o modelo com a mão de movimento (esquerda)
export function updateModelRotation(hand) {
  if (!model) return;

  const x = hand[8].x; // indicador
  const y = hand[8].y;

  model.rotation.y = (x - 0.5) * Math.PI * 2;
  model.rotation.x = (y - 0.5) * Math.PI;
}

// Zoom com a mão de distância (direita)
export function updateModelZoom(hand) {
  if (!model) return;

  const dx = hand[4].x - hand[8].x; // polegar e indicador
  const dy = hand[4].y - hand[8].y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  camera.position.z = 2 - distance * 5; // invertido: afastar aproxima
}
