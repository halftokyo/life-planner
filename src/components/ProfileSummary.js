import { setupFields } from '../data/defaults.js';
import { formatCurrency } from '../engine/calculator.js';

export function createProfileSummary(setup) {
    const container = document.createElement('div');
    container.className = 'notion-callout profile-summary';

    // Icon
    const icon = document.createElement('div');
    icon.className = 'notion-callout-icon';
    icon.textContent = '';
    container.appendChild(icon);

    // Content
    const content = document.createElement('div');
    content.className = 'notion-callout-content';

    const title = document.createElement('h3');
    title.className = 'summary-title';
    title.textContent = '基本情報 (Profile)';
    content.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'summary-grid-props';

    // Define keys we want to show
    const keysToShow = [
        'Person1_Birth_Year', 'Person1_Salary_Start',
        'Person2_Birth_Year', 'Person2_Salary_Start',
        'Child1_Birth_Year',
        'Initial_Asset',
        'Housing_Annual_Pre', 'Living_Annual_Pre'
    ];

    keysToShow.forEach(key => {
        const val = setup[key];
        if (val === null || val === undefined || val === '') return;

        // Find label
        const fieldDef = setupFields.find(f => f.key === key);
        const label = fieldDef ? fieldDef.label : key;

        // Format value
        let displayVal = val;
        if (key.includes('Salary') || key.includes('Asset') || key.includes('Annual')) {
            displayVal = formatCurrency(Math.abs(val)); // Ensure positive for display
            if (key.includes('Annual')) displayVal += '/年';
        } else if (key.includes('Year')) {
            displayVal = val + '年';
        }

        const row = document.createElement('div');
        row.className = 'prop-row';

        const labelSpan = document.createElement('span');
        labelSpan.className = 'prop-label';
        labelSpan.textContent = label;

        const valueSpan = document.createElement('span');
        valueSpan.className = 'prop-value';
        valueSpan.textContent = displayVal;

        row.appendChild(labelSpan);
        row.appendChild(valueSpan);
        grid.appendChild(row);
    });

    content.appendChild(grid);
    container.appendChild(content);

    return container;
}
