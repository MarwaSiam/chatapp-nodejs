/**
 * Registration Page JavaScript
 * Handles two-step user registration with timeout
 * Uses shared Validators from validators-client.js
 */

// ============ Get HTML Elements ============
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const formStep1 = document.getElementById("formStep1");
const formStep2 = document.getElementById("formStep2");
const errStep1 = document.getElementById("errStep1");
const errStep2 = document.getElementById("errStep2");
const regEmail = document.getElementById("regEmail");
const regFirstName = document.getElementById("regFirstName");
const regLastName = document.getElementById("regLastName");
const regPassword = document.getElementById("regPassword");
const regConfirmPassword = document.getElementById("regConfirmPassword");
const btnNext = document.getElementById("btnNext");
const btnBack = document.getElementById("btnBack");
const btnRegister = document.getElementById("btnRegister");
const timeBox = document.getElementById("timeRemaining");
const timeValue = document.getElementById("timeRemainingValue");

// ============ Constants ============
const TIMEOUT_REGISTER = 30;
let countdownTimer = null;
let remaining = TIMEOUT_REGISTER;

// ============ Helper Functions ============

function setError(el, msg) {
    if (!el) return;
    el.textContent = msg || "";
}

function stopCountdown({ hideBox = true } = {}) {
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = null;
    if (timeBox && hideBox) timeBox.classList.add("d-none");
}

function showStep1(clear = false) {
    step1.classList.remove("d-none");
    step2.classList.add("d-none");
    setError(errStep2, "");
    stopCountdown({ hideBox: true });

    if (clear) {
        regEmail.value = "";
        regFirstName.value = "";
        regLastName.value = "";
        regPassword.value = "";
        regConfirmPassword.value = "";
        setError(errStep1, "");
    }
}

function showStep2() {
    step1.classList.add("d-none");
    step2.classList.remove("d-none");
    setError(errStep1, "");
}

function expireNow() {
    if (timeBox && timeValue) {
        timeValue.textContent = "0";
        timeBox.classList.remove("d-none");
        timeBox.classList.remove("text-success");
        timeBox.classList.add("text-danger");
    }
}

function getCookie(name) {
    const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return m ? decodeURIComponent(m[2]) : null;
}

function computeRemainingFromCookie() {
    const started = Number(getCookie("reg_started") || 0);
    if (!started) return null;
    const ageSec = Math.floor((Date.now() - started) / 1000);
    return TIMEOUT_REGISTER - ageSec;
}

function startCountdownFromCookie() {
    if (!timeBox || !timeValue) return;

    const rem = computeRemainingFromCookie();
    if (rem === null || rem <= 0) {
        stopCountdown({ hideBox: false });
        expireNow();
        return;
    }

    timeBox.classList.remove("text-danger");
    timeBox.classList.add("text-success");
    stopCountdown({ hideBox: true });

    remaining = rem;
    timeValue.textContent = String(remaining);
    timeBox.classList.remove("d-none");

    countdownTimer = setInterval(() => {
        remaining -= 1;
        timeValue.textContent = String(Math.max(0, remaining));
        if (remaining <= 0) {
            stopCountdown({ hideBox: false });
            expireNow();
        }
    }, 1000);
}

async function postJSON(url, data) {
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "same-origin",
    });

    const text = await res.text();
    try {
        return { res, payload: JSON.parse(text) };
    } catch {
        console.error("Non-JSON response:", text);
        return { res, payload: { ok: false, message: "Server error." } };
    }
}

// ============ Event Listeners ============

formStep1?.addEventListener("submit", (e) => e.preventDefault());
formStep2?.addEventListener("submit", (e) => e.preventDefault());

btnNext?.addEventListener("click", async () => {
    setError(errStep1, "");

    // Validate email
    const emailResult = Validators.validateEmail(regEmail.value);
    if (!emailResult.valid) {
        setError(errStep1, emailResult.message);
        regEmail.focus();
        return;
    }

    // Validate first name
    const firstNameResult = Validators.validateName(regFirstName.value, "First Name");
    if (!firstNameResult.valid) {
        setError(errStep1, firstNameResult.message);
        regFirstName.focus();
        return;
    }

    // Validate last name
    const lastNameResult = Validators.validateName(regLastName.value, "Last Name");
    if (!lastNameResult.valid) {
        setError(errStep1, lastNameResult.message);
        regLastName.focus();
        return;
    }

    // Send to server
    const { res, payload } = await postJSON("/api/register/step1", {
        email: emailResult.value,
        firstName: firstNameResult.value,
        lastName: lastNameResult.value,
    });

    if (!res.ok || !payload.ok) {
        setError(errStep1, payload.message || "Step 1 failed.");
        return;
    }

    showStep2();
    startCountdownFromCookie();
});

btnBack?.addEventListener("click", () => {
    showStep1(false);
    startCountdownFromCookie();
});

btnRegister?.addEventListener("click", async () => {
    setError(errStep2, "");

    // Validate password
    const passwordResult = Validators.validatePassword(regPassword.value);
    if (!passwordResult.valid) {
        setError(errStep2, passwordResult.message);
        regPassword.focus();
        return;
    }

    // Validate confirm password
    const confirmResult = Validators.validatePassword(regConfirmPassword.value);
    if (!confirmResult.valid) {
        setError(errStep2, confirmResult.message);
        regConfirmPassword.focus();
        return;
    }

    // Check match
    if (passwordResult.value !== confirmResult.value) {
        setError(errStep2, "Passwords do not match.");
        regConfirmPassword.focus();
        return;
    }

    // Send to server
    const { res, payload } = await postJSON("/api/register/step2", {
        password: passwordResult.value,
        confirmPassword: confirmResult.value,
    });

    if (res.status === 408 || payload.code === "TIMEOUT") {
        showStep1(true);
        setError(errStep1, "Registration expired. Please start again.");
        return;
    }

    if (res.status === 409 && payload.code === "EMAIL_IN_USE") {
        showStep1(false);
        setError(errStep1, payload.message);
        regEmail.focus();
        return;
    }

    if (!res.ok || !payload.ok) {
        setError(errStep2, payload.message || "Registration failed.");
        return;
    }

    document.body.classList.add("go-login");
    setTimeout(() => {
        window.location.href = "/?registered=1";
    }, 720);
});

// ============ Page Initialization ============

(function init() {
    const email = getCookie("reg_email");
    const first = getCookie("reg_first");
    const last = getCookie("reg_last");
    const started = getCookie("reg_started");

    if (email && first && last && started) {
        const rem = computeRemainingFromCookie();
        if (rem !== null && rem > 0) {
            showStep1(false);
            regEmail.value = email;
            regFirstName.value = first;
            regLastName.value = last;
            startCountdownFromCookie();
        } else {
            showStep1(true);
        }
    } else {
        showStep1(true);
    }
})();

document.getElementById("goLogin")?.addEventListener("click", (e) => {
    e.preventDefault();
    document.body.classList.add("go-login");
    setTimeout(() => {
        window.location.href = "/";
    }, 720);
});