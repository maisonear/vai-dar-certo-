// stages.js - Stage/dungeon system for Solo Leveling RPG

class StageSystem {
    constructor(game) {
        this.game = game;
        this.currentStage = null;
        this.completedStages = [];

        // Define stages - 12 DUNGEONS
        this.stages = {
            // === TIER 1 DUNGEONS (Level 1-10) ===
            1: {
                id: 1,
                name: 'Caverna dos Goblins',
                requiredLevel: 1,
                difficulty: 'FÃ¡cil',
                theme: 'goblin_cave',
                biome: 'cave',
                biome: 'goblin_cave',
                themeColors: { bg: '#1a2e1a', tile1: '#0d2b0d', tile2: '#132613', accent: '#2d6b2d' },
                backgroundImage: 'assets/goblin_cave_bg.png',
                description: 'Uma caverna infestada de goblins. O cheiro Ã© horrÃ­vel, alguÃ©m nÃ£o tomou banho.',
                waves: 5,
                enemiesPerWave: { min: 2, max: 4 },
                enemyTypes: ['goblin', 'goblin_archer', 'goblin_shaman'],
                bossType: 'goblin_king',
                bossEnabled: true,
                secretBoss: { type: 'goblin_overlord', chance: 0.15 },
                rewards: {
                    xpBonus: 100,
                    crystals: { min: 20, max: 50 },
                    itemChance: 0.3,
                    chestChance: 0.05
                }
            },
            2: {
                id: 2,
                name: 'CemitÃ©rio Assombrado',
                requiredLevel: 3,
                difficulty: 'FÃ¡cil',
                theme: 'graveyard',
                biome: 'graveyard',
                biome: 'graveyard',
                themeColors: { bg: '#1a1a2e', tile1: '#151528', tile2: '#1c1c30', accent: '#6b3fa0' },
                description: 'Mortos-vivos vagueiam entre as lÃ¡pides.',
                waves: 5,
                enemiesPerWave: { min: 3, max: 5 },
                enemyTypes: ['skeleton', 'skeleton_warrior', 'bone_mage', 'tombcrawler'],
                bossType: 'lich',
                bossEnabled: true,
                secretBoss: { type: 'lich_king', chance: 0.15 },
                rewards: {
                    xpBonus: 200,
                    crystals: { min: 40, max: 80 },
                    itemChance: 0.35,
                    chestChance: 0.08
                }
            },
            3: {
                id: 3,
                name: 'Covil dos Lobos',
                requiredLevel: 5,
                difficulty: 'Normal',
                theme: 'wolf_den',
                biome: 'wolf_den',
                biome: 'wolf_den',
                themeColors: { bg: '#2e1a0d', tile1: '#261508', tile2: '#301c10', accent: '#8b5e3c' },
                description: 'Lobos ferozes protegem seu territÃ³rio.',
                waves: 5,
                enemiesPerWave: { min: 3, max: 6 },
                enemyTypes: ['wolf', 'dire_wolf', 'shadow_wolf', 'wolf_matriarch'],
                bossType: 'alpha_wolf',
                bossEnabled: true,
                secretBoss: { type: 'fenrir', chance: 0.15 },
                rewards: {
                    xpBonus: 360,
                    crystals: { min: 60, max: 120 },
                    itemChance: 0.4,
                    chestChance: 0.10
                }
            },
            4: {
                id: 4,
                name: 'Mina Abandonada',
                requiredLevel: 7,
                difficulty: 'Normal',
                theme: 'mine',
                biome: 'cave',
                biome: 'mine',
                themeColors: { bg: '#1a1a1a', tile1: '#222222', tile2: '#1c1c1c', accent: '#5599cc' },
                description: 'Golens de pedra guardam os cristais da mina.',
                waves: 5,
                enemiesPerWave: { min: 2, max: 4 },
                enemyTypes: ['golem', 'stone_golem', 'obsidian_golem', 'crystal_spider'],
                bossType: 'crystal_golem',
                bossEnabled: true,
                secretBoss: { type: 'titan_golem', chance: 0.15 },
                rewards: {
                    xpBonus: 560,
                    crystals: { min: 100, max: 180 },
                    itemChance: 0.45,
                    chestChance: 0.12
                }
            },

            // === TIER 2 DUNGEONS (Level 10-20) ===
            5: {
                id: 5,
                name: 'PÃ¢ntano Venenoso',
                requiredLevel: 10,
                difficulty: 'DifÃ­cil',
                theme: 'swamp',
                biome: 'swamp',
                biome: 'swamp',
                themeColors: { bg: '#0d2e1a', tile1: '#0a2613', tile2: '#0f301a', accent: '#4dff4d' },
                description: 'Criaturas venenosas habitam Ã¡guas turvas.',
                waves: 5,
                enemiesPerWave: { min: 4, max: 7 },
                enemyTypes: ['slime', 'poison_slime', 'swamp_beast', 'bog_lurker', 'toxic_hydra'],
                bossType: 'hydra',
                bossEnabled: true,
                secretBoss: { type: 'swamp_colossus', chance: 0.15 },
                rewards: {
                    xpBonus: 900,
                    crystals: { min: 150, max: 250 },
                    itemChance: 0.5,
                    chestChance: 0.15
                }
            },
            6: {
                id: 6,
                name: 'Torre do Mago Louco',
                requiredLevel: 13,
                difficulty: 'DifÃ­cil',
                theme: 'mage_tower',
                biome: 'magic',
                biome: 'mage_tower',
                themeColors: { bg: '#0d1a2e', tile1: '#081528', tile2: '#101c30', accent: '#4d88ff' },
                description: 'Magia corrupta permeia o ar.',
                waves: 6,
                enemiesPerWave: { min: 3, max: 5 },
                enemyTypes: ['dark_mage', 'elemental', 'corrupted_golem', 'arcane_construct', 'spell_wraith'],
                bossType: 'mad_archmage',
                bossEnabled: true,
                secretBoss: { type: 'chrono_wizard', chance: 0.15 },
                rewards: {
                    xpBonus: 1300,
                    crystals: { min: 200, max: 350 },
                    itemChance: 0.55,
                    chestChance: 0.18
                }
            },
            7: {
                id: 7,
                name: 'Fortaleza Orc',
                requiredLevel: 16,
                difficulty: 'Muito DifÃ­cil',
                theme: 'orc_fortress',
                biome: 'wolf_den',
                biome: 'orc_fortress',
                themeColors: { bg: '#2e0d0d', tile1: '#280808', tile2: '#301010', accent: '#cc3333' },
                description: 'A fortaleza dos guerreiros orcs.',
                waves: 6,
                enemiesPerWave: { min: 4, max: 8 },
                enemyTypes: ['orc_warrior', 'orc_berserker', 'orc_shaman', 'orc_champion', 'war_drummer'],
                bossType: 'orc_warlord',
                bossEnabled: true,
                secretBoss: { type: 'orc_god', chance: 0.15 },
                rewards: {
                    xpBonus: 1800,
                    crystals: { min: 300, max: 500 },
                    itemChance: 0.6,
                    chestChance: 0.20
                }
            },
            8: {
                id: 8,
                name: 'Catacumbas Profundas',
                requiredLevel: 20,
                difficulty: 'Muito DifÃ­cil',
                theme: 'catacombs',
                biome: 'graveyard',
                biome: 'catacombs',
                themeColors: { bg: '#1a0d2e', tile1: '#150828', tile2: '#1c1030', accent: '#9933cc' },
                description: 'Antigos tÃºmulos de reis esquecidos.',
                waves: 7,
                enemiesPerWave: { min: 5, max: 9 },
                enemyTypes: ['wraith', 'banshee', 'death_knight', 'bone_dragon_whelp', 'soul_harvester'],
                bossType: 'undead_dragon',
                bossEnabled: true,
                secretBoss: { type: 'death_emperor', chance: 0.15 },
                rewards: {
                    xpBonus: 2400,
                    crystals: { min: 450, max: 700 },
                    itemChance: 0.65,
                    chestChance: 0.25
                }
            },

            // === TIER 3 DUNGEONS (Level 25-35) ===
            9: {
                id: 9,
                name: 'Templo do Vazio',
                requiredLevel: 25,
                difficulty: 'Extremo',
                theme: 'void_temple',
                biome: 'magic',
                biome: 'void_temple',
                themeColors: { bg: '#0d0d2e', tile1: '#080828', tile2: '#101030', accent: '#6633ff' },
                description: 'A realidade se distorce neste lugar profano.',
                waves: 7,
                enemiesPerWave: { min: 5, max: 10 },
                enemyTypes: ['void_spawn', 'void_knight', 'corrupted_priest', 'void_weaver', 'reality_breaker'],
                bossType: 'void_guardian',
                bossEnabled: true,
                secretBoss: { type: 'void_titan', chance: 0.15 },
                rewards: {
                    xpBonus: 3200,
                    crystals: { min: 600, max: 900 },
                    itemChance: 0.7,
                    chestChance: 0.30
                }
            },
            10: {
                id: 10,
                name: 'Montanha do DragÃ£o',
                requiredLevel: 28,
                difficulty: 'Extremo',
                theme: 'dragon_mountain',
                biome: 'cave',
                biome: 'dragon_mountain',
                themeColors: { bg: '#2e1a0d', tile1: '#301508', tile2: '#3a1c10', accent: '#ff6600' },
                description: 'DragÃµes menores e seus servos guardam o pico.',
                waves: 8,
                enemiesPerWave: { min: 4, max: 7 },
                enemyTypes: ['dragon_whelp', 'dragonkin', 'fire_elemental', 'elder_drake', 'magma_wyrm'],
                bossType: 'elder_dragon',
                bossEnabled: true,
                secretBoss: { type: 'ancient_dragon_king', chance: 0.15 },
                rewards: {
                    xpBonus: 4000,
                    crystals: { min: 800, max: 1200 },
                    itemChance: 0.75,
                    chestChance: 0.35
                }
            },
            11: {
                id: 11,
                name: 'Abismo DemonÃ­aco',
                requiredLevel: 32,
                difficulty: 'Pesadelo',
                theme: 'demon_abyss',
                biome: 'cave',
                biome: 'demon_abyss',
                themeColors: { bg: '#2e0000', tile1: '#280000', tile2: '#330505', accent: '#ff0000' },
                description: 'O portal para o inferno. Apenas os mais fortes sobrevivem.',
                waves: 8,
                enemiesPerWave: { min: 6, max: 12 },
                enemyTypes: ['imp', 'demon_warrior', 'hellhound', 'succubus', 'arch_demon', 'infernal_golem'],
                bossType: 'demon_lord',
                bossEnabled: true,
                secretBoss: { type: 'demon_emperor', chance: 0.15 },
                rewards: {
                    xpBonus: 5000,
                    crystals: { min: 1000, max: 1500 },
                    itemChance: 0.8,
                    chestChance: 0.40
                }
            },
            12: {
                id: 12,
                name: 'SantuÃ¡rio do Caos',
                requiredLevel: 35,
                difficulty: 'IMPOSSÃVEL',
                theme: 'chaos_sanctuary',
                biome: 'magic',
                biome: 'chaos_sanctuary',
                themeColors: { bg: '#0a0a0a', tile1: '#050505', tile2: '#0f0f0f', accent: '#ff00ff' },
                description: 'O fim de tudo. O caos em forma pura.',
                waves: 10,
                enemiesPerWave: { min: 8, max: 15 },
                enemyTypes: ['chaos_spawn', 'void_dragon', 'chaos_knight', 'corrupted_angel', 'chaos_weaver', 'void_archon'],
                bossType: 'harbinger_of_chaos',
                bossEnabled: true,
                secretBoss: { type: 'primordial_chaos', chance: 0.15 },
                rewards: {
                    xpBonus: 10000,
                    crystals: { min: 2000, max: 3000 },
                    itemChance: 0.9,
                    chestChance: 0.50,
                    guaranteedLegendary: true
                }
            }
        };


        this.currentWave = 0;
        this.waveClearDelay = 0;
        this.stageComplete = false;
        this.secretRoomTriggered = false;
        this.inSecretRoom = false;
        this.mainBossDefeated = false; // Secret boss only spawns after main boss
    }

