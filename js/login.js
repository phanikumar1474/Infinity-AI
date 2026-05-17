import { getLoggedInUser, validateLogin, setLoggedInUser } from './auth.js';

const showMessage = (message, isError = false) => {
    const el = document.getElementById('login-message');
    el.textContent = message;
    el.style.color = isError ? 'var(--text-secondary)' : 'var(--accent-primary)';
};

window.addEventListener('DOMContentLoaded', () => {
    if (getLoggedInUser()) {
        window.location.href = 'index.html';
        return;
    }

    const form = document.getElementById('login-form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const result = validateLogin({ username, password });
        if (!result.success) {
            showMessage(result.message, true);
            return;
        }

        setLoggedInUser(result.username);
        window.location.href = 'index.html';
    });
});
