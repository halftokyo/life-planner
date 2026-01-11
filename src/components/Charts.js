import { Chart, registerables } from 'chart.js';
import { formatCurrency } from '../engine/calculator.js';

// 注册 Chart.js 组件
Chart.register(...registerables);

const CHART_COLORS = {
    asset: 'rgba(139, 92, 246, 0.8)', // Purple
    income: 'rgba(16, 185, 129, 0.8)', // Green
    expense: 'rgba(239, 68, 68, 0.8)', // Red
    tax: 'rgba(245, 158, 11, 0.8)',    // Orange
    saving: 'rgba(59, 130, 246, 0.8)', // Blue

    // Breakdown pie colors
    housing: 'rgba(236, 72, 153, 0.8)', // Pink
    living: 'rgba(16, 185, 129, 0.8)',
    medical: 'rgba(245, 158, 11, 0.8)',
    travel: 'rgba(59, 130, 246, 0.8)',

    border: 'rgba(255, 255, 255, 1.0)',
    grid: 'rgba(0, 0, 0, 0.05)',
    text: '#6b7280'
};

const CHART_FONTS = {
    family: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    size: 13
};

// 存储图表实例
let assetChart = null;
let cashFlowChart = null;
let elderlyChart = null;

/**
 * 创建图表容器
 */
export function createChartsContainer() {
    const container = document.createElement('div');
    container.className = 'dashboard-grid'; // Use grid layout

    // Asset Chart
    const assetWrapper = createChartCard('金融資産推移', 'trending-up', 'assetChart');

    // Income/Expense Chart
    const balanceWrapper = createChartCard('収支バランス', 'bar-chart-2', 'balanceChart');

    // Breakdown Chart
    const breakdownWrapper = createChartCard('生涯支出の内訳', 'pie-chart', 'breakdownChart');

    container.appendChild(assetWrapper);
    container.appendChild(balanceWrapper);
    container.appendChild(breakdownWrapper);

    return container;
}

function createDataTableWrapper() {
    const section = document.createElement('div');
    section.className = 'chart-section';
    section.innerHTML = `
    <h3 class="chart-title">
      <span class="chart-icon">📋</span>
      詳細データ
    </h3>
    <div id="data-table" class="data-table-container"></div>
  `;
    return section;
}

/**
 * 更新所有图表
 */
export function updateCharts(projection, setup) {
    updateNetAssetChart(projection); // Renamed
    updateCashFlowChart(projection);
    updateExpenseBreakdownChart(projection); // New chart call
    updateElderlyExpenseChart(projection, setup); // Renamed
    updateDataTable(projection);
}

/**
 * 资产变化图表
 */
function updateAssetChart(projection) {
    const ctx = document.getElementById('asset-chart');
    if (!ctx) return;

    const labels = projection.map(p => p.year);
    const assets = projection.map(p => p.asset / 10000); // 万円単位

    if (assetChart) {
        assetChart.destroy();
    }

    // 找到资产变负的年份
    const negativeYearIndex = projection.findIndex(p => p.asset < 0);

    assetChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: '純資産（万円）',
                data: assets,
                borderColor: '#111827', // Dark gray/black
                backgroundColor: 'rgba(17, 24, 39, 0.05)',
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#111827',
                    bodyColor: '#111827',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false,
                    callbacks: {
                        label: (context) => {
                            return `純資産: ${formatCurrency(context.raw * 10000)}`;
                        }
                    }
                },
                annotation: negativeYearIndex > -1 ? {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: 0,
                            yMax: 0,
                            borderColor: 'rgba(239, 68, 68, 0.5)',
                            borderWidth: 1,
                            borderDash: [4, 4],
                        }
                    }
                } : undefined
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        maxTicksLimit: 8,
                        color: '#6b7280'
                    }
                },
                y: {
                    grid: {
                        color: '#f3f4f6',
                        drawBorder: false,
                    },
                    ticks: {
                        color: '#6b7280',
                        callback: (value) => formatCurrency(value * 10000),
                    }
                }
            }
        }
    });
}

/**
 * 收支对比图表
 */
