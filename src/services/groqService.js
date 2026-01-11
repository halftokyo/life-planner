/**
 * Groq AI Service with Model Fallback Strategy
 * Models: Qwen3-32B → Kimi K2 → Llama 4 Scout
 */

// API Key should be set via environment variable VITE_GROQ_API_KEY
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const MODELS = [
    'qwen/qwen3-32b',
    'moonshotai/kimi-k2-instruct-0905',
    'meta-llama/llama-4-scout-17b-16e-instruct'
];

const SYSTEM_PROMPT = `あなたは家庭のファイナンシャルプランニングを手伝うAIアシスタントです。
ユーザーから家族の情報（生年、年収、資産、支出など）を収集し、シミュレーションに必要なデータを整理します。

必要な情報:
- 世帯主の生年と年収
- 配偶者の生年と年収（いる場合）
- 子供の生年（いる場合）
- 現在の金融資産
- 年間住居費
- 年間生活費

ユーザーが情報を提供したら、理解した内容を簡潔に確認し、不足している情報があれば優しく聞いてください。
すべての情報が揃ったら「情報収集が完了しました」と伝えてください。

回答は簡潔に、フレンドリーなトーンで。`;

let currentModelIndex = 0;

export async function sendMessage(messages) {
    const attempts = MODELS.length;

    for (let i = 0; i < attempts; i++) {
        const model = MODELS[(currentModelIndex + i) % MODELS.length];

        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        ...messages
                    ],
                    temperature: 0.7,
                    max_tokens: 1024,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.warn(`Model ${model} failed:`, errorData);

                // Check if rate limited or model unavailable
                if (response.status === 429 || response.status === 503) {
                    currentModelIndex = (currentModelIndex + i + 1) % MODELS.length;
                    continue; // Try next model
                }
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            return {
                content: data.choices[0].message.content,
                model: model,
            };
        } catch (error) {
            console.error(`Error with model ${model}:`, error);
            if (i === attempts - 1) {
                throw error; // All models failed
            }
        }
    }

    throw new Error('All models failed');
}

export function getCurrentModel() {
    return MODELS[currentModelIndex];
}

export function resetModelIndex() {
    currentModelIndex = 0;
}
