import { defaultSetup } from '../data/defaults.js';

/**
 * Chat flow definition
 * Defines the questions, validation, and state updates
 */

export const chatFlow = [
    {
        id: 'welcome',
        message: `こんにちは。家庭のファイナンシャルプランニングをお手伝いするAIアシスタントです。

以下のような形式で、ご家族の情報をまとめて入力していただけますか？
（面倒な場合は「開始」とだけ入力して、一つずつ答えていくこともできます）

【入力例】
私の生年: 1985
年収: 800万
配偶者の生年: 1990
配偶者の年収: 600万
子供の生年: 2020
金融資産: 5000万
住居費: 年240万
生活費: 年300万`,
        field: 'Person1_Birth_Year', // Assign to p1 birth initially, but logic will handle bulk
        type: 'text', // Changed to text to allow bulk input
        // parse logic will determine if it's a single value or bulk
    },
    {
        id: 'p1_salary',
        message: '現在の年収（額面）は大体どのくらいですか？',
        field: 'Person1_Salary_Start',
        type: 'currency',
        validate: (val) => val >= 0,
        transform: (val) => val * 10000
    },
    {
        id: 'p2_birth',
        message: '配偶者の方のお生まれ年も教えてください。（独身の場合は「なし」と入力）',
        field: 'Person2_Birth_Year',
        type: 'number_or_skip',
    },
    {
        id: 'p2_salary',
        message: '配偶者の方の現在の年収はどのくらいですか？',
        field: 'Person2_Salary_Start',
        condition: (state) => state.setup.Person2_Birth_Year !== null,
        type: 'currency'
    },
    {
        id: 'child_birth',
        message: 'お子様がいらっしゃる場合、第一子のお生まれ年を教えてください。（いない場合は「なし」）',
        field: 'Child1_Birth_Year',
        type: 'number_or_skip',
    },
    {
        id: 'assets',
        message: '現在の世帯の金融資産（現金、株式など）の合計はどのくらいですか？',
        field: 'Initial_Asset',
        type: 'currency'
    },
    {
        id: 'housing',
        message: '現在の年間の住居費（家賃またはローン返済額）はどのくらいですか？',
        field: 'Housing_Annual_Pre',
        type: 'currency',
        transform: (val) => -Math.abs(val)
    },
    {
        id: 'living',
        message: '住居費を除く、その他の生活費（食費、光熱費など）の年間合計はざっくりどのくらいですか？',
        field: 'Living_Annual_Pre',
        type: 'currency',
        transform: (val) => -Math.abs(val)
    }
];

export class ChatEngine {
    constructor(updateStateCallback, finishCallback) {
        this.currentStepIndex = 0;
        this.updateState = updateStateCallback;
        this.finish = finishCallback;
        this.history = [];
        this.state = { ...defaultSetup };
        this.providedFields = new Set(); // Track which fields were extracted from bulk input
    }

    start() {
        this.askCurrentQuestion();
    }

    askCurrentQuestion() {
        const step = chatFlow[this.currentStepIndex];

        // Check condition
        if (step.condition && !step.condition({ setup: this.state })) {
            this.nextStep();
            return;
        }

        // Adaptive Skip: If field is already provided via bulk input (and it's not the first welcome step which acts as the prompt)
        // The first step (welcome) matches 'Person1_Birth_Year' field but serves as the bulk input receiver.
        // If we parsed P1 Birth Year from bulk, we should NOT skip the welcome (because it was the prompt), 
        // but we should proceed without asking again?
        // Actually, 'welcome' step has already been "asked" (displayed). We are typically calling askCurrentQuestion logic for the NEXT step.
        // So for step [1] and beyond, if the field is in providedFields, we skip.

        if (this.currentStepIndex > 0 && step.field && this.providedFields.has(step.field)) {
            this.nextStep();
            return;
        }

        this.addMessage('bot', step.message);
    }

    nextStep() {
        this.currentStepIndex++;
        if (this.currentStepIndex >= chatFlow.length) {
            this.complete();
        } else {
            // Recursive call to check next step's skip condition immediately
            setTimeout(() => this.askCurrentQuestion(), 600); // Small delay for natural feel
        }
    }

