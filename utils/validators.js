// ============ Normalization Functions ============

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function normalizeName(name) {
    return String(name || "").trim().toLowerCase();
}

function normalizePassword(password) {
    return String(password || "").trim();
}

function normalizeText(text) {
    return String(text || "").trim();
}

// ============ Validation Functions ============

function isAlphaOnly(str) {
    return /^[A-Za-z]+$/.test(str);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isExceedingMaxLength(str, maxLength = 32) {
    return String(str || "").length > maxLength;
}

function meetsMinLength(str, minLength) {
    return String(str || "").length >= minLength;
}

function isEmpty(value) {
    return value === null || value === undefined || String(value).trim() === "";
}

// ============ Combined Validation Functions ============

function validateEmail(email) {
    const normalized = normalizeEmail(email);

    if (isEmpty(normalized)) {
        return { valid: false, message: "Email is required." };
    }

    if (!isValidEmail(normalized)) {
        return { valid: false, message: "Invalid email format." };
    }

    if (isExceedingMaxLength(normalized, 32)) {
        return { valid: false, message: "Email must be 32 characters or less." };
    }

    return { valid: true, message: "", value: normalized };
}

function validateName(name, fieldName = "Name") {
    const normalized = normalizeName(name);

    if (isEmpty(normalized)) {
        return { valid: false, message: `${fieldName} is required.` };
    }

    if (!meetsMinLength(normalized, 3)) {
        return { valid: false, message: `${fieldName} must be at least 3 characters.` };
    }

    if (isExceedingMaxLength(normalized, 32)) {
        return { valid: false, message: `${fieldName} must be 32 characters or less.` };
    }

    if (!isAlphaOnly(normalized)) {
        return { valid: false, message: `${fieldName} must contain only letters (A-Z).` };
    }

    return { valid: true, message: "", value: normalized };
}

function validatePassword(password) {
    const normalized = normalizePassword(password);

    if (isEmpty(normalized)) {
        return { valid: false, message: "Password is required." };
    }

    if (!meetsMinLength(normalized, 3)) {
        return { valid: false, message: "Password must be at least 3 characters." };
    }

    if (isExceedingMaxLength(normalized, 32)) {
        return { valid: false, message: "Password must be 32 characters or less." };
    }

    return { valid: true, message: "", value: normalized };
}

function validateMessageContent(content) {
    const normalized = normalizeText(content);

    if (isEmpty(normalized)) {
        return { valid: false, message: "Message cannot be empty." };
    }

    if (isExceedingMaxLength(normalized, 500)) {
        return { valid: false, message: "Message must be 500 characters or less." };
    }

    return { valid: true, message: "", value: normalized };
}

// Export all functions
module.exports = {
    // Normalization functions
    normalizeEmail,
    normalizeName,
    normalizePassword,
    normalizeText,

    // Basic validation functions
    isAlphaOnly,
    isValidEmail,
    isExceedingMaxLength,
    meetsMinLength,
    isEmpty,

    // Combined validation functions
    validateEmail,
    validateName,
    validatePassword,
    validateMessageContent
};