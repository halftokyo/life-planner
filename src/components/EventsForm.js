import { formatCurrency } from '../engine/calculator.js';

/**
 * 创建事件表单
 * @param {array} events - 当前事件列表
 * @param {function} onAdd - 添加事件回调
 * @param {function} onRemove - 删除事件回调
 * @param {function} onUpdate - 更新事件回调
 * @returns {HTMLElement} 表单元素
 */
export function createEventsForm(events, onAdd, onRemove, onUpdate) {
  const container = document.createElement('div');
  container.className = 'events-form';

  // 添加新事件的表单
  const addForm = createAddEventForm(onAdd);
  container.appendChild(addForm);

  // 事件列表
  const listContainer = document.createElement('div');
  listContainer.className = 'events-list';
  listContainer.id = 'events-list';

  renderEventsList(listContainer, events, onRemove, onUpdate);
  container.appendChild(listContainer);

  return container;
}

/**
 * 创建添加事件的表单
 */
function createAddEventForm(onAdd) {
  const form = document.createElement('div');
  form.className = 'add-event-form';

  form.innerHTML = `
    <h3 class="form-group-title">新規イベント追加</h3>
    <div class="add-event-fields">
      <div class="form-field">
        <label class="form-label">年</label>
        <input type="number" id="new-event-year" class="form-input" value="2025" min="2025" max="2100">
      </div>
      <div class="form-field">
        <label class="form-label">金額（円）</label>
        <input type="number" id="new-event-amount" class="form-input" value="-1000000" step="100000">
        <div class="form-hint">支出はマイナス、収入はプラス</div>
      </div>
      <div class="form-field">
        <label class="form-label">期間（年）</label>
        <input type="number" id="new-event-duration" class="form-input" value="1" min="1" max="50">
      </div>
      <div class="form-field form-field-wide">
        <label class="form-label">備考</label>
        <input type="text" id="new-event-note" class="form-input" placeholder="イベントの説明">
      </div>
    </div>
    <button type="button" id="add-event-btn" class="btn btn-primary">
      <span class="btn-icon">+</span> イベント追加
    </button>
  `;

  // 添加按钮事件
  setTimeout(() => {
    const btn = form.querySelector('#add-event-btn');
    btn.addEventListener('click', () => {
      const year = parseInt(document.getElementById('new-event-year').value);
      const amount = parseFloat(document.getElementById('new-event-amount').value);
      const duration = parseInt(document.getElementById('new-event-duration').value);
      const note = document.getElementById('new-event-note').value;

      if (year && amount && duration) {
        onAdd({ year, amount, duration, note: note || '未指定' });
        // 重置表单
        document.getElementById('new-event-note').value = '';
      }
    });
  }, 0);

  return form;
}

/**
 * 渲染事件列表
 */
export function renderEventsList(container, events, onRemove, onUpdate) {
  // 按年份排序
  const sortedEvents = [...events].sort((a, b) => a.year - b.year);

  // 分类：支出和收入
  const expenses = sortedEvents.filter(e => e.amount < 0);
  const incomes = sortedEvents.filter(e => e.amount > 0);

  container.innerHTML = `
    <div class="events-section">
      <h3 class="events-section-title expense-title">
        支出イベント（${expenses.length}件）
      </h3>
      <div class="events-grid" id="expense-events"></div>
    </div>
    <div class="events-section">
      <h3 class="events-section-title income-title">
        収入イベント（${incomes.length}件）
      </h3>
      <div class="events-grid" id="income-events"></div>
    </div>
  `;

  const expenseGrid = container.querySelector('#expense-events');
  const incomeGrid = container.querySelector('#income-events');

  expenses.forEach((event, idx) => {
    const originalIdx = events.indexOf(event);
    expenseGrid.appendChild(createEventCard(event, originalIdx, onRemove, onUpdate, 'expense'));
  });

  incomes.forEach((event, idx) => {
    const originalIdx = events.indexOf(event);
    incomeGrid.appendChild(createEventCard(event, originalIdx, onRemove, onUpdate, 'income'));
  });
}

/**
 * 创建事件卡片
 */
function createEventCard(event, index, onRemove, onUpdate, type) {
  const card = document.createElement('div');
  card.className = `event-card ${type}`;
  card.dataset.index = index;

  const endYear = event.year + event.duration - 1;
  const yearRange = event.duration > 1 ? `${event.year} - ${endYear}` : `${event.year}`;
  const totalAmount = event.amount * event.duration;

  card.innerHTML = `
    <div class="event-header">
      <span class="event-year">${yearRange}</span>
      <button class="event-delete" data-index="${index}" title="削除">×</button>
    </div>
    <div class="event-note">${event.note}</div>
    <div class="event-amount ${type}">${formatCurrency(event.amount)}/年</div>
    ${event.duration > 1 ? `
      <div class="event-total">
        <span class="event-duration">${event.duration}年間</span>
        <span class="event-total-amount">合計 ${formatCurrency(totalAmount)}</span>
      </div>
    ` : ''}
  `;

  // 删除按钮事件
  setTimeout(() => {
    const deleteBtn = card.querySelector('.event-delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      onRemove(index);
    });
  }, 0);

  return card;
}

/**
 * 更新事件列表显示
 */
export function updateEventsList(events, onRemove, onUpdate) {
  const container = document.getElementById('events-list');
  if (container) {
    renderEventsList(container, events, onRemove, onUpdate);
  }
}
