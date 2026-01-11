import { PROFILES } from '../data/profiles.js';

export function createProfileSelector(onSelectCallback) {
    const container = document.createElement('div');
    container.className = 'profile-selector-container fade-in';

    // Header
    const header = document.createElement('div');
    header.className = 'profile-selector-header';
    header.innerHTML = `
        <h2>ライフプランを選択してください</h2>
        <p>あなたの状況に最も近いコースを選ぶことで、最適なシミュレーションを素早く作成できます。</p>
    `;
    container.appendChild(header);

    // Cards Grid
    const grid = document.createElement('div');
    grid.className = 'profile-cards-grid';

    Object.entries(PROFILES).forEach(([key, profile]) => {
        const card = document.createElement('div');
        card.className = 'profile-card';
        // Add specific class for colors
        if (key === 'A') card.classList.add('profile-card-accent-a');
        if (key === 'B') card.classList.add('profile-card-accent-b');
        if (key === 'C') card.classList.add('profile-card-accent-c');

        card.onclick = () => onSelectCallback(key);

        // Icon/Color mapping based on Role
        let icon = '🏠';
        if (key === 'A') { icon = '💎'; }
        if (key === 'C') { icon = '🛡️'; }

        card.innerHTML = `
            <div class="profile-card-icon">${icon}</div>
            <h3 class="profile-card-title">${profile.name}</h3>
            <p class="profile-card-desc">${profile.description}</p>
            <ul class="profile-card-features">
                <li>世帯年収目安: ${(profile.setup.Person1_Salary_Start + profile.setup.Person2_Salary_Start) / 10000}万円</li>
                <li>初期資産: ${profile.setup.Initial_Asset / 10000}万円</li>
            </ul>
            <button class="btn-select">このコースで始める</button>
        `;

        grid.appendChild(card);
    });

    container.appendChild(grid);
    return container;
}
