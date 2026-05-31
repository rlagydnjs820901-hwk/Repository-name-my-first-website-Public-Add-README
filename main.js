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

generateBtn.addEventListener('click', () => {
  const numbers = generateLottoNumbers();
  renderNumbers(numbers);
});

resetBtn.addEventListener('click', resetNumbers);
