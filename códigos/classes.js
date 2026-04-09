// classes.js - Class system for Solo Leveling RPG
// 8 classes with attribute requirements, unique skills, and passive bonuses

const ClassDefinitions = {
    berserker: {
        id: 'berserker',
        name: 'Berserker',
        icon: '🪓',
        description: 'Guerreiro furioso focado em dano físico agressivo. Quanto menor seu HP, maior seu poder.',
        color: '#dc2626',
        requirements: { força: 15, constituição: 10 },
        statMultipliers: {
            hp: 1.1,
            mp: 0.9,
            força: 1.35,
            velocidade: 1.1,
            estamina: 1.1,
            sentidos: 1.0,
            inteligência: 0.85,
            constituição: 1.1,
            agilidade: 1.0,
            destreza: 1.0,
            sorte: 1.0
        },
        bonuses: {
            attackPower: 0.2,
            attackSpeed: 0.1,
            critChance: 0.05,
            defense: -0.1
        },
        passiveSkill: {
            id: 'berserker_rage',
            name: 'Fúria do Berserker',
            description: 'Quando HP cai abaixo de 30%, ganha +40% dano e +20% velocidade de ataque por 8s.',
            icon: '🔥'
        },
        classSkills: ['fury_strike', 'blood_rage', 'rampage']
    },

    cavaleiro: {
        id: 'cavaleiro',
        name: 'Cavaleiro',
        icon: '🛡️',
        description: 'Defensor implacável. Grande resistência e capacidade de absorver dano na linha de frente.',
        color: '#6366f1',
        requirements: { constituição: 15, força: 10 },
        statMultipliers: {
            hp: 1.4,
            mp: 1.0,
            força: 1.1,
            velocidade: 0.9,
            estamina: 1.3,
            sentidos: 1.0,
            inteligência: 0.95,
            constituição: 1.3,
            agilidade: 0.85,
            destreza: 1.0,
            sorte: 1.0
        },
        bonuses: {
            defense: 0.3,
            maxHP: 100,
            hpRegen: 5,
            attackPower: 0.05
        },
        passiveSkill: {
            id: 'iron_fortitude',
            name: 'Fortitude de Ferro',
            description: 'Reduz todo dano recebido em 15%. Ao receber dano letal, sobrevive com 1 HP (cooldown 120s).',
            icon: '🏰'
        },
        classSkills: ['divine_shield', 'taunt', 'fortress_stance']
    },

    assassino: {
        id: 'assassino',
        name: 'Assassino',
        icon: '🗡️',
        description: 'Mestre da morte silenciosa. Ataques rápidos, críticos devastadores e mobilidade extrema.',
        color: '#a855f7',
        requirements: { agilidade: 15, destreza: 15 },
        statMultipliers: {
            hp: 0.85,
            mp: 1.0,
            força: 1.0,
            velocidade: 1.4,
            estamina: 0.85,
            sentidos: 1.3,
            inteligência: 1.0,
            constituição: 0.85,
            agilidade: 1.4,
            destreza: 1.35,
            sorte: 1.1
        },
        bonuses: {
            critChance: 0.2,
            dodgeChance: 0.2,
            attackSpeed: 0.25,
            attackPower: 0.1
        },
        passiveSkill: {
            id: 'shadow_mastery',
            name: 'Maestria das Sombras',
            description: 'Críticos causam 300% de dano. Matar um inimigo concede +30% velocidade por 3s.',
            icon: '🌑'
        },
        classSkills: ['ambush', 'blade_rain', 'phantom_step']
    },

    mago_arcano: {
        id: 'mago_arcano',
        name: 'Mago Arcano',
        icon: '🔮',
        description: 'Canaliza energias arcanas devastadoras. Poder mágico imenso, mas frágil no corpo a corpo.',
        color: '#3b82f6',
        requirements: { inteligência: 15, mp: 15 },
        statMultipliers: {
            hp: 0.8,
            mp: 1.6,
            força: 0.8,
            velocidade: 1.0,
            estamina: 0.85,
            sentidos: 1.1,
            inteligência: 1.5,
            constituição: 0.8,
            agilidade: 1.0,
            destreza: 1.0,
            sorte: 1.0
        },
        bonuses: {
            magicPower: 0.4,
            mpRegen: 3,
            manaCostReduction: 0.2,
            defense: -0.15
        },
        passiveSkill: {
            id: 'arcane_overflow',
            name: 'Excesso Arcano',
            description: 'Habilidades têm 20% de chance de não consumir MP. A cada 5 habilidades, a próxima causa dano duplo.',
            icon: '✨'
        },
        classSkills: ['meteor_strike', 'arcane_explosion', 'mana_shield']
    },

    guardiao: {
        id: 'guardiao',
        name: 'Guardião',
        icon: '✝️',
        description: 'Protetor sagrado. Combina defesa robusta com regeneração e proteção contra dano.',
        color: '#f59e0b',
        requirements: { constituição: 12, inteligência: 12 },
        statMultipliers: {
            hp: 1.25,
            mp: 1.2,
            força: 1.05,
            velocidade: 0.95,
            estamina: 1.2,
            sentidos: 1.0,
            inteligência: 1.15,
            constituição: 1.25,
            agilidade: 0.9,
            destreza: 1.0,
            sorte: 1.0
        },
        bonuses: {
            defense: 0.2,
            healPower: 0.25,
            hpRegen: 8,
            mpRegen: 2,
            maxHP: 60
        },
        passiveSkill: {
            id: 'divine_protection',
            name: 'Proteção Divina',
            description: 'Regenera 1.5% do HP máximo por segundo. Allies próximos ganham +10% defesa.',
            icon: '🌟'
        },
        classSkills: ['aura_protection', 'bastion', 'holy_light']
    },

    cacador: {
        id: 'cacador',
        name: 'Caçador',
        icon: '🏹',
        description: 'Especialista em combate à distância. Causa dano extra contra monstros e possui alta precisão.',
        color: '#22c55e',
        requirements: { destreza: 15, agilidade: 10 },
        statMultipliers: {
            hp: 1.0,
            mp: 1.0,
            força: 1.0,
            velocidade: 1.15,
            estamina: 1.0,
            sentidos: 1.3,
            inteligência: 1.0,
            constituição: 1.0,
            agilidade: 1.15,
            destreza: 1.4,
            sorte: 1.1
        },
        bonuses: {
            critChance: 0.1,
            attackPower: 0.15,
            monsterDamage: 0.25,
            attackSpeed: 0.1
        },
        passiveSkill: {
            id: 'hunter_instinct',
            name: 'Instinto do Caçador',
            description: 'Causa 25% mais dano contra monstros. Cada acerto no mesmo alvo aumenta o dano em 5% (máx 25%).',
            icon: '🦅'
        },
        classSkills: ['precise_shot', 'trap', 'eagle_eye']
    },

    feiticeiro_vazio: {
        id: 'feiticeiro_vazio',
        name: 'Feiticeiro do Vazio',
        icon: '👁️',
        description: 'Manipulador de energias sombrias. Especialista em debuffs e enfraquecimento dos inimigos.',
        color: '#7c3aed',
        requirements: { inteligência: 20, sorte: 10 },
        statMultipliers: {
            hp: 0.85,
            mp: 1.5,
            força: 0.85,
            velocidade: 1.0,
            estamina: 0.9,
            sentidos: 1.2,
            inteligência: 1.45,
            constituição: 0.85,
            agilidade: 1.0,
            destreza: 1.0,
            sorte: 1.3
        },
        bonuses: {
            magicPower: 0.3,
            mpRegen: 2,
            debuffPower: 0.3,
            critChance: 0.05
        },
        passiveSkill: {
            id: 'void_corruption',
            name: 'Corrupção do Vazio',
            description: 'Ataques têm 20% de chance de aplicar debuff aleatório. Inimigos debuffados recebem 15% mais dano.',
            icon: '🌀'
        },
        classSkills: ['curse', 'void_vortex', 'soul_drain']
    },

    duelista: {
        id: 'duelista',
        name: 'Duelista',
        icon: '⚔️',
        description: 'Espadachim técnico e preciso. Mestre em esquivas, contra-ataques e golpes certeiros.',
        color: '#ec4899',
        requirements: { destreza: 15, agilidade: 15 },
        statMultipliers: {
            hp: 1.0,
            mp: 1.0,
            força: 1.1,
            velocidade: 1.2,
            estamina: 1.0,
            sentidos: 1.2,
            inteligência: 1.0,
            constituição: 1.0,
            agilidade: 1.35,
            destreza: 1.35,
            sorte: 1.05
        },
        bonuses: {
            dodgeChance: 0.25,
            critChance: 0.15,
            attackSpeed: 0.2,
            attackPower: 0.1,
            counterAttack: 0.3
        },
        passiveSkill: {
            id: 'perfect_counter',
            name: 'Contra-ataque Perfeito',
            description: 'Ao esquivar, 30% de chance de contra-atacar causando 200% dano. Combos aumentam dano.',
            icon: '⚡'
        },
        classSkills: ['riposte', 'flurry', 'blade_dance']
    },

    // ==================== RARE CLASSES ====================
    demonio: {
        id: 'demonio',
        name: 'Demônio',
        icon: '😈',
        isRare: true,
        description: 'Canaliza o poder demoníaco para causar destruição. Drena vida e causa dano massivo ao custo da própria saúde.',
        color: '#b91c1c',
        requirements: { força: 20, inteligência: 15 },
        statMultipliers: {
            hp: 1.15, mp: 1.2, força: 1.4, velocidade: 1.15,
            estamina: 1.0, sentidos: 1.1, inteligência: 1.2,
            constituição: 0.9, agilidade: 1.1, destreza: 1.05, sorte: 1.1
        },
        bonuses: {
            attackPower: 0.35, magicPower: 0.2, critChance: 0.1,
            defense: -0.1, hpRegen: -2
        },
        passiveSkill: {
            id: 'demonic_aura',
            name: 'Aura Demoníaca',
            description: 'Ataques drenam 8% do dano como HP. Ao matar, ganha +15% dano por 5s.',
            icon: '🔥'
        },
        classSkills: ['hellfire_blast', 'demon_grasp', 'infernal_sacrifice'],
        evolution: {
            evolvesTo: 'Rei Demônio',
            evolvedId: 'rei_demonio',
            conditions: { level: 35, bossesDefeated: 15 },
            conditionDesc: 'Nível 35 + Derrotar 15 Bosses'
        }
    },

    elementalista: {
        id: 'elementalista',
        name: 'Elementalista',
        icon: '🌪️',
        isRare: true,
        description: 'Mestre dos elementos. Alterna entre fogo, gelo e raio para adaptar-se a qualquer situação de combate.',
        color: '#06b6d4',
        requirements: { inteligência: 20, sorte: 12 },
        statMultipliers: {
            hp: 0.9, mp: 1.5, força: 0.85, velocidade: 1.1,
            estamina: 0.9, sentidos: 1.2, inteligência: 1.5,
            constituição: 0.85, agilidade: 1.1, destreza: 1.0, sorte: 1.2
        },
        bonuses: {
            magicPower: 0.45, mpRegen: 4, manaCostReduction: 0.15,
            critChance: 0.08
        },
        passiveSkill: {
            id: 'elemental_mastery',
            name: 'Maestria Elemental',
            description: 'Habilidades elementais causam 30% mais dano. Alternar elementos concede bônus temporário.',
            icon: '🌀'
        },
        classSkills: ['flame_wave', 'frost_nova', 'chain_lightning']
    },

    necromante: {
        id: 'necromante',
        name: 'Necromante',
        icon: '💀',
        isRare: true,
        description: 'Senhor da morte. Invoca espíritos, drena almas dos inimigos e se fortalece com cada morte ao redor.',
        color: '#6b21a8',
        requirements: { inteligência: 18, constituição: 12 },
        statMultipliers: {
            hp: 1.0, mp: 1.4, força: 0.9, velocidade: 1.0,
            estamina: 1.05, sentidos: 1.15, inteligência: 1.4,
            constituição: 1.1, agilidade: 0.95, destreza: 1.0, sorte: 1.15
        },
        bonuses: {
            magicPower: 0.3, hpRegen: 3, mpRegen: 3,
            debuffPower: 0.2, defense: 0.05
        },
        passiveSkill: {
            id: 'death_harvest',
            name: 'Colheita da Morte',
            description: 'Cada inimigo morto próximo restaura 5% HP e 3% MP. Dano +3% por kill recente (máx 30%).',
            icon: '☠️'
        },
        classSkills: ['soul_harvest', 'raise_dead', 'death_coil']
    },

    paladino_sombrio: {
        id: 'paladino_sombrio',
        name: 'Paladino Sombrio',
        icon: '⚜️',
        isRare: true,
        description: 'Guerreiro que domina luz e trevas. Combina defesa pesada com magia sombria para ser uma fortaleza imparável.',
        color: '#1e3a5f',
        requirements: { constituição: 18, força: 15, inteligência: 12 },
        statMultipliers: {
            hp: 1.3, mp: 1.2, força: 1.2, velocidade: 0.95,
            estamina: 1.25, sentidos: 1.0, inteligência: 1.15,
            constituição: 1.3, agilidade: 0.9, destreza: 1.0, sorte: 1.0
        },
        bonuses: {
            defense: 0.25, attackPower: 0.15, magicPower: 0.15,
            maxHP: 80, hpRegen: 6, mpRegen: 2
        },
        passiveSkill: {
            id: 'dark_resolve',
            name: 'Resolução Sombria',
            description: 'Dano recebido reduzido em 20%. Abaixo de 40% HP: +25% dano e +10% defesa extra.',
            icon: '🌑'
        },
        classSkills: ['dark_smite', 'shadow_barrier', 'twilight_judgment']
    }
};

