/**
 * Login Page JavaScript
 * Handles user login form submission and validation
 */

const loginForm = document.querySelector("form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const regSuccess = document.getElementById("regSuccess");

// Create error div if it doesn't exist
let errorDiv = document.getElementById("loginError");
if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.id = "loginError";
    errorDiv.className = "text-danger small text-center mb-2";
    loginForm.insertBefore(errorDiv, loginForm.firstChild);
}

// Show success message if redirected from registration
const params = new URLSearchParams(window.location.search);
if (params.get("registered") === "1") {
    regSuccess?.classList.remove("d-none");
    history.replaceState(null, "", "/"); // remove query string
}

// Navigate to register page with animation
document.getElementById("goRegister")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.body.classList.add("go-register");
    setTimeout(() => { window.location.href = "/register"; }, 720);
});

// Handle login form submission
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorDiv.textContent = "";

    const emailResult = Validators.validateEmail(emailInput.value);
    if (!emailResult.valid) return showError(emailResult.message, emailInput);

    const passwordResult = Validators.validatePassword(passwordInput.value);
    if (!passwordResult.valid) return showError(passwordResult.message, passwordInput);

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: emailResult.value,
                password: passwordResult.value
            }),
        });

        const data = await response.json();
        if (!response.ok || !data.ok) return showError(data.message || "Login failed.");

        window.location.href = "/chat";

    } catch {
        showError("Connection error. Please try again.");
    }
});

// Utility function to show error messages
function showError(message, focusEl) {
    errorDiv.textContent = message;
    focusEl?.focus();
}
