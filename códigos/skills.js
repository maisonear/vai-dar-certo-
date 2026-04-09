// skills.js - Skill system for Solo Leveling RPG

// Base Skill class
class Skill {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;
        this.type = config.type; // 'active' or 'passive'
        this.category = config.category; // 'attack', 'defense', 'mobility', 'utility'
        this.manaCost = config.manaCost || 0;
        this.cooldown = config.cooldown || 0; // in seconds
        this.cooldownRemaining = 0;
        this.level = config.level || 1;
        this.maxLevel = config.maxLevel || 5;
        this.icon = config.icon || '⚔️';
        this.isPassive = config.type === 'passive';
        this.targetType = config.targetType || 'enemy'; // 'enemy', 'self', 'area'
        this.range = config.range || 100;
        this.execute = config.execute; // Function to execute skill
        this.passive = config.passive; // Passive effect function
    }

    canUse(player) {
        if (this.cooldownRemaining > 0) return false;
        if (player.currentMP < this.manaCost) return false;
        return true;
    }

    use(player, target, game) {
        if (!this.canUse(player)) return false;

        // Consume mana
        player.currentMP -= this.manaCost;

        // Execute skill
        if (this.execute) {
            this.execute(player, target, game);
        }

        // Start cooldown
        this.cooldownRemaining = this.cooldown;

        return true;
    }

    update(deltaTime) {
        if (this.cooldownRemaining > 0) {
            this.cooldownRemaining = Math.max(0, this.cooldownRemaining - deltaTime);
        }
    }

    levelUp() {
        if (this.level < this.maxLevel) {
            this.level++;
            return true;
        }
        return false;
    }
}

