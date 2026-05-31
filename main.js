const numberCount = 6;
const maxNumber = 45;
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const ballsContainer = document.getElementById('balls');
const themeToggle = document.getElementById('themeToggle');

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

themeToggle.addEventListener('click', toggleTheme);
initTheme();

function getBallColor(value) {
  if (value <= 10) return 'yellow';
  if (value <= 20) return 'green';
  if (value <= 30) return 'blue';
  if (value <= 40) return 'red';
  return 'gray';
}

function createBall(value) {
  const ball = document.createElement('div');
  ball.className = `ball ${getBallColor(value)}`;
  ball.textContent = value;
  return ball;
}

function generateLottoNumbers() {
  const pool = Array.from({ length: maxNumber }, (_, i) => i + 1);
  const selected = [];
  while (selected.length < numberCount) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    selected.push(pool.splice(randomIndex, 1)[0]);
  }
  return selected.sort((a, b) => a - b);
}

function renderNumbers(numbers) {
  ballsContainer.innerHTML = '';
  numbers.forEach(num => ballsContainer.appendChild(createBall(num)));
}

function resetNumbers() {
  ballsContainer.innerHTML = '';
}

// Teachable Machine Logic
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/zmmNO8ppd/";
let model, webcam, labelContainer, maxPredictions;

async function initClassifier() {
  const modelURL = MODEL_URL + "model.json";
  const metadataURL = MODEL_URL + "metadata.json";

  const container = document.getElementById("webcam-container");
  container.innerHTML = "모델 로딩 중...";

  try {
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Webcam setup
    const flip = true; 
    webcam = new tmImage.Webcam(400, 300, flip);
    await webcam.setup(); 
    await webcam.play();
    window.requestAnimationFrame(loop);

    container.innerHTML = "";
    container.appendChild(webcam.canvas);
    
    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = "";
    for (let i = 0; i < maxPredictions; i++) {
      const bar = document.createElement("div");
      bar.className = "prediction-bar";
      bar.innerHTML = `
        <div class="bar-header">
          <span class="class-name"></span>
          <span class="probability">0%</span>
        </div>
        <div class="bar-outer">
          <div class="bar-inner" style="width: 0%"></div>
        </div>
      `;
      labelContainer.appendChild(bar);
    }
  } catch (e) {
    container.innerHTML = "에러: " + e.message;
  }
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict(inputElement) {
  const prediction = await model.predict(inputElement || webcam.canvas);
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction = prediction[i].className;
    const probability = (prediction[i].probability * 100).toFixed(0);
    
    const bar = labelContainer.childNodes[i];
    bar.querySelector(".class-name").innerText = classPrediction;
    bar.querySelector(".probability").innerText = probability + "%";
    bar.querySelector(".bar-inner").style.width = probability + "%";
  }
}

// Image Upload Logic
document.getElementById('image-upload')?.addEventListener('change', async (e) => {
  if (!e.target.files.length) return;
  
  const file = e.target.files[0];
  const reader = new FileReader();
  
  reader.onload = async (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = async () => {
      const container = document.getElementById("webcam-container");
      container.innerHTML = "";
      const displayImg = img.cloneNode();
      displayImg.style.width = "100%";
      displayImg.style.height = "100%";
      displayImg.style.objectFit = "contain";
      container.appendChild(displayImg);

      if (!model) {
        model = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
        maxPredictions = model.getTotalClasses();
        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = "";
        for (let i = 0; i < maxPredictions; i++) {
          const bar = document.createElement("div");
          bar.className = "prediction-bar";
          bar.innerHTML = `
            <div class="bar-header">
              <span class="class-name"></span>
              <span class="probability">0%</span>
            </div>
            <div class="bar-outer">
              <div class="bar-inner" style="width: 0%"></div>
            </div>
          `;
          labelContainer.appendChild(bar);
        }
      }
      await predict(img);
    };
  };
  reader.readAsDataURL(file);
});
