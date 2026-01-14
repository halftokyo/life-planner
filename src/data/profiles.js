export const PROFILES = {
    A: {
        name: "Role A (共働き・高収入)",
        description: "世帯年収1300万円、私立教育、都心生活",
        setup: {
            Initial_Asset: 2000000,
            Invest_Return: 0.05,
            Inflation: 0.02,

            Person1_Birth_Year: 1985,
            Person1_Salary_Start: 7500000,
            Person1_Retire_Age: 65,
            Person1_Pension_Start_Age: 65,
            Person1_Pension_Income: 2000000,
            Person1_Medical_Start_Age: 70,
            Person1_Medical_Annual: 840000,

            Person2_Birth_Year: 1987,
            Person2_Salary_Start: 5500000,
            Person2_Retire_Age: 65,
            Person2_Pension_Start_Age: 65,
            Person2_Pension_Income: 2000000,
            Person2_Medical_Start_Age: 70,
            Person2_Medical_Annual: 840000,

            Person2_Medical_Start_Age: 70,
            Person2_Medical_Annual: 840000,

            Child1_Birth_Year: 2021,

            Housing_Annual_Pre: 600000,
            Housing_Annual_Post: 480000,
            Living_Annual_Pre: 4200000,
            Living_Annual_Post: 3600000,
            Travel_Annual: 1000000,

            Income_Tax_Rate: 0.25,
            Pension_Tax_Rate: 0.15,
            Events_Tax_Rate: 0.30,
        },
        events: [
            { year: 2025, amount: -2400000, duration: 28, note: '住宅ローン' },
            { year: 2029, amount: -600000, duration: 2, note: 'Child1 小学補習' },
            { year: 2031, amount: -800000, duration: 3, note: 'Child1 中学補習' },
            { year: 2034, amount: -1000000, duration: 3, note: 'Child1 高校補習' },
            { year: 2038, amount: -1000000, duration: 1, note: '大学入学時納税' },
            { year: 2038, amount: -1477339, duration: 1, note: 'Child1 私立大学(初年度)' },
            { year: 2039, amount: -1124476, duration: 3, note: 'Child1 私立大学(以降)' },

            { year: 2032, amount: -600000, duration: 2, note: 'Child2 小学補習' },
            { year: 2034, amount: -800000, duration: 3, note: 'Child2 中学補習' },
            { year: 2037, amount: -1200000, duration: 3, note: 'Child2 高校補習' },
            { year: 2041, amount: -817800, duration: 1, note: 'Child2 国立大学(初年度)' },
            { year: 2042, amount: -535800, duration: 3, note: 'Child2 国立大学(以降)' },

            { year: 2047, amount: -2000000, duration: 1, note: '大額支出納税' },
            { year: 2047, amount: -3000000, duration: 1, note: 'Child1 結婚支援' },
            { year: 2050, amount: -3000000, duration: 1, note: 'Child2 結婚支援' },
            { year: 2052, amount: -5000000, duration: 1, note: '世界一周旅行' },

            { year: 2067, amount: -3000000, duration: 8, note: 'P1 介護費用' },
            { year: 2069, amount: -3000000, duration: 6, note: 'P2 介護費用' },

            { year: 2027, amount: 3000000, duration: 13, note: 'P1 中年昇給' },
            { year: 2029, amount: 2000000, duration: 11, note: 'P2 中年昇給' },
            { year: 2042, amount: -1000000, duration: 10, note: 'P1 役職定年減収' },
            { year: 2044, amount: -800000, duration: 8, note: 'P2 役職定年減収' },

            { year: 2050, amount: -2000000, duration: 1, note: '修繕納税' },
            { year: 2050, amount: -10000000, duration: 1, note: '大規模修繕1' },
            { year: 2070, amount: -10000000, duration: 1, note: '大規模修繕2' },
        ]
    },

    B: {
        name: "Role B (標準世帯)",
        description: "世帯年収800万円、国立・私立混合、標準的生活",
        setup: {
            Initial_Asset: 2000000,
            Invest_Return: 0.03,
            Inflation: 0.02,

            Person1_Birth_Year: 1985,
            Person1_Salary_Start: 5000000,
            Person1_Retire_Age: 65,
            Person1_Pension_Start_Age: 65,
            Person1_Pension_Income: 1200000,
            Person1_Medical_Start_Age: 70,
            Person1_Medical_Annual: 1000000,

            Person2_Birth_Year: 1987,
            Person2_Salary_Start: 3000000,
            Person2_Retire_Age: 65,
            Person2_Pension_Start_Age: 65,
            Person2_Pension_Income: 1200000,
            Person2_Medical_Start_Age: 70,
            Person2_Medical_Annual: 1000000,

            Child1_Birth_Year: 2021,

            Housing_Annual_Pre: 600000,
            Housing_Annual_Post: 480000,
            Living_Annual_Pre: 4500000,
            Living_Annual_Post: 3600000,
            Travel_Annual: 600000,

            Income_Tax_Rate: 0.2,
            Pension_Tax_Rate: 0.1,
            Events_Tax_Rate: 0.2,
        },
        events: [
            { year: 2025, amount: -1800000, duration: 30, note: '住宅ローン' },

            { year: 2030, amount: -400000, duration: 3, note: 'Child1 中学補習' },
            { year: 2033, amount: -600000, duration: 3, note: 'Child1 高校補習' },
            { year: 2036, amount: -817800, duration: 1, note: 'Child1 国立大学(初年度)' },
            { year: 2037, amount: -535800, duration: 3, note: 'Child1 国立大学(以降)' },

            { year: 2034, amount: -400000, duration: 3, note: 'Child2 中学補習' },
            { year: 2037, amount: -600000, duration: 3, note: 'Child2 高校補習' },
            { year: 2040, amount: -1200000, duration: 1, note: 'Child2 私立大学(初年度)' },
            { year: 2041, amount: -1000000, duration: 3, note: 'Child2 私立大学(以降)' },

            { year: 2045, amount: -2000000, duration: 1, note: 'Child1 結婚支援' },
            { year: 2048, amount: -2000000, duration: 1, note: 'Child2 結婚支援' },

            { year: 2042, amount: -2000000, duration: 10, note: 'P1 役職定年減収' },
            { year: 2044, amount: -800000, duration: 8, note: 'P2 役職定年減収' },

            { year: 2050, amount: -5000000, duration: 1, note: '大规模修缮' },

            { year: 2070, amount: -2000000, duration: 8, note: 'P1 护理' },
            { year: 2072, amount: -2000000, duration: 6, note: 'P2 护理' },
        ]
    },

    C: {
        name: "Role C (片働き・堅実)",
        description: "世帯年収750万円、公立中心、堅実な生活",
        setup: {
            Initial_Asset: 3000000,
            Invest_Return: 0.03,
            Inflation: 0.02,

            Person1_Birth_Year: 1985,
            Person1_Salary_Start: 6000000,
            Person1_Retire_Age: 65,
            Person1_Pension_Start_Age: 65,
            Person1_Pension_Income: 1100000,
            Person1_Medical_Start_Age: 70,
            Person1_Medical_Annual: 900000,

            Person2_Birth_Year: 1987,
            Person2_Salary_Start: 1500000,
            Person2_Retire_Age: 65,
            Person2_Pension_Start_Age: 65,
            Person2_Pension_Income: 1100000,
            Person2_Medical_Start_Age: 70,
            Person2_Medical_Annual: 900000,

            Child1_Birth_Year: 2021,

            Housing_Annual_Pre: 600000,
            Housing_Annual_Post: 480000,
            Living_Annual_Pre: 4000000,
            Living_Annual_Post: 3000000,
            Travel_Annual: 200000,

            Income_Tax_Rate: 0.2,
            Pension_Tax_Rate: 0.1,
            Events_Tax_Rate: 0.2,
        },
        events: [
            { year: 2025, amount: -1800000, duration: 30, note: '住宅ローン' },

            { year: 2030, amount: -400000, duration: 3, note: 'Child1 中学補習' },
            { year: 2033, amount: -600000, duration: 3, note: 'Child1 高校補習' },
            { year: 2036, amount: -1500000, duration: 1, note: 'Child1 私立大学(初年度)' },
            { year: 2037, amount: -1200000, duration: 3, note: 'Child1 私立大学(以降)' },

            { year: 2033, amount: -400000, duration: 3, note: 'Child2 中学補習' },
            { year: 2036, amount: -600000, duration: 3, note: 'Child2 高校補習' },
            { year: 2039, amount: -817800, duration: 1, note: 'Child2 公立大学(初年度)' },
            { year: 2040, amount: -535800, duration: 3, note: 'Child2 公立大学(以降)' },

            { year: 2045, amount: -1000000, duration: 1, note: 'Child1 結婚支援' },
            { year: 2048, amount: -1000000, duration: 1, note: 'Child2 結婚支援' },

            { year: 2042, amount: -1500000, duration: 10, note: 'P1 役職定年減収' },
            { year: 2044, amount: -500000, duration: 8, note: 'P2 役職定年減収' },

            { year: 2050, amount: -5000000, duration: 1, note: '大规模修缮' },

            { year: 2070, amount: -2500000, duration: 8, note: 'P1 护理' },
            { year: 2072, amount: -2500000, duration: 6, note: 'P2 护理' },
        ]
    }
};