// Active Skills Definitions
const ActiveSkills = {
    // === ATTACK SKILLS ===
    SLASH_COMBO: {
        id: 'slash_combo',
        name: 'Combo de Cortes',
        description: 'Realiza 3 cortes rápidos, cada um causando 60% de dano.',
        type: 'active',
        category: 'attack',
        manaCost: 20,
        cooldown: 8,
        icon: '⚔️',
        targetType: 'enemy',
        range: 100,
        execute: (player, target, game) => {
            if (!target || !Array.isArray(target)) target = [target];

            const baseDamage = player.getAttackPower() * 0.6;

            // Find closest enemy
            const enemy = target.find(e => e && !e.isDead);
            if (enemy) {
                // Perform 3 hits with small delay
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        const damage = baseDamage * (1 + player.level * 0.05);
                        const actualDamage = enemy.takeDamage(damage);
                        game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);

                        if (enemy.isDead) {
                            game.combat.onEnemyDeath(player, enemy);
                        }
                    }, i * 200);
                }
            }
        }
    },

    SHADOW_STRIKE: {
        id: 'shadow_strike',
        name: 'Golpe das Sombras',
        description: 'Teleporta atrás do inimigo e causa 200% de dano crítico.',
        type: 'active',
        category: 'attack',
        manaCost: 35,
        cooldown: 12,
        icon: '🌑',
        targetType: 'enemy',
        range: 200,
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => !e.isDead) : target;
            if (!enemy) return;

            // Teleport behind enemy
            const oldX = player.x;
            const oldY = player.y;
            player.x = enemy.x + 30;
            player.y = enemy.y;

            // Deal damage
            const damage = player.getAttackPower() * 2;
            const actualDamage = enemy.takeDamage(damage);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);

            if (enemy.isDead) {
                game.combat.onEnemyDeath(player, enemy);
            }
        }
    },

    BLADE_STORM: {
        id: 'blade_storm',
        name: 'Tempestade de Lâminas',
        description: 'Gira causando 150% de dano em área.',
        type: 'active',
        category: 'attack',
        manaCost: 40,
        cooldown: 15,
        icon: '🌪️',
        targetType: 'area',
        range: 150,
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = player.getAttackPower() * 1.5;

            enemies.forEach(enemy => {
                if (enemy.isDead) return;

                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= 150) {
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);

                    if (enemy.isDead) {
                        game.combat.onEnemyDeath(player, enemy);
                    }
                }
            });
        }
    },

    DRAGONS_FURY: {
        id: 'dragons_fury',
        name: 'Fúria do Dragão',
        description: 'Libera uma onda de energia que causa 300% de dano e aplica queimadura.',
        type: 'active',
        category: 'attack',
        manaCost: 60,
        cooldown: 20,
        icon: '🐉',
        targetType: 'area',
        range: 250,
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = player.getAttackPower() * 3;

            enemies.forEach(enemy => {
                if (enemy.isDead) return;

                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance <= 250) {
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);

                    // Apply burn effect
                    if (game.effectManager) {
                        const burnEffect = createEffect('BURN', { source: player.id });
                        game.effectManager.applyEffect(enemy.id, burnEffect);
                    }

                    if (enemy.isDead) {
                        game.combat.onEnemyDeath(player, enemy);
                    }
                }
            });
        }
    },

    // === DEFENSE SKILLS ===
    IRON_WALL: {
        id: 'iron_wall',
        name: 'Muralha de Ferro',
        description: 'Concede um escudo que absorve 200 de dano por 8 segundos.',
        type: 'active',
        category: 'defense',
        manaCost: 30,
        cooldown: 18,
        icon: '🛡️',
        targetType: 'self',
        execute: (player, target, game) => {
            if (game.effectManager) {
                const shieldEffect = createEffect('SHIELD', {
                    source: player.id,
                    value: 200 + player.level * 20
                });
                game.effectManager.applyEffect(player.id, shieldEffect);
                game.ui.showNotification('Escudo ativado!', 'buff');
            }
        }
    },

    COUNTER_STANCE: {
        id: 'counter_stance',
        name: 'Postura de Contra-ataque',
        description: 'Próximo ataque recebido é refletido em 150%.',
        type: 'active',
        category: 'defense',
        manaCost: 25,
        cooldown: 12,
        icon: '⚡',
        targetType: 'self',
        execute: (player, target, game) => {
            player.counterActive = true;
            player.counterDamageMultiplier = 1.5;

            setTimeout(() => {
                player.counterActive = false;
            }, 3000);

            game.ui.showNotification('Contra-ataque pronto!', 'buff');
        }
    },

    // === MOBILITY SKILLS ===
    DASH: {
        id: 'dash',
        name: 'Arrancada',
        description: 'Dá um dash rápido na direção do movimento.',
        type: 'active',
        category: 'mobility',
        manaCost: 15,
        cooldown: 6,
        icon: '💨',
        targetType: 'self',
        execute: (player, target, game) => {
            const dashDistance = 150;
            const keys = game.keys || {};

            let dx = 0, dy = 0;
            if (keys['w'] || keys['W'] || keys['arrowup']) dy -= 1;
            if (keys['s'] || keys['S'] || keys['arrowdown']) dy += 1;
            if (keys['a'] || keys['A'] || keys['arrowleft']) dx -= 1;
            if (keys['d'] || keys['D'] || keys['arrowright']) dx += 1;

            // Normalize
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            if (magnitude > 0) {
                dx /= magnitude;
                dy /= magnitude;
            } else {
                dx = 1; // Default to right
            }

            player.x += dx * dashDistance;
            player.y += dy * dashDistance;

            // Clamp to canvas bounds
            player.x = Math.max(32, Math.min(1888, player.x));
            player.y = Math.max(32, Math.min(1048, player.y));
        }
    },

    BLINK: {
        id: 'blink',
        name: 'Teleporte',
        description: 'Teleporta para uma posição próxima instantaneamente.',
        type: 'active',
        category: 'mobility',
        manaCost: 25,
        cooldown: 10,
        icon: '✨',
        targetType: 'self',
        execute: (player, target, game) => {
            // Teleport to random nearby position
            const angle = Math.random() * Math.PI * 2;
            const distance = 200;

            player.x += Math.cos(angle) * distance;
            player.y += Math.sin(angle) * distance;

            // Clamp to canvas bounds
            player.x = Math.max(32, Math.min(1888, player.x));
            player.y = Math.max(32, Math.min(1048, player.y));

            // Brief invulnerability
            if (game.effectManager) {
                const invulnEffect = createEffect('INVULNERABLE', { source: player.id });
                game.effectManager.applyEffect(player.id, invulnEffect);
            }
        }
    },

    // === UTILITY SKILLS ===
    BATTLE_MEDITATION: {
        id: 'battle_meditation',
        name: 'Meditação de Batalha',
        description: 'Regenera 10 MP/s por 5 segundos.',
        type: 'active',
        category: 'utility',
        manaCost: 0,
        cooldown: 30,
        icon: '🧘',
        targetType: 'self',
        execute: (player, target, game) => {
            let ticks = 0;
            const interval = setInterval(() => {
                player.currentMP = Math.min(player.getMaxMP(), player.currentMP + 10);
                ticks++;

                if (ticks >= 5) {
                    clearInterval(interval);
                }
            }, 1000);

            game.ui.showNotification('Meditando...', 'buff');
        }
    },

    TIME_DISTORTION: {
        id: 'time_distortion',
        name: 'Distorção Temporal',
        description: 'Reduz todos os cooldowns em 50%.',
        type: 'active',
        category: 'utility',
        manaCost: 50,
        cooldown: 60,
        icon: '⏰',
        targetType: 'self',
        execute: (player, target, game) => {
            if (player.skillManager) {
                player.skillManager.skills.forEach(skill => {
                    skill.cooldownRemaining *= 0.5;
                });
            }
            game.ui.showNotification('Tempo distorcido!', 'buff');
        }
    },

    // === NOVAS HABILIDADES ATIVAS ===
    SEISMIC_SLASH: {
        id: 'seismic_slash',
        name: 'Corte Sísmico',
        description: 'Golpe poderoso que libera uma onda de impacto. Causa 85 + 60% da força. 30% de chance de derrubar por 2s.',
        type: 'active',
        category: 'attack',
        manaCost: 18,
        cooldown: 6,
        icon: '🌍',
        targetType: 'area',
        range: 180,
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const baseDamage = 85 + player.getStat('força') * 0.6;

            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 180) {
                    const actualDamage = enemy.takeDamage(baseDamage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);

                    // 30% chance de derrubar
                    if (Math.random() < 0.3 && game.effectManager) {
                        const knockdown = createEffect('KNOCKDOWN', { source: player.id });
                        game.effectManager.applyEffect(enemy.id, knockdown);
                        game.combat.showDamageNumber(enemy.x, enemy.y - 40, 'DERRUBADO!', 'debuff', false);
                    }

                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
            game.ui.showNotification('Corte Sísmico! 🌍', 'skill');
        }
    },

    SPIRIT_LANCE: {
        id: 'spirit_lance',
        name: 'Lança Espiritual',
        description: 'Lança de energia que causa 110 + 75% da inteligência. Atravessa até 2 inimigos. 15% de sangramento mágico.',
        type: 'active',
        category: 'attack',
        manaCost: 22,
        cooldown: 10,
        icon: '🔱',
        targetType: 'area',
        range: 250,
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const baseDamage = 110 + player.getStat('inteligência') * 0.75;

            // Pegar os 2 inimigos mais próximos
            const sorted = enemies.filter(e => !e.isDead).map(enemy => {
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                return { enemy, dist: Math.sqrt(dx * dx + dy * dy) };
            }).filter(e => e.dist <= 250).sort((a, b) => a.dist - b.dist).slice(0, 2);

            sorted.forEach(({ enemy }) => {
                const actualDamage = enemy.takeDamage(baseDamage);
                game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);

                // 15% chance de sangramento mágico
                if (Math.random() < 0.15 && game.effectManager) {
                    const bleed = createEffect('MAGIC_BLEED', { source: player.id });
                    game.effectManager.applyEffect(enemy.id, bleed);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 40, 'SANGRAMENTO!', 'debuff', false);
                }

                if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
            });
            game.ui.showNotification('Lança Espiritual! 🔱', 'skill');
        }
    },

    RAPID_BLADE_STORM: {
        id: 'rapid_blade_storm',
        name: 'Tempestade de Lâminas Rápida',
        description: 'Gira atacando inimigos próximos durante 3s. 35 de dano por golpe. Pode causar 200+ de dano total.',
        type: 'active',
        category: 'attack',
        manaCost: 28,
        cooldown: 14,
        icon: '⚔️',
        targetType: 'area',
        range: 120,
        execute: (player, target, game) => {
            const damagePerHit = 35;
            const totalHits = 6; // 6 golpes em 3s

            for (let i = 0; i < totalHits; i++) {
                setTimeout(() => {
                    const enemies = game.enemySpawner ? game.enemySpawner.getAllEnemies() : (Array.isArray(target) ? target : [target]);
                    enemies.forEach(enemy => {
                        if (!enemy || enemy.isDead) return;
                        const dx = enemy.x - player.x;
                        const dy = enemy.y - player.y;
                        if (Math.sqrt(dx * dx + dy * dy) <= 120) {
                            const actualDamage = enemy.takeDamage(damagePerHit);
                            game.combat.showDamageNumber(enemy.x, enemy.y - 20 - i * 5, actualDamage, 'enemy', false);
                            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                        }
                    });
                }, i * 500); // 1 golpe a cada 0.5s
            }
            game.ui.showNotification('Tempestade de Lâminas! ⚔️', 'skill');
        }
    },

    INFERNAL_FLAME: {
        id: 'infernal_flame',
        name: 'Chama Infernal',
        description: 'Círculo de fogo no chão por 6s. 40 de dano/s. 20% de chance de queimar.',
        type: 'active',
        category: 'attack',
        manaCost: 30,
        cooldown: 18,
        icon: '🔥',
        targetType: 'area',
        range: 150,
        execute: (player, target, game) => {
            const flameX = player.x;
            const flameY = player.y;
            const damagePerSecond = 40;
            let ticks = 0;

            const interval = setInterval(() => {
                const enemies = game.enemySpawner ? game.enemySpawner.getAllEnemies() : (Array.isArray(target) ? target : [target]);
                enemies.forEach(enemy => {
                    if (!enemy || enemy.isDead) return;
                    const dx = enemy.x - flameX;
                    const dy = enemy.y - flameY;
                    if (Math.sqrt(dx * dx + dy * dy) <= 150) {
                        const actualDamage = enemy.takeDamage(damagePerSecond);
                        game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', false);

                        // 20% chance de queimar
                        if (Math.random() < 0.2 && game.effectManager) {
                            const burn = createEffect('BURN', { source: player.id });
                            game.effectManager.applyEffect(enemy.id, burn);
                        }

                        if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                    }
                });

                ticks++;
                if (ticks >= 6) clearInterval(interval);
            }, 1000);
            game.ui.showNotification('Chama Infernal! 🔥', 'skill');
        }
    },

    PHANTOM_CHAIN: {
        id: 'phantom_chain',
        name: 'Corrente Fantasma',
        description: 'Lança correntes espirituais que puxam um inimigo. 70 + 50% inteligência de dano. Imobiliza 1.5s.',
        type: 'active',
        category: 'attack',
        manaCost: 16,
        cooldown: 10,
        icon: '⛓️',
        targetType: 'enemy',
        range: 300,
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => e && !e.isDead) : target;
            if (!enemy) return;

            const baseDamage = 70 + player.getStat('inteligência') * 0.5;
            const actualDamage = enemy.takeDamage(baseDamage);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);

            // Puxar inimigo para perto do player
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 50) {
                enemy.x = player.x - (dx / dist) * 50;
                enemy.y = player.y - (dy / dist) * 50;
            }

            // Imobilizar por 1.5s
            if (game.effectManager) {
                const immobilize = createEffect('IMMOBILIZE', { source: player.id });
                game.effectManager.applyEffect(enemy.id, immobilize);
                game.combat.showDamageNumber(enemy.x, enemy.y - 40, 'PRESO!', 'debuff', false);
            }

            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
            game.ui.showNotification('Corrente Fantasma! ⛓️', 'skill');
        }
    },

    TITANIC_IMPACT: {
        id: 'titanic_impact',
        name: 'Impacto Titânico',
        description: 'Salta e causa explosão no chão. 120 + 70% força de dano. Atordoa por 2s.',
        type: 'active',
        category: 'attack',
        manaCost: 35,
        cooldown: 16,
        icon: '💪',
        targetType: 'area',
        range: 200,
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const baseDamage = 120 + player.getStat('força') * 0.7;

            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 200) {
                    const actualDamage = enemy.takeDamage(baseDamage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);

                    // Atordoar por 2s
                    if (game.effectManager) {
                        const stun = createEffect('STUN', { source: player.id, duration: 2 });
                        game.effectManager.applyEffect(enemy.id, stun);
                        game.combat.showDamageNumber(enemy.x, enemy.y - 40, 'STUN!', 'debuff', false);
                    }

                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
            game.ui.showNotification('Impacto Titânico! 💪', 'skill');
        }
    },

    ABYSSAL_DOMINION: {
        id: 'abyssal_dominion',
        name: 'Domínio Abissal',
        description: 'ULTRA RARA - +40% dano, +20% roubo de vida, dano sombrio extra por 8s. Custo: 50 MP.',
        type: 'active',
        category: 'utility',
        manaCost: 50,
        cooldown: 45,
        icon: '👿',
        targetType: 'self',
        execute: (player, target, game) => {
            // +40% dano por 8s
            player.addBuff('strength', 0.4, 8);

            // +20% roubo de vida por 8s
            player.addBuff('lifeSteal', 0.2, 8);

            // Dano sombrio extra
            if (game.effectManager) {
                const shadow = createEffect('SHADOW_DAMAGE', { source: player.id });
                game.effectManager.applyEffect(player.id, shadow);
            }

            game.ui.showNotification('⚠️ DOMÍNIO ABISSAL ATIVADO! 👿', 'level-up');
        }
    },

    // ==================== HABILIDADES ÚNICAS ====================
    SOLAR_EXPLOSION: {
        id: 'solar_explosion',
        name: 'Explosão Solar',
        description: 'Esfera de energia solar que explode ao atingir. 140 + 80% inteligência. Queimadura 6s.',
        type: 'active',
        category: 'attack',
        manaCost: 30,
        cooldown: 12,
        icon: '☀️',
        targetType: 'enemy',
        range: 250,
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => e && !e.isDead) : target;
            if (!enemy) return;
            const damage = 140 + player.getStat('inteligência') * 0.8;
            const actualDamage = enemy.takeDamage(damage);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
            if (game.effectManager) {
                const burn = createEffect('BURN', { source: player.id, duration: 6 });
                game.effectManager.applyEffect(enemy.id, burn);
            }
            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
            game.ui.showNotification('Explosão Solar! ☀️', 'skill');
        }
    },

    BEAST_STRIKE: {
        id: 'beast_strike',
        name: 'Golpe da Fera',
        description: 'Ataque brutal. 120 + 90% força. 20% chance de sangramento.',
        type: 'active',
        category: 'attack',
        manaCost: 20,
        cooldown: 8,
        icon: '🐾',
        targetType: 'enemy',
        range: 100,
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => e && !e.isDead) : target;
            if (!enemy) return;
            const damage = 120 + player.getStat('força') * 0.9;
            const actualDamage = enemy.takeDamage(damage);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
            if (Math.random() < 0.2 && game.effectManager) {
                const bleed = createEffect('BLEED', { source: player.id });
                game.effectManager.applyEffect(enemy.id, bleed);
                game.combat.showDamageNumber(enemy.x, enemy.y - 40, 'SANGRAMENTO!', 'debuff', false);
            }
            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
            game.ui.showNotification('Golpe da Fera! 🐾', 'skill');
        }
    },

    PHANTOM_ARROW: {
        id: 'phantom_arrow',
        name: 'Flecha Fantasma',
        description: 'Flecha espiritual que ignora armadura. 110 + 70% agilidade. Atravessa 3 inimigos.',
        type: 'active',
        category: 'attack',
        manaCost: 18,
        cooldown: 9,
        icon: '👻',
        targetType: 'area',
        range: 300,
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = 110 + player.getStat('agilidade') * 0.7;
            const sorted = enemies.filter(e => !e.isDead).map(enemy => {
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                return { enemy, dist: Math.sqrt(dx * dx + dy * dy) };
            }).filter(e => e.dist <= 300).sort((a, b) => a.dist - b.dist).slice(0, 3);

            sorted.forEach(({ enemy }) => {
                const actualDamage = enemy.takeDamage(damage);
                game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
            });
            game.ui.showNotification('Flecha Fantasma! 👻', 'skill');
        }
    },

    ARCANE_STORM: {
        id: 'arcane_storm',
        name: 'Tempestade Arcana',
        description: 'Raios mágicos caem na área por 4s. 50 de dano por segundo.',
        type: 'active',
        category: 'attack',
        manaCost: 35,
        cooldown: 16,
        icon: '⚡',
        targetType: 'area',
        range: 180,
        execute: (player, target, game) => {
            const stormX = player.x;
            const stormY = player.y;
            let ticks = 0;
            const interval = setInterval(() => {
                const enemies = game.enemySpawner ? game.enemySpawner.getAllEnemies() : (Array.isArray(target) ? target : [target]);
                enemies.forEach(enemy => {
                    if (!enemy || enemy.isDead) return;
                    const dx = enemy.x - stormX;
                    const dy = enemy.y - stormY;
                    if (Math.sqrt(dx * dx + dy * dy) <= 180) {
                        const actualDamage = enemy.takeDamage(50);
                        game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', false);
                        if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                    }
                });
                ticks++;
                if (ticks >= 4) clearInterval(interval);
            }, 1000);
            game.ui.showNotification('Tempestade Arcana! ⚡', 'skill');
        }
    },

    PREDATOR_LEAP: {
        id: 'predator_leap',
        name: 'Salto do Predador',
        description: 'Salta sobre o inimigo. 95 + 60% força. Atordoa 1.5s.',
        type: 'active',
        category: 'attack',
        manaCost: 15,
        cooldown: 10,
        icon: '🦁',
        targetType: 'enemy',
        range: 200,
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => e && !e.isDead) : target;
            if (!enemy) return;
            player.x = enemy.x;
            player.y = enemy.y - 20;
            const damage = 95 + player.getStat('força') * 0.6;
            const actualDamage = enemy.takeDamage(damage);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
            if (game.effectManager) {
                const stun = createEffect('STUN', { source: player.id, duration: 1.5 });
                game.effectManager.applyEffect(enemy.id, stun);
                game.combat.showDamageNumber(enemy.x, enemy.y - 40, 'STUN!', 'debuff', false);
            }
            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
            game.ui.showNotification('Salto do Predador! 🦁', 'skill');
        }
    },

    SHADOW_BLADE: {
        id: 'shadow_blade',
        name: 'Lâmina Sombria',
        description: 'Ataque rápido com +35% chance de crítico. 85 + 70% agilidade.',
        type: 'active',
        category: 'attack',
        manaCost: 14,
        cooldown: 6,
        icon: '🌑',
        targetType: 'enemy',
        range: 100,
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => e && !e.isDead) : target;
            if (!enemy) return;
            let damage = 85 + player.getStat('agilidade') * 0.7;
            const isCrit = Math.random() < (player.getCritChance() + 0.35);
            if (isCrit) damage *= 2.5;
            const actualDamage = enemy.takeDamage(damage);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', isCrit);
            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
            game.ui.showNotification('Lâmina Sombria! 🌑', 'skill');
        }
    },

    ELEMENTAL_WALL: {
        id: 'elemental_wall',
        name: 'Muralha Elemental',
        description: 'Barreira mágica que absorve 200 de dano por 6s.',
        type: 'active',
        category: 'defense',
        manaCost: 28,
        cooldown: 16,
        icon: '🧱',
        targetType: 'self',
        execute: (player, target, game) => {
            player.addBuff('defense', 0.5, 6);
            if (game.effectManager) {
                const shield = createEffect('SHIELD', { source: player.id, value: 200, duration: 6 });
                game.effectManager.applyEffect(player.id, shield);
            }
            game.ui.showNotification('Muralha Elemental! 🧱 200 de absorção', 'buff');
        }
    },

    EXPLOSIVE_SHOT: {
        id: 'explosive_shot',
        name: 'Disparo Explosivo',
        description: 'Flecha que explode ao atingir. 100 + 60% agilidade em área pequena.',
        type: 'active',
        category: 'attack',
        manaCost: 22,
        cooldown: 10,
        icon: '💥',
        targetType: 'area',
        range: 200,
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const baseDamage = 100 + player.getStat('agilidade') * 0.6;
            const closest = enemies.filter(e => !e.isDead).map(enemy => {
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                return { enemy, dist: Math.sqrt(dx * dx + dy * dy) };
            }).filter(e => e.dist <= 200).sort((a, b) => a.dist - b.dist)[0];

            if (closest) {
                // Explode at target hitting nearby enemies
                enemies.forEach(enemy => {
                    if (enemy.isDead) return;
                    const dx = enemy.x - closest.enemy.x;
                    const dy = enemy.y - closest.enemy.y;
                    if (Math.sqrt(dx * dx + dy * dy) <= 100) {
                        const actualDamage = enemy.takeDamage(baseDamage);
                        game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                        if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                    }
                });
            }
            game.ui.showNotification('Disparo Explosivo! 💥', 'skill');
        }
    },

    CHAIN_LIGHTNING: {
        id: 'chain_lightning',
        name: 'Corrente de Relâmpago',
        description: 'Raio que pula entre inimigos. 80 de dano. Máximo 5 alvos.',
        type: 'active',
        category: 'attack',
        manaCost: 26,
        cooldown: 12,
        icon: '⚡',
        targetType: 'area',
        range: 250,
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const alive = enemies.filter(e => !e.isDead);
            const sorted = alive.map(enemy => {
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                return { enemy, dist: Math.sqrt(dx * dx + dy * dy) };
            }).filter(e => e.dist <= 250).sort((a, b) => a.dist - b.dist).slice(0, 5);

            sorted.forEach(({ enemy }, i) => {
                setTimeout(() => {
                    if (enemy.isDead) return;
                    const actualDamage = enemy.takeDamage(80);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }, i * 200);
            });
            game.ui.showNotification('Corrente de Relâmpago! ⚡', 'skill');
        }
    },

    WAR_ROAR: {
        id: 'war_roar',
        name: 'Rugido da Guerra',
        description: 'Reduz defesa de inimigos próximos em 25% por 8s.',
        type: 'active',
        category: 'utility',
        manaCost: 18,
        cooldown: 14,
        icon: '🗣️',
        targetType: 'area',
        range: 200,
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 200) {
                    if (game.effectManager) {
                        const weakness = createEffect('WEAKNESS', { source: player.id, value: 0.25, duration: 8 });
                        game.effectManager.applyEffect(enemy.id, weakness);
                    }
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, '-DEF!', 'debuff', false);
                }
            });
            game.ui.showNotification('Rugido da Guerra! 🗣️ Defesa inimiga reduzida!', 'skill');
        }
    }
};