    // Start a stage
    startStage(stageId, player) {
        const stage = this.stages[stageId];

        if (!stage) return false;

        // Check level requirement
        if (player.level < stage.requiredLevel) {
            if (this.game.ui) {
                this.game.ui.showNotification(`NÃ­vel ${stage.requiredLevel} necessÃ¡rio!`, 'warning');
            }
            return false;
        }

        this.currentStage = stage;
        this.currentWave = 0;
        this.stageComplete = false;
        this.secretRoomTriggered = false;
        this.inSecretRoom = false;
        this.mainBossDefeated = false;

        // Clear existing enemies and loot
        if (this.game.enemySpawner) {
            this.game.enemySpawner.clearAll();
        }
        if (this.game.lootSystem) {
            this.game.lootSystem.clearAll();
        }

        // Trocar bioma do tilemap para o da dungeon
        if (this.game.world) {
            const biomeId = stage.biome || stage.theme || 'cave';
            this.game.world.setBiome(biomeId);
        }

        // Start first wave
        this.spawnNextWave(player);

        if (this.game.ui) {
            this.game.ui.showNotification(`Dungeon: ${stage.name} - InÃ­cio!`, 'stage');
        }

        return true;
    }

    // Spawn next wave
    spawnNextWave(player) {
        if (!this.currentStage) return;

        this.currentWave++;

        if (this.currentWave > this.currentStage.waves) {
            // All waves done, spawn boss
            this.spawnBoss(player);
            return;
        }



        // Spawn enemies
        if (this.game.enemySpawner) {
            const min = this.currentStage.enemiesPerWave.min;
            const max = this.currentStage.enemiesPerWave.max;
            const count = Math.floor(Math.random() * (max - min + 1)) + min;
            const level = this.currentStage.level || this.currentStage.requiredLevel || 1;

            this.game.enemySpawner.spawnWave(level, count, this.currentStage.enemyTypes);
        }

        if (this.game.ui) {
            this.game.ui.showNotification(`Onda ${this.currentWave}/${this.currentStage.waves}`, 'wave');
        }
    }

