const spots = [
    {
        id: "praca-central",
        nome: "Praça Central",
        cidade: "Vila Aurora",
        tipo: "Street",
        nivel: "iniciante",
        acesso: "Gratuito",
        descricao:
            "Área plana com obstáculos baixos para praticar equilíbrio, " +
            "ollie e as primeiras manobras."
    },
    {
        id: "parque-da-estacao",
        nome: "Parque da Estação",
        cidade: "Vila Aurora",
        tipo: "Skatepark",
        nivel: "intermediario",
        acesso: "Gratuito",
        descricao:
            "Pista com banks, corrimãos e caixotes. " +
            "Um cenário para treinar linhas e combinar manobras."
    },
    {
        id: "bowl-do-vale",
        nome: "Bowl do Vale",
        cidade: "Jardim do Vale",
        tipo: "Bowl",
        nivel: "avancado",
        acesso: "Gratuito",
        descricao:
            "Bowl com transições altas e curvas fechadas. " +
            "Exige domínio de velocidade e leitura das transições."
    },
    {
        id: "galpao-skate",
        nome: "Galpão Skate",
        cidade: "Jardim do Vale",
        tipo: "Indoor",
        nivel: "intermediario",
        acesso: "Pago",
        descricao:
            "Espaço coberto com mini ramp e obstáculos de street. " +
            "Uma opção de rolê para os dias de chuva."
    }
];

const nomesDosNiveis = {
    iniciante: "Iniciante",
    intermediario: "Intermediário",
    avancado: "Avançado"
};

const busca = document.querySelector("#busca");
const nivel = document.querySelector("#nivel");
const filtroFavoritos = document.querySelector("#filtro-favoritos");

const lista = document.querySelector("#lista-spots");
const modelo = document.querySelector("#modelo-spot");
const resultado = document.querySelector("#resultado");
const vazio = document.querySelector("#vazio");
const mensagem = document.querySelector("#mensagem");

const chaveFavoritos = "skate-spot-favoritos";

let favoritos = carregarFavoritos();
let mostrarSoFavoritos = false;

function carregarFavoritos() {
    try {
        const salvos = JSON.parse(
            localStorage.getItem(chaveFavoritos) || "[]"
        );

        if (Array.isArray(salvos)) {
            return salvos.filter(function (id) {
                return spots.some(function (spot) {
                    return spot.id === id;
                });
            });
        }
    } catch {
        // A página pode funcionar mesmo com o armazenamento bloqueado.
    }

    return [];
}

// Permite pesquisar "praca" e encontrar "Praça".
function normalizar(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

function atualizarBotao(botao, spot) {
    const estaSalvo = favoritos.includes(spot.id);

    botao.textContent = estaSalvo ? "♥" : "♡";
    botao.setAttribute("aria-pressed", String(estaSalvo));

    const acao = estaSalvo
        ? "Remover dos favoritos"
        : "Adicionar aos favoritos";

    botao.setAttribute("aria-label", `${acao}: ${spot.nome}`);
}

function alternarFavorito(spot, botao) {
    const estaSalvo = favoritos.includes(spot.id);

    if (estaSalvo) {
        favoritos = favoritos.filter(function (id) {
            return id !== spot.id;
        });
    } else {
        favoritos.push(spot.id);
    }

    mensagem.textContent = estaSalvo
        ? `${spot.nome} foi removido dos favoritos.`
        : `${spot.nome} foi adicionado aos favoritos.`;

    try {
        localStorage.setItem(
            chaveFavoritos,
            JSON.stringify(favoritos)
        );
    } catch {
        mensagem.textContent +=
            " O navegador bloqueou o salvamento. " +
            "A seleção ficará disponível enquanto esta página estiver aberta.";
    }

    if (mostrarSoFavoritos) {
        // Guarda a posição para manter a navegação pelo teclado.
        const botoesAntes = [...lista.querySelectorAll(".favoritar")];
        const posicao = botoesAntes.indexOf(botao);

        renderizarSpots();

        const botoesDepois = lista.querySelectorAll(".favoritar");
        const proximoBotao =
            botoesDepois[Math.min(posicao, botoesDepois.length - 1)];

        if (proximoBotao) {
            proximoBotao.focus();
        } else {
            filtroFavoritos.focus();
        }
    } else {
        atualizarBotao(botao, spot);
    }
}

function criarCard(spot) {
    const card = modelo.content.firstElementChild.cloneNode(true);

    card.querySelector(".tipo").textContent = spot.tipo;
    card.querySelector("h2").textContent = spot.nome;
    card.querySelector(".local").textContent = spot.cidade;
    card.querySelector(".resumo").textContent = spot.descricao;
    card.querySelector(".nivel").textContent = nomesDosNiveis[spot.nivel];
    card.querySelector(".acesso").textContent = spot.acesso;

    const botao = card.querySelector(".favoritar");
    atualizarBotao(botao, spot);

    botao.addEventListener("click", function () {
        alternarFavorito(spot, botao);
    });

    return card;
}

function renderizarSpots() {
    const termo = normalizar(busca.value.trim());

    const encontrados = spots.filter(function (spot) {
        const texto = normalizar(`${spot.nome} ${spot.cidade}`);

        const combinaBusca = texto.includes(termo);
        const combinaNivel =
            nivel.value === "todos" || spot.nivel === nivel.value;
        const combinaFavoritos =
            !mostrarSoFavoritos || favoritos.includes(spot.id);

        return combinaBusca && combinaNivel && combinaFavoritos;
    });

    lista.replaceChildren();

    encontrados.forEach(function (spot) {
        lista.appendChild(criarCard(spot));
    });

    const total = encontrados.length;

    resultado.textContent = total === 1
        ? "1 spot encontrado"
        : `${total} spots encontrados`;

    vazio.hidden = total > 0;
}

busca.addEventListener("input", renderizarSpots);
nivel.addEventListener("change", renderizarSpots);

filtroFavoritos.addEventListener("click", function () {
    mostrarSoFavoritos = !mostrarSoFavoritos;

    filtroFavoritos.setAttribute(
        "aria-pressed",
        String(mostrarSoFavoritos)
    );

    renderizarSpots();
});

renderizarSpots();