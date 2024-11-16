class Leaderboard {
    constructor() {
        this.userData = JSON.parse(localStorage.getItem('userData') || '{}');
        this.loadLeaderboard();
        this.setupCrosshair();
        this.audio = new AudioManager();
    }

    setupCrosshair() {
        const crosshair = document.querySelector('.crosshair');
        document.addEventListener('mousemove', (e) => {
            crosshair.style.left = e.clientX + 'px';
            crosshair.style.top = e.clientY + 'px';
        });
    }

    async loadLeaderboard() {
        try {
            const response = await fetch('/api/stats');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const leaderboard = await response.json();
            
            const leaderboardList = document.querySelector('.leaderboard-list');
            if (!leaderboardList) {
                console.error('Leaderboard list element not found');
                return;
            }

            leaderboardList.innerHTML = leaderboard.map((user, index) => `
                <div class="leaderboard-item ${user.userId === this.userData.userId ? 'current-user' : ''}">
                    <span class="leaderboard-rank">#${index + 1}</span>
                    <img src="${user.avatar || 'assets/default-avatar.png'}" 
                         alt="" 
                         class="leaderboard-avatar"
                         onerror="this.src='assets/default-avatar.png'">
                    <span class="leaderboard-username">${user.username || 'Unknown Player'}</span>
                    <span class="leaderboard-wave">Wave ${user.stats?.highestWave || 0}</span>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            this.showError('Failed to load leaderboard. Please try again later.');
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('.leaderboard-page').prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

window.addEventListener('load', () => new Leaderboard()); 