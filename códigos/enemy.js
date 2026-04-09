// enemy.js - Enemy system for Solo Leveling RPG

class Enemy {
    constructor(type, level, x, y) {
        this.type = type;
        this.level = (typeof level === 'number' && !isNaN(level)) ? level : 1;
        this.x = x;
        this.y = y;

        // Set stats based on type and level
        const baseStats = this.getBaseStats(type);
        this.maxHP = baseStats.hp + (level * 20);
        this.currentHP = this.maxHP;
        this.attack = baseStats.attack + (level * 3);
        this.defense = baseStats.defense + (level * 2);
        this.speed = baseStats.speed;
        this.xpReward = Math.floor(baseStats.xp * level * 1.5);

        // AI state
        this.targetX = x;
        this.targetY = y;
        this.attackCooldown = 0;
        this.aggroRange = 200;
        this.attackRange = 50;

        // Loot
        this.lootTable = baseStats.lootTable;

        // Animation
        this.animationFrame = 0;
        this.animationTimer = 0;

        // Status
        this.isDead = false;
    }

    getBaseStats(type) {
        const stats = {
            // === TIER 1 ENEMIES (Rebalanced: -25% HP, -20% ATK) ===
            goblin: {
                hp: 60,
                attack: 32,
                defense: 4,
                speed: 2.5,
                xp: 22,
                lootTable: 'goblin',
                aiType: 'melee'
            },
            goblin_archer: {
                hp: 45,
                attack: 28,
                defense: 3,
                speed: 2,
                xp: 25,
                lootTable: 'goblin',
                aiType: 'ranged'
            },
            goblin_shaman: {
                hp: 40,
                attack: 35,
                defense: 2,
                speed: 1.8,
                xp: 30,
                lootTable: 'goblin',
                aiType: 'caster',
                special: 'poison'
            },
            skeleton: {
                hp: 80,
                attack: 24,
                defense: 3,
                speed: 2,
                xp: 28,
                lootTable: 'skeleton',
                aiType: 'melee'
            },
            skeleton_warrior: {
                hp: 105,
                attack: 34,
                defense: 7,
                speed: 2.3,
                xp: 35,
                lootTable: 'skeleton',
                aiType: 'melee'
            },
            bone_mage: {
                hp: 65,
                attack: 40,
                defense: 3,
                speed: 1.5,
                xp: 38,
                lootTable: 'skeleton',
                aiType: 'caster'
            },
            tombcrawler: {
                hp: 90,
                attack: 30,
                defense: 5,
                speed: 3,
                xp: 32,
                lootTable: 'undead',
                aiType: 'fast_melee'
            },
            wolf: {
                hp: 95,
                attack: 36,
                defense: 3,
                speed: 3.5,
                xp: 33,
                lootTable: 'wolf',
                aiType: 'fast_melee'
            },
            dire_wolf: {
                hp: 120,
                attack: 44,
                defense: 5,
                speed: 4,
                xp: 42,
                lootTable: 'wolf',
                aiType: 'fast_melee'
            },
            shadow_wolf: {
                hp: 100,
                attack: 48,
                defense: 4,
                speed: 4.5,
                xp: 45,
                lootTable: 'wolf',
                aiType: 'fast_melee'
            },
            wolf_matriarch: {
                hp: 140,
                attack: 40,
                defense: 6,
                speed: 3.8,
                xp: 50,
                lootTable: 'wolf',
                aiType: 'melee'
            },
            golem: {
                hp: 150,
                attack: 27,
                defense: 12,
                speed: 1,
                xp: 60,
                lootTable: 'golem',
                aiType: 'tank'
            },
            stone_golem: {
                hp: 185,
                attack: 32,
                defense: 16,
                speed: 0.8,
                xp: 75,
                lootTable: 'golem',
                aiType: 'tank'
            },
            obsidian_golem: {
                hp: 200,
                attack: 35,
                defense: 18,
                speed: 0.7,
                xp: 80,
                lootTable: 'golem',
                aiType: 'tank'
            },
            crystal_spider: {
                hp: 110,
                attack: 38,
                defense: 8,
                speed: 3.5,
                xp: 70,
                lootTable: 'golem',
                aiType: 'fast_melee'
            },

            // === TIER 2 ENEMIES (Rebalanced: -25% HP, -20% ATK) ===
            slime: {
                hp: 135,
                attack: 30,
                defense: 4,
                speed: 1.5,
                xp: 50,
                lootTable: 'slime',
                aiType: 'melee'
            },
            poison_slime: {
                hp: 150,
                attack: 36,
                defense: 6,
                speed: 1.8,
                xp: 65,
                lootTable: 'slime',
                aiType: 'melee',
                special: 'poison'
            },
            swamp_beast: {
                hp: 210,
                attack: 48,
                defense: 10,
                speed: 2.2,
                xp: 85,
                lootTable: 'beast',
                aiType: 'melee'
            },
            bog_lurker: {
                hp: 170,
                attack: 42,
                defense: 8,
                speed: 2.5,
                xp: 75,
                lootTable: 'beast',
                aiType: 'melee',
                special: 'poison'
            },
            toxic_hydra: {
                hp: 250,
                attack: 50,
                defense: 12,
                speed: 1.8,
                xp: 95,
                lootTable: 'beast',
                aiType: 'melee',
                special: 'poison'
            },
            dark_mage: {
                hp: 110,
                attack: 56,
                defense: 4,
                speed: 1.5,
                xp: 95,
                lootTable: 'mage',
                aiType: 'caster'
            },
            elemental: {
                hp: 150,
                attack: 52,
                defense: 6,
                speed: 2,
                xp: 90,
                lootTable: 'elemental',
                aiType: 'caster'
            },
            corrupted_golem: {
                hp: 260,
                attack: 44,
                defense: 20,
                speed: 1,
                xp: 110,
                lootTable: 'golem',
                aiType: 'tank'
            },
            arcane_construct: {
                hp: 200,
                attack: 55,
                defense: 15,
                speed: 1.5,
                xp: 100,
                lootTable: 'mage',
                aiType: 'caster'
            },
            spell_wraith: {
                hp: 130,
                attack: 60,
                defense: 5,
                speed: 2.5,
                xp: 105,
                lootTable: 'mage',
                aiType: 'caster'
            },
            orc_warrior: {
                hp: 240,
                attack: 60,
                defense: 12,
                speed: 2.5,
                xp: 120,
                lootTable: 'orc',
                aiType: 'melee'
            },
            orc_berserker: {
                hp: 210,
                attack: 76,
                defense: 8,
                speed: 3,
                xp: 130,
                lootTable: 'orc',
                aiType: 'berserker'
            },
            orc_shaman: {
                hp: 180,
                attack: 56,
                defense: 10,
                speed: 2,
                xp: 125,
                lootTable: 'orc',
                aiType: 'caster'
            },
            orc_champion: {
                hp: 280,
                attack: 70,
                defense: 16,
                speed: 2.3,
                xp: 140,
                lootTable: 'orc',
                aiType: 'elite'
            },
            war_drummer: {
                hp: 160,
                attack: 45,
                defense: 10,
                speed: 2,
                xp: 115,
                lootTable: 'orc',
                aiType: 'caster'
            },
            wraith: {
                hp: 185,
                attack: 68,
                defense: 6,
                speed: 3,
                xp: 140,
                lootTable: 'undead',
                aiType: 'fast_melee'
            },
            banshee: {
                hp: 165,
                attack: 64,
                defense: 5,
                speed: 2.5,
                xp: 145,
                lootTable: 'undead',
                aiType: 'caster'
            },
            death_knight: {
                hp: 335,
                attack: 80,
                defense: 20,
                speed: 2,
                xp: 180,
                lootTable: 'undead',
                aiType: 'elite'
            },
            bone_dragon_whelp: {
                hp: 280,
                attack: 72,
                defense: 15,
                speed: 3,
                xp: 170,
                lootTable: 'undead',
                aiType: 'flying'
            },
            soul_harvester: {
                hp: 220,
                attack: 78,
                defense: 10,
                speed: 2.5,
                xp: 175,
                lootTable: 'undead',
                aiType: 'caster'
            },

            // === TIER 3 ENEMIES (Rebalanced: -25% HP, -20% ATK) ===
            void_spawn: {
                hp: 260,
                attack: 76,
                defense: 12,
                speed: 2.8,
                xp: 200,
                lootTable: 'void',
                aiType: 'melee'
            },
            void_knight: {
                hp: 375,
                attack: 96,
                defense: 24,
                speed: 2.5,
                xp: 250,
                lootTable: 'void',
                aiType: 'elite'
            },
            corrupted_priest: {
                hp: 300,
                attack: 88,
                defense: 16,
                speed: 2,
                xp: 230,
                lootTable: 'demon',
                aiType: 'caster'
            },
            void_weaver: {
                hp: 280,
                attack: 85,
                defense: 14,
                speed: 2.5,
                xp: 220,
                lootTable: 'void',
                aiType: 'caster'
            },
            reality_breaker: {
                hp: 340,
                attack: 92,
                defense: 18,
                speed: 3,
                xp: 260,
                lootTable: 'void',
                aiType: 'elite'
            },
            dragon_whelp: {
                hp: 335,
                attack: 104,
                defense: 20,
                speed: 3,
                xp: 280,
                lootTable: 'dragon',
                aiType: 'flying'
            },
            dragonkin: {
                hp: 410,
                attack: 112,
                defense: 24,
                speed: 2.5,
                xp: 300,
                lootTable: 'dragon',
                aiType: 'elite'
            },
            fire_elemental: {
                hp: 300,
                attack: 100,
                defense: 12,
                speed: 2.5,
                xp: 270,
                lootTable: 'elemental',
                aiType: 'caster',
                special: 'burn'
            },
            elder_drake: {
                hp: 380,
                attack: 110,
                defense: 22,
                speed: 3.2,
                xp: 290,
                lootTable: 'dragon',
                aiType: 'flying'
            },
            magma_wyrm: {
                hp: 360,
                attack: 108,
                defense: 18,
                speed: 2.8,
                xp: 285,
                lootTable: 'dragon',
                aiType: 'melee',
                special: 'burn'
            },
            imp: {
                hp: 225,
                attack: 80,
                defense: 10,
                speed: 4,
                xp: 220,
                lootTable: 'demon',
                aiType: 'fast_melee'
            },
            demon_warrior: {
                hp: 450,
                attack: 120,
                defense: 28,
                speed: 2.5,
                xp: 350,
                lootTable: 'demon',
                aiType: 'elite'
            },
            hellhound: {
                hp: 360,
                attack: 108,
                defense: 16,
                speed: 4.5,
                xp: 310,
                lootTable: 'demon',
                aiType: 'fast_melee',
                special: 'burn'
            },
            succubus: {
                hp: 315,
                attack: 92,
                defense: 14,
                speed: 3,
                xp: 290,
                lootTable: 'demon',
                aiType: 'caster'
            },
            arch_demon: {
                hp: 420,
                attack: 115,
                defense: 25,
                speed: 2.8,
                xp: 340,
                lootTable: 'demon',
                aiType: 'elite'
            },
            infernal_golem: {
                hp: 500,
                attack: 100,
                defense: 35,
                speed: 1.2,
                xp: 330,
                lootTable: 'demon',
                aiType: 'tank',
                special: 'burn'
            },
            chaos_spawn: {
                hp: 490,
                attack: 128,
                defense: 24,
                speed: 3,
                xp: 400,
                lootTable: 'chaos',
                aiType: 'elite'
            },
            void_dragon: {
                hp: 600,
                attack: 144,
                defense: 32,
                speed: 3.5,
                xp: 500,
                lootTable: 'dragon',
                aiType: 'flying'
            },
            chaos_knight: {
                hp: 560,
                attack: 140,
                defense: 36,
                speed: 2.5,
                xp: 450,
                lootTable: 'chaos',
                aiType: 'elite'
            },
            corrupted_angel: {
                hp: 525,
                attack: 136,
                defense: 28,
                speed: 3.5,
                xp: 480,
                lootTable: 'chaos',
                aiType: 'flying'
            },
            chaos_weaver: {
                hp: 480,
                attack: 130,
                defense: 22,
                speed: 3,
                xp: 420,
                lootTable: 'chaos',
                aiType: 'caster'
            },
            void_archon: {
                hp: 550,
                attack: 145,
                defense: 30,
                speed: 2.8,
                xp: 470,
                lootTable: 'chaos',
                aiType: 'elite'
            },

            // === DUNGEON BOSSES (Rebalanced: -15% HP, -18% ATK) ===
            goblin_king: {
                hp: 425,
                attack: 66,
                defense: 22,
                speed: 2.5,
                xp: 350,
                lootTable: 'boss_goblin',
                aiType: 'boss',
                isBoss: true
            },
            lich: {
                hp: 595,
                attack: 74,
                defense: 17,
                speed: 1.5,
                xp: 550,
                lootTable: 'boss_undead',
                aiType: 'boss_caster',
                isBoss: true
            },
            alpha_wolf: {
                hp: 680,
                attack: 90,
                defense: 15,
                speed: 4,
                xp: 650,
                lootTable: 'boss_beast',
                aiType: 'boss',
                isBoss: true
            },
            crystal_golem: {
                hp: 1020,
                attack: 78,
                defense: 42,
                speed: 1,
                xp: 850,
                lootTable: 'boss_golem',
                aiType: 'boss_tank',
                isBoss: true
            },
            hydra: {
                hp: 1275,
                attack: 98,
                defense: 25,
                speed: 2,
                xp: 1200,
                lootTable: 'boss_beast',
                aiType: 'boss',
                isBoss: true,
                special: 'poison'
            },
            mad_archmage: {
                hp: 1105,
                attack: 123,
                defense: 21,
                speed: 2,
                xp: 1600,
                lootTable: 'boss_mage',
                aiType: 'boss_caster',
                isBoss: true
            },
            orc_warlord: {
                hp: 1700,
                attack: 115,
                defense: 34,
                speed: 2.5,
                xp: 2100,
                lootTable: 'boss_orc',
                aiType: 'boss',
                isBoss: true
            },
            undead_dragon: {
                hp: 2125,
                attack: 140,
                defense: 38,
                speed: 3,
                xp: 2800,
                lootTable: 'boss_dragon',
                aiType: 'boss_flying',
                isBoss: true
            },
            void_guardian: {
                hp: 2550,
                attack: 164,
                defense: 42,
                speed: 2.5,
                xp: 3800,
                lootTable: 'boss_void',
                aiType: 'boss',
                isBoss: true
            },
            elder_dragon: {
                hp: 2975,
                attack: 189,
                defense: 51,
                speed: 3.5,
                xp: 4800,
                lootTable: 'boss_dragon',
                aiType: 'boss_flying',
                isBoss: true,
                special: 'burn'
            },
            demon_lord: {
                hp: 3400,
                attack: 213,
                defense: 60,
                speed: 3,
                xp: 6000,
                lootTable: 'boss_demon',
                aiType: 'boss',
                isBoss: true
            },
            harbinger_of_chaos: {
                hp: 4250,
                attack: 246,
                defense: 68,
                speed: 3.5,
                xp: 10000,
                lootTable: 'boss_chaos',
                aiType: 'boss',
                isBoss: true
            },
            orc_boss: {
                hp: 1530,
                attack: 111,
                defense: 30,
                speed: 2,
                xp: 2000,
                lootTable: 'boss_orc',
                aiType: 'boss',
                isBoss: true
            },

            // === SECRET BOSSES (Very powerful, optional) ===
            goblin_overlord: {
                hp: 740,
                attack: 83,
                defense: 30,
                speed: 3,
                xp: 800,
                lootTable: 'secret_boss_1',
                aiType: 'boss',
                isBoss: true,
                isSecretBoss: true
            },
            lich_king: {
                hp: 1110,
                attack: 111,
                defense: 25,
                speed: 2,
                xp: 1200,
                lootTable: 'secret_boss_2',
                aiType: 'boss_caster',
                isBoss: true,
                isSecretBoss: true
            },
            fenrir: {
                hp: 1295,
                attack: 139,
                defense: 22,
                speed: 5,
                xp: 1500,
                lootTable: 'secret_boss_3',
                aiType: 'boss',
                isBoss: true,
                isSecretBoss: true
            },
            titan_golem: {
                hp: 1850,
                attack: 120,
                defense: 65,
                speed: 0.8,
                xp: 1800,
                lootTable: 'secret_boss_4',
                aiType: 'boss_tank',
                isBoss: true,
                isSecretBoss: true
            },
            swamp_colossus: {
                hp: 2035,
                attack: 148,
                defense: 35,
                speed: 1.5,
                xp: 2500,
                lootTable: 'secret_boss_5',
                aiType: 'boss',
                isBoss: true,
                isSecretBoss: true,
                special: 'poison'
            },
            chrono_wizard: {
                hp: 1665,
                attack: 185,
                defense: 28,
                speed: 3,
                xp: 3000,
                lootTable: 'secret_boss_6',
                aiType: 'boss_caster',
                isBoss: true,
                isSecretBoss: true
            },
            orc_god: {
                hp: 2775,
                attack: 167,
                defense: 50,
                speed: 2.5,
                xp: 4000,
                lootTable: 'secret_boss_7',
                aiType: 'boss',
                isBoss: true,
                isSecretBoss: true
            },
            death_emperor: {
                hp: 3238,
                attack: 194,
                defense: 55,
                speed: 2.8,
                xp: 5000,
                lootTable: 'secret_boss_8',
                aiType: 'boss',
                isBoss: true,
                isSecretBoss: true
            },
            void_titan: {
                hp: 3700,
                attack: 231,
                defense: 60,
                speed: 2.5,
                xp: 6500,
                lootTable: 'secret_boss_9',
                aiType: 'boss',
                isBoss: true,
                isSecretBoss: true
            },
            ancient_dragon_king: {
                hp: 4163,
                attack: 259,
                defense: 70,
                speed: 3.5,
                xp: 8000,
                lootTable: 'secret_boss_10',
                aiType: 'boss_flying',
                isBoss: true,
                isSecretBoss: true,
                special: 'burn'
            },
            demon_emperor: {
                hp: 5088,
                attack: 296,
                defense: 80,
                speed: 3,
                xp: 10000,
                lootTable: 'secret_boss_11',
                aiType: 'boss',
                isBoss: true,
                isSecretBoss: true
            },
            primordial_chaos: {
                hp: 6475,
                attack: 370,
                defense: 100,
                speed: 3.5,
                xp: 15000,
                lootTable: 'secret_boss_12',
                aiType: 'boss',
                isBoss: true,
                isSecretBoss: true
            }
        };

        return stats[type] || stats.goblin;
    }


    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.currentHP -= actualDamage;