// ==================== CLASS SKILLS DEFINITIONS ====================
const ClassSkillDefinitions = {
    // === BERSERKER ===
    fury_strike: {
        id: 'fury_strike',
        name: 'Golpe Furioso',
        description: 'Golpe devastador que causa 250% de dano. Dano aumenta em 50% se HP < 50%.',
        type: 'active',
        category: 'attack',
        manaCost: 25,
        cooldown: 10,
        icon: '🪓',
        targetType: 'enemy',
        range: 100,
        classId: 'berserker',
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => e && !e.isDead) : target;
            if (!enemy) return;
            let damage = player.getAttackPower() * 2.5;
            const hpPercent = player.currentHP / player.getMaxHP();
            if (hpPercent < 0.5) damage *= 1.5;
            const actualDamage = enemy.takeDamage(damage);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
        }
    },
    blood_rage: {
        id: 'blood_rage',
        name: 'Fúria Sanguinária',
        description: 'Entra em estado de fúria por 10s: +30% dano, +20% vel. ataque, mas recebe 10% mais dano.',
        type: 'active',
        category: 'utility',
        manaCost: 30,
        cooldown: 25,
        icon: '🩸',
        targetType: 'self',
        classId: 'berserker',
        execute: (player, target, game) => {
            player.addBuff('strength', 0.3, 10);
            player.addBuff('attackSpeedBuff', 0.2, 10);
            game.ui.showNotification('Fúria Sanguinária ativada! 🩸', 'buff');
        }
    },
    rampage: {
        id: 'rampage',
        name: 'Devastação',
        description: 'Ataca todos os inimigos ao redor causando 180% de dano.',
        type: 'active',
        category: 'attack',
        manaCost: 40,
        cooldown: 18,
        icon: '💥',
        targetType: 'area',
        range: 150,
        classId: 'berserker',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = player.getAttackPower() * 1.8;
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 150) {
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
        }
    },

    // === CAVALEIRO ===
    divine_shield: {
        id: 'divine_shield',
        name: 'Escudo Divino',
        description: 'Gera um escudo que absorve 300 + (nível×30) de dano por 10s.',
        type: 'active',
        category: 'defense',
        manaCost: 35,
        cooldown: 20,
        icon: '🛡️',
        targetType: 'self',
        classId: 'cavaleiro',
        execute: (player, target, game) => {
            const shieldAmount = 300 + player.level * 30;
            player.addBuff('defense', 0.5, 10);
            game.ui.showNotification(`Escudo Divino ativado! (${shieldAmount} absorção)`, 'buff');
        }
    },
    taunt: {
        id: 'taunt',
        name: 'Provocar',
        description: 'Provoca todos os inimigos próximos, forçando-os a atacar você por 5s.',
        type: 'active',
        category: 'utility',
        manaCost: 20,
        cooldown: 15,
        icon: '📢',
        targetType: 'area',
        range: 200,
        classId: 'cavaleiro',
        execute: (player, target, game) => {
            player.addBuff('defense', 0.3, 5);
            game.ui.showNotification('Inimigos provocados!', 'buff');
        }
    },
    fortress_stance: {
        id: 'fortress_stance',
        name: 'Postura Fortaleza',
        description: 'Fica imóvel por 8s, mas recebe 50% menos dano e regenera 3% HP/s.',
        type: 'active',
        category: 'defense',
        manaCost: 40,
        cooldown: 30,
        icon: '🏰',
        targetType: 'self',
        classId: 'cavaleiro',
        execute: (player, target, game) => {
            player.addBuff('defense', 0.5, 8);
            player.addBuff('regen', player.getMaxHP() * 0.03, 8);
            game.ui.showNotification('Postura Fortaleza! Defesa massiva + regeneração.', 'buff');
        }
    },

    // === ASSASSINO ===
    ambush: {
        id: 'ambush',
        name: 'Emboscada',
        description: 'Teleporta atrás do inimigo e causa 300% de dano crítico garantido.',
        type: 'active',
        category: 'attack',
        manaCost: 35,
        cooldown: 14,
        icon: '🌑',
        targetType: 'enemy',
        range: 250,
        classId: 'assassino',
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => !e.isDead) : target;
            if (!enemy) return;
            player.x = enemy.x + 30;
            player.y = enemy.y;
            const damage = player.getAttackPower() * 3;
            const actualDamage = enemy.takeDamage(damage);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
        }
    },
    blade_rain: {
        id: 'blade_rain',
        name: 'Chuva de Lâminas',
        description: 'Desfere 5 golpes rápidos, cada um causando 50% de dano com chance de crit individual.',
        type: 'active',
        category: 'attack',
        manaCost: 30,
        cooldown: 12,
        icon: '🗡️',
        targetType: 'enemy',
        range: 100,
        classId: 'assassino',
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => !e.isDead) : target;
            if (!enemy) return;
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    if (enemy.isDead) return;
                    let damage = player.getAttackPower() * 0.5;
                    const isCrit = Math.random() < player.getCritChance();
                    if (isCrit) damage *= 2;
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20 - i * 5, actualDamage, 'enemy', isCrit);
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }, i * 150);
            }
        }
    },
    phantom_step: {
        id: 'phantom_step',
        name: 'Passo Fantasma',
        description: 'Dash instantâneo de 200 unidades. Ganha esquiva 100% por 1s após usar.',
        type: 'active',
        category: 'mobility',
        manaCost: 20,
        cooldown: 8,
        icon: '💨',
        targetType: 'self',
        classId: 'assassino',
        execute: (player, target, game) => {
            const keys = game.keys || {};
            let dx = 0, dy = 0;
            if (keys['w']) dy -= 1;
            if (keys['s']) dy += 1;
            if (keys['a']) dx -= 1;
            if (keys['d']) dx += 1;
            const mag = Math.sqrt(dx * dx + dy * dy);
            if (mag > 0) { dx /= mag; dy /= mag; } else { dx = 1; }
            player.x += dx * 200;
            player.y += dy * 200;
            player.x = Math.max(32, Math.min(1888, player.x));
            player.y = Math.max(32, Math.min(1048, player.y));
        }
    },

    // === MAGO ARCANO ===
    meteor_strike: {
        id: 'meteor_strike',
        name: 'Meteoro',
        description: 'Invoca um meteoro que causa 400% de dano mágico em área.',
        type: 'active',
        category: 'attack',
        manaCost: 60,
        cooldown: 22,
        icon: '☄️',
        targetType: 'area',
        range: 250,
        classId: 'mago_arcano',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = player.getMagicPower() * 4;
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
        }
    },
    arcane_explosion: {
        id: 'arcane_explosion',
        name: 'Explosão Arcana',
        description: 'Libera uma explosão de energia arcana causando 250% de dano mágico ao redor.',
        type: 'active',
        category: 'attack',
        manaCost: 40,
        cooldown: 14,
        icon: '💫',
        targetType: 'area',
        range: 150,
        classId: 'mago_arcano',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = player.getMagicPower() * 2.5;
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 150) {
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
        }
    },
    mana_shield: {
        id: 'mana_shield',
        name: 'Escudo de Mana',
        description: 'Converte dano recebido em consumo de MP por 8s (1 dano = 2 MP).',
        type: 'active',
        category: 'defense',
        manaCost: 30,
        cooldown: 25,
        icon: '🔷',
        targetType: 'self',
        classId: 'mago_arcano',
        execute: (player, target, game) => {
            player.addBuff('defense', 0.4, 8);
            game.ui.showNotification('Escudo de Mana ativado!', 'buff');
        }
    },

    // === GUARDIÃO ===
    aura_protection: {
        id: 'aura_protection',
        name: 'Aura de Proteção',
        description: 'Ganha +30% defesa e regenera 5% HP máximo por segundo durante 8s.',
        type: 'active',
        category: 'defense',
        manaCost: 40,
        cooldown: 25,
        icon: '🌟',
        targetType: 'self',
        classId: 'guardiao',
        execute: (player, target, game) => {
            player.addBuff('defense', 0.3, 8);
            player.addBuff('regen', player.getMaxHP() * 0.05, 8);
            game.ui.showNotification('Aura de Proteção ativada!', 'buff');
        }
    },
    bastion: {
        id: 'bastion',
        name: 'Bastião',
        description: 'Reduz todo dano recebido em 60% por 5s.',
        type: 'active',
        category: 'defense',
        manaCost: 35,
        cooldown: 20,
        icon: '🏛️',
        targetType: 'self',
        classId: 'guardiao',
        execute: (player, target, game) => {
            player.addBuff('defense', 0.6, 5);
            game.ui.showNotification('Bastião ativado! Dano reduzido em 60%!', 'buff');
        }
    },
    holy_light: {
        id: 'holy_light',
        name: 'Luz Sagrada',
        description: 'Cura 40% do HP máximo instantaneamente.',
        type: 'active',
        category: 'utility',
        manaCost: 50,
        cooldown: 30,
        icon: '💛',
        targetType: 'self',
        classId: 'guardiao',
        execute: (player, target, game) => {
            const healAmount = Math.floor(player.getMaxHP() * 0.4);
            player.heal(healAmount);
            game.combat.showDamageNumber(player.x, player.y - 20, `+${healAmount}`, 'heal', false);
            game.ui.showNotification(`Luz Sagrada! +${healAmount} HP`, 'buff');
        }
    },

    // === CAÇADOR ===
    precise_shot: {
        id: 'precise_shot',
        name: 'Tiro Preciso',
        description: 'Dispara uma flecha certeira causando 280% de dano a longa distância.',
        type: 'active',
        category: 'attack',
        manaCost: 25,
        cooldown: 10,
        icon: '🎯',
        targetType: 'enemy',
        range: 300,
        classId: 'cacador',
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => !e.isDead) : target;
            if (!enemy) return;
            const damage = player.getAttackPower() * 2.8;
            const actualDamage = enemy.takeDamage(damage);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
        }
    },
    trap: {
        id: 'trap',
        name: 'Armadilha',
        description: 'Coloca uma armadilha que causa 150% de dano e aplica slow por 5s.',
        type: 'active',
        category: 'attack',
        manaCost: 20,
        cooldown: 15,
        icon: '🪤',
        targetType: 'area',
        range: 100,
        classId: 'cacador',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = player.getAttackPower() * 1.5;
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 100) {
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
            game.ui.showNotification('Armadilha colocada!', 'buff');
        }
    },
    eagle_eye: {
        id: 'eagle_eye',
        name: 'Olho de Águia',
        description: 'Aumenta chance de crítico em 25% e alcance de ataque em 50% por 12s.',
        type: 'active',
        category: 'utility',
        manaCost: 25,
        cooldown: 20,
        icon: '🦅',
        targetType: 'self',
        classId: 'cacador',
        execute: (player, target, game) => {
            player.addBuff('strength', 0.15, 12);
            game.ui.showNotification('Olho de Águia! Precisão aumentada!', 'buff');
        }
    },

    // === FEITICEIRO DO VAZIO ===
    curse: {
        id: 'curse',
        name: 'Maldição',
        description: 'Amaldiçoa um inimigo: -30% dano, -30% defesa por 10s.',
        type: 'active',
        category: 'attack',
        manaCost: 30,
        cooldown: 15,
        icon: '☠️',
        targetType: 'enemy',
        range: 200,
        classId: 'feiticeiro_vazio',
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => !e.isDead) : target;
            if (!enemy) return;
            const damage = player.getMagicPower() * 1.5;
            const actualDamage = enemy.takeDamage(damage);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
            game.ui.showNotification('Inimigo amaldiçoado!', 'buff');
        }
    },
    void_vortex: {
        id: 'void_vortex',
        name: 'Vórtice do Vazio',
        description: 'Cria um vórtice que causa 200% dano mágico em área e drena MP dos inimigos.',
        type: 'active',
        category: 'attack',
        manaCost: 45,
        cooldown: 18,
        icon: '🌀',
        targetType: 'area',
        range: 180,
        classId: 'feiticeiro_vazio',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = player.getMagicPower() * 2;
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                if (Math.sqrt(dx * dx + dy * dy) <= 180) {
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                    // Drain MP recovery
                    player.currentMP = Math.min(player.getMaxMP(), player.currentMP + 10);
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
        }
    },
    soul_drain: {
        id: 'soul_drain',
        name: 'Drenar Alma',
        description: 'Drena vida do inimigo: causa 180% dano mágico e cura 50% do dano como HP.',
        type: 'active',
        category: 'attack',
        manaCost: 35,
        cooldown: 14,
        icon: '👻',
        targetType: 'enemy',
        range: 150,
        classId: 'feiticeiro_vazio',
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => !e.isDead) : target;
            if (!enemy) return;
            const damage = player.getMagicPower() * 1.8;
            const actualDamage = enemy.takeDamage(damage);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
            const healAmount = Math.floor(actualDamage * 0.5);
            player.heal(healAmount);
            game.combat.showDamageNumber(player.x, player.y - 20, `+${healAmount}`, 'heal', false);
            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
        }
    },

    // === DUELISTA ===
    riposte: {
        id: 'riposte',
        name: 'Riposte',
        description: 'Entra em postura defensiva por 3s. O próximo ataque recebido é anulado e contra-ataca com 250% dano.',
        type: 'active',
        category: 'defense',
        manaCost: 25,
        cooldown: 12,
        icon: '⚡',
        targetType: 'self',
        classId: 'duelista',
        execute: (player, target, game) => {
            player.counterActive = true;
            player.counterDamageMultiplier = 2.5;
            setTimeout(() => { player.counterActive = false; }, 3000);
            game.ui.showNotification('Riposte pronto! Aguardando contra-ataque...', 'buff');
        }
    },
    flurry: {
        id: 'flurry',
        name: 'Rajada de Golpes',
        description: 'Desfere 7 golpes rápidos causando 40% de dano cada. Cada hit aumenta crit em 5%.',
        type: 'active',
        category: 'attack',
        manaCost: 30,
        cooldown: 14,
        icon: '⚔️',
        targetType: 'enemy',
        range: 100,
        classId: 'duelista',
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => !e.isDead) : target;
            if (!enemy) return;
            for (let i = 0; i < 7; i++) {
                setTimeout(() => {
                    if (enemy.isDead) return;
                    let damage = player.getAttackPower() * 0.4;
                    const isCrit = Math.random() < (player.getCritChance() + i * 0.05);
                    if (isCrit) damage *= 2;
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20 - i * 4, actualDamage, 'enemy', isCrit);
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }, i * 120);
            }
        }
    },
    blade_dance: {
        id: 'blade_dance',
        name: 'Dança das Lâminas',
        description: 'Executa uma dança mortal: ganha +40% esquiva e +20% dano por 8s.',
        type: 'active',
        category: 'utility',
        manaCost: 35,
        cooldown: 22,
        icon: '💃',
        targetType: 'self',
        classId: 'duelista',
        execute: (player, target, game) => {
            player.addBuff('strength', 0.2, 8);
            player.addBuff('speed', 0.3, 8);
            game.ui.showNotification('Dança das Lâminas ativada!', 'buff');
        }
    },

    // === DEMÔNIO (Rare) ===
    hellfire_blast: {
        id: 'hellfire_blast',
        name: 'Explosão Infernal',
        description: 'Libera uma explosão de fogo infernal causando 350% de dano em área.',
        type: 'active', category: 'attack', manaCost: 45, cooldown: 16,
        icon: '🔥', targetType: 'area', range: 180, classId: 'demonio',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = player.getAttackPower() * 3.5;
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x; const dy = enemy.y - player.y;
                if (Math.sqrt(dx*dx + dy*dy) <= 180) {
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
        }
    },
    demon_grasp: {
        id: 'demon_grasp',
        name: 'Garra Demoníaca',
        description: 'Agarra um inimigo causando 280% dano e drena 50% como HP.',
        type: 'active', category: 'attack', manaCost: 35, cooldown: 12,
        icon: '🖐️', targetType: 'enemy', range: 120, classId: 'demonio',
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => !e.isDead) : target;
            if (!enemy) return;
            const damage = player.getAttackPower() * 2.8;
            const actualDamage = enemy.takeDamage(damage);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
            const healAmount = Math.floor(actualDamage * 0.5);
            player.heal(healAmount);
            game.combat.showDamageNumber(player.x, player.y - 20, `+${healAmount}`, 'heal', false);
            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
        }
    },
    infernal_sacrifice: {
        id: 'infernal_sacrifice',
        name: 'Sacrifício Infernal',
        description: 'Sacrifica 20% do HP para ganhar +50% dano e +30% vel. ataque por 10s.',
        type: 'active', category: 'utility', manaCost: 20, cooldown: 30,
        icon: '💉', targetType: 'self', classId: 'demonio',
        execute: (player, target, game) => {
            player.currentHP -= Math.floor(player.getMaxHP() * 0.2);
            if (player.currentHP < 1) player.currentHP = 1;
            player.addBuff('strength', 0.5, 10);
            player.addBuff('attackSpeedBuff', 0.3, 10);
            game.ui.showNotification('Sacrifício Infernal! Poder demoníaco liberado! 😈', 'buff');
        }
    },

    // === ELEMENTALISTA (Rare) ===
    flame_wave: {
        id: 'flame_wave',
        name: 'Onda de Chamas',
        description: 'Lança uma onda de fogo causando 300% dano mágico em área frontal.',
        type: 'active', category: 'attack', manaCost: 40, cooldown: 14,
        icon: '🔥', targetType: 'area', range: 200, classId: 'elementalista',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = player.getMagicPower() * 3;
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x; const dy = enemy.y - player.y;
                if (Math.sqrt(dx*dx + dy*dy) <= 200) {
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
        }
    },
    frost_nova: {
        id: 'frost_nova',
        name: 'Nova de Gelo',
        description: 'Explode gelo ao redor causando 250% dano e aplicando slow.',
        type: 'active', category: 'attack', manaCost: 45, cooldown: 18,
        icon: '❄️', targetType: 'area', range: 160, classId: 'elementalista',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = player.getMagicPower() * 2.5;
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x; const dy = enemy.y - player.y;
                if (Math.sqrt(dx*dx + dy*dy) <= 160) {
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
            game.ui.showNotification('Nova de Gelo! Inimigos desacelerados! ❄️', 'buff');
        }
    },
    chain_lightning: {
        id: 'chain_lightning',
        name: 'Corrente de Raios',
        description: 'Raio que salta entre 5 inimigos causando 200% dano mágico cada.',
        type: 'active', category: 'attack', manaCost: 50, cooldown: 16,
        icon: '⚡', targetType: 'area', range: 250, classId: 'elementalista',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target.filter(e => !e.isDead) : game.enemySpawner.getAllEnemies().filter(e => !e.isDead);
            const damage = player.getMagicPower() * 2;
            const targets = enemies.slice(0, 5);
            targets.forEach((enemy, i) => {
                setTimeout(() => {
                    if (enemy.isDead) return;
                    const actualDamage = enemy.takeDamage(damage);
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }, i * 100);
            });
        }
    },

    // === NECROMANTE (Rare) ===
    soul_harvest: {
        id: 'soul_harvest',
        name: 'Colheita de Almas',
        description: 'Drena vida de todos inimigos próximos: 200% dano, cura 30% do dano.',
        type: 'active', category: 'attack', manaCost: 40, cooldown: 15,
        icon: '💀', targetType: 'area', range: 150, classId: 'necromante',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = player.getMagicPower() * 2;
            let totalDamage = 0;
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x; const dy = enemy.y - player.y;
                if (Math.sqrt(dx*dx + dy*dy) <= 150) {
                    const actualDamage = enemy.takeDamage(damage);
                    totalDamage += actualDamage;
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
            const healAmount = Math.floor(totalDamage * 0.3);
            if (healAmount > 0) {
                player.heal(healAmount);
                game.combat.showDamageNumber(player.x, player.y - 20, `+${healAmount}`, 'heal', false);
            }
        }
    },
    raise_dead: {
        id: 'raise_dead',
        name: 'Erguer Mortos',
        description: 'Invoca espíritos que causam 150% dano a todos inimigos por 8s.',
        type: 'active', category: 'utility', manaCost: 50, cooldown: 25,
        icon: '👻', targetType: 'self', classId: 'necromante',
        execute: (player, target, game) => {
            player.addBuff('strength', 0.35, 8);
            player.addBuff('regen', player.getMaxHP() * 0.02, 8);
            game.ui.showNotification('Espíritos invocados! Poder amplificado! 👻', 'buff');
        }
    },
    death_coil: {
        id: 'death_coil',
        name: 'Espiral da Morte',
        description: 'Projétil sombrio: 350% dano mágico a um alvo, cura caster em 40% do dano.',
        type: 'active', category: 'attack', manaCost: 45, cooldown: 14,
        icon: '🌑', targetType: 'enemy', range: 200, classId: 'necromante',
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => !e.isDead) : target;
            if (!enemy) return;
            const damage = player.getMagicPower() * 3.5;
            const actualDamage = enemy.takeDamage(damage);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
            const healAmount = Math.floor(actualDamage * 0.4);
            player.heal(healAmount);
            game.combat.showDamageNumber(player.x, player.y - 20, `+${healAmount}`, 'heal', false);
            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
        }
    },

    // === PALADINO SOMBRIO (Rare) ===
    dark_smite: {
        id: 'dark_smite',
        name: 'Golpe Sombrio',
        description: 'Golpe devastador com energia sombria: 300% dano + 20% do HP máximo como dano extra.',
        type: 'active', category: 'attack', manaCost: 40, cooldown: 14,
        icon: '⚜️', targetType: 'enemy', range: 120, classId: 'paladino_sombrio',
        execute: (player, target, game) => {
            const enemy = Array.isArray(target) ? target.find(e => !e.isDead) : target;
            if (!enemy) return;
            const damage = player.getAttackPower() * 3 + player.getMaxHP() * 0.2;
            const actualDamage = enemy.takeDamage(damage);
            game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
            if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
        }
    },
    shadow_barrier: {
        id: 'shadow_barrier',
        name: 'Barreira Sombria',
        description: 'Cria barreira: +50% defesa por 8s e regenera 3% HP/s.',
        type: 'active', category: 'defense', manaCost: 45, cooldown: 25,
        icon: '🛡️', targetType: 'self', classId: 'paladino_sombrio',
        execute: (player, target, game) => {
            player.addBuff('defense', 0.5, 8);
            player.addBuff('regen', player.getMaxHP() * 0.03, 8);
            game.ui.showNotification('Barreira Sombria ativada! 🛡️', 'buff');
        }
    },
    twilight_judgment: {
        id: 'twilight_judgment',
        name: 'Julgamento Crepuscular',
        description: 'Causa 250% dano em área e cura 20% do dano total causado.',
        type: 'active', category: 'attack', manaCost: 55, cooldown: 20,
        icon: '🌅', targetType: 'area', range: 180, classId: 'paladino_sombrio',
        execute: (player, target, game) => {
            const enemies = Array.isArray(target) ? target : game.enemySpawner.getAllEnemies();
            const damage = player.getAttackPower() * 2.5;
            let totalDamage = 0;
            enemies.forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - player.x; const dy = enemy.y - player.y;
                if (Math.sqrt(dx*dx + dy*dy) <= 180) {
                    const actualDamage = enemy.takeDamage(damage);
                    totalDamage += actualDamage;
                    game.combat.showDamageNumber(enemy.x, enemy.y - 20, actualDamage, 'enemy', true);
                    if (enemy.isDead) game.combat.onEnemyDeath(player, enemy);
                }
            });
            const healAmount = Math.floor(totalDamage * 0.2);
            if (healAmount > 0) {
                player.heal(healAmount);
                game.combat.showDamageNumber(player.x, player.y - 20, `+${healAmount}`, 'heal', false);
            }
        }
    }
};


