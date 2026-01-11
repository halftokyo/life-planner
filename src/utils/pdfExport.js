/**
 * PDF Export Utility
 * Uses html2canvas and jsPDF
 */
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportToPDF(elementId, filename = 'life-planner-results.pdf') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('Element not found:', elementId);
        return;
    }

    // Show loading state
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'pdf-loading-overlay';
    loadingOverlay.innerHTML = '<div class="pdf-loading-spinner"></div><p>PDFを生成中...</p>';
    document.body.appendChild(loadingOverlay);

    try {
        // Capture element as canvas
        const canvas = await html2canvas(element, {
            scale: 2, // Higher quality
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
        });

        // Calculate PDF dimensions (A4)
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        const pdf = new jsPDF('p', 'mm', 'a4');
        let heightLeft = imgHeight;
        let position = 0;

        // Add first page
        pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add additional pages if needed
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(canvas, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Save
        pdf.save(filename);
    } catch (error) {
        console.error('PDF generation failed:', error);
        alert('PDF生成に失敗しました。');
    } finally {
        loadingOverlay.remove();
    }
}
