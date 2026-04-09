// player.js - Player character class for Solo Leveling RPG

class Player {
    constructor() {
        // Base stats
        this.level = 1;
        this.xp = 0;
        this.xpToNextLevel = 150;

        // Core attributes
        this.baseStats = {
            força: 5,
            velocidade: 5,
            estamina: 5,
            hp: 100,
            mp: 80,
            sentidos: 5,
            inteligência: 5,
            constituição: 5,
            agilidade: 5,
            destreza: 5,
            sorte: 5
        };

        // Equipment bonuses
        this.equipmentStats = {
            força: 0,
            velocidade: 0,
            estamina: 0,
            hp: 0,
            mp: 0,
            sentidos: 0,
            inteligência: 0,
            constituição: 0,
            agilidade: 0,
            destreza: 0,
            sorte: 0
        };

        // Available stat points
        this.statPoints = 0;

        // Class system
        this.playerClass = null;
        this.classData = null;
        this.classMultipliers = null;
        this.classBonuses = null;
        this.bossesDefeated = 0;
        this.classEvolved = false;

        // Temporary buffs
        this.activeBuffs = [];
        // Each buff: { type: 'strength'|'speed'|'xp'|'regen'|'defense', value: number, duration: number, remaining: number }

        // Current HP/MP
        this.currentHP = this.getMaxHP();
        this.currentMP = this.getMaxMP();

        // Equipment slots
        this.equipment = {
            weapon: null,
            helmet: null,
            chest: null,
            boots: null,
            ring: null,
            amulet: null
        };

        // Inventory
        this.inventory = [];
        this.maxInventorySlots = 90;

        // Position (center of town chunk)
        this.x = 256;
        this.y = 256;

        // World reference (set by game.js)
        this.world = null;

        // Combat stats
        this.attackCooldown = 0;
        this.isAttacking = false;
        this.dashCooldown = 0;

        // Hotbar (Skill assignments) - 10 slots: keys 1-9 and 0
        this.hotbar = {
            '1': 'dash', // Dash is always on 1 by default now
            '2': null, '3': null, '4': null, '5': null,
            '6': null, '7': null, '8': null, '9': null, '0': null
        };

        // Activated state for skills in hotbar
        this.activatedSkills = {
            '1': true, // Dash is active by default
            '2': false, '3': false, '4': false, '5': false,
            '6': false, '7': false, '8': false, '9': false, '0': false
        };

        // Movement
        this.velocityX = 0;
        this.velocityY = 0;
        this.facingX = 1;
        this.facingY = 0;
    }

    // Get class multiplier for a stat
    getClassMult(statName) {
        if (this.classMultipliers && this.classMultipliers[statName]) {
            return this.classMultipliers[statName];
        }
        return 1;
    }

    // Get class bonus
    getClassBonus(bonusName) {
        if (this.classBonuses && this.classBonuses[bonusName]) {
            return this.classBonuses[bonusName];
        }
        return 0;
    }

    // Get buff value for a type
    getBuffValue(buffType) {
        let total = 0;
        this.activeBuffs.forEach(buff => {
            if (buff.type === buffType) {
                total += buff.value;
            }
        });
        return total;
    }

    // Get total stats (base + equipment) * class multiplier
    getStat(statName) {
        const base = (this.baseStats[statName] || 0) + (this.equipmentStats[statName] || 0);
        return Math.floor(base * this.getClassMult(statName));
    }

    getMaxHP() {
        const base = 100 + (this.getStat('hp')) + (this.getStat('estamina') * 5) + (this.getStat('constituição') * 8);
        return Math.floor(base * this.getClassMult('hp')) + this.getClassBonus('maxHP');
    }

    getMaxMP() {
        const base = 80 + (this.getStat('mp') * 3) + (this.getStat('inteligência') * 3);
        let total = Math.floor(base * this.getClassMult('mp'));
        // Apply Mente Expandida passive
        if (this.skillManager) {
            const bonuses = this.skillManager.getPassiveBonuses();
            total = Math.floor(total * (1 + (bonuses.maxMPMultiplier || 0)));
        }
        return total;
    }

    getAttackPower() {
        let base = 20 + this.getStat('força') * 2;
        base *= (1 + this.getClassBonus('attackPower'));
        // Apply strength buff
        base *= (1 + this.getBuffValue('strength'));
        return Math.floor(base);
    }

    getMagicPower() {
        let base = 5 + this.getStat('inteligência') * 3;
        base *= (1 + this.getClassBonus('magicPower'));
        // Apply Afinidade Arcana passive
        if (this.skillManager) {
            const bonuses = this.skillManager.getPassiveBonuses();
            base *= (1 + (bonuses.magicDamage || 0));
        }
        return Math.floor(base);
    }

