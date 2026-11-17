const form = document.querySelector("#form-login");
const email = document.querySelector("#email");
const senha = document.querySelector("#senha");
const lembrar = document.querySelector("#lembrar");

const erroEmail = document.querySelector("#erro-email");
const erroSenha = document.querySelector("#erro-senha");
const mensagem = document.querySelector("#mensagem");

const mostrarSenha = document.querySelector("#mostrar-senha");
const recuperar = document.querySelector("#recuperar");

const chaveEmail = "portfolio-kaiky-email";

// Usa a validação que o HTML já oferece para type="email".
function validarEmail() {
    email.value = email.value.trim();

    let erro = "";

    if (email.validity.valueMissing) {
        erro = "Digite seu e-mail.";
    } else if (email.validity.typeMismatch) {
        erro = "Confira o formato. Exemplo: nome@email.com.";
    }

    erroEmail.textContent = erro;
    email.setAttribute("aria-invalid", String(erro !== ""));

    return erro === "";
}

function validarSenha() {
    const preenchida = senha.value.length > 0;

    erroSenha.textContent = preenchida ? "" : "Digite uma senha de teste.";
    senha.setAttribute("aria-invalid", String(!preenchida));

    return preenchida;
}

// Alterna entre esconder e mostrar o que foi digitado.
mostrarSenha.addEventListener("click", function () {
    const estaOculta = senha.type === "password";

    senha.type = estaOculta ? "text" : "password";
    mostrarSenha.textContent = estaOculta ? "Ocultar" : "Mostrar";
});

// Limpa a mensagem anterior enquanto a pessoa corrige o campo.
email.addEventListener("input", function () {
    erroEmail.textContent = "";
    email.removeAttribute("aria-invalid");
    mensagem.textContent = "";
});

senha.addEventListener("input", function () {
    erroSenha.textContent = "";
    senha.removeAttribute("aria-invalid");
    mensagem.textContent = "";
});

// Se o navegador permitir, recupera o e-mail lembrado anteriormente.
try {
    const emailSalvo = localStorage.getItem(chaveEmail);

    if (emailSalvo) {
        email.value = emailSalvo;
        lembrar.checked = true;
    }
} catch {
    // O formulário também funciona com o armazenamento bloqueado.
}

lembrar.addEventListener("change", function () {
    if (!lembrar.checked) {
        try {
            localStorage.removeItem(chaveEmail);
        } catch {
            // O navegador pode bloquear o armazenamento local.
        }
    }
});

form.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const emailValido = validarEmail();
    const senhaValida = validarSenha();

    if (!emailValido || !senhaValida) {
        mensagem.textContent = "";

        if (!emailValido) {
            email.focus();
        } else {
            senha.focus();
        }

        return;
    }

    if (lembrar.checked) {
        try {
            localStorage.setItem(chaveEmail, email.value);
        } catch {
            mensagem.textContent =
                "Campos válidos. O navegador bloqueou a opção de lembrar o e-mail.";
            return;
        }
    }

    mensagem.textContent = "Campos válidos! Você concluiu o teste de login.";
});

recuperar.addEventListener("click", function () {
    if (!validarEmail()) {
        mensagem.textContent = "";
        email.focus();
        return;
    }

    mensagem.textContent =
        "E-mail válido. Em um site com contas cadastradas, " +
        "esta etapa solicitaria um link de recuperação.";
});