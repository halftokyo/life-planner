import { Chart, registerables } from 'chart.js';
import { formatCurrency } from '../engine/calculator.js';

Chart.register(...registerables);

const COLORS = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    neutral: '#94a3b8',
    bg: '#f8fafc',
    grid: '#f1f5f9'
};

let assetChart = null;
let cashFlowChart = null;
let breakdownChart = null;

export function createChartsContainer() {
    const grid = document.createElement('div');
    grid.className = 'charts-grid';

    // 1. Asset Growth (Large)
    const assetCard = createCard('資産残高の推移', 'Growth', 'assetChart', 'col-8');

    // 2. Breakdown (Small)
    const breakdownCard = createCard('支出内訳', 'Allocation', 'breakdownChart', 'col-4');

    // 3. Cashflow (Full Width)
    const cashFlowCard = createCard('収支バランス', 'Cash Flow', 'cashFlowChart', 'col-12');

    grid.appendChild(assetCard);
    grid.appendChild(breakdownCard);
    grid.appendChild(cashFlowCard);

    return grid;
}

function createCard(title, subtitle, canvasId, colClass) {
    const card = document.createElement('div');
    card.className = `card ${colClass}`;
    card.innerHTML = `
        <h3 class="card-title">${title} <span>${subtitle}</span></h3>
        <div class="chart-container" style="position: relative; height: 320px;">
            <canvas id="${canvasId}"></canvas>
        </div>
    `;
    return card;
}

export function updateCharts(projection, setup) {
    updateNetAssetChart(projection);
    updateCashFlowChart(projection);
    updateExpenseBreakdownChart(projection, setup);
    updateDataTable(projection);
}

function updateNetAssetChart(projection) {
    const ctx = document.getElementById('assetChart')?.getContext('2d');
    if (!ctx) return;

    if (assetChart) assetChart.destroy();

    assetChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: projection.map(d => d.year),
            datasets: [{
                label: '金融資産残高',
                data: projection.map(d => d.endAssets),
                borderColor: COLORS.primary,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    grid: { color: COLORS.grid },
                    ticks: { callback: val => formatCurrency(val) }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

function updateCashFlowChart(projection) {
    const ctx = document.getElementById('cashFlowChart')?.getContext('2d');
    if (!ctx) return;

    if (cashFlowChart) cashFlowChart.destroy();

    cashFlowChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: projection.map(d => d.year),
            datasets: [
                {
                    label: '収入',
                    data: projection.map(d => d.totalIncome),
                    backgroundColor: COLORS.primary,
                    borderRadius: 4
                },
                {
                    label: '支出',
                    data: projection.map(d => d.totalExpense),
                    backgroundColor: COLORS.neutral,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top', align: 'end' } },
            scales: {
                y: { stacked: false, grid: { color: COLORS.grid } },
                x: { stacked: false, grid: { display: false } }
            }
        }
    });
}

function updateExpenseBreakdownChart(projection, setup) {
    const ctx = document.getElementById('breakdownChart')?.getContext('2d');
    if (!ctx) return;

    if (breakdownChart) breakdownChart.destroy();

    // Mock breakdown based on setup for demonstration
    const data = [
        Math.abs(setup.Housing_Annual_Pre || 0),
        Math.abs(setup.Living_Annual_Pre || 0),
        Math.abs(setup.Travel_Annual || 0),
        Math.abs(setup.Medical_Annual || 0)
    ];

    breakdownChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['住居', '生活', '旅行', '医療'],
            datasets: [{
                data: data,
                backgroundColor: [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.neutral],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function updateDataTable(projection) {
    const wrapper = document.getElementById('data-table-wrapper');
    if (!wrapper) return;

    wrapper.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>年度</th>
                    <th>年齢 (本人/配偶者)</th>
                    <th>収入合計</th>
                    <th>支出合計</th>
                    <th>収支差</th>
                    <th>資産残高</th>
                </tr>
            </thead>
            <tbody>
                ${projection.map(d => `
                    <tr>
                        <td>${d.year}年</td>
                        <td>${d.age1}歳 / ${d.age2}歳</td>
                        <td>${formatCurrency(d.totalIncome)}</td>
                        <td>${formatCurrency(d.totalExpense)}</td>
                        <td style="color: ${d.cashFlow >= 0 ? '#10b981' : '#ef4444'}">
                            ${formatCurrency(d.cashFlow)}
                        </td>
                        <td style="font-weight: 700">${formatCurrency(d.endAssets)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}
