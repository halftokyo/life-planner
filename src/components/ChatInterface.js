/**
 * Chat component implementation
 */
import { ChatEngine } from '../engine/chatLogic.js';

export function createChatInterface(updateSetupCallback, onCompleteCallback) {
    const container = document.createElement('div');
    container.className = 'chat-container';

    // Chat History Area
    const messagesArea = document.createElement('div');
    messagesArea.className = 'chat-messages';
    container.appendChild(messagesArea);

    // Input Area
    const inputArea = document.createElement('div');
    inputArea.className = 'chat-input-area';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'chat-input';
    input.placeholder = 'ここに入力...';
    // Allow Japanese IME composition
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.isComposing) {
            sendMsg();
        }
    });

    const sendBtn = document.createElement('button');
    sendBtn.className = 'chat-send-btn';
    sendBtn.innerHTML = '↑';
    sendBtn.addEventListener('click', sendMsg);

    inputArea.appendChild(input);
    inputArea.appendChild(sendBtn);
    container.appendChild(inputArea);

    // Engine initialization
    const engine = new ChatEngine(updateSetupCallback, () => {
        // Disable input on finish
        input.disabled = true;
        sendBtn.disabled = true;
        input.placeholder = '完了しました';
        if (onCompleteCallback) onCompleteCallback();
    });

    engine.onMessageUpdate = (history) => {
        renderMessages(messagesArea, history);
        scrollToBottom(messagesArea);
    };

    // Start chat
    setTimeout(() => engine.start(), 500);

    function sendMsg() {
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        engine.handleInput(text);
    }

    return container;
}

function renderMessages(container, history) {
    container.innerHTML = '';
    history.forEach(msg => {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${msg.type}`;
        bubble.textContent = msg.text;
        container.appendChild(bubble);
    });
}

function scrollToBottom(el) {
    el.scrollTop = el.scrollHeight;
}