class ClassSystem {
    constructor(game) {
        this.game = game;
        this.unlockLevel = 15;
        this.rareUnlockLevel = 25;
        this.classSelected = false;
        this.classPromptDismissed = false;
        this.classPromptShownAt15 = false;
        this.classPromptShownAt25 = false;
    }

    // Check if player can choose a class
    canChooseClass(player) {
        return player.level >= this.unlockLevel && !player.playerClass;
    }

    // Check if player meets requirements for a class
    meetsRequirements(player, classId) {
        const classDef = ClassDefinitions[classId];
        if (!classDef || !classDef.requirements) return true;

        for (const [stat, minVal] of Object.entries(classDef.requirements)) {
            const playerVal = player.baseStats[stat];
            if (playerVal === undefined || playerVal < minVal) {
                return false;
            }
        }
        return true;
    }

    // Get missing requirements for a class
    getMissingRequirements(player, classId) {
        const classDef = ClassDefinitions[classId];
        if (!classDef || !classDef.requirements) return [];

        const missing = [];
        for (const [stat, minVal] of Object.entries(classDef.requirements)) {
            const playerVal = player.baseStats[stat] || 0;
            if (playerVal < minVal) {
                missing.push({ stat, required: minVal, current: playerVal });
            }
        }
        return missing;
    }