// ==================== HABILIDADES LENDÁRIAS ====================
// Drop de bosses apenas
const LegendarySkills = {
    ARCANE_APOCALYPSE: {
        id: 'arcane_apocalypse',
        name: 'Apocalipse Arcano',
        description: '⭐ LENDÁRIA - Explosão mágica gigantesca. 350 + 120% inteligência. Área grande.',
        type: 'active',
        category: 'attack',
        manaCost: 60,
        cooldown: 30,
        icon: '🌟',
        targetType: 'area',
        range: 350,
        rarity: 'legendary',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = 350 + player.getStat('inteligência') * 1.2;
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 350) {
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
            game.ui.showNotification('⭐ APOCALIPSE ARCANO! 🌟', 'level-up');
        }
    },

    ROYAL_REND: {
        id: 'royal_rend',
        name: 'Dilacerar Real',
        description: '⭐ LENDÁRIA - Golpe devastador. 320 + 110% força. Ignora 40% da defesa.',
        type: 'active',
        category: 'attack',
        manaCost: 50,
        cooldown: 25,
        icon: '👑',
        targetType: 'enemy',
        range: 120,
        rarity: 'legendary',
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => e && !e.isDead) : target;
            if (!enemy) return;
            const damage = 320 + player.getStat('força') * 1.1;
            // Ignora 40% defesa (aplica dano bruto)
            const trueDamage = damage * 1.4;
            const actualDamage = enemy.takeDamage(trueDamage);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
            game.ui.showNotification('⭐ DILACERAR REAL! 👑', 'level-up');
        }
    },

    CELESTIAL_STORM: {
        id: 'celestial_storm',
        name: 'Tempestade Celestial',
        description: '⭐ LENDÁRIA - Raios por 8 segundos. 90 de dano/s.',
        type: 'active',
        category: 'attack',
        manaCost: 70,
        cooldown: 35,
        icon: '🌩️',
        targetType: 'area',
        range: 250,
        rarity: 'legendary',
        execute: (player, target, game) => {
            let ticks = 0;
            const interval = setInterval(() => {
                const enemies = game.enemySpawner ? game.enemySpawner.getAllEnemies() : (Array.isArray(target) ? target : [target]);
                enemies.forEach(enemy => {
                    if (!enemy || enemy.isDead) return;
                    const dx = enemy.x - player.x;
                    const dy = enemy.y - player.y;
                    if (Math.sqrt(dx * dx + dy * dy) <= 250) {
                        const actualDamage = enemy.takeDamage(90);
                        game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                        if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                    }
                });
                ticks++;
                if (ticks >= 8) clearInterval(interval);
            }, 1000);
            game.ui.showNotification('⭐ TEMPESTADE CELESTIAL! 🌩️', 'level-up');
        }
    },

    THOUSAND_ARROWS: {
        id: 'thousand_arrows',
        name: 'Chuva de Mil Flechas',
        description: '⭐ LENDÁRIA - Ataque massivo. 180 de dano total dividido entre inimigos.',
        type: 'active',
        category: 'attack',
        manaCost: 55,
        cooldown: 28,
        icon: '🏹',
        targetType: 'area',
        range: 300,
        rarity: 'legendary',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const alive = enemies.filter(e => !e.isDead && (() => {
                const dx = e.x - player.x;
                const dy = e.y - player.y;
                return Math.sqrt(dx * dx + dy * dy) <= 300;
            })());
            const totalDamage = 180 + player.getAttackPower() * 2;
            const damagePerEnemy = alive.length > 0 ? totalDamage / alive.length : totalDamage;
            alive.forEach(enemy => {
                const actualDamage = enemy.takeDamage(damagePerEnemy);
                game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
            });
            game.ui.showNotification('⭐ CHUVA DE MIL FLECHAS! 🏹', 'level-up');
        }
    },

    TIME_DOMINION: {
        id: 'time_dominion',
        name: 'Domínio do Tempo',
        description: '⭐ LENDÁRIA - Desacelera todos os inimigos em 50% por 6s.',
        type: 'active',
        category: 'utility',
        manaCost: 45,
        cooldown: 40,
        icon: '⏳',
        targetType: 'area',
        range: 300,
        rarity: 'legendary',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 300) {
                    if (game.effectManager) {
                        const slow = createEffect('SLOW', { source: player.id, value: 0.5, duration: 6 });
                        game.effectManager.applyEffect(enemy.id, slow);
                    }
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, 'SLOW!', 'debuff', false);
                }
            });
            game.ui.showNotification('⭐ DOMÍNIO DO TEMPO! ⏳ Inimigos desacelerados!', 'level-up');
        }
    }
};

