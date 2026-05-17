import { parseMarkdown, formatTime } from './utils.js';

export const UI = {
    get elements() {
        return {
            chatMessages: document.getElementById('chat-messages'),
            chatHistoryList: document.getElementById('chat-history-list'),
            typingIndicator: document.getElementById('typing-indicator'),
            welcomeState: document.getElementById('welcome-state'),
            currentChatTitle: document.getElementById('current-chat-title'),
            themeToggle: document.getElementById('btn-theme-toggle'),
            themeText: document.querySelector('.theme-text')
        };
    },

    scrollToBottom() {
        this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
    },

    showTypingIndicator() {
        this.elements.typingIndicator.classList.remove('hidden');
        this.scrollToBottom();
    },

    hideTypingIndicator() {
        this.elements.typingIndicator.classList.add('hidden');
    },

    clearMessages() {
        this.elements.chatMessages.innerHTML = '';
    },

    showWelcomeState() {
        this.clearMessages();
        if (!this.elements.welcomeState) return;
        this.elements.welcomeState.style.display = 'flex';
        this.elements.chatMessages.appendChild(this.elements.welcomeState);
    },

    hideWelcomeState() {
        if (!this.elements.welcomeState || !this.elements.welcomeState.parentNode) return;
        this.elements.welcomeState.style.display = 'none';
    },

    createMessageBubble(content, role, isStreaming = false, timestamp = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = role === 'user' ? '<i data-lucide="user"></i>' : '<i data-lucide="cpu"></i>';
        
        const contentContainer = document.createElement('div');
        contentContainer.className = 'message-content-container';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content markdown-body';
        
        if (role === 'bot') {
            contentDiv.innerHTML = isStreaming ? '' : parseMarkdown(content);
        } else {
            contentDiv.textContent = content;
        }

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = formatTime(timestamp);

        contentContainer.appendChild(contentDiv);
        
        if (role === 'bot' && !isStreaming) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'message-action-btn';
            copyBtn.title = 'Copy response';
            copyBtn.innerHTML = '<i data-lucide="copy"></i>';
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(content);
                copyBtn.innerHTML = '<i data-lucide="check"></i>';
                setTimeout(() => copyBtn.innerHTML = '<i data-lucide="copy"></i>', 2000);
            };

            const speakBtn = document.createElement('button');
            speakBtn.className = 'message-action-btn btn-speak-msg';
            speakBtn.title = 'Read aloud';
            speakBtn.innerHTML = '<i data-lucide="volume-2"></i>';
            speakBtn.dataset.text = content;

            actionsDiv.appendChild(copyBtn);
            actionsDiv.appendChild(speakBtn);
            contentContainer.appendChild(actionsDiv);
        }

        contentContainer.appendChild(timeDiv);

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentContainer);
        
        this.elements.chatMessages.appendChild(messageDiv);
        if (window.lucide) lucide.createIcons({ root: messageDiv });
        
        return { messageDiv, contentDiv };
    },

    async simulateTyping(contentDiv, content, fullHtml) {
        contentDiv.innerHTML = '';
        let currentHtml = '';
        
        // Simple typing effect for HTML content. 
        // For accurate HTML typing, it's better to type character by character into a hidden div and sync,
        // but for simplicity, we'll just show the parsed markdown immediately and maybe fade it in.
        // To implement real character-by-character while supporting markdown is complex.
        // We will compromise: show parsed HTML but use CSS animation to fade it in block by block.
        
        contentDiv.innerHTML = fullHtml;
        contentDiv.style.opacity = '0';
        
        // Re-highlight code blocks
        if (window.Prism) Prism.highlightAllUnder(contentDiv);
        
        let opacity = 0;
        return new Promise(resolve => {
            const interval = setInterval(() => {
                opacity += 0.1;
                contentDiv.style.opacity = opacity.toString();
                if (opacity >= 1) {
                    clearInterval(interval);
                    resolve();
                }
            }, 30);
        });
    },

    renderChatHistory(chats, currentChatId, onSelect, onDelete) {
        this.elements.chatHistoryList.innerHTML = '';
        
        chats.forEach(chat => {
            const item = document.createElement('div');
            item.className = `history-item ${chat.id === currentChatId ? 'active' : ''}`;
            
            const titleSpan = document.createElement('span');
            titleSpan.className = 'history-item-title';
            titleSpan.textContent = chat.title || 'New Conversation';
            
            const actions = document.createElement('div');
            actions.className = 'history-item-actions';
            
            const delBtn = document.createElement('button');
            delBtn.className = 'icon-btn';
            delBtn.innerHTML = '<i data-lucide="trash-2"></i>';
            delBtn.onclick = (e) => {
                e.stopPropagation();
                onDelete(chat.id);
            };
            
            actions.appendChild(delBtn);
            
            item.appendChild(titleSpan);
            item.appendChild(actions);
            
            item.onclick = () => onSelect(chat.id);
            
            this.elements.chatHistoryList.appendChild(item);
        });
        
        if (window.lucide) lucide.createIcons({ root: this.elements.chatHistoryList });
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const icon = theme === 'dark' ? 'sun' : 'moon';
        const text = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
        
        this.elements.themeToggle.innerHTML = `<i data-lucide="${icon}"></i> <span class="theme-text">${text}</span>`;
        if (window.lucide) lucide.createIcons({ root: this.elements.themeToggle });
    }
};
