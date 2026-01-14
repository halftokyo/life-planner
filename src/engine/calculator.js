/**
 * 家庭财务计算引擎
 * 基于用户提供的Excel公式进行实现
 */

/**
 * 计算某年的总收入
 * @param {number} year - 年份
 * @param {object} setup - 家庭基本设置
 * @param {array} events - 生活事件列表
 * @returns {number} 总收入（正数）
 */
export function calculateIncome(year, setup, events) {
    let income = 0;

    // 退休前工资收入 (Decoupled)
    const p1RetireYear = setup.Person1_Birth_Year + setup.Person1_Retire_Age;
    const p2RetireYear = setup.Person2_Birth_Year + setup.Person2_Retire_Age;

    if (year < p1RetireYear) {
        income += setup.Person1_Salary_Start || 0;
    }
    if (year < p2RetireYear) {
        income += setup.Person2_Salary_Start || 0;
    }

    // 养老金收入 (Decoupled)
    const person1Age = year - setup.Person1_Birth_Year;
    const person2Age = year - setup.Person2_Birth_Year;

    if (person1Age >= setup.Person1_Pension_Start_Age) {
        income += setup.Person1_Pension_Income || 0;
    }
    if (person2Age >= setup.Person2_Pension_Start_Age) {
        income += setup.Person2_Pension_Income || 0;
    }

    // 正向生活事件
    for (const event of events) {
        if (event.amount > 0 && year >= event.year && year < event.year + event.duration) {
            income += event.amount;
        }
    }

    return income;
}

export function calculateExpense(year, setup, events) {
    let expense = 0;

    // 住房和生活支出 (Based on oldest person's retirement status? Or average? 
    // HeHe: Excel used global Retire_Year. Let's use P1's retirement as primary for household transition)
    const p1RetireYear = setup.Person1_Birth_Year + setup.Person1_Retire_Age;

    if (year < p1RetireYear) {
        expense += (setup.Housing_Annual_Pre || 0) + (setup.Living_Annual_Pre || 0);
    } else {
        expense += (setup.Housing_Annual_Post || 0) + (setup.Living_Annual_Post || 0);
    }

    // 旅游支出
    expense += setup.Travel_Annual || 0;

    // 医疗支出 (Decoupled)
    const person1Age = year - setup.Person1_Birth_Year;
    const person2Age = year - setup.Person2_Birth_Year;

    if (person1Age >= setup.Person1_Medical_Start_Age) {
        expense += setup.Person1_Medical_Annual || 0;
    }
    if (person2Age >= setup.Person2_Medical_Start_Age) {
        expense += setup.Person2_Medical_Annual || 0;
    }

    // 负向生活事件 (Events are still stored as negative values, so we convert to positive expense)
    for (const event of events) {
        if (event.amount < 0 && year >= event.year && year < event.year + event.duration) {
            expense += Math.abs(event.amount);
        }
    }

    return expense;
}

export function calculateTax(year, setup, events) {
    let tax = 0;

    const p1RetireYear = setup.Person1_Birth_Year + setup.Person1_Retire_Age;
    const p2RetireYear = setup.Person2_Birth_Year + setup.Person2_Retire_Age;

    // 工资所得税 (Individual)
    if (year < p1RetireYear) {
        tax -= (setup.Person1_Salary_Start || 0) * setup.Income_Tax_Rate;
    }
    if (year < p2RetireYear) {
        tax -= (setup.Person2_Salary_Start || 0) * setup.Income_Tax_Rate;
    }

    // 养老金税 (Individual)
    const person1Age = year - setup.Person1_Birth_Year;
    const person2Age = year - setup.Person2_Birth_Year;

    if (person1Age >= setup.Person1_Pension_Start_Age) {
        tax -= (setup.Person1_Pension_Income || 0) * (setup.Pension_Tax_Rate || 0);
    }
    if (person2Age >= setup.Person2_Pension_Start_Age) {
        tax -= (setup.Person2_Pension_Income || 0) * (setup.Pension_Tax_Rate || 0);
    }

    // 正向事件课税
    for (const event of events) {
        if (event.amount > 0 && year >= event.year && year < event.year + event.duration) {
            tax -= event.amount * setup.Events_Tax_Rate;
        }
    }

    return tax;
}

export function calculateNetCashFlow(year, setup, events) {
    const income = calculateIncome(year, setup, events);
    const expense = calculateExpense(year, setup, events);
    const tax = calculateTax(year, setup, events);

    // Income is (+), Expense is (+ magnitude), Tax is (-)
    return income - expense + tax;
}

/**
 * Ensure simulation covers up to age 90 for the youngest spouse
 * @param {object} setup
 * @returns {number} Adjusted years
 */
export function calculateProjectionYears(setup) {
    const currentYear = new Date().getFullYear();
    const startYear = setup.Start_Year || currentYear;

    // Calculate ages in start year
    const p1Age = startYear - setup.Person1_Birth_Year;
    const p2Age = startYear - setup.Person2_Birth_Year;

    const youngestAge = Math.min(p1Age, p2Age);
    const yearsTo90 = 90 - youngestAge;

    // Ensure at least 50 years or up to 90, whichever is longer, allowing user override if larger
    const minYears = Math.max(50, yearsTo90);

    // If setup.Years is manually set higher, keep it, otherwise ensure coverage
    return Math.max(setup.Years || 0, minYears);
}

/**
 * 生成完整的预测数据 (Auto-extends to age 90)
 * @param {object} setup - 家庭基本设置
 * @param {array} events - 生活事件列表
 * @returns {array} 每年的财务数据
 */
export function generateProjection(setup, events) {
    const projection = [];
    let currentAsset = setup.Initial_Asset;
    const realReturnRate = (1 + setup.Invest_Return) / (1 + setup.Inflation);

    const totalYears = calculateProjectionYears(setup);

    for (let i = 0; i < totalYears; i++) {
        const year = setup.Start_Year + i;
        const income = calculateIncome(year, setup, events);
        const expense = calculateExpense(year, setup, events);
        const tax = calculateTax(year, setup, events);
        const netCashFlow = income + expense + tax;

        // 资产增长：考虑投资回报和通胀
        currentAsset = currentAsset * realReturnRate + netCashFlow;

        const person1Age = year - setup.Person1_Birth_Year;
        const person2Age = year - setup.Person2_Birth_Year;
        const childAge = year - setup.Child1_Birth_Year;

        projection.push({
            year,
            person1Age,
            person2Age,
            childAge,
            income,
            expense,
            tax,
            netCashFlow,
            asset: currentAsset,
        });
    }

    return projection;
}

/**
 * 格式化日元货币
 * @param {number} value - 金额
 * @returns {string} 格式化后的字符串
 */
export function formatCurrency(value) {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absValue >= 100000000) {
        return sign + '¥' + (absValue / 100000000).toFixed(2) + '億';
    } else if (absValue >= 10000) {
        return sign + '¥' + (absValue / 10000).toFixed(0) + '万';
    } else {
        return sign + '¥' + absValue.toLocaleString('ja-JP');
    }
}

/**
 * 格式化百分比
 * @param {number} value - 小数形式的百分比
 * @returns {string} 格式化后的字符串
 */
export function formatPercent(value) {
    return (value * 100).toFixed(1) + '%';
}
