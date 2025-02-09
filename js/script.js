// Seleção de elementos do DOM
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const score = document.querySelector(".score--value");
const finalScore = document.querySelector(".final-score > span");
const menu = document.querySelector(".menu-screen");
const buttonPlay = document.querySelector(".btn-play");
const audio = new Audio("../assets/audio.mp3");

// Configurações iniciais
const size = 30;
const initialPosition = { x: 270, y: 240 };
let snake = [initialPosition];
let direction;
let loopId;
let speed = 300;
let scoreMultiplier = 1;
let boostActive = false;

// Funções utilitárias
const incrementScore = () => {
    score.innerText = +score.innerText + (10 * scoreMultiplier);
    checkBoost();
};

const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
};

const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size);
    return Math.round(number / size) * size;
};

const randomColor = () => {
    return `rgb(${randomNumber(0, 255)}, ${randomNumber(0, 255)}, ${randomNumber(0, 255)})`;
};

// Configuração da comida
const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor(),
};

// Funções de desenho
const drawGrid = () => {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#191919";

    for (let i = size; i < canvas.width; i += size) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
};

const drawFood = () => {
    ctx.shadowColor = food.color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = food.color;
    ctx.fillRect(food.x, food.y, size, size);
    ctx.shadowBlur = 0;
};

const drawSnake = () => {
    snake.forEach((position, index) => {
        ctx.fillStyle = index === snake.length - 1 ? "white" : boostActive ? "#4caf50" : "#ddd";
        ctx.shadowBlur = boostActive ? 10 : 0;
        ctx.fillRect(position.x, position.y, size, size);
    });
};

// Movimentação e lógica do jogo
const moveSnake = () => {
    if (!direction) return;

    const head = snake[snake.length - 1];
    let newHead;

    switch (direction) {
        case "right": newHead = { x: head.x + size, y: head.y }; break;
        case "left": newHead = { x: head.x - size, y: head.y }; break;
        case "down": newHead = { x: head.x, y: head.y + size }; break;
        case "up": newHead = { x: head.x, y: head.y - size }; break;
    }

    snake.push(newHead);
    snake.shift();
};

const checkEat = () => {
    const head = snake[snake.length - 1];

    if (head.x === food.x && head.y === food.y) {
        incrementScore();
        snake.push(head);
        audio.play();

        do {
            food.x = randomPosition();
            food.y = randomPosition();
        } while (snake.some(position => position.x === food.x && position.y === food.y));

        food.color = randomColor();
    }
};

const checkCollision = () => {
    const head = snake[snake.length - 1];
    const canvasLimit = canvas.width - size;
    const neckIndex = snake.length - 2;

    const wallCollision = head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit;
    const selfCollision = snake.some((position, index) => index < neckIndex && position.x === head.x && position.y === head.y);

    if (wallCollision || selfCollision) {
        gameOver();
    }
};

const checkBoost = () => {
    if (!boostActive && +score.innerText % 50 === 0 && +score.innerText > 0) {
        activateBoost();
    }
};

const activateBoost = () => {
    boostActive = true;
    speed /= 2;
    scoreMultiplier = 2;
    setTimeout(() => {
        boostActive = false;
        speed *= 2;
        scoreMultiplier = 1;
    }, 5000);
};

const gameOver = () => {
    direction = undefined;
    menu.style.display = "flex";
    finalScore.innerText = score.innerText;
    canvas.style.filter = "blur(2px)";
};

const gameLoop = () => {
    clearInterval(loopId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawFood();
    moveSnake();
    drawSnake();
    checkEat();
    checkCollision();

    loopId = setTimeout(gameLoop, speed);
};

gameLoop();

// Eventos de controle
document.addEventListener("keydown", ({ key }) => {
    if (key === "ArrowRight" && direction !== "left") direction = "right";
    if (key === "ArrowLeft" && direction !== "right") direction = "left";
    if (key === "ArrowDown" && direction !== "up") direction = "down";
    if (key === "ArrowUp" && direction !== "down") direction = "up";
});

buttonPlay.addEventListener("click", () => {
    score.innerText = "00";
    menu.style.display = "none";
    canvas.style.filter = "none";
    snake = [initialPosition];
    direction = undefined;
    speed = 300;
    scoreMultiplier = 1;
    boostActive = false;
});
