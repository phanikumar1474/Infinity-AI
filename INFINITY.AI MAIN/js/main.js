import { 
    getTheme, saveTheme, 
    getChats, createNewChat, getChatById, addMessageToChat, deleteChat, updateChat 
} from './storage.js';
import { generateContent } from './api.js';
import { UI } from './ui.js';
import { SpeechService } from './speech.js';
import { exportChatAsText } from './utils.js';

let currentChatId = null;
let speechService = new SpeechService();

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

function initApp() {
    // Check initial theme
    const savedTheme = getTheme();
    UI.setTheme(savedTheme);

    // Initialize Chats
    const chats = getChats();
    if (chats.length === 0) {
        const newChat = createNewChat();
        currentChatId = newChat.id;
    } else {
        currentChatId = chats[0].id; // Load most recent
    }
    
    loadChat(currentChatId);
    updateSidebar();
}

function loadChat(chatId) {
    currentChatId = chatId;
    const chat = getChatById(chatId);
    
    UI.elements.currentChatTitle.textContent = chat.title || 'New Conversation';
    UI.clearMessages();
    
    if (chat.messages.length === 0) {
        UI.showWelcomeState();
    } else {
        UI.hideWelcomeState();
        chat.messages.forEach(msg => {
            UI.createMessageBubble(msg.content, msg.role, false, msg.timestamp);
        });
        UI.scrollToBottom();
    }
    updateSidebar();
}

function updateSidebar() {
    const chats = getChats();
    UI.renderChatHistory(chats, currentChatId, loadChat, handleDeleteChat);
}

function handleDeleteChat(id) {
    const remaining = deleteChat(id);
    if (id === currentChatId) {
        if (remaining.length > 0) {
            loadChat(remaining[0].id);
        } else {
            const newChat = createNewChat();
            loadChat(newChat.id);
        }
    } else {
        updateSidebar();
    }
}

async function handleSendMessage() {
    const inputEl = document.getElementById('message-input');
    const content = inputEl.value.trim();
    
    if (!content) return;
    
    
    // Check API Key
    // Key is now checked in api.js

    inputEl.value = '';
    inputEl.style.height = 'auto'; // Reset textarea height
    document.getElementById('btn-send').disabled = true;
    
    UI.hideWelcomeState();

    // User Message
    const userMsg = { role: 'user', content, timestamp: new Date().toISOString() };
    addMessageToChat(currentChatId, userMsg);
    UI.createMessageBubble(content, 'user', false, userMsg.timestamp);
    UI.scrollToBottom();

    // Show Typing
    UI.showTypingIndicator();

    try {
        const chat = getChatById(currentChatId);
        const personality = document.getElementById('ai-personality').value;
        
        // Fetch Response
        const aiResponseText = await generateContent(chat.messages, personality);
        
        UI.hideTypingIndicator();
        
        // Bot Message
        const botMsg = { role: 'bot', content: aiResponseText, timestamp: new Date().toISOString() };
        addMessageToChat(currentChatId, botMsg);
        
        const { contentDiv } = UI.createMessageBubble(aiResponseText, 'bot', true, botMsg.timestamp);
        
        // Simulate Typing Effect
        const parsedHtml = window.parseMarkdown ? window.parseMarkdown(aiResponseText) : aiResponseText;
        await UI.simulateTyping(contentDiv, aiResponseText, parsedHtml);
        
        UI.scrollToBottom();
        updateSidebar(); // Update title if it changed
        
        // Setup speaker button logic for new message
        setupSpeakerButtons();

    } catch (error) {
        UI.hideTypingIndicator();
        let errorMessage = "An error occurred. Please try again.";
        if (error.message === 'API_KEY_MISSING') {
            errorMessage = "API Key is missing. Please add it to js/api.js.";
        } else {
            errorMessage = `Error: ${error.message}`;
        }
        UI.createMessageBubble(errorMessage, 'bot', false, new Date().toISOString());
        UI.scrollToBottom();
    }
    
    document.getElementById('btn-send').disabled = false;
}

