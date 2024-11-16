class Game {
    constructor() {
        this.titleScreen = document.getElementById('title-screen');
        this.gameContainer = document.getElementById('game-container');
        this.player = document.getElementById('player');
        this.playButton = document.getElementById('play-button');
        
        this.playerPos = { x: 0, y: 0 };
        this.keys = {};
        this.speed = 5;
        this.isDashing = false;
        this.dashCooldown = false;
        this.mousePos = { x: 0, y: 0 };
        this.crosshair = document.querySelector('.crosshair');
        this.bullets = [];
        this.bulletSpeed = 15;
        this.canShoot = true;
        this.shootCooldown = 100;
        this.currentWave = 0;
        this.waveActive = false;
        this.enemiesRemaining = 0;
        this.enemies = [];
        this.enemiesContainer = document.querySelector('.enemies-container');
        this.waveOverlay = document.querySelector('.wave-overlay');
        this.maxAmmo = 30;
        this.currentAmmo = this.maxAmmo;
        this.isReloading = false;
        this.reloadTime = 1500;
        this.playerHealth = 100;
        this.maxPlayerHealth = 100;
        this.playerInvulnerable = false;
        this.invulnerabilityTime = 1000;

        this.ammoDisplay = document.querySelector('.current-ammo');
        this.healthBar = document.querySelector('.health-fill');
        this.healthText = document.querySelector('.health-text');
        this.playerStats = document.querySelector('.player-stats');

        this.damageOverlay = document.createElement('div');
        this.damageOverlay.className = 'damage-overlay';
        document.body.appendChild(this.damageOverlay);

        this.faceState = 'serious';
        this.faceTimeout = null;

        this.dashDuration = 200;
        this.dashTrails = [];

        this.previousPos = { x: 0, y: 0 };

        this.stats = new PlayerStats();
        
        this.totalDamageDealt = 0;
        this.totalDamageTaken = 0;
        this.bulletsFired = 0;
        this.enemiesKilled = 0;

        this.loginSection = document.querySelector('.login-section');
        this.loginWarning = document.getElementById('login-warning');
        
        this.checkLoginState();

        this.profileButton = document.querySelector('.profile-button');
        this.profileDropdown = document.querySelector('.profile-dropdown');
        this.logoutButton = document.getElementById('logout-button');
        
        this.initializeProfileButton();
        
        this.updateCrosshair();

        const discordLoginBtn = document.getElementById('discord-login');
        if (discordLoginBtn) {
            discordLoginBtn.addEventListener('click', () => {
                this.handleDiscordLogin();
            });
        }

        this.audio = new AudioManager();
        
        this.init();

        this.playButton = document.getElementById('play-button');
        if (this.playButton) {
            this.playButton.addEventListener('click', () => this.startGame());
        }

        this.setupModalCloseButtons();

        document.addEventListener('keydown', (e) => {
            if (this.stats.isLoggedIn) {
                if (e.key === 'p') this.showProfile();
                if (e.key === 'l') this.showLeaderboard();
            }
        });
    }

    init() {
        this.playerPos = {
            x: window.innerWidth / 2 - 25,
            y: window.innerHeight / 2 - 25
        };
        this.updatePlayerPosition();

        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.shoot();
            }
        });
        
        this.gameLoop();

        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'r') {
                this.reload();
            }
        });
        
        this.updateAmmoDisplay();
        this.updateHealthDisplay();
    }

    startGame() {
        if (!this.stats.isLoggedIn && this.loginWarning) {
            this.loginWarning.classList.remove('hidden');
            this.loginWarning.classList.add('show');
            
            setTimeout(() => {
                this.loginWarning.classList.remove('show');
                setTimeout(() => {
                    this.loginWarning.classList.add('hidden');
                }, 300);
            }, 5000);
        }

        this.audio.setGameActive(true);

        this.titleScreen.classList.add('slide-up');
        this.gameContainer.classList.remove('hidden');
        
        setTimeout(() => {
            this.gameContainer.classList.add('visible');
            this.initializeUI();
            if (this.playerStats) {
                this.playerStats.classList.add('show');
            }
            this.titleScreen.remove();
            this.startWave();
        }, 800);
    }

    startWave() {
        if (this.waveActive) return;
        
        this.currentWave++;
        this.waveActive = true;
        
        this.enemiesRemaining = this.currentWave === 1 ? 3 : Math.min(3 + Math.floor(this.currentWave * 1.5), 15);

        this.waveOverlay.querySelector('.wave-number').textContent = this.currentWave;
        this.waveOverlay.querySelector('.enemy-count span').textContent = this.enemiesRemaining;
        
        this.waveOverlay.classList.remove('hidden');
        this.waveOverlay.classList.add('show');

        setTimeout(() => {
            this.waveOverlay.classList.remove('show');
            this.waveOverlay.classList.add('hidden');
            this.spawnWaveEnemies();
        }, 3000);
    }

    spawnWaveEnemies() {
        if (this.enemiesRemaining <= 0) return;

        const spawnInterval = setInterval(() => {
            if (this.enemiesRemaining <= 0 || !this.waveActive) {
                clearInterval(spawnInterval);
                return;
            }

            this.spawnEnemy();
            this.enemiesRemaining--;

            if (this.enemiesRemaining === 0) {
                setTimeout(() => {
                    if (this.enemies.length === 0) {
                        this.waveActive = false;
                        this.startWave();
                    }
                }, 3000);
            }
        }, 1500);
    }

    handleKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;
        
        if (e.key.toLowerCase() === 'shift' && !this.dashCooldown) {
            const isMoving = this.keys['w'] || this.keys['s'] || this.keys['a'] || this.keys['d'] ||
                            this.keys['arrowup'] || this.keys['arrowdown'] || 
                            this.keys['arrowleft'] || this.keys['arrowright'];
            
            if (isMoving) {
                this.isDashing = true;
                this.dashCooldown = true;
                this.audio.play('dash');

                const trailInterval = setInterval(() => {
                    if (this.isDashing) {
                        this.createDashTrail();
                    } else {
                        clearInterval(trailInterval);
                    }
                }, 30);

                setTimeout(() => {
                    this.isDashing = false;
                    setTimeout(() => {
                        this.dashCooldown = false;
                    }, 1000);
                }, this.dashDuration);
            }
        }
    }

    handleKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }

    handleMouseMove(e) {
        this.mousePos.x = e.clientX;
        this.mousePos.y = e.clientY;
        
        if (this.crosshair) {
            this.crosshair.style.left = `${e.clientX}px`;
            this.crosshair.style.top = `${e.clientY}px`;
        }
        
        this.updateAiming();
    }

    updateAiming() {
        const playerCenterX = this.playerPos.x + 30;
        const playerCenterY = this.playerPos.y + 15;
        
        const angle = Math.atan2(
            this.mousePos.y - playerCenterY,
            this.mousePos.x - playerCenterX
        ) * (180 / Math.PI);

        const weapon = this.player.querySelector('.weapon');
        const gun = weapon.querySelector('.gun');
        
        if (weapon && gun) {
            const radius = 40;
            const gunX = Math.cos(angle * Math.PI / 180) * radius;
            const gunY = Math.sin(angle * Math.PI / 180) * radius;

            weapon.style.transform = `translate(${gunX}px, ${gunY}px)`;

            if (this.mousePos.x < playerCenterX) {
                weapon.classList.add('flip');
                gun.style.transform = `rotate(${angle}deg)`;
            } else {
                weapon.classList.remove('flip');
                gun.style.transform = `rotate(${angle}deg)`;
            }
        }

        const eyes = this.player.querySelectorAll('.eye');
        eyes.forEach(eye => {
            const eyeRect = eye.getBoundingClientRect();
            const eyeCenterX = eyeRect.left + eyeRect.width / 2;
            const eyeCenterY = eyeRect.top + eyeRect.height / 2;
            
            const deltaX = this.mousePos.x - eyeCenterX;
            const deltaY = this.mousePos.y - eyeCenterY;
            const distance = Math.min(2, Math.sqrt(deltaX * deltaX + deltaY * deltaY));
            const eyeAngle = Math.atan2(deltaY, deltaX);
            
            const moveX = Math.cos(eyeAngle) * distance;
            const moveY = Math.sin(eyeAngle) * distance;
            
            eye.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    }

    updatePlayerPosition() {
        this.player.style.transform = `translate(${this.playerPos.x}px, ${this.playerPos.y}px)`;
        this.updateAiming();
    }

    movePlayer() {
        this.previousPos = { ...this.playerPos };

        const currentSpeed = this.isDashing ? this.speed * 3 : this.speed;

        if (this.keys['w'] || this.keys['arrowup']) {
            this.playerPos.y = Math.max(0, this.playerPos.y - currentSpeed);
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.playerPos.y = Math.min(window.innerHeight - 50, this.playerPos.y + currentSpeed);
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.playerPos.x = Math.max(0, this.playerPos.x - currentSpeed);
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.playerPos.x = Math.min(window.innerWidth - 50, this.playerPos.x + currentSpeed);
        }

        this.updatePlayerPosition();
    }

    shoot() {
        if (!this.canShoot || 
            this.isReloading || 
            this.titleScreen.classList.contains('slide-up') === false) return;

        if (this.currentAmmo === 0) {
            const ammoCount = document.querySelector('.ammo-count');
            if (ammoCount) {
                ammoCount.classList.add('empty-flash');
                setTimeout(() => {
                    ammoCount.classList.remove('empty-flash');
                }, 500);
            }
            return;
        }

        const weapon = this.player.querySelector('.weapon');
        const barrelPoint = weapon.querySelector('.barrel-point');
        if (!weapon || !barrelPoint) return;

        const barrelRect = barrelPoint.getBoundingClientRect();
        const angle = Math.atan2(
            this.mousePos.y - barrelRect.top,
            this.mousePos.x - barrelRect.left
        );

        const bullet = document.createElement('div');
        bullet.className = 'bullet';
        this.gameContainer.appendChild(bullet);

        const bulletPos = {
            x: barrelRect.left,
            y: barrelRect.top,
            angle: angle
        };

        bullet.style.transform = `translate(${bulletPos.x}px, ${bulletPos.y}px) rotate(${angle * (180/Math.PI)}deg)`;

        this.bullets.push({
            element: bullet,
            pos: bulletPos
        });

        this.canShoot = false;
        setTimeout(() => {
            this.canShoot = true;
        }, this.shootCooldown);

        this.currentAmmo--;
        this.updateAmmoDisplay();
        this.bulletsFired++;
        this.stats.updateStats('bulletsFired', 1);
        this.audio.play('shoot');
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            bullet.pos.x += Math.cos(bullet.pos.angle) * this.bulletSpeed;
            bullet.pos.y += Math.sin(bullet.pos.angle) * this.bulletSpeed;
            
            bullet.element.style.transform = `translate(${bullet.pos.x}px, ${bullet.pos.y}px) rotate(${bullet.pos.angle * (180/Math.PI)}deg)`;

            if (
                bullet.pos.x < 0 ||
                bullet.pos.x > window.innerWidth ||
                bullet.pos.y < 0 ||
                bullet.pos.y > window.innerHeight
            ) {
                bullet.element.remove();
                this.bullets.splice(i, 1);
            }
        }
    }

    spawnEnemy() {
        const enemy = document.createElement('div');
        enemy.className = 'enemy';
        enemy.innerHTML = `
            <div class="health-bar">
                <div class="fill" style="width: 100%"></div>
            </div>
            <div class="face">
                <div class="eyes">
                    <div class="eye"></div>
                    <div class="eye"></div>
                </div>
                <img src="assets/faces/angry.png" alt="face" class="face-image">
            </div>
        `;

        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(side) {
            case 0:
                x = Math.random() * (window.innerWidth - 50);
                y = -50;
                break;
            case 1:
                x = window.innerWidth;
                y = Math.random() * (window.innerHeight - 50);
                break;
            case 2:
                x = Math.random() * (window.innerWidth - 50);
                y = window.innerHeight;
                break;
            case 3:
                x = -50;
                y = Math.random() * (window.innerHeight - 50);
                break;
        }

        const enemyData = {
            element: enemy,
            pos: { x, y },
            health: 100,
            maxHealth: 100,
            speed: 2
        };

        this.enemies.push(enemyData);
        this.enemiesContainer.appendChild(enemy);
        enemy.style.transform = `translate(${x}px, ${y}px)`;
    }

    updateEnemies() {
        if (!this.enemies) return;
        
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (!enemy || !enemy.pos) continue;
            
            const dx = this.playerPos.x - enemy.pos.x;
            const dy = this.playerPos.y - enemy.pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 40) {
                this.damagePlayer(10);
            }

            if (dist > 0) {
                enemy.pos.x += (dx / dist) * enemy.speed;
                enemy.pos.y += (dy / dist) * enemy.speed;
                enemy.element.style.transform = `translate(${enemy.pos.x}px, ${enemy.pos.y}px)`;
            }
        }

        if (this.waveActive && this.enemies.length === 0 && this.enemiesRemaining === 0) {
            this.waveActive = false;
            setTimeout(() => this.startWave(), 3000);
        }
    }

    updateEnemyEyes() {
        this.enemies.forEach(enemy => {
            const eyes = enemy.element.querySelectorAll('.eye');
            eyes.forEach(eye => {
                const eyeRect = eye.getBoundingClientRect();
                const eyeCenterX = eyeRect.left + eyeRect.width / 2;
                const eyeCenterY = eyeRect.top + eyeRect.height / 2;
                
                const playerCenterX = this.playerPos.x + 30;
                const playerCenterY = this.playerPos.y + 30;
                
                const deltaX = playerCenterX - eyeCenterX;
                const deltaY = playerCenterY - eyeCenterY;
                const distance = Math.min(2, Math.sqrt(deltaX * deltaX + deltaY * deltaY));
                const eyeAngle = Math.atan2(deltaY, deltaX);
                
                const moveX = Math.cos(eyeAngle) * distance;
                const moveY = Math.sin(eyeAngle) * distance;
                
                eye.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });
    }

    gameLoop() {
        this.movePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.updateEnemyEyes();
        this.checkBulletCollisions();
        requestAnimationFrame(() => this.gameLoop());
    }

    reload() {
        if (this.isReloading || this.currentAmmo === this.maxAmmo) return;
        
        this.isReloading = true;
        const ammoCount = document.querySelector('.ammo-count');
        if (ammoCount) {
            ammoCount.classList.add('reloading');
        }
        
        setTimeout(() => {
            this.currentAmmo = this.maxAmmo;
            this.isReloading = false;
            this.updateAmmoDisplay();
            if (ammoCount) {
                ammoCount.classList.remove('reloading');
            }
        }, this.reloadTime);
    }

    updateAmmoDisplay() {
        if (!this.ammoDisplay) return;
        
        this.ammoDisplay.textContent = this.currentAmmo;
        
        const ammoCount = document.querySelector('.ammo-count');
        if (ammoCount) {
            ammoCount.classList.remove('empty', 'low');
            
            if (this.currentAmmo === 0) {
                ammoCount.classList.add('empty');
            } else if (this.currentAmmo <= 10) {
                ammoCount.classList.add('low');
            }
        }
    }

    updateHealthDisplay() {
        this.healthBar.style.width = `${(this.playerHealth / this.maxPlayerHealth) * 100}%`;
        this.healthText.textContent = Math.ceil(this.playerHealth);
    }

    updateFace(state) {
        const mouthImage = this.player.querySelector('.mouth-image');
        mouthImage.src = `assets/faces/${state}.png`;
        this.faceState = state;
    }

    damagePlayer(damage) {
        if (this.playerInvulnerable) return;

        if (this.faceTimeout) {
            clearTimeout(this.faceTimeout);
        }

        this.playerHealth = Math.max(0, this.playerHealth - damage);
        this.updateHealthDisplay();

        this.updateFace('sad');

        this.gameContainer.classList.add('screen-shake');
        setTimeout(() => {
            this.gameContainer.classList.remove('screen-shake');
        }, 200);

        this.damageOverlay.classList.add('show');
        setTimeout(() => {
            this.damageOverlay.classList.remove('show');
            
            this.faceTimeout = setTimeout(() => {
                this.updateFace('angry');
            }, 5000);
        }, 200);

        this.playerInvulnerable = true;
        setTimeout(() => {
            this.playerInvulnerable = false;
        }, this.invulnerabilityTime);

        if (this.playerHealth <= 0) {
            this.gameOver();
        }
        this.totalDamageTaken += damage;
        this.stats.updateStats('damageTaken', damage);
        this.audio.play('damage');
    }

    checkBulletCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                const dx = bullet.pos.x - (enemy.pos.x + 25);
                const dy = bullet.pos.y - (enemy.pos.y + 25);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 30) {
                    enemy.health -= 25;
                    enemy.element.querySelector('.health-bar .fill').style.width = 
                        `${(enemy.health / enemy.maxHealth) * 100}%`;

                    if (enemy.health <= 0) {
                        enemy.element.remove();
                        this.enemies.splice(j, 1);
                        this.enemiesKilled++;
                        this.stats.updateStats('enemiesKilled', 1);
                    }

                    bullet.element.remove();
                    this.bullets.splice(i, 1);
                    this.totalDamageDealt += 25;
                    this.stats.updateStats('damageDealt', 25);
                    break;
                }
            }
        }
    }

    gameOver() {
        this.waveActive = false;
        this.gameActive = false;

        this.enemies.forEach(enemy => enemy.element.remove());
        this.enemies = [];
        this.bullets.forEach(bullet => bullet.element.remove());
        this.bullets = [];

        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over';
        gameOverScreen.innerHTML = `
            <h2>GAME OVER</h2>
            <p>You survived until Wave ${this.currentWave}</p>
            <button class="retry-button">Play Again</button>
        `;

        this.gameContainer.appendChild(gameOverScreen);
        const retryButton = gameOverScreen.querySelector('.retry-button');
        retryButton.addEventListener('click', () => location.reload());
        
        this.stats.updateStats('deaths', 1);
        
        if (this.currentWave > this.stats.stats.highestWave) {
            this.stats.stats.highestWave = this.currentWave;
            this.stats.saveStats();
        }
    }

    initializeUI() {
        this.ammoDisplay = document.querySelector('.current-ammo');
        this.healthBar = document.querySelector('.health-fill');
        this.healthText = document.querySelector('.health-text');
        this.playerStats = document.querySelector('.player-stats');
        this.waveOverlay = document.querySelector('.wave-overlay');
        this.enemiesContainer = document.querySelector('.enemies-container');
    }

    createDashTrail() {
        const trail = document.createElement('div');
        trail.className = 'dash-trail';
        trail.style.left = `${this.previousPos.x}px`;
        trail.style.top = `${this.previousPos.y}px`;
        this.gameContainer.appendChild(trail);

        setTimeout(() => {
            trail.remove();
        }, 300);
    }

    checkLoginState() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('logged_in') === 'true') {
            if (this.profileButton) {
                const avatarUrl = urlParams.get('avatar') || 'https://cdn.discord.com/embed/avatars/0.png';
                const profileImg = this.profileButton.querySelector('img');
                if (profileImg) {
                    profileImg.src = avatarUrl;
                }
                this.profileButton.classList.add('show');
            }

            const discordBtn = document.getElementById('discord-login');
            const orDivider = document.querySelector('.or-divider');
            const playAsGuest = document.getElementById('play-button');
            if (discordBtn) discordBtn.style.display = 'none';
            if (orDivider) orDivider.style.display = 'none';
            if (playAsGuest) {
                playAsGuest.textContent = 'PLAY';
                playAsGuest.style.marginTop = '0';
            }

            window.history.replaceState({}, document.title, '/');
        }
    }

    initializeProfileButton() {
        if (this.profileButton && this.stats.isLoggedIn) {
            this.profileDropdown.innerHTML = `
                <button class="view-profile">Profile</button>
                <button class="view-leaderboard">Leaderboard</button>
                <button class="about-btn">About</button>
                <button id="logout-button">Logout</button>
            `;
            
            const viewProfile = this.profileDropdown.querySelector('.view-profile');
            const viewLeaderboard = this.profileDropdown.querySelector('.view-leaderboard');
            
            viewProfile.addEventListener('click', () => {
                this.profileDropdown.classList.remove('show');
                this.showProfile();
            });
            
            viewLeaderboard.addEventListener('click', () => {
                this.profileDropdown.classList.remove('show');
                this.showLeaderboard();
            });
            
            this.profileButton.classList.add('show');
            
            this.profileButton.addEventListener('click', () => {
                this.profileDropdown.classList.toggle('show');
            });

            document.addEventListener('click', (e) => {
                if (!this.profileButton.contains(e.target)) {
                    this.profileDropdown.classList.remove('show');
                }
            });
        }
    }

    updateCrosshair() {
        const isHoverable = document.querySelectorAll('button, .discord-btn, .profile-button, .profile-dropdown button').length > 0;
        if (isHoverable) {
            this.crosshair.classList.add('hover');
        } else {
            this.crosshair.classList.remove('hover');
        }
    }

    handleDiscordLogin() {
        const CLIENT_ID = '1307079117438582944';
        const REDIRECT_URI = encodeURIComponent('https://cubeshooter.vercel.app/api/auth/callback');
        const SCOPES = 'identify email';
        
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES}`;
        
        window.location.href = authUrl;
    }

    setupModalCloseButtons() {
        const modals = document.querySelectorAll('.profile-modal, .leaderboard-modal');
        const closeButtons = document.querySelectorAll('.profile-modal .close-btn, .leaderboard-modal .close-btn');
        
        closeButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                modals[index].style.display = 'none';
                modals[index].classList.remove('show');
            });
        });

        // Close on outside click
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    modal.classList.remove('show');
                }
            });
        });
    }
}

window.addEventListener('load', () => {
    new Game();
}); 