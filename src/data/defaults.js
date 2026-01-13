// 默认家庭基本设定
export const defaultSetup = {
    // 基本设置
    Start_Year: 2025,
    Years: 50,
    Initial_Asset: 100000000,
    Invest_Return: 0.05,
    Inflation: 0.02,

    // 家庭成员信息 - 本人 (Person 1)
    Person1_Birth_Year: 1981,
    Person1_Salary_Start: 12000000,
    Person1_Retire_Age: 65,
    Person1_Pension_Start_Age: 65,
    Person1_Pension_Income: 2000000,
    Person1_Medical_Start_Age: 70,
    Person1_Medical_Annual: -960000,

    // 家庭成员信息 - 配偶 (Person 2)
    Person2_Birth_Year: 1986,
    Person2_Salary_Start: 9000000,
    Person2_Retire_Age: 65,
    Person2_Pension_Start_Age: 65,
    Person2_Pension_Income: 2000000,
    Person2_Medical_Start_Age: 70,
    Person2_Medical_Annual: -960000,

    // 其他孩子信息
    Child1_Birth_Year: 2019,

    // 住房支出
    Housing_Annual_Pre: -3600000,
    Housing_Annual_Post: 0,

    // 生活支出
    Living_Annual_Pre: -4440000,
    Living_Annual_Post: -3600000,
    Travel_Annual: -960000,

    // 税率
    Income_Tax_Rate: 0.30,
    Pension_Tax_Rate: 0.15,
    Events_Tax_Rate: 0.30,
};

// 设置项的元数据（用于生成表单）
export const setupFields = [
    {
        group: '基本設定', fields: [
            { key: 'Start_Year', label: '起始年份', type: 'number', unit: '年' },
            { key: 'Years', label: '予測年数', type: 'number', unit: '年' },
            { key: 'Initial_Asset', label: '起始純資産', type: 'currency' },
            { key: 'Invest_Return', label: '投資年回報率', type: 'percent' },
            { key: 'Inflation', label: '年通貨膨張率', type: 'percent' },
        ]
    },
    {
        group: '家族情報 - 本人', fields: [
            { key: 'Person1_Birth_Year', label: '生年', type: 'number', unit: '年' },
            { key: 'Person1_Salary_Start', label: '年収', type: 'currency' },
            { key: 'Person1_Retire_Age', label: '退職年齢', type: 'number', unit: '歳' },
            { key: 'Person1_Pension_Start_Age', label: '年金開始年齢', type: 'number', unit: '歳' },
            { key: 'Person1_Pension_Income', label: '年金収入（年間）', type: 'currency' },
            { key: 'Person1_Medical_Start_Age', label: '医療費開始年齢', type: 'number', unit: '歳' },
            { key: 'Person1_Medical_Annual', label: '年間医療費', type: 'currency' },
        ]
    },
    {
        group: '家族情報 - 配偶者', fields: [
            { key: 'Person2_Birth_Year', label: '生年', type: 'number', unit: '年' },
            { key: 'Person2_Salary_Start', label: '年収', type: 'currency' },
            { key: 'Person2_Retire_Age', label: '退職年齢', type: 'number', unit: '歳' },
            { key: 'Person2_Pension_Start_Age', label: '年金開始年齢', type: 'number', unit: '歳' },
            { key: 'Person2_Pension_Income', label: '年金収入（年間）', type: 'currency' },
            { key: 'Person2_Medical_Start_Age', label: '医療費開始年齢', type: 'number', unit: '歳' },
            { key: 'Person2_Medical_Annual', label: '年間医療費', type: 'currency' },
        ]
    },
    {
        group: '住居費', fields: [
            { key: 'Housing_Annual_Pre', label: '退職前（年間）', type: 'currency' },
            { key: 'Housing_Annual_Post', label: '退職後（年間）', type: 'currency' },
        ]
    },
    {
        group: '生活費', fields: [
            { key: 'Living_Annual_Pre', label: '退職前（年間）', type: 'currency' },
            { key: 'Living_Annual_Post', label: '退職後（年間）', type: 'currency' },
            { key: 'Travel_Annual', label: '旅行費（年間）', type: 'currency' },
        ]
    },
    {
        group: '税率', fields: [
            { key: 'Income_Tax_Rate', label: '給与所得税率', type: 'percent' },
            { key: 'Pension_Tax_Rate', label: '年金税率', type: 'percent' },
            { key: 'Events_Tax_Rate', label: 'イベント課税率', type: 'percent' },
        ]
    },
    {
        group: '家族情報 - 子供', fields: [
            { key: 'Child1_Birth_Year', label: '生年', type: 'number', unit: '年' },
        ]
    },
];
