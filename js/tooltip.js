/**
 * tooltip.js
 * Shared tooltip singleton for all charts.
 */

const tooltipEl = document.createElement('div');
tooltipEl.id = 'tooltip';
Object.assign(tooltipEl.style, {
  position: 'absolute',
  pointerEvents: 'none',
  opacity: '0',
  background: '#FFFFFF',
  border: '1px solid #E0DEDA',
  borderRadius: '8px',
  padding: '12px',
  fontSize: '12px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  minWidth: '140px',
  transition: 'opacity 150ms ease',
  zIndex: '1000',
  lineHeight: '1.5',
  color: '#1A1A1A',
  fontFamily: "'Inter', sans-serif",
});
document.body.appendChild(tooltipEl);

export const tooltip = {
  /**
   * Show the tooltip near the mouse, keeping it within the viewport.
   * @param {string} htmlString - innerHTML content
   * @param {MouseEvent} event - the mouse event for positioning
   */
  show(htmlString, event) {
    if (htmlString != null) {
      tooltipEl.innerHTML = htmlString;
    }
    tooltipEl.style.opacity = '1';

    const pad = 12;
    let x = event.pageX + pad;
    let y = event.pageY + pad;

    // Measure after setting content
    const rect = tooltipEl.getBoundingClientRect();
    const viewW = window.innerWidth;
    const viewH = window.innerHeight;

    // Keep within right edge
    if (x + rect.width > viewW + window.scrollX) {
      x = event.pageX - rect.width - pad;
    }

    // Keep within bottom edge
    if (y + rect.height > viewH + window.scrollY) {
      y = event.pageY - rect.height - pad;
    }

    tooltipEl.style.left = x + 'px';
    tooltipEl.style.top = y + 'px';
  },

  /**
   * Hide the tooltip.
   */
  hide() {
    tooltipEl.style.opacity = '0';
  },
};
