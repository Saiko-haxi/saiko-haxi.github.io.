const fio = document.querySelector(".fio");
const interruptor = document.querySelector("#interruptor");

interruptor.addEventListener("click", function () {
    const aceso = fio.classList.toggle("aceso");

    if (aceso) {
        interruptor.textContent = "Apagar luzes";
    } else {
        interruptor.textContent = "Acender luzes";
    }
});

const neve = document.createElement("div");
neve.className = "flocos";
neve.setAttribute("aria-hidden", "true");

for (let i = 0; i < 40; i++) {
    const floco = document.createElement("span");
    floco.className = "floco";
    floco.textContent = "❄";

    const duracao = 5 + Math.random() * 6;
    
    floco.style.setProperty("--posicao", `${Math.random() * 100}%`);
    floco.style.setProperty("--tamanho", `${7 + Math.random() * 10}px`);
    floco.style.setProperty("--duracao", `${duracao}s`);
    floco.style.setProperty("--atraso", `${Math.random() * duracao}s`);

    neve.appendChild(floco);
}

document.body.appendChild(neve);