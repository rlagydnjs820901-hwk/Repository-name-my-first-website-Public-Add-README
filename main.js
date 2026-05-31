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

themeToggle?.addEventListener('click', toggleTheme);
initTheme();

// Lotto Logic
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const ballsContainer = document.getElementById('balls');

if (generateBtn && resetBtn && ballsContainer) {
  const numberCount = 6;
  const maxNumber = 45;

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

  generateBtn.addEventListener('click', () => {
    const numbers = generateLottoNumbers();
    ballsContainer.innerHTML = '';
    numbers.forEach(num => ballsContainer.appendChild(createBall(num)));
  });

  resetBtn.addEventListener('click', () => {
    ballsContainer.innerHTML = '';
  });
}

// AI Classifier Logic (Upload Only)
const imageUpload = document.getElementById('image-upload');
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/zmmNO8ppd/";
let model, labelContainer, maxPredictions;

if (imageUpload) {
  imageUpload.addEventListener('change', async (e) => {
    if (!e.target.files.length) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    const container = document.getElementById("upload-container");
    
    container.innerHTML = "분석 중...";
    
    reader.onload = async (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = async () => {
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
        }

        const prediction = await model.predict(img);
        labelContainer.innerHTML = "";
        for (let i = 0; i < maxPredictions; i++) {
          const classPrediction = prediction[i].className;
          const probability = (prediction[i].probability * 100).toFixed(0);
          
          const bar = document.createElement("div");
          bar.className = "prediction-bar";
          bar.innerHTML = `
            <div class="bar-header">
              <span class="class-name">${classPrediction}</span>
              <span class="probability">${probability}%</span>
            </div>
            <div class="bar-outer">
              <div class="bar-inner" style="width: ${probability}%"></div>
            </div>
          `;
          labelContainer.appendChild(bar);
        }
      };
    };
    reader.readAsDataURL(file);
  });
}