function updateCashFlowChart(projection) {
    const ctx = document.getElementById('cashflow-chart');
    if (!ctx) return;

    const labels = projection.map(p => p.year);
    const incomes = projection.map(p => p.income / 10000);
    const expenses = projection.map(p => Math.abs(p.expense + p.tax) / 10000);

    if (cashFlowChart) {
        cashFlowChart.destroy();
    }

    cashFlowChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: '収入（万円）',
                    data: incomes,
                    backgroundColor: '#d1d5db', // Light gray
                    hoverBackgroundColor: '#9ca3af',
                    borderWidth: 0,
                },
                {
                    label: '支出（万円）',
                    data: expenses,
                    backgroundColor: '#111827', // Black
                    hoverBackgroundColor: '#374151',
                    borderWidth: 0,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        padding: 20,
                        color: '#4b5563'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#111827',
                    bodyColor: '#111827',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: (context) => {
                            return `${context.dataset.label}: ${formatCurrency(context.raw * 10000)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: '#6b7280',
                        maxTicksLimit: 8,
                    }
                },
                y: {
                    grid: {
                        color: '#f3f4f6',
                        drawBorder: false,
                    },
                    ticks: {
                        color: '#6b7280',
                        callback: (value) => `${(value / 100).toFixed(0)}億`,
                    }
                }
            }
        }
    });
}

/**
 * 80-90岁支出分析图表
 */
function updateElderlyChart(projection, setup) {
    const ctx = document.getElementById('elderly-chart');
    const summaryEl = document.getElementById('elderly-summary');
    if (!ctx || !summaryEl) return;

    // 过滤出Person1在80-90岁的年份数据
    const elderlyData = projection.filter(p => {
        const age = p.person1Age;
        return age >= 80 && age <= 90;
    });

    if (elderlyData.length === 0) {
        summaryEl.innerHTML = '<p class="no-data">該当するデータがありません</p>';
        return;
    }

    const labels = elderlyData.map(p => `${p.year}年 (${p.person1Age}歳)`);

    // 分解支出项目
    const housingExpense = elderlyData.map(p => Math.abs(setup.Housing_Annual_Post) / 10000);
    const livingExpense = elderlyData.map(p => Math.abs(setup.Living_Annual_Post) / 10000);
    const travelExpense = elderlyData.map(p => Math.abs(setup.Travel_Annual) / 10000);
    const medicalExpense = elderlyData.map(p => {
        let medical = 0;
        if (p.person1Age >= setup.Medical_Start_Age) {
            medical += Math.abs(setup.Medical_Annual);
        }
        if (p.person2Age >= setup.Medical_Start_Age) {
            medical += Math.abs(setup.Medical_Annual);
        }
        return medical / 10000;
    });

    if (elderlyChart) {
        elderlyChart.destroy();
    }

    elderlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: '住居費',
                    data: housingExpense,
                    backgroundColor: '#e5e7eb', // Gray 200
                },
                {
                    label: '生活費',
                    data: livingExpense,
                    backgroundColor: '#9ca3af', // Gray 400
                },
                {
                    label: '旅行費',
                    data: travelExpense,
                    backgroundColor: '#6b7280', // Gray 500
                },
                {
                    label: '医療費',
                    data: medicalExpense,
                    backgroundColor: '#1f2937', // Gray 800
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        color: '#4b5563'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#111827',
                    bodyColor: '#111827',
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: (context) => {
                            return `${context.dataset.label}: ${formatCurrency(context.raw * 10000)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        display: false,
                    },
                    ticks: {
                        color: '#6b7280'
                    }
                },
                y: {
                    stacked: true,
                    grid: {
                        color: '#f3f4f6',
                        drawBorder: false,
                    },
                    ticks: {
                        color: '#6b7280',
                        callback: (value) => `${value}万`,
                    }
                }
            }
        }
    });

    // 计算总结信息
    const totalExpense = elderlyData.reduce((sum, p) => sum + Math.abs(p.expense + p.tax), 0);
    const avgExpense = totalExpense / elderlyData.length;
    const finalAsset = elderlyData[elderlyData.length - 1]?.asset || 0;

    summaryEl.innerHTML = `
    <div class="summary-grid">
      <div class="summary-item">
        <span class="summary-label">80-90歳期間の総支出</span>
        <span class="summary-value expense">${formatCurrency(totalExpense)}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">年間平均支出</span>
        <span class="summary-value">${formatCurrency(avgExpense)}</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">90歳時点の純資産</span>
        <span class="summary-value ${finalAsset < 0 ? 'expense' : 'income'}">${formatCurrency(finalAsset)}</span>
      </div>
    </div>
  `;
}

/**
 * 数据表格
 */
function updateDataTable(projection) {
    const container = document.getElementById('data-table');
    if (!container) return;

    // 只显示部分年份（每5年）
    const filteredData = projection.filter((p, i) => i === 0 || i === projection.length - 1 || i % 5 === 0);

    let tableHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>年</th>
          <th>年齢</th>
          <th>収入</th>
          <th>支出</th>
          <th>純資産</th>
        </tr>
      </thead>
      <tbody>
  `;

    for (const p of filteredData) {
        const assetClass = p.asset < 0 ? 'negative' : '';
        tableHTML += `
      <tr>
        <td>${p.year}</td>
        <td>${p.person1Age}歳 / ${p.person2Age}歳</td>
        <td class="income">${formatCurrency(p.income)}</td>
        <td class="expense">${formatCurrency(p.expense + p.tax)}</td>
        <td class="${assetClass}">${formatCurrency(p.asset)}</td>
      </tr>
    `;
    }

    tableHTML += '</tbody></table>';
    container.innerHTML = tableHTML;
}