    getCritChance() {
        const base = 0.05 + (this.getStat('sentidos') * 0.01) + (this.getStat('destreza') * 0.008) + (this.getStat('sorte') * 0.005);
        return Math.min(base + this.getClassBonus('critChance'), 0.6); // Max 60%
    }

    getDodgeChance() {
        const base = 0.05 + (this.getStat('sentidos') * 0.008) + (this.getStat('agilidade') * 0.01);
        return Math.min(base + this.getClassBonus('dodgeChance'), 0.5); // Max 50%
    }

    getDefense() {
        let base = this.getStat('estamina') * 0.5;
        base *= (1 + this.getClassBonus('defense'));
        // Apply defense buff
        base *= (1 + this.getBuffValue('defense'));
        return base;
    }

    getAttackSpeed() {
        let speed = Math.max(0.5, 1 - (this.getStat('velocidade') * 0.02) - (this.getStat('agilidade') * 0.01));
        speed *= (1 - this.getClassBonus('attackSpeed'));
        return Math.max(0.2, speed);
    }

    getMoveSpeed() {
        let base = (21 + (this.getStat('velocidade') * 0.5) + (this.getStat('agilidade') * 0.3)) * 2;
        // Apply speed buff
        base *= (1 + this.getBuffValue('speed'));
        return base;
    }

    // Add stat point
    addStat(statName) {
        if (this.statPoints > 0 && this.baseStats.hasOwnProperty(statName)) {
            this.baseStats[statName]++;
            this.statPoints--;

            // Update current HP/MP if those stats were increased
            if (statName === 'hp' || statName === 'estamina') {
                const oldMax = this.getMaxHP() - (statName === 'hp' ? 1 : 5);
                const newMax = this.getMaxHP();
                this.currentHP += (newMax - oldMax);
            }
            if (statName === 'mp' || statName === 'inteligência') {
                const oldMax = this.getMaxMP() - (statName === 'mp' ? 3 : 3);
                const newMax = this.getMaxMP();
                this.currentMP += (newMax - oldMax);
            }

            return true;
        }
        return false;
    }

    // Add a temporary buff
    addBuff(type, value, duration) {
        // Check if buff of same type exists
        const existing = this.activeBuffs.find(b => b.type === type);
        if (existing) {
            // Refresh duration, take higher value
            existing.remaining = duration;
            existing.value = Math.max(existing.value, value);
        } else {
            this.activeBuffs.push({ type, value, duration, remaining: duration });
        }
    }

    // Gain XP and level up
    gainXP(amount) {
        // Apply XP buff
        const xpMult = 1 + this.getBuffValue('xp');
        amount = Math.floor(amount * xpMult);

        this.xp += amount;

        const leveledUp = [];
        while (this.xp >= this.xpToNextLevel) {
            this.xp -= this.xpToNextLevel;
            this.level++;
            this.statPoints += 4;
            this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.65);

            // Heal on level up
            this.currentHP = this.getMaxHP();
            this.currentMP = this.getMaxMP();

            leveledUp.push(this.level);
        }

        if (leveledUp.length > 0 && this.world && this.world.game && this.world.game.saveSystem) {
            this.world.game.saveSystem.saveGame(true);
        }

