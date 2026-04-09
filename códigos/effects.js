// effects.js - Status effects and modifier system for Solo Leveling RPG

// Base Effect class
class Effect {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.type = config.type; // 'buff', 'debuff', 'damage_over_time', 'heal_over_time'
        this.duration = config.duration; // in seconds, -1 for permanent
        this.remainingTime = config.duration;
        this.tickInterval = config.tickInterval || 1; // How often effect triggers (seconds)
        this.timeSinceLastTick = 0;
        this.stacks = config.stacks || 1;
        this.maxStacks = config.maxStacks || 1;
        this.value = config.value; // Effect magnitude
        this.source = config.source; // Who applied this effect
        this.visual = config.visual || null; // Visual indicator
    }

    update(deltaTime) {
        if (this.duration === -1) return false; // Permanent effect

        this.remainingTime -= deltaTime;
        this.timeSinceLastTick += deltaTime;

        return this.remainingTime <= 0;
    }

    shouldTick() {
        if (this.timeSinceLastTick >= this.tickInterval) {
            this.timeSinceLastTick = 0;
            return true;
        }
        return false;
    }

    addStack() {
        if (this.stacks < this.maxStacks) {
            this.stacks++;
            return true;
        }
        return false;
    }

    refreshDuration() {
        this.remainingTime = this.duration;
    }
}

// Effect Manager - manages all active effects on entities
class EffectManager {
    constructor() {
        this.effects = new Map(); // Map of targetId -> array of effects
    }

    // Apply effect to a target
    applyEffect(targetId, effectConfig) {
        if (!this.effects.has(targetId)) {
            this.effects.set(targetId, []);
        }

        const targetEffects = this.effects.get(targetId);

        // Check if effect already exists
        const existingEffect = targetEffects.find(e => e.id === effectConfig.id);

        if (existingEffect) {
            // Refresh duration and add stacks if stackable
            existingEffect.refreshDuration();
            if (effectConfig.stackable) {
                existingEffect.addStack();
            }
        } else {
            // Create new effect
            const newEffect = new Effect(effectConfig);
            targetEffects.push(newEffect);
        }
    }

    // Remove effect from target
    removeEffect(targetId, effectId) {
        if (!this.effects.has(targetId)) return;

        const targetEffects = this.effects.get(targetId);
        const index = targetEffects.findIndex(e => e.id === effectId);

        if (index !== -1) {
            targetEffects.splice(index, 1);
        }
    }

    // Get all effects on a target
    getEffects(targetId) {
        return this.effects.get(targetId) || [];
    }

    // Check if target has specific effect
    hasEffect(targetId, effectId) {
        if (!this.effects.has(targetId)) return false;
        return this.effects.get(targetId).some(e => e.id === effectId);
    }

    // Get specific effect
    getEffect(targetId, effectId) {
        if (!this.effects.has(targetId)) return null;
        return this.effects.get(targetId).find(e => e.id === effectId) || null;
    }

    // Update all effects
    update(deltaTime) {
        for (const [targetId, effectList] of this.effects.entries()) {
            for (let i = effectList.length - 1; i >= 0; i--) {
                const effect = effectList[i];
                const expired = effect.update(deltaTime);

                if (expired) {
                    effectList.splice(i, 1);
                }
            }
        }
    }

    // Clear all effects from target
    clearEffects(targetId) {
        this.effects.delete(targetId);
    }

    // Clear all effects
    clearAll() {
        this.effects.clear();
    }
}