    // Trigger secret room â€” only callable AFTER main boss is defeated
    triggerSecretRoom(player) {
        if (!this.mainBossDefeated) return; // Guard: never before main boss
        this.inSecretRoom = true;
        this.secretRoomTriggered = true;

        if (this.game.ui) {
            this.game.ui.showNotification('ðŸ‘ï¸ BOSS SECRETO DA DUNGEON DETECTADO! Prepare-se...', 'boss');
        }

        // Short delay before spawning secret boss
        setTimeout(() => {
            this.spawnSecretBoss(player);
        }, 2500);
    }

    // Spawn secret boss
    spawnSecretBoss(player) {
        if (!this.currentStage || !this.currentStage.secretBoss) return;

        const level = this.currentStage.level || this.currentStage.requiredLevel || 1;

        if (this.game.enemySpawner) {
            this.game.enemySpawner.clearAll();
            this.game.enemySpawner.spawnBoss(level, this.currentStage.secretBoss.type);
        }

        if (this.game.ui) {
            this.game.ui.showNotification('ðŸ‘ï¸ BOSS SECRETO APARECEU! ðŸ‘ï¸', 'boss');
        }
    }

    // Complete secret room â€” finish stage after defeating the secret boss
    completeSecretRoom(player) {
        this.inSecretRoom = false;

        if (this.game.ui) {
            this.game.ui.showNotification('ðŸ† BOSS SECRETO DERROTADO! Recompensa Ã‰pica! ðŸ†', 'stage-complete');
        }

        // Secret boss loot is handled by the enemy loot system on death.
        // After defeating secret boss the dungeon is fully cleared â€” return to town.
        setTimeout(() => {
            this.returnToTown();
        }, 4000);
    }