        if (this.currentHP <= 0) {
            this.currentHP = 0;
            this.isDead = true;
        }

        return actualDamage;
    }

    update(deltaTime, player) {
        if (this.isDead) return;

        // Calculate distance to player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // AI behavior
        if (distance < this.aggroRange) {
            if (distance > this.attackRange) {
                // Move towards player
                const angle = Math.atan2(dy, dx);
                this.x += Math.cos(angle) * this.speed * deltaTime * 60;
                this.y += Math.sin(angle) * this.speed * deltaTime * 60;
            } else {
                // In attack range
                if (this.attackCooldown <= 0) {
                    this.attackPlayer(player);
                    this.attackCooldown = 1.5; // Attack every 1.5 seconds
                }
            }
        }

        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }

        // Update animation
        this.animationTimer += deltaTime;
        if (this.animationTimer >= 0.2) {
            this.animationFrame = (this.animationFrame + 1) % 3;
            this.animationTimer = 0;
        }
    }

    attackPlayer(player) {
        // This will be handled by combat system
        return this.attack;
    }

    getDrops() {
        // This will be handled by loot system
        return {
            xp: this.xpReward,
            lootTable: this.lootTable,
            level: this.level
        };
    }
}

// Enemy spawner
class EnemySpawner {
    constructor() {
        this.enemies = [];
        this.spawnTimer = 0;
        this.maxEnemies = 10;
    }

