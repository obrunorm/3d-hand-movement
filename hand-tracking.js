import {
  FilesetResolver,
  HandLandmarker
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.mjs";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fpsBox = document.getElementById("fps");

let lastFrameTime = performance.now();
let handLandmarker;

// Start camera
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

// Load model
async function loadModel() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/models/hand_landmarker.task"
    },
    runningMode: "VIDEO",
    numHands: 2
  });
}

// Draw ONLY thumb tip (4) and index tip (8)
function drawPoints(points) {
  const tipIndices = [4, 8]; // Thumb tip & Index tip

  for (const index of tipIndices) {
    const point = points[index];
    const x = point.x * canvas.width;
    const y = point.y * canvas.height;

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2); // bigger point
    ctx.fill();
  }
}

// Detection loop
async function detect() {
  const now = performance.now();
  const delta = now - lastFrameTime;
  lastFrameTime = now;

  fpsBox.textContent = `FPS: ${(1000 / delta).toFixed(1)}`;

  const results = handLandmarker.detectForVideo(video, now);

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  if (results && results.landmarks && results.landmarks.length > 0) {
    for (const hand of results.landmarks) {
      drawPoints(hand);
    }
  }

  requestAnimationFrame(detect);
}

// Start system
await startCamera();
await loadModel();
detect();
