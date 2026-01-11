```javascript
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

        // 1. Regex Parsing
        this.parseBulkInput(input);
        
        // 2. Attempt Profile Match (if Salary info exists)
        if (!this.matchedProfile && this.hasIncomeInfo()) {
            this.applyBestMatchProfile();
        }

        // 3. Check Completeness
        // If we applied a profile, many fields are filled. We only check if valid inputs exist.
        const { isComplete, missingFields, nextQuestionHint } = this.checkCompleteness();

        if (isComplete) {
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
            this.addMessage('bot', `すみません、少し調子が悪いようです。もう一度お願いします。（${ nextQuestionHint }）`);
        } finally {
            this.isProcessing = false;
        }
    }

    hasIncomeInfo() {
        // Check if we have P1 salary at minimum
        return (this.state.Person1_Salary_Start !== undefined && this.state.Person1_Salary_Start !== null);
    }

    applyBestMatchProfile() {
        const s = this.state;
        const p1 = s.Person1_Salary_Start || 0;
        const p2 = s.Person2_Salary_Start || 0;
        const totalIncome = p1 + p2;
        
        // Simple Matching Logic
        let match = 'C'; // Default
        if (totalIncome >= 10500000) match = 'A'; // >10.5M -> A
        else if (totalIncome >= 7800000) match = 'B'; // >7.8M -> B
        // else match = 'C'; // Else C

        this.matchedProfile = match;
        const profile = PROFILES[match];

        // Apply Profile Data
        // We only overwrite fields that are NOT provided by user (except specifically events)
        // Actually, requirement says "override with user provided". 
        // So we Load Profile FIRST, then Re-apply User State?
        // Better: Load Profile into a temp obj, then merge User State over it.
        
        // 1. Merge Setup
        const newSetup = { ...profile.setup, ...this.getUserProvidedState() };
        this.state = newSetup;

        // 2. Merge Events? 
        // Profile has default events. User hasn't provided events yet via Chat usually.
        // So we strictly take Profile events.
        // But we need to save them. state only has setup?
        // Constructor says: this.state = { ...defaultSetup }; 
        // Main.js expects us to call updateStateCallback(key, val).
        
        // We need to update ALL fields in main state.
        for (const [key, val] of Object.entries(profile.setup)) {
            // Only update if NOT provided by user
            if (!this.providedFields.has(key)) {
                this.updateState(key, val);
                this.state[key] = val;
            }
        }
        
        // Also update EVENTS - How? 
        // ChatEngine constructor doesn't take 'updateEvents'.
        // We might need to expose a way to set events.
        // Hack: We can assume `updateState` can handle a special key or we add a new callback?
        // Given constraints, I'll add a structured message or assume main.js can handle it?
        // Let's modify main.js to handle full profile injection separately? 
        // No, let's keep it simple. Chat usually updates 'setup'. 
        // TO DO: We need to update `events` in App State.
        // I will add a special method to `updateStateCallback` if possible, or just ignore events in ChatEngine?
        // User wants the events.
        
        // Let's communicate the Profile Match to UI
        this.addMessage('bot', `あなたの年収情報から「${ profile.name }」としてシミュレーション設定をプリセットしました。（${ profile.description }）
不足している細かな情報があれば調整します。`);
        
        // Note: Actual Event update is tricky without callback.
        // I will dispatch a custom event or extended callback logic in next step if needed.
        // For now, let's assume `updateState` might accept 'EVENTS' key if I modify main.js
        this.updateState('__APPLY_PROFILE_EVENTS__', profile.events); 
    }

    getUserProvidedState() {
        const sub = {};
        this.providedFields.forEach(k => {
            sub[k] = this.state[k];
        });
        return sub;
    }

    checkCompleteness() {
        // Reduced strictness because Profile fills most gaps
        // We only check P1 Birth and Salary to be sure.
        const missing = [];
        if (!this.state.Person1_Birth_Year) missing.push('あなたの年齢（または生まれた年）');
        if (!this.state.Person1_Salary_Start) missing.push('あなたの年収');

        // Asset/Housing/Living are filled by Profile, but we might want to confirm if they differ?
        // We rely on "Is User satisfied?" logic implicitly by completing if core info is there.
        // But let's check if User specifically said "None" or implied it.
        // If Profile filled it, it acts as "Done". 
        // So we are likely complete immediately after matching if P1 info is there.
        
        return {
            isComplete: missing.length === 0,
            missingFields: missing,
            nextQuestionHint: missing.length > 0 ? `${ missing[0] } ` : ''
        };
    }

    constructContextPrompt(missingFields) {
        const s = this.state;
        const profile = this.matchedProfile ? PROFILES[this.matchedProfile].name : '未定';
        
        // Only show relevant fields
        const known = `
[現在の設定状況]
    - 適用プロファイル: ${ profile }
- 世帯主: ${ s.Person1_Birth_Year } 年生まれ, 年収${ s.Person1_Salary_Start / 10000 } 万
    - 配偶者: ${ s.Person2_Birth_Year || 'なし' }, 年収${ (s.Person2_Salary_Start || 0) / 10000 } 万
        - 金融資産: ${ (s.Initial_Asset || 0) / 10000 } 万
`;
        if (missingFields.length === 0) {
              return `必須情報は揃いました（プロファイル推定含む）。「情報が揃いました。${ profile } ベースでシミュレーションします」と答えてください。`;
        }
        return `
あなたはFP AIです。現在「${ profile }」を想定しています。
不足情報: ${ missingFields.join(', ') }。
${ known }
不足情報を優しく聞いてください。
`;
    }
    
    addMessage(type, text) {
        this.history.push({ type, text });
        if (this.onMessageUpdate) this.onMessageUpdate([...this.history]);
    }

    complete() {
        this.addMessage('bot', 'ありがとうございます！シミュレーション結果を作成します。');
        setTimeout(() => this.finish(), 1500);
    }
    
    parseBulkInput(text) {
        // Reuse previous regex logic
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

        // Standard Patterns
        extract(/(?:私|本人|夫|旦那|p1).*?(?:生年|生まれ|birth|歳|才).*?(\d{2,4})/i, 'Person1_Birth_Year', v => v < 100 ? 2025 - v : v);
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
