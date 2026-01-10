import { defaultSetup } from './data/defaults.js';
import { defaultEvents } from './data/events.js';
import { generateProjection } from './engine/calculator.js';
import { createSetupForm, updateFormattedValues } from './components/SetupForm.js';
import { createEventsForm, updateEventsList } from './components/EventsForm.js';
import { createChartsContainer, updateCharts } from './components/Charts.js';

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

// 初始化应用
function init() {
    loadState();

    // 初始化设置表单
    const setupContainer = document.getElementById('setup-form');
    if (setupContainer) {
        const form = createSetupForm(state.setup, (key, value) => {
            state.setup[key] = value;
            saveState();
            updateFormattedValues(state.setup);
            refreshCharts();
        });
        setupContainer.appendChild(form);
    }

    // 初始化事件表单
    const eventsContainer = document.getElementById('events-form');
    if (eventsContainer) {
        const form = createEventsForm(
            state.events,
            // 添加事件
            (event) => {
                state.events.push(event);
                saveState();
                updateEventsList(state.events, handleRemoveEvent, handleUpdateEvent);
                refreshCharts();
            },
            // 删除事件
            handleRemoveEvent,
            // 更新事件
            handleUpdateEvent
        );
        eventsContainer.appendChild(form);
    }

    // 初始化图表容器
    const chartsContainer = document.getElementById('charts-container');
    if (chartsContainer) {
        const charts = createChartsContainer();
        chartsContainer.appendChild(charts);
        refreshCharts();
    }

    // 初始化 Tab 切换
    initTabs();

    // 添加重置按钮功能
    initResetButton();
}

// 删除事件处理
function handleRemoveEvent(index) {
    state.events.splice(index, 1);
    saveState();
    updateEventsList(state.events, handleRemoveEvent, handleUpdateEvent);
    refreshCharts();
}

// 更新事件处理
function handleUpdateEvent(index, event) {
    state.events[index] = event;
    saveState();
    updateEventsList(state.events, handleRemoveEvent, handleUpdateEvent);
    refreshCharts();
}

// 刷新图表
function refreshCharts() {
    const projection = generateProjection(state.setup, state.events);
    updateCharts(projection, state.setup);
}

// Tab 切换
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.tab;

            // 切换 tab 激活状态
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // 切换 panel 显示
            panels.forEach(p => {
                p.classList.remove('active');
                if (p.id === targetId) {
                    p.classList.add('active');
                    // 切换到图表时刷新
                    if (targetId === 'charts') {
                        setTimeout(refreshCharts, 100);
                    }
                }
            });
        });
    });
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
