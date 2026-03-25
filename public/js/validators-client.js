/**
 * Client-Side Validators
 * Shared validation functions for frontend forms
 * Mirrors server-side validators.js for consistency
 */

(function() {
    "use strict";

    var Validators = {
        // ============ Normalization Functions ============

        normalizeEmail: function(value) {
            return String(value || "").trim().toLowerCase();
        },

        normalizeName: function(value) {
            return String(value || "").trim().toLowerCase();
        },

        normalizePassword: function(value) {
            return String(value || "").trim();
        },

        normalizeText: function(value) {
            return String(value || "").trim();
        },

        // ============ Basic Validation Functions ============

        isEmpty: function(value) {
            return value === null || value === undefined || String(value).trim() === "";
        },

        isAlphaOnly: function(str) {
            return /^[A-Za-z]+$/.test(str);
        },

        isValidEmail: function(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },

        isExceedingMaxLength: function(str, maxLength) {
            maxLength = maxLength || 32;
            return String(str || "").length > maxLength;
        },

        meetsMinLength: function(str, minLength) {
            return String(str || "").length >= minLength;
        },

        // ============ Combined Validation Functions ============

        validateEmail: function(email) {
            var normalized = this.normalizeEmail(email);

            if (this.isEmpty(normalized)) {
                return { valid: false, message: "Email is required." };
            }

            if (!this.isValidEmail(normalized)) {
                return { valid: false, message: "Invalid email format." };
            }

            if (this.isExceedingMaxLength(normalized, 32)) {
                return { valid: false, message: "Email must be 32 characters or less." };
            }

            return { valid: true, message: "", value: normalized };
        },

        validateName: function(name, fieldName) {
            fieldName = fieldName || "Name";
            var normalized = this.normalizeName(name);

            if (this.isEmpty(normalized)) {
                return { valid: false, message: fieldName + " is required." };
            }

            if (!this.meetsMinLength(normalized, 3)) {
                return { valid: false, message: fieldName + " must be at least 3 characters." };
            }

            if (this.isExceedingMaxLength(normalized, 32)) {
                return { valid: false, message: fieldName + " must be 32 characters or less." };
            }

            if (!this.isAlphaOnly(normalized)) {
                return { valid: false, message: fieldName + " must contain only letters (A-Z)." };
            }

            return { valid: true, message: "", value: normalized };
        },

        validatePassword: function(password) {
            var normalized = this.normalizePassword(password);

            if (this.isEmpty(normalized)) {
                return { valid: false, message: "Password is required." };
            }

            if (!this.meetsMinLength(normalized, 3)) {
                return { valid: false, message: "Password must be 3 characters or more." };
            }

            if (this.isExceedingMaxLength(normalized, 32)) {
                return { valid: false, message: "Password must be 32 characters or less." };
            }

            return { valid: true, message: "", value: normalized };
        },

        validateMessageContent: function(content) {
            var normalized = this.normalizeText(content);

            if (this.isEmpty(normalized)) {
                return { valid: false, message: "Message cannot be empty." };
            }

            if (this.isExceedingMaxLength(normalized, 500)) {
                return { valid: false, message: "Message must be 500 characters or less." };
            }

            return { valid: true, message: "", value: normalized };
        }
    };

    // Make available globally
    window.Validators = Validators;

})();