import { setupFields } from '../data/defaults.js';
import { formatCurrency, formatPercent } from '../engine/calculator.js';

/**
 * 生成设置表单
 * @param {object} setup - 当前设置
 * @param {function} onChange - 值变化回调
 * @returns {HTMLElement} 表单元素
 */
export function createSetupForm(setup, onChange) {
    const container = document.createElement('div');
    container.className = 'setup-form';

    for (const group of setupFields) {
        const groupEl = document.createElement('div');
        groupEl.className = 'form-group';

        const groupTitle = document.createElement('h3');
        groupTitle.className = 'form-group-title';
        groupTitle.textContent = group.group;
        groupEl.appendChild(groupTitle);

        const fieldsContainer = document.createElement('div');
        fieldsContainer.className = 'form-fields';

        for (const field of group.fields) {
            const fieldEl = createField(field, setup[field.key], (value) => {
                onChange(field.key, value);
            });
            fieldsContainer.appendChild(fieldEl);
        }

        groupEl.appendChild(fieldsContainer);
        container.appendChild(groupEl);
    }

    return container;
}

/**
 * 创建单个表单字段
 */
function createField(field, value, onChange) {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-field';

    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = field.label;
    wrapper.appendChild(label);

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'input-wrapper';

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-input';
    input.id = `field-${field.key}`;

    // 根据类型设置值和步进
    if (field.type === 'percent') {
        input.value = (value * 100).toFixed(1);
        input.step = '0.1';
        input.addEventListener('input', (e) => {
            onChange(parseFloat(e.target.value) / 100);
        });
    } else if (field.type === 'currency') {
        input.value = value;
        input.step = '10000';
        input.addEventListener('input', (e) => {
            onChange(parseFloat(e.target.value) || 0);
        });
    } else {
        input.value = value;
        input.step = '1';
        input.addEventListener('input', (e) => {
            onChange(parseInt(e.target.value) || 0);
        });
    }

    inputWrapper.appendChild(input);

    // 添加单位标签
    if (field.unit || field.type === 'percent' || field.type === 'currency') {
        const unitLabel = document.createElement('span');
        unitLabel.className = 'input-unit';
        if (field.type === 'percent') {
            unitLabel.textContent = '%';
        } else if (field.type === 'currency') {
            unitLabel.textContent = '円';
        } else {
            unitLabel.textContent = field.unit;
        }
        inputWrapper.appendChild(unitLabel);
    }

    wrapper.appendChild(inputWrapper);

    // 显示当前值的格式化版本
    if (field.type === 'currency') {
        const formattedValue = document.createElement('div');
        formattedValue.className = 'formatted-value';
        formattedValue.textContent = formatCurrency(value);
        wrapper.appendChild(formattedValue);
    }

    return wrapper;
}

/**
 * 更新表单显示的格式化值
 */
export function updateFormattedValues(setup) {
    for (const group of setupFields) {
        for (const field of group.fields) {
            if (field.type === 'currency') {
                const wrapper = document.querySelector(`#field-${field.key}`)?.closest('.form-field');
                if (wrapper) {
                    const formatted = wrapper.querySelector('.formatted-value');
                    if (formatted) {
                        formatted.textContent = formatCurrency(setup[field.key]);
                    }
                }
            }
        }
    }
}
