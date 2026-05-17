import { getLoggedInUser, registerUser } from './auth.js';

const showMessage = (message, isError = false) => {
    const el = document.getElementById('register-message');
    el.textContent = message;
    el.style.color = isError ? 'var(--text-secondary)' : 'var(--accent-primary)';
};

window.addEventListener('DOMContentLoaded', () => {
    if (getLoggedInUser()) {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('register-form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        const result = registerUser({ username, email, password });
        if (!result.success) {
            showMessage(result.message, true);
            return;
        }

        showMessage('Registration successful! Redirecting to login...');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1200);
    });
});
