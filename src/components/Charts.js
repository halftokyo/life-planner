import { Chart, registerables } from 'chart.js';
import { formatCurrency } from '../engine/calculator.js';

// 注册 Chart.js 组件
Chart.register(...registerables);

// 存储图表实例
let assetChart = null;
let cashFlowChart = null;
let elderlyChart = null;

/**
 * 创建图表容器
 */
export function createChartsContainer() {
    const container = document.createElement('div');
    container.className = 'charts-container';

    container.innerHTML = `
    <div class="chart-section">
      <h3 class="chart-title">
        <span class="chart-icon">💰</span>
        純資産推移（50年間）
      </h3>
      <div class="chart-wrapper">
        <canvas id="asset-chart"></canvas>
      </div>
    </div>

    <div class="chart-section">
      <h3 class="chart-title">
        <span class="chart-icon">📊</span>
        年間収支推移
      </h3>
      <div class="chart-wrapper">
        <canvas id="cashflow-chart"></canvas>
      </div>
    </div>

    <div class="chart-section">
      <h3 class="chart-title">
        <span class="chart-icon">🏥</span>
        高齢期（80-90歳）の支出分析
      </h3>
      <div class="chart-wrapper chart-wrapper-small">
        <canvas id="elderly-chart"></canvas>
      </div>
      <div id="elderly-summary" class="chart-summary"></div>
    </div>

    <div class="chart-section">
      <h3 class="chart-title">
        <span class="chart-icon">📋</span>
        詳細データ
      </h3>
      <div id="data-table" class="data-table-container"></div>
    </div>
  `;

    return container;
}

/**
 * 更新所有图表
 */
export function updateCharts(projection, setup) {
    updateAssetChart(projection);
    updateCashFlowChart(projection);
    updateElderlyChart(projection, setup);
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
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 0,
                pointHoverRadius: 6,
                borderWidth: 3,
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
                            borderWidth: 2,
                            borderDash: [5, 5],
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
                        maxTicksLimit: 10,
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                    },
                    ticks: {
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
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: 'rgb(34, 197, 94)',
                    borderWidth: 1,
                },
                {
                    label: '支出（万円）',
                    data: expenses,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
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
                        maxTicksLimit: 10,
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                    },
                    ticks: {
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
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                },
                {
                    label: '生活費',
                    data: livingExpense,
                    backgroundColor: 'rgba(168, 85, 247, 0.7)',
                },
                {
                    label: '旅行費',
                    data: travelExpense,
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                },
                {
                    label: '医療費',
                    data: medicalExpense,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
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
                    }
                },
                y: {
                    stacked: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                    },
                    ticks: {
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