// Common effect definitions
const EffectDefinitions = {
    // Damage over time
    BURN: {
        id: 'burn',
        name: 'Queimadura',
        type: 'damage_over_time',
        duration: 5,
        tickInterval: 1,
        value: 10, // damage per tick
        visual: { color: '#ff6600', icon: '🔥' }
    },

    POISON: {
        id: 'poison',
        name: 'Veneno',
        type: 'damage_over_time',
        duration: 8,
        tickInterval: 1,
        value: 5,
        visual: { color: '#00ff00', icon: '☠️' }
    },

    BLEED: {
        id: 'bleed',
        name: 'Sangramento',
        type: 'damage_over_time',
        duration: 6,
        tickInterval: 0.5,
        value: 3,
        stackable: true,
        maxStacks: 5,
        visual: { color: '#ff0000', icon: '💉' }
    },

    // Debuffs
    SLOW: {
        id: 'slow',
        name: 'Lentidão',
        type: 'debuff',
        duration: 4,
        value: 0.5, // 50% speed reduction
        visual: { color: '#4444ff', icon: '❄️' }
    },

    STUN: {
        id: 'stun',
        name: 'Atordoado',
        type: 'debuff',
        duration: 2,
        value: 1, // complete disable
        visual: { color: '#ffff00', icon: '⚡' }
    },

    VOID_MARK: {
        id: 'void_mark',
        name: 'Marca do Vazio',
        type: 'debuff',
        duration: 6,
        value: 0.3, // 30% defense reduction
        visual: { color: '#9900ff', icon: '👁️' }
    },

    WEAKNESS: {
        id: 'weakness',
        name: 'Fraqueza',
        type: 'debuff',
        duration: 10,
        value: 0.25, // 25% damage reduction
        visual: { color: '#666666', icon: '⬇️' }
    },

    // Buffs
    SHIELD: {
        id: 'shield',
        name: 'Escudo',
        type: 'buff',
        duration: 5,
        value: 100, // shield amount
        visual: { color: '#00ffff', icon: '🛡️' }
    },

    STRENGTH: {
        id: 'strength',
        name: 'Força',
        type: 'buff',
        duration: 15,
        value: 1.5, // 50% damage increase
        visual: { color: '#ff0000', icon: '💪' }
    },

    SPEED_BOOST: {
        id: 'speed_boost',
        name: 'Velocidade',
        type: 'buff',
        duration: 8,
        value: 1.5, // 50% speed increase
        visual: { color: '#ffff00', icon: '⚡' }
    },

    REGENERATION: {
        id: 'regeneration',
        name: 'Regeneração',
        type: 'heal_over_time',
        duration: 10,
        tickInterval: 1,
        value: 5, // heal per tick
        visual: { color: '#00ff00', icon: '💚' }
    },

    ECHO_STACK: {
        id: 'echo_stack',
        name: 'Eco',
        type: 'buff',
        duration: 2,
        value: 0.04, // 4% damage per stack
        stackable: true,
        maxStacks: 6,
        visual: { color: '#00ccff', icon: '🔊' }
    },

    KNOCKDOWN: {
        id: 'knockdown',
        name: 'Derrubado',
        type: 'debuff',
        duration: 2,
        value: 1, // complete disable
        visual: { color: '#8B4513', icon: '💫' }
    },

    MAGIC_BLEED: {
        id: 'magic_bleed',
        name: 'Sangramento Mágico',
        type: 'damage_over_time',
        duration: 5,
        tickInterval: 1,
        value: 8, // magic damage per tick
        visual: { color: '#9933ff', icon: '🩸' }
    },

    SHADOW_DAMAGE: {
        id: 'shadow_damage',
        name: 'Dano Sombrio',
        type: 'buff',
        duration: 8,
        value: 0.4, // 40% extra shadow damage
        visual: { color: '#1a0033', icon: '👿' }
    },

    IMMOBILIZE: {
        id: 'immobilize',
        name: 'Imobilizado',
        type: 'debuff',
        duration: 1.5,
        value: 1, // complete movement disable
        visual: { color: '#666699', icon: '⛓️' }
    },

    INVULNERABLE: {
        id: 'invulnerable',
        name: 'Invulnerável',
        type: 'buff',
        duration: 1,
        value: 1, // complete immunity
        visual: { color: '#ffffff', icon: '✨' }
    }
};

// Helper function to create effect
function createEffect(effectType, customConfig = {}) {
    const baseConfig = EffectDefinitions[effectType];
    if (!baseConfig) {
        console.error(`Effect type ${effectType} not found`);
        return null;
    }

    return { ...baseConfig, ...customConfig };
}
