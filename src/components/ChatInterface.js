import { ChatEngine } from '../engine/chatLogic.js';

export function createChatInterface(updateCallback, onComplete, preSelectedProfileId = null, options = {}) {
    const container = document.createElement('div');
    container.className = 'chat-gpt-container';
    // Note: CSS uses .chat-sidebar flex logic, but container internally manages messages.

    // Sidebar Header (New Design)
    if (options.sidebarMode) {
        const header = document.createElement('div');
        header.className = 'chat-sidebar-header';
        header.innerHTML = `
            <div class="ai-badge">
                <div class="ai-dot"></div>
                <span class="ai-text">AI Assistant</span>
            </div>
        `;
        container.appendChild(header);
    }

    // Messages Area
    const messagesArea = document.createElement('div');
    messagesArea.className = 'chat-history';
    container.appendChild(messagesArea);

    // Input Area
    const inputArea = document.createElement('div');
    inputArea.className = 'chat-input-area';
    inputArea.innerHTML = `
        <div class="chat-input-wrapper">
            <input type="text" class="chat-input" placeholder="メッセージを入力...">
            <button class="chat-send-btn">
                <span class="material-symbols-outlined">send</span>
            </button>
        </div>
    `;
    container.appendChild(inputArea);

    // Initial Helper
    const appendMessage = (role, text) => {
        const bubble = document.createElement('div');
        bubble.className = `bubble ${role === 'assistant' || role === 'bot' ? 'bubble-ai' : 'bubble-user'}`;

        // Handle multiline text
        const p = document.createElement('p');
        p.textContent = text;
        bubble.appendChild(p);

        if (role === 'assistant' || role === 'bot') {
            const sub = document.createElement('span');
            sub.className = 'bubble-sub';
            sub.textContent = 'AI-powered response';
            bubble.appendChild(sub);
        }

        messagesArea.appendChild(bubble);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    };

    // --- Chat Logic Integration ---
    const engine = new ChatEngine(updateCallback, onComplete);

    // Override engine's message adding to use our local appendMessage
    engine.onMessageUpdate = (history) => {
        messagesArea.innerHTML = ''; // Clear and re-render for consistency with engine history
        history.forEach(msg => appendMessage(msg.type, msg.text));
    };

    const input = inputArea.querySelector('.chat-input');
    const sendBtn = inputArea.querySelector('.chat-send-btn');

    const handleSend = async () => {
        const val = input.value.trim();
        if (!val || engine.isProcessing) return;

        input.value = '';
        await engine.handleInput(val);
    };

    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });
    sendBtn.addEventListener('click', handleSend);

    // Start Engine
    engine.start(preSelectedProfileId);

    return {
        container,
        engine
    };
}