        return leveledUp;
    }

    // Equipment management
    equip(item) {
        if (!item || !item.slot) return false;

        const slot = item.slot;

        // Unequip current item in slot
        if (this.equipment[slot]) {
            this.unequip(slot);
        }

        // Equip new item
        this.equipment[slot] = item;

        // Apply equipment stats
        if (item.stats) {
            for (let stat in item.stats) {
                this.equipmentStats[stat] = (this.equipmentStats[stat] || 0) + item.stats[stat];
            }
        }

        return true;
    }

    unequip(slot) {
        const item = this.equipment[slot];
        if (!item) return null;

        // Remove equipment stats
        if (item.stats) {
            for (let stat in item.stats) {
                this.equipmentStats[stat] = (this.equipmentStats[stat] || 0) - item.stats[stat];
            }
        }

        this.equipment[slot] = null;

        // Make sure HP/MP don't exceed new max
        this.currentHP = Math.min(this.currentHP, this.getMaxHP());
        this.currentMP = Math.min(this.currentMP, this.getMaxMP());

        return item;
    }

    // Inventory management
    addToInventory(item) {
        // Check if stackable and already in inventory
        if (item.stackable) {
            const existing = this.inventory.find(invItem =>
                invItem.item.id === item.id
            );
            if (existing) {
                existing.count++;
                return true;
            }
        }

        // Add new item
        if (this.inventory.length < this.maxInventorySlots) {
            this.inventory.push({
                item: item,
                count: 1
            });
            return true;
        }

        return false; // Inventory full
    }

    removeFromInventory(itemId, count = 1) {
        const index = this.inventory.findIndex(invItem =>
            invItem.item.id === itemId
        );

        if (index !== -1) {
            this.inventory[index].count -= count;
            if (this.inventory[index].count <= 0) {
                this.inventory.splice(index, 1);
            }
            return true;
        }
        return false;
    }

    // Use consumable
    useItem(itemId) {
        const invItem = this.inventory.find(inv => inv.item.id === itemId);
        if (!invItem || invItem.item.type !== 'consumable') return false;

        const item = invItem.item;
        const effect = item.effect;

        // Healing effects
        if (effect.healHP) {
            this.currentHP = Math.min(this.currentHP + effect.healHP, this.getMaxHP());
        }
        if (effect.healMP) {
            this.currentMP = Math.min(this.currentMP + effect.healMP, this.getMaxMP());
        }

        // Reset stats
        if (effect.resetStats) {
            const totalStats = Object.values(this.baseStats).reduce((a, b) => a + b, 0);
            const baseTotal = 7 * 5;
            this.statPoints += (totalStats - baseTotal);

            for (let stat in this.baseStats) {
                this.baseStats[stat] = 5;
            }
        }

        // Escape scroll (handled by game.js)
        if (effect.escape) {
            this.removeFromInventory(itemId, 1);
            return 'escape';
        }

        // Buff consumables
        if (effect.buffType && effect.buffValue && effect.buffDuration) {
            this.addBuff(effect.buffType, effect.buffValue, effect.buffDuration);
        }

        this.removeFromInventory(itemId, 1);
        return true;
    }

    // Take damage
    takeDamage(damage) {
        const defense = this.getDefense();
        const actualDamage = Math.max(1, damage - defense);
        this.currentHP -= actualDamage;

        if (this.currentHP <= 0) {
            this.currentHP = 0;
            return { damage: actualDamage, isDead: true };
        }

        return { damage: actualDamage, isDead: false };
    }

    // Heal
    heal(amount) {
        const healMult = 1 + this.getClassBonus('healPower');
        this.currentHP = Math.min(this.currentHP + Math.floor(amount * healMult), this.getMaxHP());
    }

    // Update (called every frame)
    update(deltaTime) {
        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown -= deltaTime;
        }

        // Update dash cooldown
        if (this.dashCooldown > 0) {
            this.dashCooldown -= deltaTime;
        }

        // Track facing direction based on velocity
        if (this.velocityX !== 0 || this.velocityY !== 0) {
            const mag = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
            this.facingX = this.velocityX / mag;
            this.facingY = this.velocityY / mag;
        }

        // Apply velocity with world collision check
        const newX = this.x + this.velocityX * deltaTime;
        const newY = this.y + this.velocityY * deltaTime;

        if (this.world) {
            // Check X movement (raio 13 compatível com tile 32px)
            if (this.world.isWalkable(newX, this.y, 13)) {
                this.x = newX;
            }
            // Check Y movement
            if (this.world.isWalkable(this.x, newY, 13)) {
                this.y = newY;
            }
        } else {
            // Fallback: no world, just apply movement with canvas bounds
            this.x = Math.max(32, Math.min(1888, newX));
            this.y = Math.max(32, Math.min(1048, newY));
        }

        // Natural MP regeneration
        let mpRegen = this.getStat('inteligência') * 0.01;
        mpRegen += this.getClassBonus('mpRegen') * deltaTime;
        this.currentMP = Math.min(
            this.currentMP + mpRegen,
            this.getMaxMP()
        );

        // HP regeneration from class
        const hpRegen = this.getClassBonus('hpRegen') * deltaTime;
        if (hpRegen > 0) {
            this.currentHP = Math.min(this.currentHP + hpRegen, this.getMaxHP());
        }

        // Update buff timers
        for (let i = this.activeBuffs.length - 1; i >= 0; i--) {
            this.activeBuffs[i].remaining -= deltaTime;

            // Apply regen buff
            if (this.activeBuffs[i].type === 'regen') {
                this.currentHP = Math.min(
                    this.currentHP + this.activeBuffs[i].value * deltaTime,
                    this.getMaxHP()
                );
            }

            if (this.activeBuffs[i].remaining <= 0) {
                this.activeBuffs.splice(i, 1);
            }
        }

        // Update dynamic skill cooldowns
        if (this._cooldowns) {
            for (let key in this._cooldowns) {
                if (this._cooldowns[key] > 0) {
                    this._cooldowns[key] -= deltaTime;
                }
            }
        }
    }
}
