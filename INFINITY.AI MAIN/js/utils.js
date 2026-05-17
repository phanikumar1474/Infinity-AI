// Utility Functions

// Markdown configuration
if (window.marked) {
    marked.setOptions({
        breaks: true,
        gfm: true,
        highlight: function(code, lang) {
            if (Prism.languages[lang]) {
                return Prism.highlight(code, Prism.languages[lang], lang);
            }
            return code;
        }
    });
}

export const parseMarkdown = (text) => {
    if (!window.marked || !window.DOMPurify) return text;
    
    const rawHtml = marked.parse(text);
    // Sanitize output to prevent XSS
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    return cleanHtml;
};

export const formatTime = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const generateId = () => {
    return Math.random().toString(36).substring(2, 9);
};

export const exportChatAsText = (chat) => {
    if (!chat || !chat.messages.length) return;
    
    let text = `Chat: ${chat.title}\nDate: ${new Date(chat.createdAt).toLocaleString()}\n\n`;
    
    chat.messages.forEach(msg => {
        const role = msg.role === 'user' ? 'You' : 'Infinty.ai';
        text += `[${formatTime(msg.timestamp)}] ${role}:\n${msg.content}\n\n`;
    });
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Infinty.ai_Chat_${chat.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
};
