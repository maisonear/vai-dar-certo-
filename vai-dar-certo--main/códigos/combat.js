// combat.js - Combat system for Solo Leveling RPG

class CombatSystem {
    constructor(game) {
        this.game = game;
        this.damageNumbers = [];
    }

    // Player attacks enemy
    playerAttack(player, enemy) {
        if (player.attackCooldown > 0) return false;

        // Calculate distance
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 80) return false; // Out of range

        // Calculate damage
        let damage = player.getAttackPower();
        let isCritical = false;

        // Check for critical hit
        if (Math.random() < player.getCritChance()) {
            // Assassino passive: crits deal 300% instead of 200%
            const critMult = (player.playerClass === 'assassino') ? 3 : 2;
            damage *= critMult;
            isCritical = true;
        }

        // Berserker passive: +40% damage when HP < 30%
        if (player.playerClass === 'berserker') {
            const hpPercent = player.currentHP / player.getMaxHP();
            if (hpPercent < 0.3) {
                damage *= 1.4;
            }
        }

        // Caçador passive: +25% damage against monsters
        if (player.playerClass === 'cacador' && player.classBonuses && player.classBonuses.monsterDamage) {
            damage *= (1 + player.classBonuses.monsterDamage);
        }

        // Apply damage to enemy
        const actualDamage = enemy.takeDamage(damage);

        // Show damage number
        this.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', isCritical);

        // Set attack cooldown
        player.attackCooldown = player.getAttackSpeed();
        player.isAttacking = true;

        // Check if enemy died
        if (enemy.isDead) {
            this.onEnemyDeath(player, enemy);
        }