    spawnEnemy(type, level, x, y) {
        if (this.enemies.length < this.maxEnemies) {
            const enemy = new Enemy(type, level, x, y);
            this.enemies.push(enemy);
            return enemy;
        }
        return null;
    }

    spawnWave(level, count = 3, types = ['goblin', 'skeleton', 'wolf'], playerX, playerY) {
        // Clear existing enemies
        this.enemies = [];

        // Use player position as center, or fallback to canvas center
        const cx = playerX || 640;
        const cy = playerY || 360;

        // Spawn enemies around the player (300-700px away)
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const dist = 300 + Math.random() * 400;
            const x = cx + Math.cos(angle) * dist;
            const y = cy + Math.sin(angle) * dist;
            this.spawnEnemy(type, level, x, y);
        }
    }

    spawnBoss(playerLevel, bossType, playerX, playerY) {
        this.enemies = [];
        const cx = playerX || 640;
        const cy = playerY || 360;
        // Spawn boss 300px ahead of player
        this.spawnEnemy(bossType || 'orc_boss', playerLevel || 1, cx + 300, cy);
    }

    updateAll(deltaTime, player) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime, player);

            // Remove dead enemies (handled by loot system)
            if (enemy.isDead && enemy.deathTimer <= 0) {
                this.enemies.splice(i, 1);
            }
        }
    }

    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index !== -1) {
            this.enemies.splice(index, 1);
        }
    }

    clearAll() {
        this.enemies = [];
    }

    getAllEnemies() {
        return this.enemies;
    }

    getAliveCount() {
        return this.enemies.filter(e => !e.isDead).length;
    }
}
