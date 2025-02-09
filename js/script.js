// Seleção de elementos do DOM
const tela = document.querySelector("canvas");
const contexto = tela.getContext("2d");
const pontuacao = document.querySelector(".score--value");
const pontuacaoFinal = document.querySelector(".final-score > span");
const menu = document.querySelector(".menu-screen");
const botaoJogar = document.querySelector(".btn-play");
const audio = new Audio("../assets/audio.mp3");

// Configurações iniciais
const tamanho = 30;
const posicaoInicial = { x: 270, y: 240 };
let cobra = [posicaoInicial];
let direcao;
let idLoop;
let velocidade = 300;
let multiplicadorDePontuacao = 1;
let aumentoAtivo = false;

// Funções utilitárias
const incrementarPontuacao = () => {
    pontuacao.innerText = +pontuacao.innerText + (10 * multiplicadorDePontuacao);
    verificarAumento();
};

const numeroAleatorio = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
};

const posicaoAleatoria = () => {
    const numero = numeroAleatorio(0, tela.width - tamanho);
    return Math.round(numero / tamanho) * tamanho;
};

const corAleatoria = () => {
    return `rgb(${numeroAleatorio(0, 255)}, ${numeroAleatorio(0, 255)}, ${numeroAleatorio(0, 255)})`;
};

// Configuração da comida
const comida = {
    x: posicaoAleatoria(),
    y: posicaoAleatoria(),
    cor: corAleatoria(),
};

// Funções de desenho
const desenharGrade = () => {
    contexto.lineWidth = 1;
    contexto.strokeStyle = "#191919";

    for (let i = tamanho; i < tela.width; i += tamanho) {
        contexto.beginPath();
        contexto.moveTo(i, 0);
        contexto.lineTo(i, tela.height);
        contexto.stroke();

        contexto.beginPath();
        contexto.moveTo(0, i);
        contexto.lineTo(tela.width, i);
        contexto.stroke();
    }
};

const desenharComida = () => {
    contexto.shadowColor = comida.cor;
    contexto.shadowBlur = 6;
    contexto.fillStyle = comida.cor;
    contexto.fillRect(comida.x, comida.y, tamanho, tamanho);
    contexto.shadowBlur = 0;
};

const desenharCobra = () => {
    cobra.forEach((posicao, indice) => {
        contexto.fillStyle = indice === cobra.length - 1 ? "white" : aumentoAtivo ? "#4caf50" : "#ddd";
        contexto.shadowBlur = aumentoAtivo ? 10 : 0;
        contexto.fillRect(posicao.x, posicao.y, tamanho, tamanho);
    });
};

// Movimentação e lógica do jogo
const moverCobra = () => {
    if (!direcao) return;

    const cabeca = cobra[cobra.length - 1];
    let novaCabeca;

    switch (direcao) {
        case "direita": novaCabeca = { x: cabeca.x + tamanho, y: cabeca.y }; break;
        case "esquerda": novaCabeca = { x: cabeca.x - tamanho, y: cabeca.y }; break;
        case "baixo": novaCabeca = { x: cabeca.x, y: cabeca.y + tamanho }; break;
        case "cima": novaCabeca = { x: cabeca.x, y: cabeca.y - tamanho }; break;
    }

    cobra.push(novaCabeca);
    cobra.shift();
};

const verificarComer = () => {
    const cabeca = cobra[cobra.length - 1];

    if (cabeca.x === comida.x && cabeca.y === comida.y) {
        incrementarPontuacao();
        cobra.push(cabeca);
        audio.play();

        do {
            comida.x = posicaoAleatoria();
            comida.y = posicaoAleatoria();
        } while (cobra.some(posicao => posicao.x === comida.x && posicao.y === comida.y));

        comida.cor = corAleatoria();
    }
};

const verificarColisao = () => {
    const cabeca = cobra[cobra.length - 1];
    const limiteTela = tela.width - tamanho;
    const indicePescoço = cobra.length - 2;

    const colisaoComParede = cabeca.x < 0 || cabeca.x > limiteTela || cabeca.y < 0 || cabeca.y > limiteTela;
    const colisaoComPropriaCobra = cobra.some((posicao, indice) => indice < indicePescoço && posicao.x === cabeca.x && posicao.y === cabeca.y);

    if (colisaoComParede || colisaoComPropriaCobra) {
        gameOver();
    }
};

const verificarAumento = () => {
    if (!aumentoAtivo && +pontuacao.innerText % 50 === 0 && +pontuacao.innerText > 0) {
        ativarAumento();
    }
};

const ativarAumento = () => {
    aumentoAtivo = true;
    velocidade /= 2;
    multiplicadorDePontuacao = 2;
    setTimeout(() => {
        aumentoAtivo = false;
        velocidade *= 2;
        multiplicadorDePontuacao = 1;
    }, 5000);
};

const gameOver = () => {
    direcao = undefined;
    menu.style.display = "flex";
    pontuacaoFinal.innerText = pontuacao.innerText;
    tela.style.filter = "blur(2px)";
};

const loopDeJogo = () => {
    clearInterval(idLoop);
    contexto.clearRect(0, 0, tela.width, tela.height);
    desenharGrade();
    desenharComida();
    moverCobra();
    desenharCobra();
    verificarComer();
    verificarColisao();

    idLoop = setTimeout(loopDeJogo, velocidade);
};

loopDeJogo();

// Eventos de controle
document.addEventListener("keydown", ({ key }) => {
    if (key === "ArrowRight" && direcao !== "esquerda") direcao = "direita";
    if (key === "ArrowLeft" && direcao !== "direita") direcao = "esquerda";
    if (key === "ArrowDown" && direcao !== "cima") direcao = "baixo";
    if (key === "ArrowUp" && direcao !== "baixo") direcao = "cima";
});

botaoJogar.addEventListener("click", () => {
    pontuacao.innerText = "00";
    menu.style.display = "none";
    tela.style.filter = "none";
    cobra = [posicaoInicial];
    direcao = undefined;
    velocidade = 300;
    multiplicadorDePontuacao = 1;
    aumentoAtivo = false;
});
