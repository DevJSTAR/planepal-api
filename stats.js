class PlayerStats {
    constructor() {
        this.isLoggedIn = false;
        this.userId = null;
        this.stats = {
            highestWave: 0,
            enemiesKilled: 0,
            deaths: 0,
            damageDealt: 0,
            damageTaken: 0
        };
        
        this.checkLoginState();
    }

    async saveStats() {
        if (!this.isLoggedIn) return;

        try {
            // Get a new signature from the auth endpoint
            const authResponse = await fetch('/api/auth/signature', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: this.userId }),
                credentials: 'include'
            });
            
            if (!authResponse.ok) {
                throw new Error('Failed to get signature');
            }

            const { signature, timestamp } = await authResponse.json();

            // Use the signature to make the stats request
            const response = await fetch('/api/stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.userId,
                    username: this.username,
                    avatar: this.avatar,
                    stats: this.stats,
                    timestamp,
                    signature
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save stats');
            }
            
            const updatedStats = await response.json();
            this.stats = updatedStats.stats;
        } catch (error) {
            console.error('Failed to save stats:', error);
        }
    }
} 