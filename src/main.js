import { defaultSetup } from './data/defaults.js';
import { defaultEvents } from './data/events.js';
import { generateProjection } from './engine/calculator.js';
import { createSetupForm, updateFormattedValues } from './components/SetupForm.js';
import { createEventsForm, updateEventsList } from './components/EventsForm.js';
import { createChartsContainer, updateCharts } from './components/Charts.js';
import { createChatInterface } from './components/ChatInterface.js';
import { createProfileSummary } from './components/ProfileSummary.js';
import { createEventsTable } from './components/EventsTable.js';
import { createResultsPage } from './components/ResultsPage.js';

// 应用状态
let state = {
    setup: { ...defaultSetup },
    events: [...defaultEvents],
};

// 从 LocalStorage 加载
function loadState() {
    try {
        const saved = localStorage.getItem('life-planner-state');
        if (saved) {
            const parsed = JSON.parse(saved);
            state.setup = { ...defaultSetup, ...parsed.setup };
            state.events = parsed.events || [...defaultEvents];
        }
    } catch (e) {
        console.warn('Failed to load saved state:', e);
    }
}

// 保存到 LocalStorage
function saveState() {
    try {
        localStorage.setItem('life-planner-state', JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save state:', e);
    }
}

import { createProfileSelector } from './components/ProfileSelector.js';

// Initialize Application
function init() {
    // Basic Layout Setup
    const mainContent = document.querySelector('.main .container');
    mainContent.innerHTML = ''; // Start clean

    // Listen for hash changes
    window.addEventListener('hashchange', handleRoute);

    // Initial Route
    handleRoute();

    // Add Reset Button Logic
    initResetButton();
}

function handleRoute() {
    const hash = window.location.hash;
    const mainContent = document.querySelector('.main .container');
    const saved = localStorage.getItem('life-planner-state');

    mainContent.innerHTML = ''; // Clear current view

    if (hash === '#results') {
        if (!saved) {
            window.location.hash = ''; // Redirect if no data
            return;
        }
        loadState();
        const resultsPage = createResultsPage(state.setup, state.events, () => {
            location.reload(); // Or hash=''
        });
        mainContent.appendChild(resultsPage);
        window.scrollTo(0, 0);
        return;
    }

    // Default / Chat View
    const layout = document.createElement('div');
    layout.className = 'app-layout';
    layout.id = 'app-layout';

    const chatPanel = document.createElement('div');
    chatPanel.className = 'panel-chat';
    chatPanel.id = 'chat-panel';

    layout.appendChild(chatPanel);
    mainContent.appendChild(layout);

    if (saved) {
        loadState();
        initChat(chatPanel);
    } else {
        // Show Profile Selector for new users
        mainContent.innerHTML = '';
        mainContent.appendChild(createProfileSelector((profileId) => {
            mainContent.innerHTML = '';
            mainContent.appendChild(layout);
            initChat(chatPanel, profileId);
        }));
    }
}

function initChat(container, preSelectedProfileId = null) {
    const chatUI = createChatInterface(
        (key, value) => {
            if (key === '__APPLY_PROFILE_EVENTS__') {
                state.events = [...value];
            } else {
                state.setup[key] = value;
            }
            saveState();
        },
        () => {
            showViewResultsButton(container);
        },
        preSelectedProfileId
    );
    container.appendChild(chatUI);
}

// Show "View Results" button after chat completion
function showViewResultsButton(container) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'view-results-container fade-in';
    buttonContainer.innerHTML = `
        <p class="completion-message">✅ 情報収集が完了しました！</p>
        <button class="btn-primary btn-large btn-pulse" id="view-results-btn">
            📊 シミュレーション結果を見る
        </button>
    `;
    container.appendChild(buttonContainer);

    document.getElementById('view-results-btn').addEventListener('click', () => {
        window.location.hash = 'results';
    });
}

function initDashboard(container) {
    // Create Dashboard Structure
    container.innerHTML = `
    <div class="dashboard-header">
      <h2>シミュレーション結果</h2>
      <div class="dashboard-controls">
         <button class="btn-sm" id="edit-events-btn">イベント編集</button>
      </div>
    </div>
    <div id="profile-summary-entry"></div>
    <div id="events-table-entry"></div>
    <div id="charts-entry"></div>
    <div id="events-modal" class="modal hidden"></div>
  `;

    // Profile Summary
    const summaryContainer = container.querySelector('#profile-summary-entry');
    summaryContainer.appendChild(createProfileSummary(state.setup));

    // Events Table
    const eventsTableContainer = container.querySelector('#events-table-entry');
    eventsTableContainer.appendChild(createEventsTable(state.events));

    const chartsContainer = container.querySelector('#charts-entry');
    const charts = createChartsContainer();
    chartsContainer.appendChild(charts);

    refreshCharts();

    // Initialize Events Modal (Hidden by default, shown on button click)
    const eventsModal = container.querySelector('#events-modal');
    const eventsForm = createEventsForm(
        state.events,
        (event) => { state.events.push(event); saveState(); updateEventsAndCharts(); },
        (idx) => { state.events.splice(idx, 1); saveState(); updateEventsAndCharts(); },
        (idx, event) => { state.events[idx] = event; saveState(); updateEventsAndCharts(); }
    );

    eventsModal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <h2>ライフイベント設定</h2>
      <div id="events-form-wrapper"></div>
    </div>
  `;
    eventsModal.querySelector('#events-form-wrapper').appendChild(eventsForm);

    // Modal Logic
    document.getElementById('edit-events-btn').addEventListener('click', () => {
        eventsModal.classList.remove('hidden');
    });
    eventsModal.querySelector('.close-modal').addEventListener('click', () => {
        eventsModal.classList.add('hidden');
    });
}

function updateEventsAndCharts() {
    const wrapper = document.getElementById('events-form-wrapper');
    if (wrapper) {
        // Re-render events list is tricky with current EventsForm implementation 
        // which appends to its container. 
        // Ideally EventsForm should allow refreshing list.
        // For now, let's just refresh charts.
        updateEventsList(state.events, handleRemoveEvent, handleUpdateEvent);
    }
    refreshCharts();
}
// Helper to bridge old EventForm logic
function handleRemoveEvent(index) {
    state.events.splice(index, 1);
    saveState();
    updateEventsAndCharts();
}
function handleUpdateEvent(index, event) {
    state.events[index] = event;
    saveState();
    updateEventsAndCharts();
}

// 刷新图表
function refreshCharts() {
    const projection = generateProjection(state.setup, state.events);
    updateCharts(projection, state.setup);
}

// 重置按钮
function initResetButton() {
    // 在 header 添加重置按钮
    const header = document.querySelector('.header .container');
    if (header) {
        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn btn-reset';
        resetBtn.innerHTML = '🔄 リセット';
        resetBtn.addEventListener('click', () => {
            if (confirm('すべてのデータをデフォルトに戻しますか？')) {
                localStorage.removeItem('life-planner-state');
                location.reload();
            }
        });
        header.appendChild(resetBtn);
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', init);
