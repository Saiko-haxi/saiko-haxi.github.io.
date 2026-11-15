const tela = document.querySelector("#cena");
const ctx = tela.getContext("2d");

// A barra tem 5 colunas e 5 linhas e encosta no canto inferior direito.
const largura = 30;
const altura = 40;
const origemX = tela.width - 5 * largura;
const origemY = tela.height - 5 * altura;

function quadradinho(x, y) {
    ctx.fillStyle = "#593820";
    ctx.fillRect(x, y, largura, altura);

    ctx.fillStyle = "#ab7850";
    ctx.fillRect(x + 2, y + 2, largura - 4, altura - 4);

    ctx.fillStyle = "#8c603f";
    ctx.fillRect(x + 5, y + 5, largura - 9, altura - 9);
}

// Cada peça usa o mesmo desenho de chocolate.
// O contorno determina qual parte da barra fica visível.
function desenharPeca(contorno, x, y) {
    ctx.save();
    ctx.translate(origemX + x, origemY + y);

    ctx.beginPath();
    ctx.moveTo(contorno[0][0], contorno[0][1]);

    for (const [px, py] of contorno.slice(1)) {
        ctx.lineTo(px, py);
    }

    ctx.closePath();
    ctx.clip();

    for (let linha = 0; linha < 5; linha++) {
        for (let coluna = 0; coluna < 5; coluna++) {
            quadradinho(coluna * largura, linha * altura);
        }
    }

    ctx.restore();
}

// Converte um intervalo de tempo em um movimento suave de 0 até 1.
function progresso(tempo, inicio, fim) {
    const p = Math.max(0, Math.min(1, (tempo - inicio) / (fim - inicio)));
    return p * p * (3 - 2 * p);
}

function desenharPacman(x, y, abertura) {
    ctx.fillStyle = "#fff500";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, 41, abertura, Math.PI * 2 - abertura);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(x + 10, y - 16, 4, 0, Math.PI * 2);
    ctx.fill();
}

const base = [[0, 136], [150, 56], [150, 200], [0, 200]];
const dupla = [[30, 0], [90, 0], [90, 40], [30, 40]];
const pedaco = [[0, 0], [30, 0], [30, 40], [0, 40]];

function animar(agora) {
    const t = (agora / 1000) % 3;
    ctx.clearRect(0, 0, tela.width, tela.height);

    const abrir = progresso(t, 0.10, 0.75);
    const trocar = progresso(t, 0.75, 1.55);
    const baixar = progresso(t, 1.45, 2.0);

    // A base nunca sai do lugar.
    desenharPeca(base, 0, 0);

    // A peça de 3 colunas desliza da esquerda para a direita.
    // A de 2 colunas passa por cima dela e vai para a esquerda.
    const ajuste = 8 * trocar;
    const larga = [[0, 40], [90, 40], [90, 88 + ajuste], [0, 136 + ajuste]];
    const estreita = [[90, 0], [150, 0], [150, 56 + ajuste], [90, 88 + ajuste]];

    desenharPeca(larga, 60 * trocar, -24 * abrir - 16 * trocar);
    desenharPeca(estreita, -90 * trocar, -125 * abrir + 165 * trocar);

    // A dupla volta para o topo da barra, fechando o encaixe.
    desenharPeca(dupla, -110 * abrir + 80 * baixar, -92 * abrir + 92 * baixar);

    // O quadradinho solto espera o Pac-Man na altura da boca.
    // Ele desaparece por inteiro quando a boca fecha sobre ele.
    if (t < 2.35) {
        desenharPeca(pedaco, -116 * abrir, -92 * abrir);
    }

    // O Pac-Man atravessa a tela sempre para a direita.
    const entrada = progresso(t, 1.22, 2.35);
    const saida = progresso(t, 2.35, 2.98);
    const x = -45 + 315 * entrada + 300 * saida;
    const mordida = progresso(t, 2.14, 2.35);
    const boca = 0.88 * (1 - mordida) + 0.015;

    desenharPacman(x, origemY - 72, boca);
    requestAnimationFrame(animar);
}

requestAnimationFrame(animar);