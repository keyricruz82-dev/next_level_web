window.LoginPage = (function createLoginPage() {
    async function init() {
        const form = document.getElementById("loginForm");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const messageBox = document.getElementById("loginMessage");
        const submitButton = document.getElementById("loginButton");
        const spinner = document.getElementById("loginSpinner");
        const buttonText = document.getElementById("loginButtonText");

        const session = await AuthService.getSession().catch(() => null);
        if (session && session.user && AuthService.isAuthorizedUser(session.user)) {
            window.location.href = "dashboard.html";
            return;
        }

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            messageBox.className = "mt-3 small";
            messageBox.textContent = "";

            if (!form.checkValidity()) {
                form.classList.add("was-validated");
                return;
            }

            submitButton.disabled = true;
            spinner.classList.remove("d-none");
            buttonText.textContent = "Validando...";

            try {
                const email = emailInput.value.trim();
                const password = passwordInput.value;
                const { data, error } = await AuthService.signInWithPassword(email, password);

                if (error) {
                    messageBox.className = "mt-3 small alert alert-danger";
                    messageBox.textContent = error.message || "No se pudo iniciar sesion.";
                    return;
                }

                if (!data || !data.user) {
                    messageBox.className = "mt-3 small alert alert-danger";
                    messageBox.textContent = "No se pudo validar la sesion.";
                    return;
                }

                window.location.href = "dashboard.html";
            } catch (error) {
                messageBox.className = "mt-3 small alert alert-danger";
                messageBox.textContent = error.message || "Ocurrio un error al iniciar sesion.";
            } finally {
                submitButton.disabled = false;
                spinner.classList.add("d-none");
                buttonText.textContent = "Iniciar sesion";
            }
        });
    }

    return { init };
})();

document.addEventListener("DOMContentLoaded", () => {
    window.LoginPage.init();
});