        return true;
    }

    // Enemy attacks player
    enemyAttack(enemy, player) {
        // Check dodge
        if (Math.random() < player.getDodgeChance()) {
            this.showDamageNumber(player.x, player.y - 20, 'DODGE', 'player', false);

            // Duelista passive: 30% chance to counter-attack on dodge
            if (player.playerClass === 'duelista' && Math.random() < 0.3) {
                const counterDmg = player.getAttackPower() * 2;
                const actualCounter = enemy.takeDamage(counterDmg);
                this.showDamageNumber(enemy.x, enemy.y - 20, actualCounter, 'enemy', true);
                if (enemy.isDead) this.onEnemyDeath(player, enemy);
            }

            return { damaged: false, dodged: true };
        }

        // Cavaleiro passive: flat damage reduction of 15%
        let damage = enemy.attack;
        if (player.playerClass === 'cavaleiro') {
            damage *= 0.85;
        }

        const result = player.takeDamage(damage);

        // Show damage number
        this.showDamageNumber(player.x, player.y - 20, result.damage, 'player', false);

        // Berserker passive: trigger rage buff when HP < 30%
        if (player.playerClass === 'berserker') {
            const hpPercent = player.currentHP / player.getMaxHP();
            if (hpPercent < 0.3 && hpPercent > 0) {
                player.addBuff('strength', 0.4, 8);
            }
        }

        // Check if player died
        if (result.isDead) {
            // Cavaleiro passive: survive lethal hit once (cooldown tracked)
            if (player.playerClass === 'cavaleiro' && !player._lastStandUsed) {
                player.currentHP = 1;
                result.isDead = false;
                player._lastStandUsed = true;
                if (this.game.ui) {
                    this.game.ui.showNotification('Fortitude de Ferro! Sobreviveu com 1 HP!', 'level-up');
                }
                setTimeout(() => { player._lastStandUsed = false; }, 120000);
            } else {
                this.onPlayerDeath();
            }
        }

        return { damaged: true, dodged: false, ...result };
    }

    // Handle enemy death
    onEnemyDeath(player, enemy) {
        // Add delay before removing enemy
        enemy.deathTimer = 0.5;

        // Track boss kills for class evolution
        if (enemy.isBoss) {
            player.bossesDefeated = (player.bossesDefeated || 0) + 1;
        }

        // Grant XP
        const levelsGained = player.gainXP(enemy.xpReward);

        // Show XP notification
        if (this.game.ui) {
            this.game.ui.showNotification(`+${enemy.xpReward} XP`, 'xp');
        }

        // Show level up notification
        if (levelsGained.length > 0) {
            levelsGained.forEach(level => {
                if (this.game.ui) {
                    this.game.ui.showNotification(`NÍVEL ${level}! +3 Pontos de Atributo`, 'level-up');
                }
            });

            // Check if class unlock should trigger
            if (this.game.classSystem) {
                this.game.classSystem.checkClassUnlock(player);
            }
        }

        // Check if class can evolve (after boss kills or level ups)
        if (this.game.classSystem) {
            this.game.classSystem.checkEvolution(player);
        }

        // Drop loot
        if (this.game.lootSystem) {
            const drops = enemy.getDrops();
            this.game.lootSystem.generateLoot(drops, enemy.x, enemy.y);

            // Award currency (crystals)
            if (this.game.currencyManager && this.game.lootSystem.lootTables[drops.lootTable]) {
                const goldRange = this.game.lootSystem.lootTables[drops.lootTable].gold;
                if (goldRange) {
                    const crystals = Math.floor(Math.random() * (goldRange.max - goldRange.min + 1)) + goldRange.min;
                    this.game.currencyManager.addCurrency(player, crystals);
                    if (this.game.ui) {
                        this.game.ui.showNotification(`+${crystals} 💎`, 'xp');
                        const currencyEl = document.getElementById('player-currency');
                        if (currencyEl) currencyEl.textContent = player.currency || 0;
                    }
                }
            }
        }
    }

    // Handle player death
    onPlayerDeath() {
        if (this.game) {
            // Show game over screen or respawn
            setTimeout(() => {
                this.game.respawnPlayer();
            }, 2000);
        }
    }

    // Show damage number
    showDamageNumber(x, y, value, type, isCritical) {
        const damageNum = {
            x: x,
            y: y,
            value: value,
            type: type,
            isCritical: isCritical,
            lifetime: 1.0,
            opacity: 1.0
        };

        this.damageNumbers.push(damageNum);

        // Also add to DOM for HTML overlay
        if (this.game && this.game.ui) {
            this.game.ui.showDamageNumber(x, y, value, type, isCritical);
        }
    }

    // Update combat system
    update(deltaTime, player, enemies) {
        // Check for enemy attacks on player
        enemies.forEach(enemy => {
            if (enemy.isDead) return;

            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < enemy.attackRange && enemy.attackCooldown <= 0) {
                this.enemyAttack(enemy, player);
                enemy.attackCooldown = 1;
            }
        });

        // Update damage numbers
        for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
            const dmg = this.damageNumbers[i];
            dmg.lifetime -= deltaTime;
            dmg.opacity = dmg.lifetime;
            dmg.y -= 50 * deltaTime;

            if (dmg.lifetime <= 0) {
                this.damageNumbers.splice(i, 1);
            }
        }

        // Update enemy death timers
        enemies.forEach(enemy => {
            if (enemy.isDead && enemy.deathTimer > 0) {
                enemy.deathTimer -= deltaTime;
            }
        });
    }

    // Player uses skill
    useSkill(player, skillName, enemies) {
        // === DASH SKILL ===
        if (skillName === 'dash') {
            const dashCost = 15;
            const dashDistance = 150;
            const dashCooldownTime = 3;

            if (player.dashCooldown > 0) {
                if (this.game.ui) this.game.ui.showNotification('Passos Rápidos em recarga!', 'warning');
                return false;
            }
            if (player.currentMP < dashCost) {
                if (this.game.ui) this.game.ui.showNotification('MP insuficiente!', 'warning');
                return false;
            }

            player.currentMP -= dashCost;
            player.dashCooldown = dashCooldownTime;

            // Teleport in facing direction
            player.x += player.facingX * dashDistance;
            player.y += player.facingY * dashDistance;

            // Clamp to canvas bounds
            player.x = Math.max(32, Math.min(1888, player.x));
            player.y = Math.max(32, Math.min(1048, player.y));

            this.showDamageNumber(player.x, player.y - 20, 'DASH!', 'heal', false);
            return true;
        }

        // First check if it's a dynamic skill from ActiveSkills
        if (typeof ActiveSkills !== 'undefined') {
            const activeSkillDef = Object.values(ActiveSkills).find(s => s.id === skillName);
            if (activeSkillDef) {
                // Check MP
                if (player.currentMP < (activeSkillDef.manaCost || 0)) {
                    if (this.game.ui) this.game.ui.showNotification('MP insuficiente!', 'warning');
                    return false;
                }

                // Check Cooldown
                if (!player._cooldowns) player._cooldowns = {};
                if (player._cooldowns[skillName] > 0) {
                    if (this.game.ui) this.game.ui.showNotification('Habilidade em recarga!', 'warning');
                    return false;
                }

                // Consume MP and start cooldown
                player.currentMP -= (activeSkillDef.manaCost || 0);
                player._cooldowns[skillName] = activeSkillDef.cooldown || 0;

                // Execute
                if (activeSkillDef.execute) {
                    activeSkillDef.execute(player, enemies, this.game);
                }
                return true;
            }
        }

        // Basic skill system
        const skills = {
            slash: {
                cost: 10,
                damage: player.getAttackPower() * 1.5,
                range: 100,
                aoe: false
            },
            fireball: {
                cost: 20,
                damage: player.getMagicPower() * 2,
                range: 200,
                aoe: true,
                aoeRadius: 80
            },
            heal: {
                cost: 30,
                heal: 50 + player.getStat('inteligência') * 2,
                range: 0,
                aoe: false
            }
        };

        const skill = skills[skillName];
        if (!skill) return false;

        // Check MP
        if (player.currentMP < skill.cost) return false;

        // Use MP
        player.currentMP -= skill.cost;

        // Apply skill effect
        if (skillName === 'heal') {
            player.heal(skill.heal);
            this.showDamageNumber(player.x, player.y - 20, `+${skill.heal}`, 'heal', false);
        } else {
            // Damage skill
            const hitEnemies = enemies.filter(enemy => {
                if (enemy.isDead) return false;

                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (skill.aoe) {
                    return distance < skill.aoeRadius;
                } else {
                    return distance < skill.range;
                }
            });

            hitEnemies.forEach(enemy => {
                const actualDamage = enemy.takeDamage(skill.damage);
                this.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);

                if (enemy.isDead) {
                    this.onEnemyDeath(player, enemy);
                }
            });
        }

        return true;
    }
}
