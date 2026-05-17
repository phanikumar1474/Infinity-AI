const AUTH_STORAGE_KEY = 'infintyai_accounts';
const AUTH_LOGGED_IN_KEY = 'infintyai_logged_in_user';

export const getUserAccounts = () => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
};

export const saveUserAccounts = (accounts) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(accounts));
};

export const getLoggedInUser = () => {
    return localStorage.getItem(AUTH_LOGGED_IN_KEY);
};

export const setLoggedInUser = (username) => {
    localStorage.setItem(AUTH_LOGGED_IN_KEY, username);
};

export const logoutUser = () => {
    localStorage.removeItem(AUTH_LOGGED_IN_KEY);
};

export const registerUser = ({ username, email, password }) => {
    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedUsername || !normalizedEmail || !password) {
        return { success: false, message: 'Please complete every field.' };
    }

    const accounts = getUserAccounts();
    const existing = accounts.find(account => account.username === normalizedUsername || account.email === normalizedEmail);
    if (existing) {
        return { success: false, message: 'An account with that username or email already exists.' };
    }

    accounts.push({ username: normalizedUsername, email: normalizedEmail, password });
    saveUserAccounts(accounts);
    return { success: true };
};

export const validateLogin = ({ username, password }) => {
    const normalizedUsername = username.trim().toLowerCase();
    const accounts = getUserAccounts();
    const account = accounts.find(account => account.username === normalizedUsername);
    if (!account) {
        return { success: false, message: 'No account found with that username.' };
    }
    if (account.password !== password) {
        return { success: false, message: 'Incorrect password.' };
    }
    return { success: true, username: account.username };
};
