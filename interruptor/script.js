const interruptor = document.querySelector("#interruptor");
const personagem = document.querySelector(".personagem");

interruptor.addEventListener("click", async function () {
    if (interruptor.classList.contains("andando")) return;

    const ligado = interruptor.getAttribute("aria-pressed") === "true";
    const inicio = ligado ? 80 : 0;
    const fim = ligado ? 0 : 80;

    interruptor.classList.add("andando");

    const caminhada = personagem.animate([
        { transform: `translate(${inicio}px, 0)`, offset: 0 },
        { transform: `translate(${inicio}px, -24px)`, offset: 0.18 },
        { transform: `translate(${fim}px, -24px)`, offset: 0.82 },
        { transform: `translate(${fim}px, 0)`, offset: 1 }
    ], {
        duration: 1200,
        easing: "ease-in-out"
    });

    await caminhada.finished;

    interruptor.setAttribute("aria-pressed", String(!ligado));
    interruptor.classList.remove("andando");
});