    // Get all available (unlocked) classes for a player
    getAvailableClasses(player) {
        const available = [];
        for (const classId in ClassDefinitions) {
            if (this.meetsRequirements(player, classId)) {
                available.push(classId);
            }
        }
        return available;
    }

    // Show class selection UI
    showClassSelection(showRare = false) {
        if (this.game.ui) {
            this.game.ui.showClassSelection(showRare);
        }
    }

    // Select a class for the player
    selectClass(player, classId) {
        const classDef = ClassDefinitions[classId];
        if (!classDef) return false;

        // Verify requirements
        if (!this.meetsRequirements(player, classId)) {
            if (this.game.ui) {
                this.game.ui.showNotification('Você não atende aos requisitos desta classe!', 'warning');
            }
            return false;
        }

        player.playerClass = classId;
        player.classData = { ...classDef };
        player.classMultipliers = classDef.statMultipliers;
        player.classBonuses = classDef.bonuses;

        // Add class skills to player skill manager
        if (classDef.classSkills) {
            classDef.classSkills.forEach(skillId => {
                const skillDef = ClassSkillDefinitions[skillId];
                if (skillDef && player.skillManager) {
                    player.skillManager.addSkill(skillDef);
                }
            });
        }

        // Recalculate HP and MP with new multipliers
        player.currentHP = player.getMaxHP();
        player.currentMP = player.getMaxMP();

        this.classSelected = true;

        if (this.game.ui) {
            this.game.ui.showNotification(`Classe ${classDef.name} selecionada! ${classDef.icon}`, 'level-up');
            this.game.ui.updateClassDisplay(player);
            this.game.ui.updateBars(player);
            this.game.ui.updateStatsDisplay(player);
        }

        return true;
    }

