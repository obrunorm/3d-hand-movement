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

  return new Promise((resolve) => {
    video.addEventListener("loadeddata", () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      resolve();
    });
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
  if (!hand) return;

  if (type === "rotation") {
    const p = hand[8]; // indicador
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(p.x * canvas.width, p.y * canvas.height, 12, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === "zoom") {
    [4, 8].forEach((i) => {
      const p = hand[i];
      ctx.fillStyle = "blue";
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, 12, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

// ======== DETECTION LOOP ========
async function detect() {
  const now = performance.now();
  fpsBox.textContent = `FPS: ${(1000 / (now - lastFrameTime)).toFixed(1)}`;
  lastFrameTime = now;

  if (!handLandmarker) {
    requestAnimationFrame(detect);
    return;
  }

  const results = await handLandmarker.detectForVideo(video, now);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (results.handLandmarks.length > 0) {
    for (let i = 0; i < results.handLandmarks.length; i++) {
      const hand = results.handLandmarks[i];

      // 🔥 Forma correta na versão atual do Mediapipe
      const handedness = results.handedness[i][0].categoryName; // "Left" ou "Right"

      if (handedness === "Left") {
        drawPoints(hand, "rotation");
        updateCubeRotation(hand);
      } 
      else if (handedness === "Right") {
        drawPoints(hand, "zoom");
        updateCubeZoom(hand);
      }
    }
  }

  requestAnimationFrame(detect);
}

// ======== START SYSTEM ========
await startCamera();
await loadModel();
detect();
