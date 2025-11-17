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
    numHands: 2 // detect two hands
  });
}

// Draw hand connections
function drawConnections(points) {
  const fingers = [
    [0, 1, 2, 3, 4],
    [0, 5, 6, 7, 8],
    [0, 9, 10, 11, 12],
    [0, 13, 14, 15, 16],
    [0, 17, 18, 19, 20],
  ];

  ctx.strokeStyle = "lime";
  ctx.lineWidth = 2;

  for (const finger of fingers) {
    ctx.beginPath();
    const first = points[finger[0]];
    ctx.moveTo(first.x * canvas.width, first.y * canvas.height);

    for (let i = 1; i < finger.length; i++) {
      const p = points[finger[i]];
      ctx.lineTo(p.x * canvas.width, p.y * canvas.height);
    }
    ctx.stroke();
  }
}

// Draw landmark points
function drawPoints(points) {
  for (const point of points) {
    const x = point.x * canvas.width;
    const y = point.y * canvas.height;
    ctx.fillStyle = "lime";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
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
      drawConnections(hand);
    }
  }

  requestAnimationFrame(detect);
}

// Start system
await startCamera();
await loadModel();
detect();
