// save_system.js - Manages saving and loading game state to/from localStorage

class SaveSystem {
    constructor(game) {
        this.game = game;
        this.saveKey = 'SL_RPG_SAVE_DATA';
    }

    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    deleteSave() {
        localStorage.removeItem(this.saveKey);
    }

    // Pack the game state into a JSON structured object
    serialize() {
        const player = this.game.player;
        if (!player) return null;

        // Collect essential player data
        const data = {
            version: '1.0',
            timestamp: Date.now(),
            player: {
                name: player.name,
                level: player.level,
                xp: player.xp,
                xpToNextLevel: player.xpToNextLevel,
                baseStats: { ...player.baseStats },
                statPoints: player.statPoints,
                currentHP: player.currentHP,
                currentMP: player.currentMP,
                x: player.x,
                y: player.y,
                currency: player.currency,
                playerClass: player.playerClass, // ID string like 'knight', 'mage'
                classEvolved: player.classEvolved,
                bossesDefeated: player.bossesDefeated,
                
                // Hotbar keys mapping to skill IDs
                hotbar: { ...player.hotbar }
            },
            
            // Equipment slot mapping to complete items
            equipment: { ...player.equipment },

            // Full inventory objects
            inventory: player.inventory.map(invSlot => ({
                count: invSlot.count,
                item: { ...invSlot.item }
            })),
            
            // System progress
            stages: {
                completedStages: [...this.game.stageSystem.completedStages]
            },
            
            // Skills unlocked and their levels (if SkillManager is used)
            skills: {}
        };

        // Save skill progression if active
        if (player.skillManager) {
            data.skills = {
                unlocks: { ...player.skillManager.unlockedSkills },
                points: player.skillManager.skillPoints
            };
        }

        return data;
    }

    saveGame(isAutoSave = false) {
        if (!this.game.player) return;

        try {
            const data = this.serialize();
            if (!data) return;

            // Simple Base64 encoding to prevent casual tweaking
            const jsonStr = JSON.stringify(data);
            const encoded = btoa(encodeURIComponent(jsonStr));
            localStorage.setItem(this.saveKey, encoded);

            if (this.game.ui) {
                const prefix = isAutoSave ? "Autosave" : "Jogo Salvo";
                this.game.ui.showNotification(`${prefix} com sucesso!`, 'success');
                this.game.ui.showSaveIndicator();
            }
            console.log(`[SaveSystem] Game saved successfully. Size: ${encoded.length} bytes`);
        } catch (e) {
            console.error('[SaveSystem] Failed to save game:', e);
            if (this.game.ui) {
                this.game.ui.showNotification("Erro ao salvar o jogo!", 'error');
            }
        }
    }

    loadGame() {
        try {
            const rawData = localStorage.getItem(this.saveKey);
            if (!rawData) {
                console.log("[SaveSystem] No save found.");
                return false;
            }

            const decoded = decodeURIComponent(atob(rawData));
            const data = JSON.parse(decoded);
            console.log("[SaveSystem] Save data loaded, ver:", data.version);

            // Reconstruct the game state
            this.deserialize(data);
            return true;
        } catch (e) {
            console.error('[SaveSystem] Corrupted save data or load failure:', e);
            alert("Falha ao carregar o seu save: Dados corrompidos.");
            return false;
        }
    }

    deserialize(data) {
        const player = this.game.player;
        const pData = data.player;

        // Name and resources
        this.game.playerName = pData.name;
        player.name = pData.name;
        player.level = pData.level;
        player.xp = pData.xp;
        player.xpToNextLevel = pData.xpToNextLevel;
        player.baseStats = { ...pData.baseStats };
        player.statPoints = pData.statPoints;
        player.currency = pData.currency || 0;
        
        // Positioning
        player.x = pData.x;
        player.y = pData.y;
        this.game.camera.centerOn(player.x, player.y);

        // Stage progress
        if (data.stages && data.stages.completedStages) {
            this.game.stageSystem.completedStages = [...data.stages.completedStages];
        }

        // Restoring Class
        player.bossesDefeated = pData.bossesDefeated || 0;
        player.classEvolved = pData.classEvolved || false;
        if (pData.playerClass) {
            // Reapply class via classSystem to ensure all multipliers map correctly
            this.game.classSystem.selectClass(player, pData.playerClass, true);
        }

        // Restoring Equipment
        player.equipmentStats = {
            força: 0, velocidade: 0, estamina: 0, hp: 0, mp: 0, sentidos: 0,
            inteligência: 0, constituição: 0, agilidade: 0, destreza: 0, sorte: 0
        };
        player.equipment = { weapon: null, helmet: null, chest: null, boots: null, ring: null, amulet: null };
        
        if (data.equipment) {
            for (let slot in data.equipment) {
                if (data.equipment[slot]) {
                    this.game.equipItem(data.equipment[slot]);
                }
            }
        }

        // Restoring Inventory
        player.inventory = [];
        if (data.inventory) {
            data.inventory.forEach(invSlot => {
                // Ensure deep copy of item properties to avoid ref issues
                const parsedItem = { ...invSlot.item };
                // Using internal add logic to respect stacks and capacity
                this.game.inventorySystem.loadItemRaw(player, parsedItem, invSlot.count);
            });
        }

        // Restore skills if applicable
        if (data.skills && player.skillManager) {
            player.skillManager.unlockedSkills = { ...data.skills.unlocks };
            player.skillManager.skillPoints = data.skills.points || 0;
        }

        // Restore Hotbar
        if (pData.hotbar) {
            player.hotbar = { ...pData.hotbar };
        }

        // Calculate maximums properly after stats have been assembled
        player.currentHP = pData.currentHP || player.getMaxHP();
        player.currentMP = pData.currentMP || player.getMaxMP();

        // Update all UI visually
        this.game.ui.updateAll(player);
        const nameDisplay = document.getElementById('player-name-display');
        if (nameDisplay) {
            nameDisplay.textContent = player.name;
        }
        const hudCurrency = document.getElementById('player-currency');
        if (hudCurrency) hudCurrency.textContent = player.currency;
    }
}
