import { formatCurrency } from '../engine/calculator.js';

export function createEventsTable(events) {
    const container = document.createElement('div');
    container.className = 'notion-callout events-summary';

    // Icon
    const icon = document.createElement('div');
    icon.className = 'notion-callout-icon';
    icon.textContent = '📅';
    container.appendChild(icon);

    // Content
    const content = document.createElement('div');
    content.className = 'notion-callout-content';

    const title = document.createElement('h3');
    title.className = 'summary-title';
    title.textContent = 'ライフイベント (Life Events)';
    content.appendChild(title);

    if (!events || events.length === 0) {
        const emptyMsg = document.createElement('p');
        emptyMsg.className = 'empty-message';
        emptyMsg.textContent = 'まだイベントが登録されていません。';
        content.appendChild(emptyMsg);
    } else {
        // Sort events by year
        const sortedEvents = [...events].sort((a, b) => a.year - b.year);

        const table = document.createElement('table');
        table.className = 'events-table';
        table.innerHTML = `
      <thead>
        <tr>
          <th>年</th>
          <th>金額</th>
          <th>期間</th>
          <th>内容</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

        const tbody = table.querySelector('tbody');
        sortedEvents.forEach(event => {
            const row = document.createElement('tr');
            row.className = event.amount < 0 ? 'expense-row' : 'income-row';

            const amountFormatted = formatCurrency(event.amount);
            const durationText = event.duration > 1 ? `${event.duration}年間` : '1回';

            row.innerHTML = `
        <td class="event-year">${event.year}</td>
        <td class="event-amount ${event.amount < 0 ? 'negative' : 'positive'}">${amountFormatted}</td>
        <td class="event-duration">${durationText}</td>
        <td class="event-note">${event.note || '-'}</td>
      `;
            tbody.appendChild(row);
        });

        content.appendChild(table);
    }

    container.appendChild(content);
    return container;
}
