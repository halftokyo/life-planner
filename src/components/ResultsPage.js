/**
 * Results Page Component
 * Displays simulation results with PDF export option
 */
import { createProfileSummary } from './ProfileSummary.js';
import { createEventsTable } from './EventsTable.js';
import { createChartsContainer, updateCharts } from './Charts.js';
import { generateProjection } from '../engine/calculator.js';
import { exportToPDF } from '../utils/pdfExport.js';

export function createResultsPage(setup, events, onBack) {
    const page = document.createElement('div');
    page.className = 'results-page fade-in';
    page.id = 'results-page-content';

    // Header with actions
    const header = document.createElement('div');
    header.className = 'results-header';
    header.innerHTML = `
    <div class="results-title">
      <button class="btn-back" id="back-btn">← 戻る</button>
      <h1>📊 シミュレーション結果</h1>
    </div>
    <div class="results-actions">
      <button class="btn-primary" id="export-pdf-btn">
        <span>📄</span> PDFで出力
      </button>
    </div>
  `;
    page.appendChild(header);

    // Content wrapper for PDF export
    const content = document.createElement('div');
    content.className = 'results-content';
    content.id = 'results-exportable';

    // PDF Header (only visible in PDF)
    const pdfHeader = document.createElement('div');
    pdfHeader.className = 'pdf-only-header';
    pdfHeader.innerHTML = `
    <h1>家庭生活規画 - シミュレーション結果</h1>
    <p>作成日: ${new Date().toLocaleDateString('ja-JP')}</p>
  `;
    content.appendChild(pdfHeader);

    // Profile Summary
    content.appendChild(createProfileSummary(setup));

    // Events Table
    content.appendChild(createEventsTable(events));

    // Charts
    const chartsContainer = document.createElement('div');
    chartsContainer.id = 'results-charts';
    chartsContainer.appendChild(createChartsContainer());
    content.appendChild(chartsContainer);

    page.appendChild(content);

    // Event Listeners
    setTimeout(() => {
        // Back button
        document.getElementById('back-btn')?.addEventListener('click', () => {
            if (onBack) onBack();
        });

        // PDF Export
        document.getElementById('export-pdf-btn')?.addEventListener('click', async () => {
            await exportToPDF('results-exportable', `life-planner-${Date.now()}.pdf`);
        });

        // Render charts
        const projection = generateProjection(setup, events);
        updateCharts(projection, setup);
    }, 100);

    return page;
}