    handleInput(input) {
        this.addMessage('user', input);
        const step = chatFlow[this.currentStepIndex];

        // Special handling for the first step (Welcome/Bulk input)
        if (this.currentStepIndex === 0) {
            const extractedCount = this.parseBulkInput(input);
            if (extractedCount > 0) {
                // If we extracted data, we assume the user attempted a bulk input.
                // We add a system message acknowledging what we understood?
                // Or just move on. Let's strictly move on to fill gaps.
                this.addMessage('bot', `ありがとうございます。${extractedCount}項目の情報を認識しました。不足している情報を確認します。`);
                this.nextStep();
                return;
            }
            // If no bulk patterns found, treat as single input for the first field (P1 Birth) if it looks like a year
            // Fallback to normal parsing below for simple "1985" or "Start"
            if (input.includes('開始') || input.toLowerCase().includes('start')) {
                this.nextStep(); // Just start questioning
                return;
            }
        }

        // Normal single field parsing
        let value = this.parseInput(input, step);

        // If parsing returned null/invalid but we expected something specific?
        // For the welcome step, if regex failed but it looks like a number:
        if (this.currentStepIndex === 0 && !isNaN(value) && value > 1900 && value < 2025) {
            // It's likely just the year
            this.state[step.field] = value;
            this.updateState(step.field, value);
            this.providedFields.add(step.field); // Mark as provided
            this.nextStep();
            return;
        }

        // Validation (skip if it was bulk input handled above)
        if (step.validate && !step.validate(value)) {
            if (step.type === 'number_or_skip' && (input === 'なし' || input === 'none')) {
                // Pass
            } else if (this.currentStepIndex === 0) {
                // If first step failed validation AND wasn't bulk...
                // Could be "Start" command which we handled... or invalid year
                this.addMessage('bot', '入力を認識できませんでした。「開始」と入力するか、西暦（例：1985）を入力してください。');
                return;
            } else {
                this.addMessage('bot', step.error || '入力内容を確認してください。');
                return;
            }
        }

        // Special handling for skip
        if (step.type === 'number_or_skip' && (input === 'なし' || input === 'none')) {
            value = null;
        }

        // Update state
        if (value !== null) {
            this.state[step.field] = value;
            this.updateState(step.field, value);
            this.providedFields.add(step.field);
        }

        this.nextStep();
    }

    parseBulkInput(text) {
        let count = 0;
        const s = this.state;

        // Helper to extract
        const extract = (regex, field, transform = null) => {
            const match = text.match(regex);
            if (match && match[1]) {
                let val = parseFloat(match[1].replace(/,/g, ''));
                // Check modifiers in the matched string or surrounding? 
                // Simple heuristic for "万"
                const fullMatch = match[0];
                if (fullMatch.includes('万')) val *= 10000;
                else if (fullMatch.includes('億')) val *= 100000000;

                // Specific transforms
                if (transform) val = transform(val);

                this.state[field] = val;
                this.updateState(field, val);
                this.providedFields.add(field);
                count++;
            }
        };

        // Person 1
        extract(/(?:私|本人|夫|旦那|p1).*?(?:生年|生まれ|birth).*?(\d{4})/i, 'Person1_Birth_Year');
        extract(/(?:私|本人|夫|旦那|p1|年収).*?(?:年収|給与|salary).*?(\d[\d,.]*)/i, 'Person1_Salary_Start', (v) => v < 10000 ? v * 10000 : v); // Heuristic: if < 10000 assume ten-thousands unit implies user meant raw number or we missed '万'

        // Spouse - distinct patterns needed
        extract(/(?:配偶者|妻|嫁|奥さん|パートナー|p2).*?(?:生年|生まれ|birth).*?(\d{4})/i, 'Person2_Birth_Year');
        extract(/(?:配偶者|妻|嫁|奥さん|パートナー|p2).*?(?:年収|給与|salary).*?(\d[\d,.]*)/i, 'Person2_Salary_Start', (v) => v < 10000 ? v * 10000 : v);

        // Child
        extract(/(?:子供|子|娘|息子|child).*?(?:生年|生まれ|birth).*?(\d{4})/i, 'Child1_Birth_Year');

        // Assets
        extract(/(?:資産|貯金|asset).*?(\d[\d,.]*)/i, 'Initial_Asset', (v) => v < 10000 ? v * 10000 : v);

        // Housing - Negative
        extract(/(?:住居|家賃|ローン|housing).*?(\d[\d,.]*)/i, 'Housing_Annual_Pre', (v) => -Math.abs(v < 1000 ? v * 10000 : v));

        // Living - Negative
        extract(/(?:生活|食費|living).*?(\d[\d,.]*)/i, 'Living_Annual_Pre', (v) => -Math.abs(v < 1000 ? v * 10000 : v));

        return count;
    }

    parseInput(input, step) {
        if (step.type === 'currency' || step.type === 'number') {
            let clean = input.replace(/,/g, '');
            let num = parseFloat(clean);

            if (input.includes('万')) {
                num = parseFloat(input.replace('万', '')) * 10000;
            } else if (input.includes('億')) {
                num = parseFloat(input.replace('億', '')) * 100000000;
            } else if (step.type === 'currency' && num < 10000) {
                // Fallback: if user types "800" for salary, likely means 800万
                num = num * 10000;
            }

            if (step.transform) return step.transform(num);
            return num;
        }
        return input;
    }

    addMessage(type, text) {
        this.history.push({ type, text });
        if (this.onMessageUpdate) this.onMessageUpdate([...this.history]);
    }

    complete() {
        this.addMessage('bot', 'ありがとうございます！シミュレーション結果を作成しました。');
        setTimeout(() => this.finish(), 1000);
    }
}