    // Spawn boss
    spawnBoss(player) {
        if (!this.currentStage || !this.currentStage.bossType) return;

        const level = this.currentStage.level || this.currentStage.requiredLevel || 1;

        if (this.game.enemySpawner) {
            this.game.enemySpawner.spawnBoss(level, this.currentStage.bossType);
        }

        if (this.game.ui) {
            this.game.ui.showNotification('ðŸ’€ BOSS APARECEU! ðŸ’€', 'boss');
        }
    }

    // Complete stage
    completeStage(player) {
        if (!this.currentStage || this.stageComplete) return;

        this.stageComplete = true;

        // Mark as completed
        if (!this.completedStages.includes(this.currentStage.id)) {
            this.completedStages.push(this.currentStage.id);
        }

        // Grant rewards
        const isFirstClear = this.completedStages.filter(s => s === this.currentStage.id).length === 1;

        // XP bonus
        player.gainXP(this.currentStage.rewards.xpBonus);

        // Guaranteed items
        if (isFirstClear && this.currentStage.rewards.guaranteedItems) {
            this.currentStage.rewards.guaranteedItems.forEach(itemId => {
                const item = createRandomItem(itemId, this.currentStage.level);
                if (item && this.game.inventorySystem) {
                    this.game.inventorySystem.addItem(player, item);
                }
            });
        }

        // Random loot
        if (this.game.lootSystem) {
            const rewards = this.game.lootSystem.generateStageRewards(
                this.currentStage.level || this.currentStage.requiredLevel,
                isFirstClear
            );
            rewards.forEach(item => {
                if (this.game.inventorySystem) {
                    this.game.inventorySystem.addItem(player, item);
                }
            });
        }

        // Mark main boss as defeated â€” enables secret boss possibility
        this.mainBossDefeated = true;

        // Show completion notification
        if (this.game.ui) {
            this.game.ui.showNotification(
                `âœ… Dungeon ${this.currentStage.name} COMPLETO! +${this.currentStage.rewards.xpBonus} XP`,
                'stage-complete'
            );
        }

        // 30% chance to trigger secret boss AFTER main boss defeat
        const hasSecretBoss = this.currentStage.secretBoss && !this.secretRoomTriggered;
        if (hasSecretBoss && Math.random() < 0.30) {
            setTimeout(() => {
                this.triggerSecretRoom(player);
            }, 3000);
        } else {
            // No secret boss â€” return to town
            setTimeout(() => {
                this.returnToTown();
            }, 5000);
        }
    }

