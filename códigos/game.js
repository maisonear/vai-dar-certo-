// game.js - Main game loop and initialization for Solo Leveling RPG

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.renderer = new Renderer(this.canvas);

        // Game systems
        this.player = null;
        this.enemySpawner = new EnemySpawner();
        this.combatSystem = new CombatSystem(this);
        this.combat = this.combatSystem;
        this.inventorySystem = new InventorySystem(this);
        this.lootSystem = new LootSystem(this);
        this.stageSystem = new StageSystem(this);
        this.classSystem = new ClassSystem(this);
        this.currencyManager = new CurrencyManager();
        this.shop = new Shop(this);
        this.ui = new UISystem(this);
        this.cutsceneManager = new CutsceneManager();
        this.saveSystem = new SaveSystem(this);

        // Camera & World
        this.camera = new Camera(this.canvas.width, this.canvas.height);
        this.world = new ChunkManager();

        // Input handling
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseDown = false;

        // Game state
        this.isPaused = false;
        this.cutscenePlaying = true;
        this.playerName = 'Caçador';
        this.lastTime = 0;
        this.deltaTime = 0;
    }

    init() {
        // Initialize cutscene manager
        this.cutsceneManager.init();

        // Setup input listeners
        this.setupInput();

        if (this.saveSystem.hasSave()) {
            this.showSaveSelection();
        } else {
            // Show name selection screen first
            this.showNameSelection();
        }
    }

    showSaveSelection() {
        const saveScreen = document.getElementById('save-selection-screen');
        const loadBtn = document.getElementById('load-game-btn');
        const newGameBtn = document.getElementById('new-game-btn');

        if (!saveScreen || !loadBtn || !newGameBtn) {
            this.showNameSelection();
            return;
        }

        saveScreen.classList.remove('hidden');

        // Remove old listeners by recreating buttons if needed, or simply assign onclick
        loadBtn.onclick = () => {
            saveScreen.classList.add('hidden');
            
            // Bypass cutscene entirely
            this.cutscenePlaying = false;
            
            // Reconstruct minimal player to be populated
            this.player = new Player();
            this.player.world = this.world;

            if (this.saveSystem.loadGame()) {
                this.lastTime = performance.now();
                this.gameLoop();
                this.ui.showNotification("Jogo carregado!", "success");
            } else {
                // If load fails, fallback to new game
                this.showNameSelection();
            }
        };

        newGameBtn.onclick = () => {
            if (confirm("Isto apagará seu progresso atual permanentemente. Tem certeza?")) {
                this.saveSystem.deleteSave();
                saveScreen.classList.add('hidden');
                this.showNameSelection();
            }
        };
    }

    showNameSelection() {
        const nameScreen = document.getElementById('name-selection-screen');
        const nameInput = document.getElementById('player-name-input');
        const nameConfirmBtn = document.getElementById('name-confirm-btn');
        const nameError = document.getElementById('name-error');

        if (!nameScreen || !nameInput || !nameConfirmBtn) {
            // Fallback: skip to cutscene if elements don't exist
            this.cutsceneManager.start();
            return;
        }

        nameScreen.classList.remove('hidden');
        nameInput.focus();

        const confirmName = () => {
            const name = nameInput.value.trim();
            
            const showError = (msg) => {
                nameError.textContent = msg;
                nameError.style.display = 'block';
                nameError.classList.remove('ns-error-shake');
                void nameError.offsetWidth; // trigger reflow to reset animation
                nameError.classList.add('ns-error-shake');
            };

            if (name.length === 0) {
                showError('Digite um nome!');
                return;
            }
            if (name.length > 15) {
                showError('Máximo 15 caracteres!');
                return;
            }
            this.playerName = name;
            nameScreen.classList.add('hidden');
            document.getElementById('player-name-display').textContent = name;
            this.cutsceneManager.start();
        };

        nameConfirmBtn.addEventListener('click', confirmName);
        nameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') confirmName();
        });
    }

    onCutsceneComplete() {
        this.cutscenePlaying = false;

        // Initialize player
        this.player = new Player();
        this.player.x = 256;
        this.player.y = 256;
        this.player.world = this.world;

        // Center camera on player immediately
        this.camera.centerOn(this.player.x, this.player.y);

        // Give starting equipment
        const starterWeapon = getItem('rusty_dagger');
        const starterArmor = getItem('leather_armor');

        this.inventorySystem.addItem(this.player, starterWeapon);
        this.inventorySystem.addItem(this.player, starterArmor);

        // Add some potions
        for (let i = 0; i < 5; i++) {
            this.inventorySystem.addItem(this.player, getItem('health_potion'));
        }
        for (let i = 0; i < 3; i++) {
            this.inventorySystem.addItem(this.player, getItem('mana_potion'));
        }

        // Set player name
        this.player.name = this.playerName;
        this.player.currency = 0;
        document.getElementById('player-name-display').textContent = this.playerName;

        // Initialize shop
        this.shop.generateInventory(this.player.level);

        // Update UI
        this.ui.updateAll(this.player);

        // Show welcome notification
        this.ui.showNotification('Sistema ativado! Distribua seus pontos de atributo.', 'level-up');

        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();
    }

    setupInput() {
        // Keyboard input
        window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;

            // Hotkeys
            if (e.key === 'i' || e.key === 'I') {
                this.ui.toggleInventory();
            }
            if (e.key === 'c' || e.key === 'C') {
                this.ui.toggleStatsPanel();
            }
            if (e.key === 'g' || e.key === 'G') {
                this.ui.toggleStagePanel();
            }
            if (e.key === 'b' || e.key === 'B') {
                this.ui.toggleSkillsPanel();
            }
            if (e.key === 'Tab') {
                e.preventDefault();
                this.ui.toggleShop();
            }
            if (e.key === 'p' || e.key === 'P') {
                if (this.isPaused) {
                    this.resume();
                } else {
                    this.pause();
                }
            }
            if (e.key === 'Escape') {
                // Close all panels
                this.ui.statsPanel.classList.add('hidden');
                this.ui.inventoryPanel.classList.add('hidden');
                this.ui.stagePanel.classList.add('hidden');
                this.ui.skillsPanel.classList.add('hidden');
                const shopPanel = document.getElementById('shop-panel');
                if (shopPanel) shopPanel.classList.add('hidden');
                const shopPreview = document.getElementById('shop-item-preview');
                if (shopPreview) shopPreview.classList.add('hidden');
            }

            // Skill Hotkeys (1-9 and 0)
            if (['1','2','3','4','5','6','7','8','9','0'].includes(key)) {
                if (this.player && this.player.hotbar[key]) {
                    // Check if skill is activated
                    if (this.player.activatedSkills[key]) {
                        this.combatSystem.useSkill(this.player, this.player.hotbar[key], this.enemySpawner.getAllEnemies());
                        this.ui.highlightHotbarSlot(key);
                    } else {
                        this.ui.showNotification('Habilidade não ativada! Ative-a na HUD.', 'warning');
                    }
                }
            }

            // Potion Hotkeys
            if (key === 'q') { // Weakest HP potion
                this.usePotion('weakest');
                this.ui.highlightHotbarSlot('q');
            }
            if (e.key === 'l' || e.key === 'L') { // Mana potion
                e.preventDefault();
                this.useManaPotion();
                this.ui.highlightHotbarSlot('l');
            }
            if (key === 'k') { // Strongest HP potion
                this.usePotion('strongest');
                this.ui.highlightHotbarSlot('k');
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Mouse input
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const screenX = (e.clientX - rect.left) * scaleX;
            const screenY = (e.clientY - rect.top) * scaleY;
            // Convert screen coords to world coords
            if (this.camera) {
                const world = this.camera.screenToWorld(screenX, screenY);
                this.mouseX = world.x;
                this.mouseY = world.y;
            } else {
                this.mouseX = screenX;
                this.mouseY = screenY;
            }
        });

        this.canvas.addEventListener('mousedown', (e) => {
            this.mouseDown = true;

            // Attack on click
            if (!this.cutscenePlaying && this.player) {
                this.handleAttack();
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });
    }

    // Potion usage logic
    usePotion(type) {
        if (!this.player) return;

        // Find all health potions
        const potions = this.player.inventory.filter(item =>
            item.item.type === 'consumable' && item.item.effect && item.item.effect.healHP
        );

        if (potions.length === 0) {
            this.ui.showNotification('Sem poções!', 'warning');
            return;
        }

        // Sort by heal amount
        potions.sort((a, b) => a.item.effect.healHP - b.item.effect.healHP);

        let selectedPotion = null;
        if (type === 'weakest') {
            selectedPotion = potions[0];
        } else {
            selectedPotion = potions[potions.length - 1]; // Strongest
        }

        if (selectedPotion) {
            this.inventorySystem.useConsumable(this.player, selectedPotion.item.id);
            this.ui.showNotification(`Usou ${selectedPotion.item.name}`, 'success');
            this.ui.updateHotbar(this.player);
            this.ui.updateBars(this.player);
            this.ui.updateInventoryDisplay(this.player);
        }
    }

    // Mana potion usage logic (L key)
    useManaPotion() {
        if (!this.player) return;

        // Find all mana potions
        const potions = this.player.inventory.filter(item =>
            item.item.type === 'consumable' && item.item.effect && item.item.effect.healMP
        );

        if (potions.length === 0) {
            this.ui.showNotification('Sem poções de mana!', 'warning');
            return;
        }

        // Sort by heal amount and pick weakest first
        potions.sort((a, b) => a.item.effect.healMP - b.item.effect.healMP);
        const selectedPotion = potions[0];

        if (selectedPotion) {
            this.inventorySystem.useConsumable(this.player, selectedPotion.item.id);
            this.ui.showNotification(`Usou ${selectedPotion.item.name}`, 'success');
            this.ui.updateHotbar(this.player);
            this.ui.updateBars(this.player);
            this.ui.updateInventoryDisplay(this.player);
        }
    }

    // Pause / Resume
    pause() {
        this.isPaused = true;
        const pauseMenu = document.getElementById('pause-menu');
        if (pauseMenu) pauseMenu.classList.remove('hidden');
    }

    resume() {
        this.isPaused = false;
        const pauseMenu = document.getElementById('pause-menu');
        if (pauseMenu) pauseMenu.classList.add('hidden');
    }

    handleInput() {
        if (!this.player || this.cutscenePlaying) return;

        const speed = this.player.getMoveSpeed();

        // Reset velocity
        this.player.velocityX = 0;
        this.player.velocityY = 0;

        // WASD movement
        if (this.keys['w'] || this.keys['arrowup']) {
            this.player.velocityY = -speed;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.player.velocityY = speed;
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.player.velocityX = -speed;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.player.velocityX = speed;
        }

        // Space to attack nearest enemy
        if (this.keys[' ']) {
            this.handleAttack();
        }
    }

    handleAttack() {
        if (!this.player) return;

        const enemies = this.enemySpawner.getAllEnemies();

        // Find nearest enemy
        let nearestEnemy = null;
        let nearestDist = Infinity;

        enemies.forEach(enemy => {
            if (enemy.isDead) return;

            const dx = enemy.x - this.player.x;
            const dy = enemy.y - this.player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = enemy;
            }
        });

        // Attack nearest enemy
        if (nearestEnemy) {
            this.combatSystem.playerAttack(this.player, nearestEnemy);
        }
    }

    update() {
        if (this.isPaused || this.cutscenePlaying) return;

        // Handle input
        this.handleInput();

        // Update player
        this.player.update(this.deltaTime);

        // Update enemies
        this.enemySpawner.updateAll(this.deltaTime, this.player);

        // Update combat
        this.combatSystem.update(this.deltaTime, this.player, this.enemySpawner.getAllEnemies());

        // Update loot
        this.lootSystem.update(this.deltaTime, this.player);

        // Update stage system
        this.stageSystem.update(this.deltaTime, this.player);

        // Update camera to follow player
        if (this.camera && this.player) {
            this.camera.follow(this.player, this.deltaTime);
        }

        // Update shop rotation timer
        if (this.shop) {
            this.shop.update(this.deltaTime);
        }

        // Update currency display
        const hudCurrency = document.getElementById('player-currency');
        if (hudCurrency) hudCurrency.textContent = this.player.currency || 0;

        // Update UI
        this.ui.updateBars(this.player);
    }

    render() {
        this.renderer.render(this);
    }

    gameLoop(currentTime = 0) {
        // Calculate delta time
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Cap delta time to prevent large jumps
        this.deltaTime = Math.min(this.deltaTime, 0.1);

        // Update and render
        this.update();
        this.render();

        // Continue loop
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    // Respawn player on death
    respawnPlayer() {
        if (!this.player) return;

        // Respawn at town center
        this.player.x = 256;
        this.player.y = 256;

        // Center camera immediately
        if (this.camera) {
            this.camera.centerOn(this.player.x, this.player.y);
        }

        // Restore HP/MP
        this.player.currentHP = this.player.getMaxHP();
        this.player.currentMP = this.player.getMaxMP();

        // Clear stage
        this.stageSystem.returnToTown();

        this.ui.showNotification('Você morreu! Retornando à cidade...', 'warning');
    }

    // Helper functions for UI callbacks
    addPlayerStat(statName) {
        if (this.player) {
            this.player.addStat(statName);
            this.ui.updateStatsDisplay(this.player);
            this.ui.updateBars(this.player);
        }
    }

    equipItem(item) {
        if (this.player) {
            this.inventorySystem.equipItem(this.player, item);
        }
    }

    unequipItem(slot) {
        if (this.player) {
            this.inventorySystem.unequipItem(this.player, slot);
        }
    }

    useConsumable(itemId) {
        if (this.player) {
            const result = this.player.useItem(itemId);
            if (result === 'escape') {
                // Escape scroll - exit dungeon
                this.stageSystem.escapeDungeon();
                this.ui.updateInventoryDisplay(this.player);
            } else if (result) {
                this.ui.updateBars(this.player);
                this.ui.updateInventoryDisplay(this.player);
            }
        }
    }

    // Handle class selection
    selectClass(classId) {
        if (this.player && this.classSystem) {
            // Validation happens inside classSystem.selectClass
            this.classSystem.selectClass(this.player, classId);
        }
    }

    startStage(stageId) {
        if (this.player) {
            this.stageSystem.startStage(stageId, this.player);
        }
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    window.game = new Game();
    game.init();
});