// ==================== HABILIDADES DE EVOLUÇÃO DE CLASSE ====================
const EvolutionSkills = {
    // === EVOLUÇÃO DEMONÍACA → REI DEMÔNIO ===
    infernal_aura: {
        id: 'infernal_aura',
        name: 'Aura Infernal',
        description: '👿 REI DEMÔNIO - Inimigos próximos recebem 35 de dano/s.',
        type: 'active',
        category: 'attack',
        manaCost: 40,
        cooldown: 20,
        icon: '🔥',
        targetType: 'area',
        range: 150,
        classId: 'rei_demonio',
        rarity: 'evolution',
        execute: (player, target, game) => {
            let ticks = 0;
            const interval = setInterval(() => {
                const enemies = game.enemySpawner ? game.enemySpawner.getAllEnemies() : (Array.isArray(target) ? target : [target]);
                enemies.forEach(enemy => {
                    if (!enemy || enemy.isDead) return;
                    const dx = enemy.x - player.x;
                    const dy = enemy.y - player.y;
                    if (Math.sqrt(dx * dx + dy * dy) <= 150) {
                        const actualDamage = enemy.takeDamage(35);
                        game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', false);
                        if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                    }
                });
                ticks++;
                if (ticks >= 10) clearInterval(interval);
            }, 1000);
            game.ui.showNotification('👿 Aura Infernal ativada!', 'level-up');
        }
    },

    shadow_command: {
        id: 'shadow_command',
        name: 'Comando das Sombras',
        description: '👿 REI DEMÔNIO - Invoca 3 demônios menores por 20s que atacam por você.',
        type: 'active',
        category: 'utility',
        manaCost: 60,
        cooldown: 45,
        icon: '😈',
        targetType: 'self',
        classId: 'rei_demonio',
        rarity: 'evolution',
        execute: (player, target, game) => {
            // Simula demônios atacando = dano automático a cada 2s por 20s
            let ticks = 0;
            const interval = setInterval(() => {
                const enemies = game.enemySpawner ? game.enemySpawner.getAllEnemies() : [];
                const alive = enemies.filter(e => !e.isDead);
                // Cada demônio ataca um inimigo aleatório
                for (let d = 0; d < 3; d++) {
                    if (alive.length === 0) break;
                    const randomEnemy = alive[Math.floor(Math.random() * alive.length)];
                    const damage = 25 + player.level * 2;
                    const actualDamage = randomEnemy.takeDamage(damage);
                    game.combat.showDamageNumber(randomEnemy.x, randomEnemy.y - 20 - d * 10, actualDamage, 'enemy', false);
                    if (randomEnemy.isDead) game.combat.onEnemyDeath(player, randomEnemy);
                }
                ticks++;
                if (ticks >= 10) clearInterval(interval);
            }, 2000);
            game.ui.showNotification('👿 Demônios invocados! Comando das Sombras!', 'level-up');
        }
    },

    abyssal_cut: {
        id: 'abyssal_cut',
        name: 'Corte Abissal',
        description: '👿 REI DEMÔNIO - Energia sombria gigantesca. 280 + 100% força.',
        type: 'active',
        category: 'attack',
        manaCost: 55,
        cooldown: 22,
        icon: '⚔️',
        targetType: 'area',
        range: 250,
        classId: 'rei_demonio',
        rarity: 'evolution',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = 280 + player.getStat('força') * 1.0;
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 250) {
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
            game.ui.showNotification('👿 CORTE ABISSAL! ⚔️', 'level-up');
        }
    },

    // === EVOLUÇÃO ARCANISTA → ARQUIMAGO ===
    arcane_supernova: {
        id: 'arcane_supernova',
        name: 'Supernova Arcana',
        description: '🔮 ARQUIMAGO - Explosão massiva de energia. 400 + 150% inteligência.',
        type: 'active',
        category: 'attack',
        manaCost: 80,
        cooldown: 30,
        icon: '💫',
        targetType: 'area',
        range: 350,
        classId: 'arquimago',
        rarity: 'evolution',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = 400 + player.getStat('inteligência') * 1.5;
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 350) {
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
            game.ui.showNotification('🔮 SUPERNOVA ARCANA! 💫', 'level-up');
        }
    },

    arcane_portal: {
        id: 'arcane_portal',
        name: 'Portal Arcano',
        description: '🔮 ARQUIMAGO - Teleporte instantâneo para qualquer ponto próximo.',
        type: 'active',
        category: 'mobility',
        manaCost: 30,
        cooldown: 8,
        icon: '🌀',
        targetType: 'self',
        classId: 'arquimago',
        rarity: 'evolution',
        execute: (player, target, game) => {
            const angle = Math.random() * Math.PI * 2;
            const distance = 300;
            player.x += Math.cos(angle) * distance;
            player.y += Math.sin(angle) * distance;
            player.x = Math.max(32, Math.min(1888, player.x));
            player.y = Math.max(32, Math.min(1048, player.y));
            if (game.effectManager) {
                const invuln = createEffect('INVULNERABLE', { source: player.id, duration: 1.5 });
                game.effectManager.applyEffect(player.id, invuln);
            }
            game.ui.showNotification('🔮 Portal Arcano! 🌀', 'buff');
        }
    },

    supreme_resonance: {
        id: 'supreme_resonance',
        name: 'Ressonância Suprema',
        description: '🔮 ARQUIMAGO - +40% dano mágico por 10s.',
        type: 'active',
        category: 'utility',
        manaCost: 50,
        cooldown: 35,
        icon: '✨',
        targetType: 'self',
        classId: 'arquimago',
        rarity: 'evolution',
        execute: (player, target, game) => {
            player.addBuff('strength', 0.4, 10);
            game.ui.showNotification('🔮 RESSONÂNCIA SUPREMA! +40% dano mágico!', 'level-up');
        }
    },

    // === EVOLUÇÃO BERSERKER → SENHOR DA GUERRA ===
    unstoppable_fury: {
        id: 'unstoppable_fury',
        name: 'Fúria Incontrolável',
        description: '⚔️ SENHOR DA GUERRA - +50% dano por 10s.',
        type: 'active',
        category: 'utility',
        manaCost: 45,
        cooldown: 35,
        icon: '🔥',
        targetType: 'self',
        classId: 'senhor_da_guerra',
        rarity: 'evolution',
        execute: (player, target, game) => {
            player.addBuff('strength', 0.5, 10);
            player.addBuff('attackSpeedBuff', 0.3, 10);
            game.ui.showNotification('⚔️ FÚRIA INCONTROLÁVEL! +50% DANO!', 'level-up');
        }
    },

    titanic_smash: {
        id: 'titanic_smash',
        name: 'Esmagamento Titânico',
        description: '⚔️ SENHOR DA GUERRA - 350 + 120% força de dano em área.',
        type: 'active',
        category: 'attack',
        manaCost: 60,
        cooldown: 25,
        icon: '💥',
        targetType: 'area',
        range: 200,
        classId: 'senhor_da_guerra',
        rarity: 'evolution',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = 350 + player.getStat('força') * 1.2;
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 200) {
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                    if (game.effectManager) {
                        const stun = createEffect('STUN', { source: player.id, duration: 2.5 });
                        game.effectManager.applyEffect(enemy.id, stun);
                    }
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
            game.ui.showNotification('⚔️ ESMAGAMENTO TITÂNICO! 💥', 'level-up');
        }
    },

    // === HABILIDADES NÍVEIS ESPECÍFICOS ===
    phantom_steps: {
        id: 'phantom_steps',
        name: 'Passos Fantasma',
        description: 'Dash rápido com invulnerabilidade momentânea.',
        type: 'active',
        category: 'mobility',
        manaCost: 20,
        cooldown: 5,
        requiredLevel: 3,
        icon: '👻',
        targetType: 'self',
        execute: (player, target, game) => {
            const dashDistance = 180;
            player.x += player.facingX * dashDistance;
            player.y += player.facingY * dashDistance;
            player.x = Math.max(32, Math.min(1888, player.x));
            player.y = Math.max(32, Math.min(1048, player.y));
            if (game.effectManager) {
                const invuln = createEffect('INVULNERABLE', { source: player.id, duration: 1.0 });
                game.effectManager.applyEffect(player.id, invuln);
            }
            game.ui.showNotification('Passos Fantasma!', 'skill');
        }
    },

    lightning_rupture: {
        id: 'lightning_rupture',
        name: 'Ruptura Relâmpago',
        description: 'Um ataque elétrico veloz que causa 120 + 80% agilidade.',
        type: 'active',
        category: 'attack',
        manaCost: 25,
        cooldown: 8,
        requiredLevel: 6,
        icon: '⚡',
        targetType: 'enemy',
        range: 150,
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => e && !e.isDead) : target;
            if (!enemy) return;
            const damage = 120 + player.getStat('agilidade') * 0.8;
            const actualDamage = enemy.takeDamage(damage);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
            game.ui.showNotification('Ruptura Relâmpago! ⚡', 'skill');
        }
    },

    vampiric_blade: {
        id: 'vampiric_blade',
        name: 'Lâmina Vampírica',
        description: 'Causa 150 + 70% força e recupera 30% do dano causado.',
        type: 'active',
        category: 'attack',
        manaCost: 30,
        cooldown: 10,
        requiredLevel: 8,
        icon: '🩸',
        targetType: 'enemy',
        range: 100,
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => e && !e.isDead) : target;
            if (!enemy) return;
            const damage = 150 + player.getStat('força') * 0.7;
            const actualDamage = enemy.takeDamage(damage);
            player.heal(actualDamage * 0.3);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
            game.combat.showDamageNumber(player.x, player.y - 20, '+' + Math.floor(actualDamage * 0.3), 'heal', false);
            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
            game.ui.showNotification('Lâmina Vampírica! 🩸', 'skill');
        }
    },

    mark_of_ruin: {
        id: 'mark_of_ruin',
        name: 'Marca da Ruína',
        description: 'Amaldiçoa inimigo, reduzindo defesa e causando dano.',
        type: 'active',
        category: 'utility',
        manaCost: 35,
        cooldown: 15,
        requiredLevel: 11,
        icon: '💀',
        targetType: 'enemy',
        range: 200,
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => e && !e.isDead) : target;
            if (!enemy) return;
            if (game.effectManager) {
                const poison = createEffect('POISON', { source: player.id, duration: 6, value: 25 });
                game.effectManager.applyEffect(enemy.id, poison);
            }
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, 'MARCADO!', 'debuff', false);
            game.ui.showNotification('Marca da Ruína! 💀', 'skill');
        }
    },

    psychic_explosion: {
        id: 'psychic_explosion',
        name: 'Explosão Psíquica',
        description: 'Explosão mental. 180 + 100% int. Atordoa por 1.5s.',
        type: 'active',
        category: 'attack',
        manaCost: 40,
        cooldown: 12,
        requiredLevel: 13,
        icon: '🧠',
        targetType: 'area',
        range: 180,
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = 180 + player.getStat('inteligência') * 1.0;
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 180) {
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                    if (game.effectManager) {
                        const stun = createEffect('STUN', { source: player.id, duration: 1.5 });
                        game.effectManager.applyEffect(enemy.id, stun);
                    }
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
            game.ui.showNotification('Explosão Psíquica! 🧠', 'skill');
        }
    },

    glacial_prison: {
        id: 'glacial_prison',
        name: 'Prisão Glacial',
        description: 'Congela inimigos no alcance por 3s. 100 de dano.',
        type: 'active',
        category: 'defense',
        manaCost: 45,
        cooldown: 20,
        requiredLevel: 15,
        icon: '🧊',
        targetType: 'area',
        range: 160,
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 160) {
                    const actualDamage = enemy.takeDamage(100);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', false);
                    if (game.effectManager) {
                        const freeze = createEffect('FREEZE', { source: player.id, duration: 3.0 });
                        game.effectManager.applyEffect(enemy.id, freeze);
                    }
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
            game.ui.showNotification('Prisão Glacial! 🧊', 'skill');
        }
    },

    abyssal_impact: {
        id: 'abyssal_impact',
        name: 'Impacto Abissal',
        description: 'Um impacto monstruoso causando 350 + 150% de força.',
        type: 'active',
        category: 'attack',
        manaCost: 50,
        cooldown: 18,
        requiredLevel: 17,
        icon: '🕳️',
        targetType: 'area',
        range: 220,
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = 350 + player.getStat('força') * 1.5;
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 220) {
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
            game.ui.showNotification('Impacto Abissal! 🕳️', 'skill');
        }
    },

    whirlwind_storm: {
        id: 'whirlwind_storm',
        name: 'Tempestade Giratória',
        description: 'Gira sem parar cortando inimigos e puxando-os.',
        type: 'active',
        category: 'attack',
        manaCost: 60,
        cooldown: 22,
        requiredLevel: 20,
        icon: '🌪️',
        targetType: 'area',
        range: 200,
        execute: (player, target, game) => {
            let ticks = 0;
            const stormX = player.x;
            const stormY = player.y;
            const damagePerSecond = 80 + player.getStat('força') * 0.4;
            const interval = setInterval(() => {
                const enemies = game.enemySpawner ? game.enemySpawner.getAllEnemies() : (Array.isArray(target) ? target : [target]);
                enemies.forEach(enemy => {
                    if (!enemy || enemy.isDead) return;
                    const dx = enemy.x - stormX;
                    const dy = enemy.y - stormY;
                    if (Math.sqrt(dx * dx + dy * dy) <= 200) {
                        const actualDamage = enemy.takeDamage(damagePerSecond);
                        game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', false);
                        if (Math.sqrt(dx * dx + dy * dy) > 50) {
                            enemy.x -= dx * 0.1;
                            enemy.y -= dy * 0.1;
                        }
                        if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                    }
                });
                ticks++;
                if (ticks >= 4) clearInterval(interval);
            }, 1000);
            game.ui.showNotification('Tempestade Giratória! 🌪️', 'skill');
        }
    }
};

