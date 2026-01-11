/**
 * Chat component implementation (ChatGPT Style)
 */
import { ChatEngine } from '../engine/chatLogic.js';

export function createChatInterface(updateSetupCallback, onCompleteCallback, preSelectedProfileId = null) {
    const container = document.createElement('div');
    container.className = 'chat-gpt-container';

    // Header (Unified Style)
    const header = document.createElement('div');
    header.className = 'app-header-shared'; // Use shared class
    header.innerHTML = `
        <h2 class="app-header-title">ライフプラン・シミュレーション</h2>
        <div></div> <!-- Spacer for flex balance -->
    `;
    container.appendChild(header);

    // Chat History Area (Scrollable)
    const messagesWrapper = document.createElement('div');
    messagesWrapper.className = 'chat-messages-scroll';
    const messagesContent = document.createElement('div');
    messagesContent.className = 'chat-messages-content';
    messagesWrapper.appendChild(messagesContent);
    container.appendChild(messagesWrapper);

    // Input Area (Fixed Bottom)
    const inputContainer = document.createElement('div');
    inputContainer.className = 'chat-input-container';

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'chat-input-wrapper';

    const input = document.createElement('textarea'); // Use textarea for multiline
    input.className = 'chat-input-textarea';
    input.placeholder = 'ここにメッセージを入力...';
    input.rows = 1;

    // Auto-resize textarea
    input.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value === '') this.style.height = 'auto';
    });

    const sendBtn = document.createElement('button');
    sendBtn.className = 'chat-send-btn-icon';
    sendBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
    `;
    sendBtn.disabled = true; // Initially disabled until input

    // Events
    input.addEventListener('input', () => {
        sendBtn.disabled = input.value.trim().length === 0;
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
            e.preventDefault();
            sendMsg();
        }
    });

    sendBtn.addEventListener('click', sendMsg);

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(sendBtn);
    inputContainer.appendChild(inputWrapper);

    const helperText = document.createElement('div');
    helperText.className = 'chat-helper-text';
    helperText.textContent = 'Shift + Enter で改行できます';
    inputContainer.appendChild(helperText);

    container.appendChild(inputContainer);

    // Engine initialization
    const engine = new ChatEngine(updateSetupCallback, () => {
        // Disable input on finish
        input.disabled = true;
        sendBtn.disabled = true;
        input.placeholder = 'シミュレーション作成中...';
        if (onCompleteCallback) onCompleteCallback();
    });

    engine.onMessageUpdate = (history) => {
        renderMessages(messagesContent, history);
        // Scroll to bottom
        messagesWrapper.scrollTo({ top: messagesWrapper.scrollHeight, behavior: 'smooth' });
    };

    // Start chat (pass profile ID)
    setTimeout(() => engine.start(preSelectedProfileId), 500);

    function sendMsg() {
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        input.style.height = 'auto'; // Reset height
        sendBtn.disabled = true;

        engine.handleInput(text);
    }

    return container;
}

function renderMessages(container, history) {
    container.innerHTML = '';
    history.forEach(msg => {
        const row = document.createElement('div');
        row.className = `message-row ${msg.type}`;

        // Avatar
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = msg.type === 'bot' ? 'AI' : 'U';

        // Content
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerText = msg.text; // innerText handles newlines

        row.appendChild(avatar);
        row.appendChild(content);
        container.appendChild(row);
    });
}
