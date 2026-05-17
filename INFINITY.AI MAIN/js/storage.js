// Storage Management

const STORAGE_KEYS = {
    CHATS: 'infintyai_chats',
    CURRENT_CHAT: 'infintyai_current_chat_id',
    THEME: 'infintyai_theme'
};

const LEGACY_STORAGE_KEYS = {
    CHATS: 'nexusai_chats',
    CURRENT_CHAT: 'nexusai_current_chat_id',
    THEME: 'nexusai_theme'
};

const getLegacyOrCurrent = (key) => {
    return localStorage.getItem(STORAGE_KEYS[key]) || localStorage.getItem(LEGACY_STORAGE_KEYS[key]);
};

export const getTheme = () => {
    return getLegacyOrCurrent('THEME') || 'dark';
};

export const saveTheme = (theme) => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

export const getChats = () => {
    const chats = getLegacyOrCurrent('CHATS');
    return chats ? JSON.parse(chats) : [];
};

export const saveChats = (chats) => {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
};

export const createNewChat = () => {
    const chats = getChats();
    const newChat = {
        id: Date.now().toString(),
        title: 'New Conversation',
        messages: [],
        createdAt: new Date().toISOString()
    };
    chats.unshift(newChat); // Add to beginning
    saveChats(chats);
    return newChat;
};

export const getChatById = (id) => {
    const chats = getChats();
    return chats.find(c => c.id === id);
};

export const updateChat = (id, updates) => {
    const chats = getChats();
    const index = chats.findIndex(c => c.id === id);
    if (index !== -1) {
        chats[index] = { ...chats[index], ...updates };
        saveChats(chats);
        return chats[index];
    }
    return null;
};

export const deleteChat = (id) => {
    const chats = getChats();
    const filtered = chats.filter(c => c.id !== id);
    saveChats(filtered);
    return filtered;
};

export const addMessageToChat = (chatId, message) => {
    const chat = getChatById(chatId);
    if (chat) {
        chat.messages.push(message);
        // Auto-generate title if it's the first user message
        if (chat.messages.length === 1 && message.role === 'user') {
            chat.title = message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '');
        }
        updateChat(chatId, { messages: chat.messages, title: chat.title });
    }
};