// ==================== HABILIDADES SECRETAS ====================
// Desbloqueadas por conquistas especiais
const SecretSkills = {
    ANCESTRAL_TOUCH: {
        id: 'ancestral_touch',
        name: 'Toque do Espírito Ancestral',
        description: '🔒 SECRETA - Recupera 200 HP e 100 MP. Desbloqueia ao matar 1000 monstros.',
        type: 'active',
        category: 'utility',
        manaCost: 0,
        cooldown: 120,
        icon: '👴',
        targetType: 'self',
        rarity: 'secret',
        unlockCondition: 'kills_1000',
        execute: (player, target, game) => {
            player.heal(200);
            player.currentMP = Math.min(player.getMaxMP(), player.currentMP + 100);
            game.combat.showDamageNumber(player.x, player.y - 20, '+200 HP', 'heal', false);
            game.combat.showDamageNumber(player.x, player.y - 40, '+100 MP', 'heal', false);
            game.ui.showNotification('🔒 Toque do Espírito Ancestral! 👴', 'level-up');
        }
    },

    CEMETERY_CURSE: {
        id: 'cemetery_curse',
        name: 'Maldição do Cemitério',
        description: '🔒 SECRETA - Dano sombrio em inimigos por 10s. Desbloqueia ao abrir 50 baús raros.',
        type: 'active',
        category: 'attack',
        manaCost: 35,
        cooldown: 30,
        icon: '⚰️',
        targetType: 'area',
        range: 200,
        rarity: 'secret',
        unlockCondition: 'chests_50',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 200 && game.effectManager) {
                    const curse = createEffect('POISON', { source: player.id, duration: 10, value: 12 });
                    game.effectManager.applyEffect(enemy.id, curse);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, 'MALDIÇÃO!', 'debuff', false);
                }
            });
            game.ui.showNotification('🔒 Maldição do Cemitério! ⚰️', 'level-up');
        }
    },

    CALL_OF_THE_DEAD: {
        id: 'call_of_the_dead',
        name: 'Chamado dos Mortos',
        description: '🔒 SECRETA - Invoca 4 esqueletos aliados. Desbloqueia ao derrotar boss secreto.',
        type: 'active',
        category: 'utility',
        manaCost: 50,
        cooldown: 60,
        icon: '💀',
        targetType: 'self',
        rarity: 'secret',
        unlockCondition: 'secret_boss',
        execute: (player, target, game) => {
            let ticks = 0;
            const interval = setInterval(() => {
                const enemies = game.enemySpawner ? game.enemySpawner.getAllEnemies() : [];
                const alive = enemies.filter(e => !e.isDead);
                for (let s = 0; s < 4; s++) {
                    if (alive.length === 0) break;
                    const randomEnemy = alive[Math.floor(Math.random() * alive.length)];
                    const damage = 15 + player.level * 1.5;
                    const actualDamage = randomEnemy.takeDamage(damage);
                    game.combat.showDamageNumber(randomEnemy.x, randomEnemy.y - 20 - s * 8, actualDamage, 'enemy', false);
                    if (randomEnemy.isDead) game.combat.onEnemyDeath(player, randomEnemy);
                }
                ticks++;
                if (ticks >= 10) clearInterval(interval);
            }, 2000);
            game.ui.showNotification('🔒 Chamado dos Mortos! 💀 Esqueletos invocados!', 'level-up');
        }
    },

    BLACK_MOON_BLESSING: {
        id: 'black_moon_blessing',
        name: 'Benção da Lua Negra',
        description: '🔒 SECRETA - +25% dano e +20% velocidade por 12s. Desbloqueia ao explorar todas as masmorras.',
        type: 'active',
        category: 'utility',
        manaCost: 30,
        cooldown: 45,
        icon: '🌑',
        targetType: 'self',
        rarity: 'secret',
        unlockCondition: 'all_dungeons',
        execute: (player, target, game) => {
            player.addBuff('strength', 0.25, 12);
            player.addBuff('speed', 0.2, 12);
            game.ui.showNotification('🔒 Benção da Lua Negra! 🌑 +25% dano, +20% velocidade!', 'level-up');
        }
    },

    VOID_ECHO: {
        id: 'void_echo',
        name: 'Eco do Vazio',
        description: '🔒 SECRETA - Dano baseado em 15% da vida máxima do inimigo. Requer TODAS as conquistas.',
        type: 'active',
        category: 'attack',
        manaCost: 40,
        cooldown: 20,
        icon: '🕳️',
        targetType: 'enemy',
        range: 200,
        rarity: 'secret',
        unlockCondition: 'all_achievements',
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => e && !e.isDead) : target;
            if (!enemy) return;
            // Dano baseado na vida máxima do inimigo
            const maxHP = enemy.maxHP || enemy.hp || 100;
            const damage = Math.floor(maxHP * 0.15);
            const actualDamage = enemy.takeDamage(damage);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
            game.combat.showDamageNumber(enemy.x, enemy.y - 40, '15% HP!', 'debuff', false);
            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
            game.ui.showNotification('🔒 ECO DO VAZIO! 🕳️ Dano baseado na vida máxima!', 'level-up');
        }
    }
};

