import { formatCurrency } from '../engine/calculator.js';
import { createChartsContainer, updateCharts } from './Charts.js';
import { createProjectionTable } from './ProjectionTable.js';
import { generateProjection } from '../engine/calculator.js';

export function createResultsPage(setup, events, onBack) {
    const container = document.createElement('div');
    container.className = 'assets-layout';

    // Safe calculations for KPIs (fallback to 0)
    const initialAsset = (setup.Initial_Asset || 0) * 10000;
    const totalIncome = ((setup.Person1_Salary_Start || 0) + (setup.Person2_Salary_Start || 0)) * 10000;
    const totalExpense = Math.abs((setup.Living_Annual_Pre || 0) + (setup.Housing_Annual_Pre || 0)) * 10000;

    container.innerHTML = `
        <div class="dashboard-container">
            <!-- Header -->
            <div class="dashboard-header">
                <div>
                    <h1 class="dashboard-title">資産概況 <span>Overview</span></h1>
                    <p style="color: #64748b; font-size: 0.875rem; margin-top: 4px;">ポートフォリオの最新状況と推移を確認できます。</p>
                </div>
            </div>

            <!-- KPI Row -->
            <div class="kpi-row">
                <div class="kpi-card">
                    <p class="kpi-label">純資産総額 <span>Net Worth</span></p>
                    <h2 class="kpi-value">${formatCurrency(initialAsset)}</h2>
                    <p style="margin-top:16px; font-size:0.75rem; color:#94a3b8;">初期資産残高</p>
                </div>
                
                <div class="kpi-card">
                    <p class="kpi-label">推定年収 <span>Income</span></p>
                    <h2 class="kpi-value">${formatCurrency(totalIncome)}</h2>
                    <p style="margin-top:16px; font-size:0.75rem; color:#94a3b8;">世帯合算（額面）</p>
                </div>

                <div class="kpi-card">
                    <p class="kpi-label">年間支出 <span>Expenses</span></p>
                    <h2 class="kpi-value">${formatCurrency(totalExpense)}</h2>
                    <p style="margin-top:16px; font-size:0.75rem; color:#94a3b8;">基本生活費 + 住居費</p>
                </div>
            </div>

            <!-- Charts Grid -->
            <div id="charts-main-container"></div>

            <!-- Table Section -->
            <div class="table-section">
                <div class="table-header">
                    <h3>詳細データ推移 <span>Projections</span></h3>
                </div>
                <div id="data-table-wrapper" class="table-wrapper"></div>
            </div>
        </div>
    `;

    // Initialize Charts
    const chartsWrapper = container.querySelector('#charts-main-container');
    chartsWrapper.appendChild(createChartsContainer());

    // Refresh Data
    setTimeout(() => {
        const projection = generateProjection(setup, events);
        updateCharts(projection, setup);

        // Render Table
        const tableWrapper = container.querySelector('#data-table-wrapper');
        const table = createProjectionTable(projection);
        tableWrapper.innerHTML = ''; // clear loading state if any
        tableWrapper.appendChild(table);
    }, 0);


    return container;
}
