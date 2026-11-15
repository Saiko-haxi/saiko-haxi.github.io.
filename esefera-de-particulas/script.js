const tela = document.querySelector("#cena");
const ctx = tela.getContext("2d");
const volta = Math.PI * 2;

const cores = ["#5efaff", "#ffac32", "#ff36ce", "#875cff", "#42ff94", "#e1ecff"];

// destribui pontos pela superficie de uma esfera
const superficie = [];
for (let i = 0; i < 1300; i++) {
    const y = 1 - 2 * (i + 0.5) / 1300;
    const anel = Math.sqrt(1 - y * y);
    const angulo = i * 2.39996;

    superficie.push({
        x: Math.cos(angulo) * anel,
        y: y,
        z: Math.sin(angulo) * anel
    });
}

//cada faisca recebe sua direção uma unica vez
const faiscas = [];
for (let i = 0; i < 100; i++) {
    faiscas.push({
        angulo:     Math.random() * volta,
        fase: Math.random(),
        velocidade: 0.18 + Math.random() * 0.22,
        cor: cores[i % cores.length]
    });
}

//centro claro que vai ficando transparente nas bordas
function brilho(x, y, raio, cor) {
    const luz = ctx.createRadialGradient(x, y, 0, x, y, raio);
    luz.addColorStop(0, "#ffffff");
    luz.addColorStop(0.10, cor);
    luz.addColorStop(0.35, cor + "78");
    luz.addColorStop(1, cor + "00");

    ctx.fillStyle = luz;
    ctx.fillRect(x - raio, y - raio, raio * 2, raio * 2);
}

function desenharNucleo(t) {
    const raio = 65;
    brilho(0, 0, 145, "#42baff");

    //o disco enconbre a parte da orbita que passa atras dele
    const disco =   ctx.createRadialGradient(-18, 15, 2, 0, 0, raio);
    disco.addColorStop(0, "#387eaa");
    disco.addColorStop(0.71, "#164776");
    disco.addColorStop(0.94, "#69ceef");
    disco.addColorStop(1, "#dbffff");
    ctx.fillStyle = disco;
    ctx.beginPath();
    ctx.arc(0, 0, raio, 0, volta);
    ctx.fill();

    const c = Math.cos(t * 0.5);
    const s = Math.sin(t * 0.5);

    for (const p of superficie) {
        const x = p.x * c + p.z * s;
        const z = p.z * c - p.x * s;
        if (z < 0) continue;

        const onda = Math.sin(11 * p.y + 7 * x + t * 2);
        const tamanho = 1.2 + (onda + 1) * 0.7;
        ctx.globalAlpha = 0.35 + (onda + 1) * 0.3;
        ctx.fillStyle = "#d2ffff";
        ctx.fillRect(x * raio, p.y * raio, tamanho, tamanho);
    }

    ctx.globalAlpha = 1;
}

//z indica a profundidade. cada luz tem sua propia órbita inclinada
function posicaoDaLuz(i, t) {
    const angulo = t  * (0.48 + i * 0.025) +  i * volta / cores.length;
    const inclinacao = -0.48 + i * 0.18;    
    const x = Math.cos(angulo) * (190 + i * 9);
    const y = Math.sin(angulo) * (58 + i * 5);

    return {
        x: x * Math.cos(inclinacao) - y * Math.sin(inclinacao),
        y: x * Math.sin(inclinacao) + y * Math.cos(inclinacao), 
        z: Math.sin(angulo)
    };
}
function desenharLuz(i, t) {
    const p = posicaoDaLuz(i, t);
    const cor = cores[i];

    //posições anteriores de uma mesma luz forma a cauda.
    for (let j = 30; j > 0; j--) {
    const rastro = posicaoDaLuz(i, t - j * 0.018);

    ctx.globalAlpha = (1 - j / 31) * 0.65;
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(rastro.x, rastro.y, 1 + (30 - j) * 0.09, 0, volta);
    ctx.fill();

    }

    ctx.globalAlpha = 1;
    brilho(p.x, p.y, 23 + 6 * p.z, cor);

    // A luz turquesa tem os aneis que aparecem no video.
    if (i === 0) {
        for (let j = 0; j < 3; j++) {
            const fase = (t * 0.65 + j / 3) % 1;
            ctx.globalAlpha = 1 - fase;
            ctx.strokeStyle = cor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 8 +  fase * 26, 0, volta);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
}

function desenharFaiscas( t, intensidade) {
    ctx.lineWidth = 1.4;

    for (const f of faiscas) {
        const fase = (f.fase + t * f.velocidade) % 1;
        const distancia = 70 + fase * 360;
        const comprimento = 2 + fase * 13;
        const x = Math.cos(f.angulo);
        const y = Math.sin(f.angulo);

        ctx.globalAlpha = Math.sin(fase * Math.PI) * intensidade;
        ctx.strokeStyle = f.cor;
        ctx.beginPath();
        ctx.moveTo(x * distancia, y * distancia);
        ctx.lineTo(x * (distancia + comprimento), y * (distancia + comprimento));
        ctx.stroke();
    }

    ctx.globalAlpha = 1;
}

function animar(agora) {
    const t = agora / 1000;
    const aproximacao = (1 - Math.cos(t * volta / 18)) / 2;
    const zoom = 0.88 + aproximacao * 1.25;

    ctx.fillStyle = "#020517";
    ctx.fillRect(0, 0, tela.width, tela.height);

    ctx.save();
    ctx.translate(tela.width / 2 , tela.height / 2);
    ctx.scale(zoom, zoom);

    desenharFaiscas(t, 0.12 + aproximacao * 0.85);

    for (let i = 0; i < cores.length; i++) {
        if (posicaoDaLuz(i, t).z < 0) desenharLuz(i, t);
    }

    desenharNucleo(t);

    for (let i = 0; i < cores.length; i++) {
        if (posicaoDaLuz(i, t).z >= 0) desenharLuz(i, t);
    }

    ctx.restore();
    requestAnimationFrame(animar);
}

requestAnimationFrame(animar);