// ==================== SISTEMA DE CONQUISTAS SECRETAS ====================
class SecretUnlockTracker {
    constructor() {
        this.stats = {
            monstersKilled: 0,
            rareChestsOpened: 0,
            secretBossDefeated: false,
            dungeonsExplored: new Set(),
            totalDungeons: 10
        };
        this.unlockedSecrets = new Set();
    }

    // Registrar kill de monstro
    registerKill() {
        this.stats.monstersKilled++;
        if (this.stats.monstersKilled >= 1000 && !this.unlockedSecrets.has('kills_1000')) {
            this.unlockedSecrets.add('kills_1000');
            return { unlocked: true, skill: SecretSkills.ANCESTRAL_TOUCH, message: '🔓 HABILIDADE SECRETA DESBLOQUEADA: Toque do Espírito Ancestral!' };
        }
        return null;
    }

    // Registrar abertura de baú raro
    registerRareChest() {
        this.stats.rareChestsOpened++;
        if (this.stats.rareChestsOpened >= 50 && !this.unlockedSecrets.has('chests_50')) {
            this.unlockedSecrets.add('chests_50');
            return { unlocked: true, skill: SecretSkills.CEMETERY_CURSE, message: '🔓 HABILIDADE SECRETA DESBLOQUEADA: Maldição do Cemitério!' };
        }
        return null;
    }

