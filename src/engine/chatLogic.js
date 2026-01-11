import { defaultSetup, setupFields } from '../data/defaults.js';
import { sendMessage } from '../services/groqService.js';

/**
 * AI-driven Chat Engine
 * Logic:
 * 1. Parse User Input (Regex) -> Update State
 * 2. Check Missing Fields
 * 3. Call AI to ask for missing fields
 */

export class ChatEngine {
    constructor(updateStateCallback, finishCallback) {
        this.updateState = updateStateCallback;
        this.finish = finishCallback;
        this.history = []; // UI history
        this.conversationContext = []; // AI context (role: user/assistant)
        this.state = { ...defaultSetup };
        this.providedFields = new Set();
        this.isProcessing = false;
    }

    start() {
        // Initial Greeting
        const greeting = `こんにちは。AIファイナンシャルプランナーです。
あなたのライフプラン・シミュレーションを作成します。

まずは、あなたのことやご家族について教えてください。
（例：私は35歳、年収600万。妻は32歳、年収400万。子供が一人います。）`;

        this.addMessage('bot', greeting);
        this.conversationContext.push({ role: 'assistant', content: greeting });
    }

    async handleInput(input) {
        if (!input.trim() || this.isProcessing) return;

        this.isProcessing = true;
        this.addMessage('user', input);
        this.conversationContext.push({ role: 'user', content: input });

        // 1. Regex Parsing (Hybrid Approach)
        // We still use regex for high-precision extraction of numbers/patterns
        const extractedCount = this.parseBulkInput(input);

        // 2. Check Completeness
        const { isComplete, missingFields, nextQuestionHint } = this.checkCompleteness();

        if (isComplete) {
            this.complete();
            this.isProcessing = false;
            return;
        }

        // 3. Call AI
        try {
            // Construct System Prompt with specific context
            const contextPrompt = this.constructContextPrompt(missingFields);

            // Call Groq
            // We append the contextPrompt as a system message at the end or update the main system prompt?
            // Better to prepend system prompt, and maybe append a "Hidden State" reminder
            const messages = [
                { role: 'system', content: contextPrompt },
                ...this.conversationContext.slice(-6) // Keep last few turns for context window
            ];

            const response = await sendMessage(messages);

            // Display AI Response
            this.addMessage('bot', response.content);
            this.conversationContext.push({ role: 'assistant', content: response.content });

        } catch (error) {
            console.error('AI Error:', error);
            // Fallback if AI fails
            this.addMessage('bot', `すみません、少し調子が悪いようです。もう一度お願いします。（${nextQuestionHint}）`);
        } finally {
            this.isProcessing = false;
        }
    }

    checkCompleteness() {
        // Define required fields
        const required = [
            'Person1_Birth_Year',
            'Person1_Salary_Start',
            'Initial_Asset',
            'Housing_Annual_Pre',
            'Living_Annual_Pre'
        ];

        // Spouse Logic: If user mentions spouse but no data, we need it. 
        // Note: For simplicity in this version, we ask assuming typical family setup 
        // OR we rely on AI to ask "配偶者はいらっしゃいますか？"
        // Let's rely on providedFields. If 'Person2_Birth_Year' is NOT provided and we haven't asked about it...
        // Actually, let's look at the null values in state.

        // Simple Logic:
        // 1. P1 Birth & Salary are MUST.
        // 2. Asset, Housing, Living are MUST.
        // 3. P2 & Child are Optional BUT we should verify if they exist.
        //    We can consider P2/Child done if the user specifically said "none" or "hitori" or we inferred it.
        //    For now, let's enforce core fields are non-null.

        // We will treat 0 as valid for some, but null means missing.
        let missing = [];

        if (!this.state.Person1_Birth_Year) missing.push('世帯主の生まれ年');
        if (this.state.Person1_Salary_Start === null || this.state.Person1_Salary_Start === undefined) missing.push('世帯主の年収');
        if (this.state.Initial_Asset === null || this.state.Initial_Asset === undefined) missing.push('現在の金融資産（貯金など）');
        if (this.state.Housing_Annual_Pre === null || this.state.Housing_Annual_Pre === undefined) missing.push('年間の住居費');
        if (this.state.Living_Annual_Pre === null || this.state.Living_Annual_Pre === undefined) missing.push('年間の生活費（住居費以外）');

        // Note: We don't strictly block on Spouse/Child to avoid infinite loops if AI doesn't extract "None".
        // Instead, the AI prompt will guide asking about family structure if unknown.

        return {
            isComplete: missing.length === 0,
            missingFields: missing,
            nextQuestionHint: missing.length > 0 ? `${missing[0]}について教えてください` : ''
        };
    }

