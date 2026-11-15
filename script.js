const tela = document.querySelector("#cena");
const ctx = tela.getContext("2d");

	const largura = tela.width;
const altura = tela.height;
const quantidade = 2600;

const mascara = document.createElement("canvas");
mascara.width = largura;
mascara.height = altura;

const desenho = mascara.getContext("2d", {
    willReadFrequently: true
});

function coletarPontos() {
    const pixels = desenho.getImageData(0, 0, largura, altura).data;
    const pontos = [];

    while (pontos.length < quantidade) {
        const x = Math.floor(Math.random() * largura);
        const y = Math.floor(Math.random() * altura);

        const opacidade = pixels[(y * largura + x) * 4 + 3];

        if (opacidade > 200) {
            pontos.push({x, y});
        }
    }

    desenho.clearRect(0, 0, largura, altura);
    return pontos;
}

desenho.font = "900 480px Arial, sans-serif";
desenho.textAlign = "center";
desenho.textBaseline = "middle";
desenho.fillText("ERVA", 960, 555);

const palavra = coletarPontos();

desenho.save();
desenho.translate(960, 704);

for (let i = -3; i <= 3; i++) {
    desenho.save();
    desenho.rotate(i * 0.49);

    const comprimento = 530 - Math.abs(i) * 85;
    const meiaLargura = comprimento * 0.125;

    desenho.beginPath();
    desenho.moveTo(0, 0);

    for (const lado of [1, -1]) {
        for(let j = 0; j <= 44; j++) {
            const fracao = lado === 1 ? j / 44 : 1 - j / 44;
            const curva = Math.sin(Math.PI * fracao) ** 0.9;
            const dente = j % 2 === 0 ? 1 : 0.74;

            const x = lado * curva * meiaLargura * dente;
            const y = -comprimento * fracao;

            desenho.lineTo(x, y);
        }
    }

    desenho.closePath();
    desenho.fill();
    desenho.restore();
}

desenho.fillRect(-6, -4, 12, 109);
desenho.restore();

const folha = coletarPontos();
const destinos = [palavra, folha];

const particulas = palavra.map(({ x, y }) => ({
    x,
    y,
    vx: 0,
    vy: 0,
    fase: Math.random() * Math.PI * 2,
    tamanho: 1.4 + Math.random() * 2.2,
    tom: Math.random()
}));

const cursor = { x: -1000, y: -1000 };

function moverCursor(evento) {
    const area = tela.getBoundingClientRect();

    cursor.x = (evento.clientX - area.left) * largura / area.width;
    cursor.y = (evento.clientY - area.top) * altura / area.height;
}

function afastarCursor() {
    cursor.x = -1000;
    cursor.y = -1000;
}

tela.addEventListener("pointermove", moverCursor);
tela.addEventListener("pointerdown", moverCursor);
tela.addEventListener("pointerleave", afastarCursor);
tela.addEventListener("pointercancel", afastarCursor);

tela.addEventListener("pointerup", function (evento) {
    if (evento.pointerType !== "mouse") {
        afastarCursor();
    } 
});

const fundo = ctx.createRadialGradient(960, 550, 40, 960, 550, 1060);
fundo.addColorStop(0, "#161630");
fundo.addColorStop(1, "#050511");

let inicio;
let quadroAnterior;

function animar(agora) {
    if (inicio === undefined) {
        inicio = agora;
        quadroAnterior = agora;
    }

    const tempo = (agora - inicio) / 1000;
    const passo = Math.min((agora - quadroAnterior) / 16.67, 2);
    quadroAnterior = agora;

    const etapa = Math.floor(tempo / 5) % 2;
    const fase = tempo % 5;
    const alvos = destinos[etapa];

    let onda = 0;
    if (fase > 2.5) {
        onda = Math.sin(Math.PI * (fase - 2.5) / 2.5);
    }

    ctx.fillStyle = fundo;
    ctx.fillRect(0, 0, largura, altura);
    ctx.globalCompositeOperation = "lighter";

    let emMovimento = 0;

    particulas.forEach(function (p, i) {
        const destino = alvos[i];

        const curvaX = Math.sin(destino.y / 200 + tempo * 1.8 + p.fase * 0.45);
        const curvaY = Math.sin(destino.x / 230 + tempo * 1.7);

        const alvoX = destino.x + onda * 310 * curvaX;
        const alvoY = destino.y + onda * (
            215 * curvaY + 82 * Math.cos(p.fase + tempo) 
        );

        let forcaX = (alvoX - p.x) * 0.022;
        let forcaY = (alvoY - p.y) * 0.022;

        const dx = p.x - cursor.x;
        const dy = p.y - cursor.y;
        const distancia = Math.hypot(dx, dy);

        if (distancia > 0 && distancia < 155) {
    const impulso = 10 * (1 - distancia / 155) / distancia;
    forcaX += dx * impulso;
    forcaY += dy * impulso;
}

p.vx = (p.vx + forcaX * passo) * 0.82 ** passo;
p.vy = (p.vy + forcaY * passo) * 0.82 ** passo;;

        p.x += p.vx * passo;
        p.y += p.vy * passo;

        if (Math.hypot(p.vx, p.vy) > 0.5) {
            emMovimento++;
        }

        let matiz = etapa === 0 ? 180 : 140;

        if (onda > 0.2) {
            matiz = p.tom < 0.55 ? 44 : 298;
        }

        const luminosidade = 52 + p.tom * 32;
        ctx.fillStyle = `hsl(${matiz} 95% ${luminosidade}%)`;
        ctx.fillRect(p.x, p.y, p.tamanho, p.tamanho);
    });

    ctx.globalCompositeOperation = "source-over";
    ctx.textAlign = "center";
    ctx.font = "20px monospace";
    ctx.fillStyle = "#9592ac";

    ctx.fillText(`${quantidade} particulas · 0 blibioteca`, 960, 62);
    ctx.fillText(`Em movimento: ${emMovimento}`, 960, 920);
    ctx.fillText("passe o cursor ou arraste o dedo", 960, 1020);

    requestAnimationFrame(animar);
}

requestAnimationFrame(animar);