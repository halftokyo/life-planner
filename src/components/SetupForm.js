import { setupFields } from '../data/defaults.js';
import { formatCurrency } from '../engine/calculator.js';

export function createSetupForm(state, onUpdate, onProfileSelect) {
    const card = document.createElement('div');
    card.className = 'form-card';

    // Header
    card.innerHTML = `
        <div class="form-card-header">
            <h2 class="form-card-title">基本設定</h2>
            <p class="form-card-subtitle">シミュレーションの前提条件を設定します</p>
        </div>

        <!-- Quick Profile Selection -->
        <div class="profile-strip-container" style="margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1px solid #f1f5f9;">
            <span class="section-label" style="margin-bottom: 12px; display: block;">クイックコース選択 (Quick Start)</span>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                <button class="role-btn" data-role="A">
                    <span class="role-id">Role A</span>
                    <span class="role-name">共働き・高収入</span>
                </button>
                <button class="role-btn" data-role="B">
                    <span class="role-id">Role B</span>
                    <span class="role-name">標準世帯</span>
                </button>
                <button class="role-btn" data-role="C">
                    <span class="role-id">Role C</span>
                    <span class="role-name">片働き・堅実</span>
                </button>
            </div>
        </div>

        <div class="setup-form"></div>
    `;

    // Add inline styles for the buttons if needed, or I can add to main.css
    // For now, let's use dataset and handle in main.jsx. 
    // I'll add the event listeners here.
    const btns = card.querySelectorAll('.role-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (onProfileSelect) onProfileSelect(btn.dataset.role);
        });
    });

    const form = card.querySelector('.setup-form');

    // Grouping logic (using defaults.js groups)
    setupFields.forEach(group => {
        const groupEl = document.createElement('div');
        groupEl.style.marginBottom = '48px';

        groupEl.innerHTML = `<span class="section-label">${group.group}</span>`;

        const grid = document.createElement('div');
        grid.className = 'form-row';

        group.fields.forEach(field => {
            const block = document.createElement('div');
            block.className = 'input-block';

            const label = document.createElement('label');
            label.className = 'input-label';
            label.textContent = field.label;

            const input = document.createElement('input');
            input.type = field.type === 'currency' ? 'text' : field.type;
            input.className = 'input-field-clean';
            input.value = state.setup[field.key];

            // Sync logic
            input.addEventListener('change', () => {
                let val = input.value;
                if (field.type === 'number' || field.type === 'currency' || field.type === 'percent') {
                    val = parseFloat(val.replace(/[^0-9.-]/g, '')) || 0;
                }
                onUpdate(field.key, val);
            });

            block.appendChild(label);
            block.appendChild(input);
            grid.appendChild(block);
        });

        groupEl.appendChild(grid);
        form.appendChild(groupEl);
    });

    // Add Submit/Recalculate Button at bottom
    const footer = document.createElement('div');
    footer.style.marginTop = '40px';
    footer.innerHTML = `
        <button class="btn-submit-form">設定を更新して再試算</button>
    `;
    footer.querySelector('button').addEventListener('click', () => {
        // Trigger results tab explicitly if needed
        const resultsTab = document.querySelector('[data-tab="results"]');
        if (resultsTab) resultsTab.click();
    });
    form.appendChild(footer);

    return card;
}
