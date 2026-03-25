/**
 * Chat Page JavaScript
 * Handles real-time messaging with polling, message editing, and rendering
 * Uses shared Validators from validators-client.js
 */

// ============ Constants ============

/** Polling interval in seconds */
const POLLING = 10;

/** @type {number|null} - Timestamp of last update (for efficient polling) */
let lastUpdate = null;

/** @type {number} - Current logged-in user ID (read from data attribute) */
const currentUserId = parseInt(document.body.dataset.userId);

// ============ Security Functions ============

/**
 * Escape HTML to prevent XSS attacks
 * Handles all dangerous characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
    return String(text).replace(/[&<>"'`=/]/g, char => map[char]);
}

/**
 * Escape JavaScript string for use in data attributes
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text safe for data attributes
 */
function escapeAttr(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ============ Polling Functions ============

/**
 * Check server for new messages
 * Called periodically via setInterval
 */
async function checkForUpdates() {
    try {
        // Build URL with lastUpdate parameter if available
        const url = lastUpdate
            ? `/api/messages?lastUpdate=${lastUpdate}`
            : '/api/messages';

        const response = await fetch(url);
        const data = await response.json();

        // Handle session expiration - redirect to login
        if (!response.ok || data.code === "NOT_LOGGED_IN") {
            window.location.href = "/";
            return;
        }

        // Update UI only if there are new messages
        if (data.hasUpdates && data.messages) {
            lastUpdate = data.lastUpdate;
            renderMessages(data.messages);
        }

    } catch (error) {
        console.error("Connection error:", error);
    }
}

// ============ Rendering Functions ============

/**
 * Render messages in the chat container
 * @param {Array} messages - Array of message objects
 */
function renderMessages(messages) {
    const container = document.getElementById("chatMessages");
    if (!container) return;

    // Show empty state if no messages
    if (!messages || messages.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                <div style="font-size: 60px; filter: grayscale(1);">☁️</div>
                <h5 class="mt-3 text-dark fw-bold">No messages yet</h5>
                <p class="small">Say hello 👋</p>
            </div>`;
        return;
    }

    // Build HTML for each message using safe escaping
    container.innerHTML = messages.map(msg => {
        const isMyMessage = msg.userId === currentUserId;
        const senderName = msg.sender?.firstName || 'Unknown';
        const initial = escapeHtml(senderName.charAt(0).toUpperCase());
        const name = escapeHtml(senderName);
        const content = escapeHtml(msg.content);
        const contentAttr = escapeAttr(msg.content);

        // Format date and time
        const date = new Date(msg.createdAt);
        const time = date.toLocaleDateString() + ' ' +
            date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="d-flex mb-4 ${isMyMessage ? 'justify-content-end my-message' : 'other-message'}">
                
                ${!isMyMessage ? `<div class="avatar-sm me-2">${initial}</div>` : ''}

                <div class="message-wrapper" style="max-width: 75%;">
                    <div class="d-flex align-items-center gap-2 mb-1 ${isMyMessage ? 'justify-content-end' : ''}">
                        <span class="fw-bold small text-dark opacity-75">${name}</span>
                        <span class="text-muted" style="font-size: 10px;">${escapeHtml(time)}</span>
                    </div>

                    <div class="message-bubble ${isMyMessage ? 'my-bubble' : 'other-bubble'} shadow-sm">
                        ${content}
                    </div>

                    ${isMyMessage ? `
                        <div class="mt-1 d-flex justify-content-end gap-2">
                            <button class="btn-action edit" 
                                    data-id="${msg.id}" 
                                    data-content="${contentAttr}">Edit</button>
                            <form action="/chat/delete/${msg.id}" method="POST" class="d-inline" 
                                  onsubmit="return confirm('Are you sure? Deleting a message cannot be undone');">
                                <button type="submit" class="btn-action delete">Delete</button>
                            </form>
                        </div>
                    ` : ''}
                </div>

                ${isMyMessage ? `<div class="avatar-sm ms-2">${initial}</div>` : ''}
            </div>
        `;
    }).join('');

    // Scroll to top to show newest messages (since ordered DESC)
    container.scrollTop = 0;
}

// ============ Message Actions ============

/**
 * Edit a message via REST API
 * @param {number} id - Message ID
 * @param {string} content - Current message content
 */
async function editMessage(id, content) {
    // Prompt user for new content
    const newContent = prompt("Edit your message:", content);

    // User cancelled or content unchanged
    if (newContent === null || newContent === content) {
        return;
    }

    // Validate message content
    const trimmedContent = newContent.trim();
    if (!trimmedContent) {
        alert("Message cannot be empty.");
        return;
    }
    if (trimmedContent.length > 500) {
        alert("Message must be 500 characters or less.");
        return;
    }

    try {
        const response = await fetch('/api/messages/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: trimmedContent })
        });

        const data = await response.json();

        // Handle session expiration
        if (response.status === 401 || data.code === "NOT_LOGGED_IN") {
            alert("Session expired. Please login again.");
            window.location.href = "/";
            return;
        }

        // Refresh messages on success
        if (data.ok) {
            lastUpdate = null;
            checkForUpdates();
        } else {
            alert(data.message || 'Failed to edit message');
        }

    } catch (error) {
        alert("Connection error. Please try again.");
    }
}

// ============ Page Initialization ============

/**
 * Initialize page on load
 */
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById("chatMessages");
    if (container) {
        // Scroll to top on page load (newest messages are at top)
        container.scrollTop = 0;
    }

    // Event delegation for edit buttons
    document.addEventListener('click', function(e) {
        const editBtn = e.target.closest('.btn-action.edit');
        if (editBtn) {
            const id = editBtn.dataset.id;
            const content = editBtn.dataset.content || '';
            if (id) {
                editMessage(parseInt(id), content);
            }
        }
    });
});

// ============ Start Polling ============

// Check if we're in search mode (query parameter exists)
const urlParams = new URLSearchParams(window.location.search);
const isSearchMode = urlParams.has('q') && urlParams.get('q').trim() !== '';

// Only poll if NOT in search mode
if (!isSearchMode) {
    setInterval(checkForUpdates, POLLING * 1000);
}