function setupSpeakerButtons() {
    document.querySelectorAll('.btn-speak-msg').forEach(btn => {
        btn.onclick = () => {
            const text = btn.dataset.text;
            if (btn.classList.contains('active')) {
                speechService.stopSpeaking();
                btn.classList.remove('active');
                btn.innerHTML = '<i data-lucide="volume-2"></i>';
            } else {
                // Stop any other active buttons
                document.querySelectorAll('.btn-speak-msg.active').forEach(b => {
                    b.classList.remove('active');
                    b.innerHTML = '<i data-lucide="volume-2"></i>';
                });
                speechService.speak(text);
                btn.classList.add('active');
                btn.innerHTML = '<i data-lucide="square"></i>'; // Stop icon
                
                // Reset after speech ends
                speechService.synthesis.onboundary = null;
                // Wait approx text length or handle via utterance onend in SpeechService (needs refactor for callbacks, keeping it simple here)
                setTimeout(() => {
                    btn.classList.remove('active');
                    btn.innerHTML = '<i data-lucide="volume-2"></i>';
                    lucide.createIcons({ root: btn });
                }, text.length * 60); // rough estimate
            }
            lucide.createIcons({ root: btn });
        };
    });
}

function setupEventListeners() {
    // View Toggles
    const launchApp = () => {
        document.getElementById('landing-page').classList.remove('active');
        document.getElementById('app-view').classList.add('active');
    };
    document.getElementById('btn-launch-app').addEventListener('click', launchApp);
    document.querySelector('.get-started-btn').addEventListener('click', launchApp);
    document.querySelector('.launch-demo-btn').addEventListener('click', launchApp);

    // Landing nav smooth scroll
    document.querySelectorAll('.landing-header nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Chat Inputs
    const messageInput = document.getElementById('message-input');
    const btnSend = document.getElementById('btn-send');

    messageInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        btnSend.disabled = this.value.trim() === '';
    });

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    btnSend.addEventListener('click', handleSendMessage);

    // Sidebar
    document.getElementById('btn-new-chat').addEventListener('click', () => {
        const newChat = createNewChat();
        loadChat(newChat.id);
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
        if(confirm("Are you sure you want to clear this conversation?")) {
            updateChat(currentChatId, { messages: [] });
            loadChat(currentChatId);
        }
    });

    document.getElementById('btn-export').addEventListener('click', () => {
        const chat = getChatById(currentChatId);
        exportChatAsText(chat);
    });

    // Settings removed from UI


    // Theme Toggle
    document.getElementById('btn-theme-toggle').addEventListener('click', () => {
        const currentTheme = getTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        saveTheme(newTheme);
        UI.setTheme(newTheme);
    });

    // Mobile Sidebar
    document.getElementById('btn-menu').addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('open');
    });
    document.getElementById('btn-close-sidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
    });

    // Search
    document.getElementById('search-chats').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const chats = getChats();
        const filtered = chats.filter(c => (c.title || '').toLowerCase().includes(query));
        UI.renderChatHistory(filtered, currentChatId, loadChat, handleDeleteChat);
    });

    // Voice Input
    const btnVoice = document.getElementById('btn-voice');
    btnVoice.addEventListener('click', () => {
        if (speechService.isRecording) {
            speechService.stopRecording();
            btnVoice.classList.remove('active');
        } else {
            messageInput.placeholder = "Listening...";
            btnVoice.classList.add('active');
            
            speechService.startRecording(
                (final, interim) => {
                    messageInput.value = final || interim;
                },
                () => {
                    btnVoice.classList.remove('active');
                    messageInput.placeholder = "Message Infinty.ai...";
                    if (messageInput.value.trim()) {
                        btnSend.disabled = false;
                        // Optional: Auto-send after voice input stops
                        // handleSendMessage();
                    }
                },
                (error) => {
                    console.error(error);
                    btnVoice.classList.remove('active');
                    messageInput.placeholder = "Message Infinty.ai...";
                }
            );
        }
    });
}
