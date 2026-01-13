import { formatCurrency } from '../engine/calculator.js';

export function createProjectionTable(projection) {
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    table.innerHTML = `
        <thead>
            <tr>
                <th>年</th>
                <th>年齢 (世帯主)</th>
                <th>資産残高</th>
                <th>収入</th>
                <th>支出</th>
                <th>収支</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    projection.forEach(d => {
        const row = document.createElement('tr');

        // Colors for cash flow
        const cashFlowClass = d.netCashFlow >= 0 ? 'text-green-600' : 'text-red-500';
        const assetClass = d.asset < 0 ? 'text-red-600 font-bold' : '';

        row.innerHTML = `
            <td>${d.year}</td>
            <td>${d.person1Age}歳</td>
            <td class="${assetClass}">${formatCurrency(d.asset)}</td>
            <td>${formatCurrency(d.income)}</td>
            <td>${formatCurrency(d.expense)}</td>
            <td class="${cashFlowClass}">${formatCurrency(d.netCashFlow)}</td>
        `;
        tbody.appendChild(row);
    });

    return table;
}
