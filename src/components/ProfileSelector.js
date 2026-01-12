export function createProfileSelector(onSelect) {
    const container = document.createElement('div');
    container.className = 'profile-selector-overlay';

    // Add specific styles for the selector page
    const style = document.createElement('style');
    style.textContent = `
        .profile-selector-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        .selector-card {
            max-width: 600px;
            width: 90%;
            text-align: center;
        }
        .selector-title {
            font-size: 2.25rem;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.02em;
        }
        .selector-subtitle {
            font-size: 1rem;
            color: #64748b;
            margin-bottom: 48px;
        }
        .profile-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }
        .profile-item {
            background: white;
            border: 1px solid #efefef;
            border-radius: 20px;
            padding: 32px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            text-align: left;
            position: relative;
            overflow: hidden;
        }
        .profile-item:hover {
            border-color: #1a1a1a;
            transform: translateY(-4px);
            box-shadow: 0 12px 24px -8px rgba(0,0,0,0.1);
        }
        .profile-icon {
            width: 48px;
            height: 48px;
            background: #f3f4f6;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            color: #1a1a1a;
        }
        .profile-name {
            font-size: 1.125rem;
            font-weight: 700;
            margin-bottom: 4px;
        }
        .profile-desc {
            font-size: 0.875rem;
            color: #64748b;
            line-height: 1.5;
        }
        .profile-arrow {
            position: absolute;
            right: 24px;
            top: 32px;
            color: #94a3b8;
            opacity: 0;
            transition: all 0.2s;
        }
        .profile-item:hover .profile-arrow {
            opacity: 1;
            transform: translateX(4px);
        }
    `;
    container.appendChild(style);

    container.innerHTML += `
        <div class="selector-card">
            <h1 class="selector-title">FAMILY ASSETS</h1>
            <p class="selector-subtitle">あなたのライフプランに合わせて、最適な初期設定を選択してください。</p>
            
            <div class="profile-grid">
                <div class="profile-item" data-profile="standard">
                    <span class="material-symbols-outlined profile-arrow">arrow_forward</span>
                    <div class="profile-icon">
                        <span class="material-symbols-outlined">family_restroom</span>
                    </div>
                    <div class="profile-name">標準的な世帯</div>
                    <p class="profile-desc">共働き夫婦、子供1人の一般的なライフプラン設定です。</p>
                </div>
                
                <div class="profile-item" data-profile="single">
                    <span class="material-symbols-outlined profile-arrow">arrow_forward</span>
                    <div class="profile-icon">
                        <span class="material-symbols-outlined">person</span>
                    </div>
                    <div class="profile-name">シングルライフ</div>
                    <p class="profile-desc">単身世帯、自由なライフスタイルを重視する方向けの設定です。</p>
                </div>

                <div class="profile-item" data-profile="high-net-worth">
                    <span class="material-symbols-outlined profile-arrow">arrow_forward</span>
                    <div class="profile-icon">
                        <span class="material-symbols-outlined">diamond</span>
                    </div>
                    <div class="profile-name">富裕層モデル</div>
                    <p class="profile-desc">高い資産運用効率と、充実したセカンドライフを目指す設定です。</p>
                </div>

                <div class="profile-item" data-profile="early-retire">
                    <span class="material-symbols-outlined profile-arrow">arrow_forward</span>
                    <div class="profile-icon">
                        <span class="material-symbols-outlined">beach_access</span>
                    </div>
                    <div class="profile-name">FIRE / 早期リタイア</div>
                    <p class="profile-desc">早期の経済的自由と退職を重視した攻撃的な貯蓄プランです。</p>
                </div>
            </div>
        </div>
    `;

    container.querySelectorAll('.profile-item').forEach(item => {
        item.addEventListener('click', () => {
            onSelect(item.dataset.profile);
        });
    });

    return container;
}
