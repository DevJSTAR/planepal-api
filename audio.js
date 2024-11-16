class AudioManager {
    constructor() {
        this.isMuted = localStorage.getItem('isMuted') === 'true';
        this.setupMuteButton();
    }

    setupMuteButton() {
        let muteBtn = document.querySelector('.mute-btn');
        if (!muteBtn) {
            muteBtn = document.createElement('button');
            muteBtn.className = 'mute-btn';
            muteBtn.innerHTML = `<i class="fas fa-volume-${this.isMuted ? 'mute' : 'up'}"></i>`;
            document.body.appendChild(muteBtn);
        }

        const muteIcon = muteBtn.querySelector('i');
        
        muteBtn.addEventListener('click', () => {
            this.isMuted = !this.isMuted;
            localStorage.setItem('isMuted', this.isMuted);
            
            if (this.isMuted) {
                muteIcon.classList.remove('fa-volume-up');
                muteIcon.classList.add('fa-volume-mute');
            } else {
                muteIcon.classList.remove('fa-volume-mute');
                muteIcon.classList.add('fa-volume-up');
            }
        });
    }

    play(soundName) {
        // Placeholder for sound effects
        if (this.isMuted) return;
    }

    setGameActive(active) {
        this.isGameActive = active;
    }

    mute() {
        this.isMuted = true;
        localStorage.setItem('isMuted', 'true');
    }

    unmute() {
        this.isMuted = false;
        localStorage.setItem('isMuted', 'false');
    }

    toggleMute() {
        if (this.isMuted) {
            this.unmute();
        } else {
            this.mute();
        }
    }
} 