    // Return to town (also used by escape scroll)
    returnToTown() {
        this.currentStage = null;
        this.currentWave = 0;
        this.inSecretRoom = false;

        // Clear enemies and loot
        if (this.game.enemySpawner) {
            this.game.enemySpawner.clearAll();
        }

        // Voltar para bioma overworld
        if (this.game.world) {
            this.game.world.setBiome('overworld');
        }

        if (this.game.ui) {
            this.game.ui.toggleStagePanel();
        }

        // Auto-save game when returning to town
        if (this.game.saveSystem) {
            this.game.saveSystem.saveGame(true);
        }
    }

    // Escape from dungeon (via escape scroll)
    escapeDungeon() {
        if (!this.currentStage) return false;

        if (this.game.ui) {
            this.game.ui.showNotification('ðŸ“œ Pergaminho de Fuga ativado! Saindo da Dungeon...', 'success');
        }

        setTimeout(() => {
            this.returnToTown();
        }, 1500);

        return true;
    }

    // Update stage system
    update(deltaTime, player) {
        if (!this.currentStage || this.stageComplete) return;

        // Check if wave is cleared
        if (this.game.enemySpawner) {
            const aliveCount = this.game.enemySpawner.getAliveCount();

            if (aliveCount === 0) {
                if (this.waveClearDelay <= 0) {
                    this.waveClearDelay = 3; // 3 second delay between waves
                } else {
                    this.waveClearDelay -= deltaTime;

                    if (this.waveClearDelay <= 0) {
                        if (this.inSecretRoom) {
                            // Secret boss defeated
                            this.completeSecretRoom(player);
                        } else if (this.currentWave > this.currentStage.waves && this.mainBossDefeated) {
                            // Main boss already defeated â€” this shouldn't normally be reached,
                            // but handle gracefully
                            this.returnToTown();
                        } else if (this.currentWave > this.currentStage.waves) {
                            // All waves done + boss was just defeated
                            this.completeStage(player);
                        } else {
                            this.spawnNextWave(player);
                        }
                        this.waveClearDelay = 0;
                    }
                }
            }
        }
    }

    // Get available stages for player level
    getAvailableStages(playerLevel) {
        const available = [];

        for (let stageId in this.stages) {
            const stage = this.stages[stageId];
            if (playerLevel >= stage.requiredLevel) {
                available.push({
                    ...stage,
                    completed: this.completedStages.includes(stage.id)
                });
            }
        }

        return available;
    }

    // Check if in active stage
    isInStage() {
        return this.currentStage !== null && !this.stageComplete;
    }

    // Get current theme colors
    getCurrentThemeColors() {
        if (this.currentStage && this.currentStage.themeColors) {
            return this.currentStage.themeColors;
        }
        return null;
    }
}

