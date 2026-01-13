
import { defaultSetup, setupFields } from '../data/defaults.js';
import { PROFILES } from '../data/profiles.js';
import { sendMessage } from '../services/groqService.js';

/**
 * AI-driven Chat Engine with Profile Matching
 * Logic:
 * 1. Parse User Input (Regex) -> Update State
 * 2. Check if we have enough info to Match Profile (Household Income)
 * 3. If matched & not yet applied: Apply Profile Defaults (filling gaps)
 * 4. Check Missing Fields (only for critical overrides)
 * 5. Call AI to ask for missing fields if critical
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
        this.matchedProfile = null; // Track if we stuck a profile
    }

    // New: Allow starting with a pre-selected profile ID
    start(preSelectedProfileId = null) {
        if (preSelectedProfileId && PROFILES[preSelectedProfileId]) {
            // Apply logic immediately
            this.applyProfile(preSelectedProfileId);

            const profile = PROFILES[preSelectedProfileId];
            const greeting = `「${profile.name}」コースを選択しました。
基本的な設定は完了しています。

もし、実際の年齢や年収が異なる場合は教えてください。
（例：実は私は38歳で、年収は450万円です）

特になければ「OK」や「次へ」と言ってください。`;

            this.addMessage('bot', greeting);
            this.conversationContext.push({ role: 'assistant', content: greeting });
        } else {
            // Standard Flow
            const greeting = `こんにちは。AIファイナンシャルプランナーです。
ライフプラン・シミュレーションを作成します。
まずは、あなたのことやご家族について教えてください。
（例：私は35歳、年収600万。妻は32歳、年収400万。子供が一人います。）`;

            this.addMessage('bot', greeting);
            this.conversationContext.push({ role: 'assistant', content: greeting });
        }
    }

    applyProfile(profileId) {
        this.matchedProfile = profileId;
        const profile = PROFILES[profileId];

        // Apply Setup
        const newSetup = { ...profile.setup, ...this.getUserProvidedState() };
        this.state = newSetup;

        // Apply Events
        for (const [key, val] of Object.entries(profile.setup)) {
            if (!this.providedFields.has(key)) {
                this.updateState(key, val);
                this.state[key] = val;
            }
        }
        this.updateState('__APPLY_PROFILE_EVENTS__', profile.events);
    }

    async handleInput(input) {
        if (!input.trim() || this.isProcessing) return;

        this.isProcessing = true;
        this.addMessage('user', input);
        this.conversationContext.push({ role: 'user', content: input });

        // 1. Regex Parsing
        this.parseBulkInput(input);

        // 2. Profile Match (Only if NOT pre-selected/matched already)
        if (!this.matchedProfile && this.hasIncomeInfo()) {
            this.applyBestMatchProfile();
        }

        // 3. Completeness / User Satisfaction Check
        // If matched, we assume complete unless user asks question.
        // Simple heuristic: If user says "OK" or "Next", finish.
        if (this.matchedProfile && (input.match(/(ok|次へ|大丈夫|良い|よし|go|yes)/i))) {
            this.complete();
            this.isProcessing = false;
            return;
        }

        const { isComplete, missingFields, nextQuestionHint } = this.checkCompleteness();

        if (isComplete && !this.matchedProfile) { // Standard flow completion
            this.complete();
            this.isProcessing = false;
            return;
        }

        // 4. Call AI
        try {
            const contextPrompt = this.constructContextPrompt(missingFields);

            const messages = [
                { role: 'system', content: contextPrompt },
                ...this.conversationContext.slice(-6)
            ];

            const response = await sendMessage(messages);

            this.addMessage('bot', response.content);
            this.conversationContext.push({ role: 'assistant', content: response.content });

        } catch (error) {
            console.error('AI Error:', error);
            this.addMessage('bot', `すみません、少し調子が悪いようです。もう一度お願いします。（${nextQuestionHint}）`);
        } finally {
            this.isProcessing = false;
        }
    }

    hasIncomeInfo() {
        return (this.state.Person1_Salary_Start !== undefined && this.state.Person1_Salary_Start !== null);
    }

    applyBestMatchProfile() {
        const s = this.state;
        const p1 = s.Person1_Salary_Start || 0;
        const p2 = s.Person2_Salary_Start || 0;
        const totalIncome = p1 + p2;

        let match = 'C';
        if (totalIncome >= 10500000) match = 'A';
        else if (totalIncome >= 7800000) match = 'B';

        this.applyProfile(match);

        const profile = PROFILES[match];
        this.addMessage('bot', `あなたの年収情報から「${profile.name}」としてシミュレーション設定をプリセットしました。
不足している細かな情報があれば調整します。特になければ「OK」と言ってください。`);
    }

    getUserProvidedState() {
        const sub = {};
        this.providedFields.forEach(k => {
            sub[k] = this.state[k];
        });
        return sub;
    }

    checkCompleteness() {
        // If profile matched, we are effectively complete unless user initiates change.
        // We maintain loose check for P1 info.
        const missing = [];
        if (!this.state.Person1_Birth_Year) missing.push('あなたの年齢');
        if (!this.state.Person1_Salary_Start) missing.push('あなたの年収');

        return {
            isComplete: missing.length === 0,
            missingFields: missing,
            nextQuestionHint: missing.length > 0 ? `${missing[0]} ` : ''
        };
    }

    constructContextPrompt(missingFields) {
        const s = this.state;
        const profile = this.matchedProfile ? PROFILES[this.matchedProfile].name : '未定';

        const known = `
[現在設定] プロファイル: ${profile}
本人: ${s.Person1_Birth_Year}生, 年収 ${s.Person1_Salary_Start / 10000}万, 退休 ${s.Person1_Retire_Age}歳, 年金 ${s.Person1_Pension_Income / 10000}万
配偶者: ${s.Person2_Birth_Year || '-'}生, 年収 ${(s.Person2_Salary_Start || 0) / 10000}万, 退休 ${s.Person2_Retire_Age}歳, 年金 ${(s.Person2_Pension_Income || 0) / 10000}万
資産: ${(s.Initial_Asset || 0) / 10000}万
`;

        if (this.matchedProfile) {
            return `あなたはFP AI。現在「${profile}」が適用済。
世帯の個別設定（退職年齢や年金など）の修正要望に対応してください。数値は「万円」で。
${known}`;
        }

        return `あなたはFP AI。不足情報: ${missingFields.join(', ')}。
${known}
不足情報を聞いて。数値は「万円」で。`;
    }

    addMessage(type, text) {
        this.history.push({ type, text });
        if (this.onMessageUpdate) this.onMessageUpdate([...this.history]);
    }

    complete() {
        this.addMessage('bot', '承知しました。シミュレーション結果を作成します。');
        setTimeout(() => this.finish(), 1500);
    }

    parseBulkInput(text) {
        let count = 0;
        const extract = (regex, field, transform = null) => {
            const match = text.match(regex);
            if (match && match[1]) {
                let val = parseFloat(match[1].replace(/,/g, ''));
                const fullMatch = match[0];
                if (fullMatch.includes('万')) val *= 10000;
                else if (fullMatch.includes('億')) val *= 100000000;
                if (transform) val = transform(val);

                this.state[field] = val;
                this.updateState(field, val);
                this.providedFields.add(field);
                count++;
            }
        };

        // P1
        extract(/(?:私|本人|夫|旦那|p1).*?(?:生年|生まれ|birth|歳|才).*?(\d{2,4})/i, 'Person1_Birth_Year', v => v < 100 ? 2025 - v : v);
        extract(/(?:私|本人|夫|旦那|p1|年収|給与).*?(?:年収|給与|手取り).*?(\d[\d,.]*)/i, 'Person1_Salary_Start', v => v < 10000 ? v * 10000 : v);
        extract(/(?:私|本人|夫|旦那|p1).*?(?:退職|引退|リタイア).*?(\d{1,2})/, 'Person1_Retire_Age');
        extract(/(?:私|本人|夫|旦那|p1).*?(?:年金|国民年金|厚生年金).*?(\d[\d,.]*)/, 'Person1_Pension_Income', v => v < 10000 ? v * 10000 : v);

        // P2
        extract(/(?:配偶者|妻|嫁|奥さん|パートナー|p2).*?(?:生年|生まれ|birth|歳|才).*?(\d{2,4})/i, 'Person2_Birth_Year', v => v < 100 ? 2025 - v : v);
        extract(/(?:配偶者|妻|嫁|奥さん|パートナー|p2).*?(?:年収|給与).*?(\d[\d,.]*)/i, 'Person2_Salary_Start', v => v < 10000 ? v * 10000 : v);
        extract(/(?:配偶者|妻|嫁|奥さん|パートナー|p2).*?(?:退職|引退|リタイア).*?(\d{1,2})/, 'Person2_Retire_Age');
        extract(/(?:配偶者|妻|嫁|奥さん|パートナー|p2).*?(?:年金|国民年金|厚生年金).*?(\d[\d,.]*)/, 'Person2_Pension_Income', v => v < 10000 ? v * 10000 : v);

        // General
        extract(/(?:子供|子|娘|息子).*?(?:生年|生まれ|birth|歳|才).*?(\d{2,4})/i, 'Child1_Birth_Year', v => v < 100 ? 2025 - v : v);
        extract(/(?:資産|貯金|貯蓄).*?(\d[\d,.]*)/i, 'Initial_Asset', v => v < 10000 ? v * 10000 : v);
        extract(/(?:住居|家賃|ローン).*?(\d[\d,.]*)/i, 'Housing_Annual_Pre', v => -Math.abs(v < 1000 ? v * 10000 : v));
        extract(/(?:生活|食費|光熱).*?(\d[\d,.]*)/i, 'Living_Annual_Pre', v => -Math.abs(v < 1000 ? v * 10000 : v));

        return count;
    }
}