    constructContextPrompt(missingFields) {
        // Create a summary of current known state
        const s = this.state;
        const known = `
[既知の情報]
- 世帯主生年: ${s.Person1_Birth_Year || '?'}
- 世帯主年収: ${s.Person1_Salary_Start ? (s.Person1_Salary_Start / 10000) + '万' : '?'}
- 配偶者生年: ${s.Person2_Birth_Year || '未確認/なし'}
- 配偶者年収: ${s.Person2_Salary_Start ? (s.Person2_Salary_Start / 10000) + '万' : '未確認/なし'}
- 子供生年: ${s.Child1_Birth_Year || '未確認/なし'}
- 金融資産: ${s.Initial_Asset ? (s.Initial_Asset / 10000) + '万' : '?'}
- 住居費: ${s.Housing_Annual_Pre ? Math.abs(s.Housing_Annual_Pre / 10000) + '万' : '?'}
- 生活費: ${s.Living_Annual_Pre ? Math.abs(s.Living_Annual_Pre / 10000) + '万' : '?'}
        `;

        if (missingFields.length === 0) {
            return `全ての情報が揃いました。「ありがとうございます。シミュレーションを作成します」と答えてください。`;
        }

        return `
あなたはプロのファイナンシャルプランナーAIです。
以下の情報が不足しています: ${missingFields.join(', ')}。

${known}

ユーザーとの会話の履歴を踏まえて、
不足している情報だけを、優しく、自然な会話の流れで聞いてください。
一度にたくさんの質問をせず、1つか2つずつ聞いてください。
もしユーザーが「なし」や「独身」と言った場合は、それを受け入れて次の質問へ進んでください。

重要: 数値を聞くときは「万円単位」で答えてもらうとスムーズです。
`;
    }

    addMessage(type, text) {
        this.history.push({ type, text });
        if (this.onMessageUpdate) this.onMessageUpdate([...this.history]);
    }

    complete() {
        this.addMessage('bot', 'ありがとうございます！全ての情報が揃いました。シミュレーション結果を作成します。');
        // Small delay before firing finish to let user read
        setTimeout(() => this.finish(), 1500);
    }

    // Reuse existing bulk parser logic because it's robust for Japanese numbers
    parseBulkInput(text) {
        let count = 0;
        // Helper to extract
        const extract = (regex, field, transform = null) => {
            const match = text.match(regex);
            if (match && match[1]) {
                let val = parseFloat(match[1].replace(/,/g, ''));
                const fullMatch = match[0];
                if (fullMatch.includes('万')) val *= 10000;
                else if (fullMatch.includes('億')) val *= 100000000;

                if (transform) val = transform(val);

                // Update if not already set or override? Override is better for corrections.
                this.state[field] = val;
                this.updateState(field, val);
                this.providedFields.add(field);
                count++;
            }
        };

        // Reuse Regex Patterns (Simplified for brevity but functionally same)
        extract(/(?:私|本人|夫|旦那|p1).*?(?:生年|生まれ|birth|歳|才).*?(\d{2,4})/i, 'Person1_Birth_Year', v => v < 100 ? 2025 - v : v); // Convert Age to Year if < 100
        extract(/(?:私|本人|夫|旦那|p1|年収|給与).*?(?:年収|給与|手取り).*?(\d[\d,.]*)/i, 'Person1_Salary_Start', v => v < 10000 ? v * 10000 : v);

        extract(/(?:配偶者|妻|嫁|奥さん|パートナー|p2).*?(?:生年|生まれ|birth|歳|才).*?(\d{2,4})/i, 'Person2_Birth_Year', v => v < 100 ? 2025 - v : v);
        extract(/(?:配偶者|妻|嫁|奥さん|パートナー|p2).*?(?:年収|給与).*?(\d[\d,.]*)/i, 'Person2_Salary_Start', v => v < 10000 ? v * 10000 : v);

        extract(/(?:子供|子|娘|息子).*?(?:生年|生まれ|birth|歳|才).*?(\d{2,4})/i, 'Child1_Birth_Year', v => v < 100 ? 2025 - v : v);

        extract(/(?:資産|貯金|貯蓄).*?(\d[\d,.]*)/i, 'Initial_Asset', v => v < 10000 ? v * 10000 : v);
        extract(/(?:住居|家賃|ローン).*?(\d[\d,.]*)/i, 'Housing_Annual_Pre', v => -Math.abs(v < 1000 ? v * 10000 : v));
        extract(/(?:生活|食費|光熱).*?(\d[\d,.]*)/i, 'Living_Annual_Pre', v => -Math.abs(v < 1000 ? v * 10000 : v));

        return count;
    }
}