    // Registrar derrota de boss secreto
    registerSecretBoss() {
        this.stats.secretBossDefeated = true;
        if (!this.unlockedSecrets.has('secret_boss')) {
            this.unlockedSecrets.add('secret_boss');
            return { unlocked: true, skill: SecretSkills.CALL_OF_THE_DEAD, message: '🔓 HABILIDADE SECRETA DESBLOQUEADA: Chamado dos Mortos!' };
        }
        return null;
    }

    // Registrar exploração de masmorra
    registerDungeon(dungeonId) {
        this.stats.dungeonsExplored.add(dungeonId);
        if (this.stats.dungeonsExplored.size >= this.stats.totalDungeons && !this.unlockedSecrets.has('all_dungeons')) {
            this.unlockedSecrets.add('all_dungeons');
            return { unlocked: true, skill: SecretSkills.BLACK_MOON_BLESSING, message: '🔓 HABILIDADE SECRETA DESBLOQUEADA: Benção da Lua Negra!' };
        }
        return null;
    }

    // Verificar se todas as conquistas foram completadas
    checkAllAchievements() {
        const allDone = this.unlockedSecrets.has('kills_1000') &&
            this.unlockedSecrets.has('chests_50') &&
            this.unlockedSecrets.has('secret_boss') &&
            this.unlockedSecrets.has('all_dungeons');

        if (allDone && !this.unlockedSecrets.has('all_achievements')) {
            this.unlockedSecrets.add('all_achievements');
            return { unlocked: true, skill: SecretSkills.VOID_ECHO, message: '🔓 HABILIDADE SECRETA DEFINITIVA DESBLOQUEADA: Eco do Vazio!' };
        }
        return null;
    }

    // Verificar se uma skill secreta está desbloqueada
    isUnlocked(conditionId) {
        return this.unlockedSecrets.has(conditionId);
    }

