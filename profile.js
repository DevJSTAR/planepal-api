class Profile {
    constructor() {
        this.checkAuth();
        this.setupCrosshair();
        this.setupCubeAnimation();
        this.audio = new AudioManager();
    }

    checkAuth() {
        const userData = localStorage.getItem('userData');
        if (!userData) {
            window.location.href = '/';
            return;
        }
        this.userData = JSON.parse(userData);
        console.log('Auth check - userData:', this.userData);
        this.loadProfile();
    }

    setupCrosshair() {
        const crosshair = document.querySelector('.crosshair');
        document.addEventListener('mousemove', (e) => {
            crosshair.style.left = e.clientX + 'px';
            crosshair.style.top = e.clientY + 'px';
        });
    }

    setupCubeAnimation() {
        const cubes = document.querySelectorAll('.cube');
        cubes.forEach((cube, index) => {
            const delay = index * 2;
            const duration = 10 + Math.random() * 5;
            cube.style.animation = `float ${duration}s infinite linear ${delay}s`;
            
            cube.style.top = `${Math.random() * 100}%`;
            cube.style.left = `${Math.random() * 100}%`;
            
            const size = 30 + Math.random() * 20;
            cube.style.width = `${size}px`;
            cube.style.height = `${size}px`;
        });
    }

    async loadProfile() {
        try {
            if (!this.userData || !this.userData.userId) {
                console.error('No user data available');
                window.location.href = '/';
                return;
            }

            // Set initial data from localStorage
            const profileAvatar = document.querySelector('.profile-avatar');
            const profileUsername = document.querySelector('.profile-username');
            
            if (profileAvatar && profileUsername) {
                profileAvatar.src = this.userData.avatar || 'assets/default-avatar.png';
                profileUsername.textContent = this.userData.username || 'Guest';
            }

            // Add error handling for network issues
            try {
                const response = await fetch(`/api/stats?userId=${this.userData.userId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const serverStats = await response.json();
                
                if (!serverStats || !serverStats.stats) {
                    await this.createInitialStats();
                    return;
                }
                
                this.updateStatsDisplay(serverStats);
            } catch (error) {
                console.error('Network error:', error);
                // Show error message to user
                this.showError('Failed to load stats. Please try again later.');
            }
            
        } catch (error) {
            console.error('Failed to load profile:', error);
            window.location.href = '/';
        }
    }

    async createInitialStats() {
        try {
            const response = await fetch('/api/stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.userData.userId,
                    username: this.userData.username,
                    avatar: this.userData.avatar,
                    stats: {
                        highestWave: 0,
                        enemiesKilled: 0,
                        deaths: 0,
                        damageDealt: 0,
                        damageTaken: 0
                    }
                })
            });
            const newStats = await response.json();
            this.updateStatsDisplay(newStats);
        } catch (error) {
            console.error('Failed to create initial stats:', error);
        }
    }

    updateStatsDisplay(serverStats) {
        if (!serverStats || !serverStats.stats) {
            console.error('Invalid stats data:', serverStats);
            return;
        }

        // Update all stats with null checks
        const stats = {
            'stat-wave': serverStats.stats.highestWave || 0,
            'stat-kills': serverStats.stats.enemiesKilled || 0,
            'stat-deaths': serverStats.stats.deaths || 0,
            'stat-damage-dealt': serverStats.stats.damageDealt || 0,
            'stat-damage-taken': serverStats.stats.damageTaken || 0
        };

        Object.entries(stats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            } else {
                console.error(`Element not found: ${id}`);
            }
        });

        this.updateLeaderboardRank();
    }

    async updateLeaderboardRank() {
        try {
            const leaderboard = await fetch('/api/stats').then(r => r.json());
            const rank = leaderboard.findIndex(user => user.userId === this.userData.userId) + 1;
            const rankElement = document.querySelector('.rank');
            if (rankElement) {
                rankElement.textContent = `#${rank}`;
            }
        } catch (error) {
            console.error('Failed to update rank:', error);
        }
    }

    // Add error display method
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        document.querySelector('.profile-content').prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Initialize on load
window.addEventListener('load', () => new Profile()); 