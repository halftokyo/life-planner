/**
 * Chat component implementation (ChatGPT Style)
 */
import { ChatEngine } from '../engine/chatLogic.js';

export function createChatInterface(updateSetupCallback, onCompleteCallback, preSelectedProfileId = null) {
    // ... (Container setup remains same)

    // ... (Engine initialization)
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
