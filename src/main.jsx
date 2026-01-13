import { defaultSetup } from './data/defaults.js';
import { defaultEvents } from './data/events.js';
import { generateProjection } from './engine/calculator.js';
import { createSetupForm } from './components/SetupForm.js';
import { createEventsForm, updateEventsList } from './components/EventsForm.js';
import { createChartsContainer, updateCharts } from './components/Charts.js';
import { createChatInterface } from './components/ChatInterface.js';
import { createProfileSummary } from './components/ProfileSummary.js';
import { createEventsTable } from './components/EventsTable.js';
import { createResultsPage } from './components/ResultsPage.js';
import { createProfileSelector } from './components/ProfileSelector.js';

// Application State
let state = {
    setup: { ...defaultSetup },
    events: [...defaultEvents],
};

// Load from LocalStorage
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

// Save to LocalStorage
function saveState() {
    try {
        localStorage.setItem('life-planner-state', JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save state:', e);
    }
}

// Initialize Application
function init() {
    loadState();

    // Determine initial view
    const saved = localStorage.getItem('life-planner-state');
    if (!saved) {
        renderProfileSelector();
    } else {
        renderMainApp();
    }
}

function renderProfileSelector() {
    const mainContent = document.querySelector('.main .container');
    mainContent.innerHTML = '';
    mainContent.appendChild(createProfileSelector((profileId) => {
        // Init state with profile logic is handled by ChatEngine (optional)
        renderMainApp(profileId);
    }));
}

// Render Main App Structure (Header + Persistent Tabs)
function renderMainApp(preSelectedProfileId = null) {
    const mainContent = document.querySelector('.main .container');
    mainContent.innerHTML = '';

    const appContainer = document.createElement('div');
    appContainer.className = 'app-container';

    // Header (Sticky, Minimalist)
    appContainer.innerHTML = `
        <header class="app-header">
            <div class="header-left">
                <div class="brand">
                    <div class="brand-icon">
                        <span class="material-symbols-outlined" style="font-size: 16px;">account_balance</span>
                    </div>
                    <span class="brand-text">FAMILY ASSETS</span>
                </div>
                <nav class="nav-tabs">
                    <div class="nav-tab active" data-tab="input">
                        入力 <span>(Input)</span>
                    </div>
                    <div class="nav-tab" data-tab="results">
                        資産 <span>(Assets)</span>
                    </div>
                </nav>
            </div>
            <div class="header-right">
                <span class="material-symbols-outlined" style="color: #94a3b8; font-size: 20px; cursor: pointer; margin-right: 16px;">notifications</span>
                <div style="width: 32px; height: 32px; background: #f3f4f6; border-radius: 50%;"></div>
            </div>
        </header>
        <div id="tab-content" style="flex: 1; overflow: hidden; display: flex; flex-direction: column;"></div>
    `;

    mainContent.appendChild(appContainer);
    const contentArea = appContainer.querySelector('#tab-content');

    // Tab Switching Logic
    let currentTab = 'input';
    const renderContent = () => {
        contentArea.innerHTML = '';
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === currentTab));

        if (currentTab === 'input') {
            renderInputTab(contentArea, preSelectedProfileId);
        } else {
            renderResultsTab(contentArea);
        }
    };

    appContainer.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            currentTab = tab.dataset.tab;
            renderContent();
        });
    });

    // Initial Render
    renderContent();

    // App-level Reset logic can be triggered from console or a hidden menu
}

// --- Tab: Input ---
function renderInputTab(container, preSelectedProfileId) {
    const layout = document.createElement('div');
    layout.className = 'input-layout';

    // Left Sidebar: AI Chat
    const chatSidebar = document.createElement('div');
    chatSidebar.className = 'chat-sidebar';

    // Right Content: Setup Form
    const formContent = document.createElement('div');
    formContent.className = 'form-content';

    layout.appendChild(chatSidebar);
    layout.appendChild(formContent);
    container.appendChild(layout);

    // AI Chat logic state
    let chatHandle = null;

    // Refresh Form Helper
    const updateForm = () => {
        formContent.innerHTML = '';
        const formCard = createSetupForm(
            state,
            (key, val) => {
                state.setup[key] = val;
                saveState();
            },
            (profileId) => {
                console.log('Profile Selected:', profileId);
                if (chatHandle && chatHandle.engine) {
                    console.log('Applying via Engine...');
                    chatHandle.engine.applyProfile(profileId);
                } else {
                    console.error('ChatHandle or Engine not found!', chatHandle);
                }
            }
        );
        formContent.appendChild(formCard);
    };
    updateForm();

    // Init Chat Sidebar
    console.log('Initializing Chat Interface...');
    chatHandle = createChatInterface(
        (key, value) => {
            // Apply updates from AI
            if (key === '__APPLY_PROFILE_EVENTS__') {
                state.events = [...value];
            } else {
                state.setup[key] = value;
            }
            saveState();
            updateForm();
        },
        () => {
            // On AI Completion -> Go to results
            const resultsTabBtn = document.querySelector('[data-tab="results"]');
            if (resultsTabBtn) resultsTabBtn.click();
        },
        preSelectedProfileId,
        { sidebarMode: true }
    );
    chatSidebar.appendChild(chatHandle.container);
}

// --- Tab: Assets (Results) ---
function renderResultsTab(container) {
    // We pass state directly to ResultsPage component
    const resultsPage = createResultsPage(state.setup, state.events, () => {
        // Back callback - not used in tab mode as we have persistent tabs
    });
    container.appendChild(resultsPage);

    // ResultsPage internally handles chart rendering via refreshCharts()
}

// Helper: Global Refresh (can be called from components)
export function refreshCharts() {
    const projection = generateProjection(state.setup, state.events);
    updateCharts(projection, state.setup);
}

// Reset Link (Helper)
function initResetButton() {
    // Can be used to clear state if needed
}

// Start Application
document.addEventListener('DOMContentLoaded', init);