    // Get class definition
    getClassDef(classId) {
        return ClassDefinitions[classId] || null;
    }

    // Get all class definitions
    getAllClasses() {
        return ClassDefinitions;
    }

    // Check on level up if class should be offered
    checkClassUnlock(player) {
        if (player.playerClass) return; // Already has a class

        // Level 15: show normal classes
        if (player.level >= this.unlockLevel && !this.classPromptShownAt15) {
            this.classPromptShownAt15 = true;
            this.showClassSelection(false);
            if (this.game.ui) {
                this.game.ui.showNotification('🎉 Nível 15! Você pode agora escolher uma classe!', 'level-up');
            }
        }

        // Level 25: show rare classes too
        if (player.level >= this.rareUnlockLevel && !this.classPromptShownAt25) {
            this.classPromptShownAt25 = true;
            this.showClassSelection(true);
            if (this.game.ui) {
                this.game.ui.showNotification('🌟 Nível 25! Classes Raras Especiais desbloqueadas!', 'level-up');
            }
        }
    }

    // Check if class can evolve
    checkEvolution(player) {
        if (!player.playerClass || !player.classData) return;

        const classDef = ClassDefinitions[player.playerClass];
        if (!classDef || !classDef.evolution) return;
        if (player.classEvolved) return; // Already evolved

        const evo = classDef.evolution;
        const conditions = evo.conditions;
        let canEvolve = true;

        if (conditions.level && player.level < conditions.level) canEvolve = false;
        if (conditions.bossesDefeated && (player.bossesDefeated || 0) < conditions.bossesDefeated) canEvolve = false;

        if (canEvolve) {
            this.evolveClass(player, classDef, evo);
        }
    }

    // Evolve class
    evolveClass(player, classDef, evolution) {
        player.classEvolved = true;
        player.classData.name = evolution.evolvesTo;
        player.classData.icon = classDef.id === 'demonio' ? '👹' : classDef.icon;

        // Boost all stat multipliers by 10%
        for (const stat in player.classMultipliers) {
            player.classMultipliers[stat] *= 1.1;
        }

        // Boost bonuses
        for (const bonus in player.classBonuses) {
            if (typeof player.classBonuses[bonus] === 'number') {
                player.classBonuses[bonus] *= 1.2;
            }
        }

        // Recalculate
        player.currentHP = player.getMaxHP();
        player.currentMP = player.getMaxMP();

        if (this.game.ui) {
            this.game.ui.showNotification(`🔥 EVOLUÇÃO! ${classDef.name} → ${evolution.evolvesTo}! 🔥`, 'level-up');
            this.game.ui.updateClassDisplay(player);
            this.game.ui.updateBars(player);
            this.game.ui.updateStatsDisplay(player);
        }
    }
}