    // Obter progresso
    getProgress() {
        return {
            kills: `${this.stats.monstersKilled}/1000`,
            chests: `${this.stats.rareChestsOpened}/50`,
            secretBoss: this.stats.secretBossDefeated ? '✅' : '❌',
            dungeons: `${this.stats.dungeonsExplored.size}/${this.stats.totalDungeons}`,
            totalUnlocked: this.unlockedSecrets.size
        };
    }
}

// Passive Skills Definitions
const PassiveSkills = {
    CRITICAL_MASTER: {
        id: 'critical_master',
        name: 'Mestre Crítico',
        description: 'Aumenta chance de crítico em 5% por nível.',
        type: 'passive',
        category: 'attack',
        icon: '💥',
        maxLevel: 5,
        passive: (player, level) => {
            return { critChance: 0.05 * level };
        }
    },

    DODGE_MASTER: {
        id: 'dodge_master',
        name: 'Mestre da Esquiva',
        description: 'Aumenta chance de esquiva em 3% por nível.',
        type: 'passive',
        category: 'defense',
        icon: '🌀',
        maxLevel: 5,
        passive: (player, level) => {
            return { dodgeChance: 0.03 * level };
        }
    },

    MP_REGENERATION: {
        id: 'mp_regen',
        name: 'Regeneração de MP',
        description: 'Regenera 1 MP/s por nível.',
        type: 'passive',
        category: 'utility',
        icon: '💙',
        maxLevel: 5,
        passive: (player, level) => {
            return { mpRegen: 1 * level };
        }
    },

    LIFE_STEAL: {
        id: 'life_steal',
        name: 'Roubo de Vida',
        description: 'Recupera 2% da vida por dano causado por nível.',
        type: 'passive',
        category: 'attack',
        icon: '🩸',
        maxLevel: 5,
        passive: (player, level) => {
            return { lifeSteal: 0.02 * level };
        }
    },

    SPEED_BOOST_PASSIVE: {
        id: 'speed_boost_passive',
        name: 'Velocista',
        description: 'Aumenta velocidade de movimento em 5% por nível.',
        type: 'passive',
        category: 'mobility',
        icon: '⚡',
        maxLevel: 5,
        passive: (player, level) => {
            return { moveSpeed: 1 + (0.05 * level) };
        }
    },

    // === NOVAS PASSIVAS ===
    SURVIVAL_INSTINCT: {
        id: 'survival_instinct',
        name: 'Instinto de Sobrevivência',
        description: 'Quando HP < 40%: +20% defesa e +10% resistência a controle.',
        type: 'passive',
        category: 'defense',
        icon: '🛡️',
        maxLevel: 3,
        passive: (player, level) => {
            const hpPercent = player.currentHP / player.getMaxHP();
            if (hpPercent < 0.4) {
                return {
                    survivalDefense: 0.20 * level,
                    survivalCCResist: 0.10 * level
                };
            }
            return { survivalDefense: 0, survivalCCResist: 0 };
        }
    },

    ARCANE_AFFINITY: {
        id: 'arcane_affinity',
        name: 'Afinidade Arcana',
        description: '+15% dano mágico e -8% custo de mana.',
        type: 'passive',
        category: 'attack',
        icon: '✨',
        maxLevel: 3,
        passive: (player, level) => {
            return {
                magicDamage: 0.15 * level,
                manaCostReduction: 0.08 * level
            };
        }
    },

    PRECISE_STRIKE: {
        id: 'precise_strike',
        name: 'Golpe Preciso',
        description: '+12% chance de crítico e +25% dano crítico.',
        type: 'passive',
        category: 'attack',
        icon: '🎯',
        maxLevel: 3,
        passive: (player, level) => {
            return {
                critChance: 0.12 * level,
                critDamage: 0.25 * level
            };
        }
    },

    BATTLE_VAMPIRISM: {
        id: 'battle_vampirism',
        name: 'Vampirismo de Batalha',
        description: '20% de chance de recuperar 5% do dano como vida.',
        type: 'passive',
        category: 'attack',
        icon: '🩸',
        maxLevel: 3,
        passive: (player, level) => {
            return {
                battleLifeStealChance: 0.20 * level,
                battleLifeStealPercent: 0.05 * level
            };
        }
    },

    EXPANDED_MIND: {
        id: 'expanded_mind',
        name: 'Mente Expandida',
        description: '+30% MP máximo e +25% regeneração de mana.',
        type: 'passive',
        category: 'utility',
        icon: '🧠',
        maxLevel: 3,
        passive: (player, level) => {
            return {
                maxMPMultiplier: 0.30 * level,
                mpRegenMultiplier: 0.25 * level
            };
        }
    },

    RELIC_HUNTER: {
        id: 'relic_hunter',
        name: 'Caçador de Relíquias',
        description: '+15% chance de drop raro e +10% ouro de monstros.',
        type: 'passive',
        category: 'utility',
        icon: '💎',
        maxLevel: 3,
        passive: (player, level) => {
            return {
                itemDropBonus: 0.15 * level,
                goldBonus: 0.10 * level
            };
        }
    }
};

// Skill Manager - manages player skills
class SkillManager {
    constructor(player) {
        this.player = player;
        this.skills = [];
        this.passiveSkills = [];
        this.hotkeys = {}; // Map of key -> skill
    }

    // Add skill to player
    addSkill(skillConfig) {
        const skill = new Skill(skillConfig);

        if (skill.isPassive) {
            this.passiveSkills.push(skill);
        } else {
            this.skills.push(skill);
        }

        return skill;
    }

    // Get skill by ID
    getSkill(skillId) {
        return this.skills.find(s => s.id === skillId) ||
            this.passiveSkills.find(s => s.id === skillId);
    }

    // Assign skill to hotkey
    assignHotkey(key, skillId) {
        this.hotkeys[key.toLowerCase()] = skillId;
    }

    // Use skill by hotkey
    useSkillByHotkey(key, target, game) {
        const skillId = this.hotkeys[key.toLowerCase()];
        if (!skillId) return false;

        return this.useSkill(skillId, target, game);
    }

    // Use skill by ID
    useSkill(skillId, target, game) {
        const skill = this.getSkill(skillId);
        if (!skill || skill.isPassive) return false;

        return skill.use(this.player, target, game);
    }

    // Update all skill cooldowns
    update(deltaTime) {
        this.skills.forEach(skill => skill.update(deltaTime));

        // Apply passive MP regen
        this.passiveSkills.forEach(skill => {
            if (skill.passive) {
                const effects = skill.passive(this.player, skill.level);
                if (effects.mpRegen) {
                    this.player.currentMP = Math.min(
                        this.player.getMaxMP(),
                        this.player.currentMP + effects.mpRegen * deltaTime
                    );
                }
            }
        });
    }

    // Get passive bonuses
    getPassiveBonuses() {
        const bonuses = {
            critChance: 0,
            critDamage: 0,
            dodgeChance: 0,
            mpRegen: 0,
            lifeSteal: 0,
            moveSpeed: 1,
            magicDamage: 0,
            manaCostReduction: 0,
            survivalDefense: 0,
            survivalCCResist: 0,
            maxMPMultiplier: 0,
            mpRegenMultiplier: 0,
            itemDropBonus: 0,
            goldBonus: 0,
            battleLifeStealChance: 0,
            battleLifeStealPercent: 0
        };

        this.passiveSkills.forEach(skill => {
            if (skill.passive) {
                const effects = skill.passive(this.player, skill.level);
                Object.keys(effects).forEach(key => {
                    if (key === 'moveSpeed') {
                        bonuses[key] *= effects[key];
                    } else if (bonuses[key] !== undefined) {
                        bonuses[key] += effects[key];
                    } else {
                        bonuses[key] = effects[key];
                    }
                });
            }
        });

        return bonuses;
    }
}
