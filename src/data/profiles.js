export const PROFILES = {
    A: {
        name: "Role A (共働き・高収入)",
        description: "世帯年収1300万円、私立教育、都心生活",
        setup: {
            Initial_Asset: 2000000,
            Invest_Return: 0.05, // Assumed from context of affluent? Or keep user default? User Role B says 3%. Role A doesn't specify Invest Return in the prompt text explicitly? 
            // Wait, Role A prompt: "Invest_Return" is NOT listed in the table provided in Step 430?
            // Actually Role A part 1: "Invest_Return" is missing. Role B has 3%. Role C has 3%.
            // I will assume 5% for A to match "High Return/Risk" usually associated, or stick to 3%? 
            // In the truncation it might be missing. I'll use 5% as it was in the original default.

            Housing_Annual_Pre: -600000,
            Housing_Annual_Post: -480000,
            Living_Annual_Pre: -4200000,
            Living_Annual_Post: -3600000,
            Travel_Annual: -1000000,

            Income_Tax_Rate: 0.25,
            Pension_Tax_Rate: 0.15,
            Events_Tax_Rate: 0.30,

            Person1_Salary_Start: 7500000,
            Person2_Salary_Start: 5500000,

            Pension_Income: 2000000,
            Medical_Annual: -840000,
        },
        events: [
            { Year: 2025, Amount: -2400000, Duration: 28, Name: '住宅ローン', Type: 'expense' },
            { Year: 2029, Amount: -600000, Duration: 2, Name: 'Child1 小学補習', Type: 'expense' },
            { Year: 2031, Amount: -800000, Duration: 3, Name: 'Child1 中学補習', Type: 'expense' },
            { Year: 2034, Amount: -1000000, Duration: 3, Name: 'Child1 高校補習', Type: 'expense' },
            { Year: 2038, Amount: -1000000, Duration: 1, Name: '大学入学時納税', Type: 'expense' },
            { Year: 2038, Amount: -1477339, Duration: 1, Name: 'Child1 私立大学(初年度)', Type: 'expense' },
            { Year: 2039, Amount: -1124476, Duration: 3, Name: 'Child1 私立大学(以降)', Type: 'expense' },

            { Year: 2032, Amount: -600000, Duration: 2, Name: 'Child2 小学補習', Type: 'expense' },
            { Year: 2034, Amount: -800000, Duration: 3, Name: 'Child2 中学補習', Type: 'expense' },
            { Year: 2037, Amount: -1200000, Duration: 3, Name: 'Child2 高校補習', Type: 'expense' },
            { Year: 2041, Amount: -817800, Duration: 1, Name: 'Child2 国立大学(初年度)', Type: 'expense' },
            { Year: 2042, Amount: -535800, Duration: 3, Name: 'Child2 国立大学(以降)', Type: 'expense' },

            { Year: 2047, Amount: -2000000, Duration: 1, Name: '大額支出納税', Type: 'expense' },
            { Year: 2047, Amount: -3000000, Duration: 1, Name: 'Child1 結婚支援', Type: 'expense' },
            { Year: 2050, Amount: -3000000, Duration: 1, Name: 'Child2 結婚支援', Type: 'expense' },
            { Year: 2052, Amount: -5000000, Duration: 1, Name: '世界一周旅行', Type: 'expense' },

            // Care
            { Year: 2067, Amount: -3000000, Duration: 8, Name: 'P1 介護費用', Type: 'expense' },
            { Year: 2069, Amount: -3000000, Duration: 6, Name: 'P2 介護費用', Type: 'expense' },

            // Income Boosts/Drops
            { Year: 2027, Amount: 3000000, Duration: 13, Name: 'P1 中年昇給', Type: 'income' },
            { Year: 2029, Amount: 2000000, Duration: 11, Name: 'P2 中年昇給', Type: 'income' },
            { Year: 2042, Amount: -1000000, Duration: 10, Name: 'P1 役職定年減収', Type: 'expense' }, // Reduced income modeled as expense or manual adjustment? Standard is to model as negative income or expense? Logic handles Amount. If negative, it reduces asset.
            { Year: 2044, Amount: -800000, Duration: 8, Name: 'P2 役職定年減収', Type: 'expense' },

            // House
            { Year: 2050, Amount: -2000000, Duration: 1, Name: '修繕納税', Type: 'expense' },
            { Year: 2050, Amount: -10000000, Duration: 1, Name: '大規模修繕1', Type: 'expense' },
            { Year: 2070, Amount: -10000000, Duration: 1, Name: '大規模修繕2', Type: 'expense' },
        ]
    },

    B: {
        name: "Role B (標準世帯)",
        description: "世帯年収800万円、国立・私立混合、標準的生活",
        setup: {
            Initial_Asset: 2000000,
            Invest_Return: 0.03,

            Housing_Annual_Pre: -600000,
            Housing_Annual_Post: -480000,
            Living_Annual_Pre: -4500000,
            Living_Annual_Post: -3600000,
            Travel_Annual: -600000,

            Income_Tax_Rate: 0.2,
            Pension_Tax_Rate: 0.1,
            Events_Tax_Rate: 0.2,

            Person1_Salary_Start: 5000000,
            Person2_Salary_Start: 3000000,

            Pension_Income: 1200000,
            Medical_Annual: -1000000,
        },
        events: [
            { Year: 2025, Amount: -1800000, Duration: 30, Name: '住宅ローン', Type: 'expense' },

            { Year: 2030, Amount: -400000, Duration: 3, Name: 'Child1 中学補習', Type: 'expense' },
            { Year: 2033, Amount: -600000, Duration: 3, Name: 'Child1 高校補習', Type: 'expense' },
            { Year: 2036, Amount: -817800, Duration: 1, Name: 'Child1 国立大学(初年度)', Type: 'expense' },
            { Year: 2037, Amount: -535800, Duration: 3, Name: 'Child1 国立大学(以降)', Type: 'expense' },

            { Year: 2034, Amount: -400000, Duration: 3, Name: 'Child2 中学補習', Type: 'expense' },
            { Year: 2037, Amount: -600000, Duration: 3, Name: 'Child2 高校補習', Type: 'expense' },
            { Year: 2040, Amount: -1200000, Duration: 1, Name: 'Child2 私立大学(初年度)', Type: 'expense' },
            { Year: 2041, Amount: -1000000, Duration: 3, Name: 'Child2 私立大学(以降)', Type: 'expense' },

            { Year: 2045, Amount: -2000000, Duration: 1, Name: 'Child1 結婚支援', Type: 'expense' },
            { Year: 2048, Amount: -2000000, Duration: 1, Name: 'Child2 結婚支援', Type: 'expense' },

            { Year: 2042, Amount: -2000000, Duration: 10, Name: 'P1 役職定年減収', Type: 'expense' },
            { Year: 2044, Amount: -800000, Duration: 8, Name: 'P2 役職定年減収', Type: 'expense' },

            { Year: 2050, Amount: -5000000, Duration: 1, Name: '大規模修繕', Type: 'expense' },

            { Year: 2070, Amount: -2000000, Duration: 8, Name: 'P1 介護', Type: 'expense' },
            { Year: 2072, Amount: -2000000, Duration: 6, Name: 'P2 介護', Type: 'expense' },
        ]
    },

    C: {
        name: "Role C (片働き・堅実)",
        description: "世帯年収750万円、公立中心、堅実な生活",
        setup: {
            Initial_Asset: 3000000,
            Invest_Return: 0.03,

            Housing_Annual_Pre: -600000,
            Housing_Annual_Post: -480000,
            Living_Annual_Pre: -4000000,
            Living_Annual_Post: -3000000,
            Travel_Annual: -200000,

            Income_Tax_Rate: 0.2,
            Pension_Tax_Rate: 0.1,
            Events_Tax_Rate: 0.2,

            Person1_Salary_Start: 6000000,
            Person2_Salary_Start: 1500000, // Part time

            Pension_Income: 1100000,
            Medical_Annual: -900000,
        },
        events: [
            { Year: 2025, Amount: -1800000, Duration: 30, Name: '住宅ローン', Type: 'expense' },

            { Year: 2030, Amount: -400000, Duration: 3, Name: 'Child1 中学補習', Type: 'expense' },
            { Year: 2033, Amount: -600000, Duration: 3, Name: 'Child1 高校補習', Type: 'expense' },
            { Year: 2036, Amount: -1500000, Duration: 1, Name: 'Child1 私立大学(初年度)', Type: 'expense' },
            { Year: 2037, Amount: -1200000, Duration: 3, Name: 'Child1 私立大学(以降)', Type: 'expense' },

            { Year: 2033, Amount: -400000, Duration: 3, Name: 'Child2 中学補習', Type: 'expense' },
            { Year: 2036, Amount: -600000, Duration: 3, Name: 'Child2 高校補習', Type: 'expense' },
            { Year: 2039, Amount: -817800, Duration: 1, Name: 'Child2 公立大学(初年度)', Type: 'expense' },
            { Year: 2040, Amount: -535800, Duration: 3, Name: 'Child2 公立大学(以降)', Type: 'expense' },

            { Year: 2045, Amount: -1000000, Duration: 1, Name: 'Child1 結婚支援', Type: 'expense' },
            { Year: 2048, Amount: -1000000, Duration: 1, Name: 'Child2 結婚支援', Type: 'expense' },

            { Year: 2042, Amount: -1500000, Duration: 10, Name: 'P1 役職定年減収', Type: 'expense' },
            { Year: 2044, Amount: -500000, Duration: 8, Name: 'P2 役職定年減収', Type: 'expense' },

            { Year: 2050, Amount: -5000000, Duration: 1, Name: '大規模修繕', Type: 'expense' },

            { Year: 2070, Amount: -2500000, Duration: 8, Name: 'P1 介護', Type: 'expense' },
            { Year: 2072, Amount: -2500000, Duration: 6, Name: 'P2 介護', Type: 'expense' },
        ]
    }
};
