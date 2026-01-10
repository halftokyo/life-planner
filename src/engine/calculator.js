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

    // 退休前工资收入
    if (year < setup.Retire_Year) {
        income += setup.Person1_Salary_Start || 0;
        income += setup.Person2_Salary_Start || 0;
    }

    // 养老金收入（达到领取年龄后）
    const person1Age = year - setup.Person1_Birth_Year;
    const person2Age = year - setup.Person2_Birth_Year;

    if (person1Age >= setup.Pension_Start_Age) {
        income += setup.Pension_Income;
    }
    if (person2Age >= setup.Pension_Start_Age) {
        income += setup.Pension_Income;
    }

    // 正向生活事件（遗产继承、卖房、副业等）
    for (const event of events) {
        if (event.amount > 0 && year >= event.year && year < event.year + event.duration) {
            income += event.amount;
        }
    }

    return income;
}

/**
 * 计算某年的总支出（返回负数表示支出）
 * @param {number} year - 年份
 * @param {object} setup - 家庭基本设置
 * @param {array} events - 生活事件列表
 * @returns {number} 总支出（负数）
 */
export function calculateExpense(year, setup, events) {
    let expense = 0;

    // 住房和生活支出
    if (year < setup.Retire_Year) {
        expense += setup.Housing_Annual_Pre + setup.Living_Annual_Pre;
    } else {
        expense += setup.Housing_Annual_Post + setup.Living_Annual_Post;
    }

    // 旅游支出
    expense += setup.Travel_Annual;

    // 医疗支出（70岁后）
    const person1Age = year - setup.Person1_Birth_Year;
    const person2Age = year - setup.Person2_Birth_Year;

    if (person1Age >= setup.Medical_Start_Age) {
        expense += setup.Medical_Annual;
    }
    if (person2Age >= setup.Medical_Start_Age) {
        expense += setup.Medical_Annual;
    }

    // 负向生活事件（教育、购房等）
    for (const event of events) {
        if (event.amount < 0 && year >= event.year && year < event.year + event.duration) {
            expense += event.amount;
        }
    }

    return expense;
}

/**
 * 计算某年的税金支出（返回负数）
 * @param {number} year - 年份
 * @param {object} setup - 家庭基本设置
 * @param {array} events - 生活事件列表
 * @returns {number} 税金（负数）
 */
export function calculateTax(year, setup, events) {
    let tax = 0;

    // 工资所得税
    if (year < setup.Retire_Year) {
        const salaryIncome = (setup.Person1_Salary_Start || 0) + (setup.Person2_Salary_Start || 0);
        tax -= salaryIncome * setup.Income_Tax_Rate;
    }

    // 养老金税
    const person1Age = year - setup.Person1_Birth_Year;
    const person2Age = year - setup.Person2_Birth_Year;
    let pensionIncome = 0;

    if (person1Age >= setup.Pension_Start_Age) {
        pensionIncome += setup.Pension_Income;
    }
    if (person2Age >= setup.Pension_Start_Age) {
        pensionIncome += setup.Pension_Income;
    }
    tax -= pensionIncome * setup.Pension_Tax_Rate;

    // 正向事件课税
    for (const event of events) {
        if (event.amount > 0 && year >= event.year && year < event.year + event.duration) {
            tax -= event.amount * setup.Events_Tax_Rate;
        }
    }

    return tax;
}

/**
 * 计算某年的净现金流
 * @param {number} year - 年份
 * @param {object} setup - 家庭基本设置
 * @param {array} events - 生活事件列表
 * @returns {number} 净现金流
 */
export function calculateNetCashFlow(year, setup, events) {
    const income = calculateIncome(year, setup, events);
    const expense = calculateExpense(year, setup, events);
    const tax = calculateTax(year, setup, events);

    return income + expense + tax;
}

/**
 * 生成完整的50年预测数据
 * @param {object} setup - 家庭基本设置
 * @param {array} events - 生活事件列表
 * @returns {array} 每年的财务数据
 */
export function generateProjection(setup, events) {
    const projection = [];
    let currentAsset = setup.Initial_Asset;
    const realReturnRate = (1 + setup.Invest_Return) / (1 + setup.Inflation);

    for (let i = 0; i < setup.Years; i++) {
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
