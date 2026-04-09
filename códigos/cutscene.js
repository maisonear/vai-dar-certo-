// cutscene.js - Intro cutscene system for Solo Leveling RPG

class CutsceneManager {
    constructor() {
        this.scenes = [
            {
                text: "Você está em uma masmorra de baixo nível...",
                duration: 3000
            },
            {
                text: "Uma porta misteriosa aparece diante de você.",
                duration: 3000
            },
            {
                text: "Você entra... e se encontra em uma sala estranha.",
                duration: 3500
            },
            {
                text: "Estátuas gigantes te observam em silêncio...",
                duration: 3500
            },
            {
                text: "De repente, as estátuas começam a se mover!",
                duration: 3000,
                effect: 'shake'
            },
            {
                text: "Você está à beira da morte...",
                duration: 3000
            },
            {
                text: "Quando tudo parece perdido...",
                duration: 3000
            },
            {
                text: "Uma mensagem aparece diante de você:",
                duration: 3000,
                effect: 'flash'
            },
            {
                text: '"Você foi selecionado."',
                duration: 3500
            },
            {
                text: '"Deseja se tornar um Jogador?"',
                duration: 3500
            },
            {
                text: '[SIM] / NÃO',
                duration: 2000
            },
            {
                text: '"Bem-vindo ao SISTEMA."',
                duration: 3000,
                effect: 'flash'
            },
            {
                text: 'Você recebeu o poder de evoluir!',
                duration: 3000
            },
            {
                text: 'Ganhe XP, suba de nível e se torne o mais forte!',
                duration: 3500
            },
            {
                text: 'A jornada começa agora...',
                duration: 3000
            }
        ];

        this.currentScene = 0;
        this.isPlaying = false;
        this.container = null;
        this.textElement = null;
        this.autoPlayTimeout = null;
    }

    init() {
        this.container = document.getElementById('cutscene-container');
        this.textElement = document.getElementById('cutscene-text');

        const continueBtn = document.getElementById('cutscene-continue');
        const skipBtn = document.getElementById('cutscene-skip');

        // Remove old listeners if any, then add new (safe init)
        continueBtn.onclick = () => this.nextScene();
        skipBtn.onclick = () => this.skip();

        // Keyboard handler
        this.handleInput = (e) => {
            if (!this.isPlaying) return;
            
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.nextScene();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.skip();
            }
        };

        window.addEventListener('keydown', this.handleInput);
    }

    start() {
        this.isPlaying = true;
        this.currentScene = 0;
        
        this.container.style.display = 'flex';
        // Force reflow
        void this.container.offsetWidth; 
        this.container.classList.add('cutscene-active');
        
        this.showScene(0);
    }

    showScene(index) {
        if (index >= this.scenes.length) {
            this.end();
            return;
        }

        const scene = this.scenes[index];
        this.textElement.textContent = scene.text;

        // Apply effects
        if (scene.effect === 'shake') {
            this.shakeScreen();
        } else if (scene.effect === 'flash') {
            this.flashScreen();
        }

        // Auto-advance to next scene
        if (this.autoPlayTimeout) {
            clearTimeout(this.autoPlayTimeout);
        }

        this.autoPlayTimeout = setTimeout(() => {
            this.nextScene();
        }, scene.duration);
    }

    nextScene() {
        if (!this.isPlaying) return;

        this.currentScene++;
        this.showScene(this.currentScene);
    }

    skip() {
        if (this.autoPlayTimeout) {
            clearTimeout(this.autoPlayTimeout);
        }
        this.end();
    }

    end() {
        if (!this.isPlaying) return; // Prevent double calls

        this.isPlaying = false;
        
        // Hide container properly
        this.container.classList.remove('cutscene-active');
        this.container.style.display = 'none';

        if (this.autoPlayTimeout) {
            clearTimeout(this.autoPlayTimeout);
        }

        // Notify game that cutscene is complete
        if (window.game) {
            setTimeout(() => {
                window.game.onCutsceneComplete();
            }, 500);
        }
    }

    shakeScreen() {
        const gameContainer = document.getElementById('game-container');
        gameContainer.style.animation = 'shake 0.5s';
        setTimeout(() => {
            gameContainer.style.animation = '';
        }, 500);
    }

    flashScreen() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(139, 92, 246, 0.8);
            pointer-events: none;
            z-index: 999;
            animation: flashEffect 0.5s ease-out;
        `;

        document.getElementById('cutscene-container').appendChild(flash);

        setTimeout(() => {
            flash.remove();
        }, 500);
    }
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translate(0, 0); }
        10%, 30%, 50%, 70%, 90% { transform: translate(-10px, 0); }
        20%, 40%, 60%, 80% { transform: translate(10px, 0); }
    }
    
    @keyframes flashEffect {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
    }
`;
document.head.appendChild(style);
