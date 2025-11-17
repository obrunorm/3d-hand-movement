import { FilesetResolver, HandLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs";
import { updateCubeRotation, updateCubeZoom } from "./scene.js";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fpsBox = document.getElementById("fps");

let lastFrameTime = performance.now();
let handLandmarker;

// ======== START CAMERA ========
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise(res => {
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      res();
    };
  });
}

// ======== LOAD MODEL ========
async function loadModel() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: "/models/hand_landmarker.task" },
    runningMode: "VIDEO",
    numHands: 2
  });
}

// ======== DRAW POINTS ========
function drawPoints(hand, type) {
  if (type === "movement") {
    // desenha apenas indicador (tip 8)
    const point = hand[8];
    const x = point.x * canvas.width;
    const y = point.y * canvas.height;
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === "zoom") {
    // desenha polegar (4) e indicador (8)
    [4, 8].forEach(index => {
      const point = hand[index];
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;
      ctx.fillStyle = "blue";
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ======== DETECTION LOOP ========
async function detect() {
  const now = performance.now();
  const delta = now - lastFrameTime;
  lastFrameTime = now;
  fpsBox.textContent = `FPS: ${(1000 / delta).toFixed(1)}`;

  const results = handLandmarker.detectForVideo(video, now);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (results && results.landmarks && results.landmarks.length > 0) {
    for (let i = 0; i < results.landmarks.length; i++) {
      const hand = results.landmarks[i];
      const handedness = results.handedness[i].label; // "Left" ou "Right"

      // Escolha qual mão é movimento e qual é zoom
      if (handedness === "Left") {
        drawPoints(hand, "movement");
        updateCubeRotation(hand);
      } else if (handedness === "Right") {
        drawPoints(hand, "zoom");
        updateCubeZoom(hand);
      }
    }
  }

  requestAnimationFrame(detect);
}

// ======== START SYSTEM ========
await startCamera();
