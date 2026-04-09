// items.js - Item database for Solo Leveling RPG

const ItemDatabase = {
    // Weapons
    rusty_dagger: {
        id: 'rusty_dagger',
        name: 'Adaga Enferrujada',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'common',
        stats: { força: 2, velocidade: 1 },
        description: 'Uma adaga velha e enferrujada.',
        icon: '../imagens equipamentos/adaga enferrujada.png'
    },
    iron_sword: {
        id: 'iron_sword',
        name: 'Espada de Ferro',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'common',
        stats: { força: 5, estamina: 2 },
        description: 'Uma espada básica de ferro.',
        icon: '../imagens equipamentos/espada de ferro.png'
    },
    steel_blade: {
        id: 'steel_blade',
        name: 'Lâmina de Aço',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'rare',
        stats: { força: 12, velocidade: 5 },
        description: 'Uma lâmina afiada de aço de alta qualidade.'
    },
    shadow_dagger: {
        id: 'shadow_dagger',
        name: 'Adaga das Sombras',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'epic',
        stats: { força: 20, velocidade: 15, sentidos: 10 },
        description: 'Uma adaga que se move nas sombras.'
    },
    demon_blade: {
        id: 'demon_blade',
        name: 'Lâmina Demoníaca',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'legendary',
        stats: { força: 40, velocidade: 20, sentidos: 15 },
        description: 'Uma lâmina lendária imbuída com poder demoníaco.'
    },

    // === SPECIAL WEAPONS ===

    // Lâmina do Eco (Echo Blade)
    echo_blade: {
        id: 'echo_blade',
        name: 'Lâmina do Eco',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'epic',
        stats: { força: 18, velocidade: 12, sentidos: 8 },
        baseDamage: 75,
        attackSpeed: 0.4, // attacks per second
        range: 90,
        description: 'Uma espada média que ressoa com cada golpe consecutivo.',
        passiveEffects: {
            name: 'Ressonância do Eco',
            description: 'Cada golpe consecutivo no mesmo inimigo aplica uma stack de Eco, aumentando o dano em 4% (máx 6 stacks). Ao atingir 6 stacks, causa Echo Burst em área.',
            stackDamageBonus: 0.04,
            maxStacks: 6,
            stackLossTime: 2, // seconds without attacking same target
            burstRadius: 100,
            burstDamageMultiplier: 2
        },
        activeSkill: {
            name: 'Explosão do Eco',
            description: 'Consome todas as stacks de Eco para causar dano massivo.',
            manaCost: 25,
            cooldown: 12,
            damagePerStack: 50
        },
        onHitEffects: {
            applyStack: true,
            stackId: 'echo_stack'
        },
        scalingRules: {
            damageScaling: 'força',
            speedScaling: 'velocidade',
            critScaling: 'sentidos'
        }
    },

    // Espada do Vazio (Void Sword)
    void_sword: {
        id: 'void_sword',
        name: 'Espada do Vazio',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'epic',
        stats: { força: 28, inteligência: 15, mp: 30 },
        baseDamage: 120,
        attackSpeed: 0.7,
        range: 100,
        description: 'Uma espada pesada que ignora as defesas mundanas e marca alvos com o vazio.',
        passiveEffects: {
            name: 'Toque do Vazio',
            description: 'Ignora 30% da defesa do inimigo. 25% de chance de aplicar Marca do Vazio, reduzindo defesa do alvo em 30% por 6 segundos.',
            defenseIgnore: 0.3,
            voidMarkChance: 0.25,
            voidMarkDefenseReduction: 0.3,
            voidMarkDuration: 6
        },
        activeSkill: {
            name: 'Corte do Vazio',
            description: 'Dispara uma lâmina de energia em linha reta que atravessa inimigos, causando dano e aplicando Marca do Vazio.',
            manaCost: 40,
            cooldown: 15,
            damageMultiplier: 1.8,
            range: 300
        },
        onHitEffects: {
            applyVoidMark: true,
            probability: 0.25
        },
        scalingRules: {
            damageScaling: 'força',
            abilityScaling: 'inteligência'
        }
    },

    // Fio Solar (Solar Thread)
    solar_thread: {
        id: 'solar_thread',
        name: 'Fio Solar',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'rare',
        stats: { força: 15, velocidade: 18, inteligência: 10 },
        baseDamage: 60,
        attackSpeed: 0.3,
        range: 85,
        description: 'Uma espada leve que brilha com a luz do sol, devastadora contra criaturas das trevas.',
        passiveEffects: {
            name: 'Luz Purificadora',
            description: '+50% de dano contra inimigos sombrios, mortos-vivos ou corrompidos. 20% de chance de aplicar Queimadura.',
            bonusDamageTypes: ['shadow', 'undead', 'corrupted'],
            bonusDamageMultiplier: 1.5,
            burnChance: 0.2,
            burnDamage: 15,
            burnDuration: 5
        },
        activeSkill: {
            name: 'Explosão Solar',
            description: 'Libera uma explosão de luz solar ao redor, causando dano e aplicando Queimadura em todos os inimigos próximos.',
            manaCost: 30,
            cooldown: 10,
            radius: 120,
            damageMultiplier: 1.4
        },
        onHitEffects: {
            burnChance: 0.2,
            extraDamageVsEvil: true
        },
        scalingRules: {
            damageScaling: 'força',
            speedScaling: 'velocidade',
            abilityScaling: 'inteligência'
        }
    },

    // Arma Viva (Living Weapon) - Evolutiva
    living_weapon: {
        id: 'living_weapon',
        name: 'Arma Viva',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'legendary',
        stats: { força: 10, velocidade: 5, inteligência: 5 },
        baseDamage: 40,
        attackSpeed: 0.5,
        range: 80,
        description: 'Uma arma misteriosa que evolui com seu portador.',
        evolutionState: 'dormant', // dormant, awakened, ascended
        evolutionProgress: {
            kills: 0,
            perfectDodges: 0,
            dungeonsExplored: 0
        },
        evolutionRequirements: {
            awakened: { kills: 50, perfectDodges: 20, dungeonsExplored: 5 },
            ascended: { kills: 200, perfectDodges: 50, dungeonsExplored: 12 }
        },
        stateEffects: {
            dormant: {
                baseDamage: 40,
                stats: { força: 10, velocidade: 5, inteligência: 5 },
                passive: 'Crescimento: Ganha experiência através de combate.'
            },
            awakened: {
                baseDamage: 85,
                stats: { força: 25, velocidade: 15, inteligência: 15 },
                passive: 'Sede de Sangue: +10% de dano para cada inimigo morto recentemente (máx 5).',
                activeSkill: {
                    name: 'Fúria Desperta',
                    description: 'Aumenta velocidade de ataque em 50% por 8 segundos.',
                    manaCost: 30,
                    cooldown: 20
                }
            },
            ascended: {
                baseDamage: 150,
                stats: { força: 50, velocidade: 30, inteligência: 25 },
                passive: 'Domínio Absoluto: +15% de dano, +10% crítico, +15% velocidade. Inimigos derrotados têm 10% de chance de dropar item raro.',
                activeSkill: {
                    name: 'Julgamento Final',
                    description: 'Desencadeia todo o poder da arma em um único golpe devastador.',
                    manaCost: 80,
                    cooldown: 35,
                    damageMultiplier: 5
                }
            }
        },
        passiveEffects: {
            name: 'Evolução Contínua',
            description: 'A arma evolui baseada nas ações do portador.'
        },
        scalingRules: {
            damageScaling: 'força',
            speedScaling: 'velocidade',
            abilityScaling: 'inteligência'
        }
    },

    // More Weapons
    crimson_katana: {
        id: 'crimson_katana',
        name: 'Katana Carmesim',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'epic',
        stats: { força: 22, velocidade: 20, sentidos: 12 },
        baseDamage: 95,
        attackSpeed: 0.35,
        range: 95,
        description: 'Uma katana vermelha Demais que se torna mais forte com sangue.',
        passiveEffects: {
            name: 'Sede Carmesim',
            description: 'Cada kill aumenta dano em 2% por 10 segundos (empilhável).',
            killBonusDamage: 0.02,
            killBonusDuration: 10,
            maxStacks: 10
        },
        scalingRules: { damageScaling: 'força', speedScaling: 'velocidade' }
    },

    thunder_hammer: {
        id: 'thunder_hammer',
        name: 'Martelo do Trovão',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'rare',
        stats: { força: 30, estamina: 15 },
        baseDamage: 140,
        attackSpeed: 0.8,
        range: 70,
        description: 'Um martelo pesado que libera descargas elétricas.',
        passiveEffects: {
            name: 'Choque Elétrico',
            description: '30% de chance de atordoar inimigos por 1 segundo.',
            stunChance: 0.3,
            stunDuration: 1
        },
        activeSkill: {
            name: 'Impacto Trovejante',
            description: 'Golpeia o chão, causando dano em área e atordoando todos os inimigos.',
            manaCost: 35,
            cooldown: 18,
            radius: 150,
            damageMultiplier: 2,
            stunDuration: 2
        },
        scalingRules: { damageScaling: 'força' }
    },

    wooden_staff: {
        id: 'wooden_staff',
        name: 'Cajado de Madeira',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'common',
        stats: { inteligência: 5 },
        baseDamage: 12,
        description: 'Cajado inicial de mago'
    },
    magic_staff: {
        id: 'magic_staff',
        name: 'Cajado Mágico',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'rare',
        stats: { inteligência: 15, mp: 25 },
        description: 'Um cajado que amplifica poderes mágicos.'
    },

    // Armor - Helmet
    leather_cap: {
        id: 'leather_cap',
        name: 'Capuz de Couro',
        type: 'armor',
        slot: 'helmet',
        rarity: 'common',
        stats: { estamina: 3, hp: 15 },
        description: 'Um capuz de couro simples.',
        icon: '../imagens equipamentos/capuz de couro.png'
    },
    iron_helmet: {
        id: 'iron_helmet',
        name: 'Elmo de Ferro',
        type: 'armor',
        slot: 'helmet',
        rarity: 'rare',
        stats: { estamina: 8, hp: 40 },
        description: 'Um elmo robusto de ferro.'
    },
    shadow_hood: {
        id: 'shadow_hood',
        name: 'Capuz das Sombras',
        type: 'armor',
        slot: 'helmet',
        rarity: 'epic',
        stats: { estamina: 12, hp: 60, sentidos: 8 },
        description: 'Um capuz que oculta seu portador.'
    },

    // Armor - Chest
    leather_armor: {
        id: 'leather_armor',
        name: 'Armadura de Couro',
        type: 'armor',
        slot: 'chest',
        rarity: 'common',
        stats: { estamina: 5, hp: 25 },
        description: 'Armadura de couro básica.',
        icon: '../imagens equipamentos/armadura de couro.png'
    },
    steel_armor: {
        id: 'steel_armor',
        name: 'Armadura de Aço',
        type: 'armor',
        slot: 'chest',
        rarity: 'rare',
        stats: { estamina: 15, hp: 70 },
        description: 'Armadura pesada de aço.'
    },
    demon_armor: {
        id: 'demon_armor',
        name: 'Armadura Demoníaca',
        type: 'armor',
        slot: 'chest',
        rarity: 'legendary',
        stats: { estamina: 30, hp: 150, força: 10 },
        description: 'Armadura lendária forjada no abismo.'
    },

    // Armor - Boots
    leather_boots: {
        id: 'leather_boots',
        name: 'Bota de Couro',
        type: 'armor',
        slot: 'boots',
        rarity: 'common',
        stats: { velocidade: 5, estamina: 3 },
        description: 'Bota base do jogo, cai até se o vento bater.',
        icon: '../imagens equipamentos/boot_leather.png'
    },
    iron_boots: {
        id: 'iron_boots',
        name: 'Bota de Ferro',
        type: 'armor',
        slot: 'boots',
        rarity: 'uncommon',
        stats: { velocidade: 8, estamina: 10, defesa: 5 },
        description: 'Opa, melhorou. Uma bota de ferro resistente.',
        icon: '../imagens equipamentos/boot_iron.png'
    },
    golden_boots: {
        id: 'golden_boots',
        name: 'Bota de Ouro',
        type: 'armor',
        slot: 'boots',
        rarity: 'rare',
        stats: { velocidade: 15, estamina: 15, sorte: 10 },
        description: 'Chama atenção, brilho que entrega poder.',
        icon: '../imagens equipamentos/boot_gold.png'
    },
    black_steel_boots: {
        id: 'black_steel_boots',
        name: 'Bota de Aço Negro Brilhante',
        type: 'armor',
        slot: 'boots',
        rarity: 'legendary',
        stats: { velocidade: 25, estamina: 30, força: 10, defesa: 15 },
        description: 'A lendária bota de aço negro.',
        icon: '../imagens equipamentos/boot_black_steel.png'
    },

    // === SPECIAL EQUIPMENT ===

    // Botas do Passo Fantasma (Ghost Step Boots)
    ghost_step_boots: {
        id: 'ghost_step_boots',
        name: 'Botas do Passo Fantasma',
        type: 'armor',
        slot: 'boots',
        rarity: 'epic',
        stats: { velocidade: 20, sentidos: 15, estamina: 12 },
        description: 'Botas místicas que permitem movimentos impossíveis.',
        passiveEffects: {
            name: 'Evasão Fantasma',
            description: '+15% de chance de esquiva automática. +25% velocidade de movimento.',
            dodgeChance: 0.15,
            moveSpeedBonus: 0.25
        },
        activeSkill: {
            name: 'Dash Fantasma',
            description: 'Dá um dash rápido na direção do movimento com 1 segundo de invulnerabilidade.',
            manaCost: 20,
            cooldown: 8,
            dashDistance: 200,
            invulnerabilityDuration: 1
        }
    },

    // Peitoral do Coração de Ferro (Iron Heart Chestplate)
    iron_heart_chestplate: {
        id: 'iron_heart_chestplate',
        name: 'Peitoral do Coração de Ferro',
        type: 'armor',
        slot: 'chest',
        rarity: 'epic',
        stats: { estamina: 25, hp: 120, força: 8 },
        description: 'Uma armadura que se fortalece quando o portador está em perigo.',
        passiveEffects: {
            name: 'Coração Inabalável',
            description: 'Reduz 30% do dano recebido quando HP está abaixo de 30%. Regenera 5 HP por segundo.',
            lowHealthDamageReduction: 0.3,
            lowHealthThreshold: 0.3,
            hpRegen: 5
        },
        activeSkill: {
            name: 'Fortaleza Inabalável',
            description: 'Concede imunidade a knockback e reduz 50% do dano por 6 segundos.',
            manaCost: 35,
            cooldown: 25,
            damageReduction: 0.5,
            duration: 6
        }
    },

    // More Armor pieces
    dragon_scale_armor: {
        id: 'dragon_scale_armor',
        name: 'Armadura de Escamas de Dragão',
        type: 'armor',
        slot: 'chest',
        rarity: 'legendary',
        stats: { estamina: 35, hp: 180, força: 15, defesa: 25 },
        description: 'Armadura feita com escamas de dragão verdadeiro.',
        passiveEffects: {
            name: 'Pele de Dragão',
            description: '20% de resistência a fogo e veneno.',
            fireResist: 0.2,
            poisonResist: 0.2
        }
    },

    mage_robes: {
        id: 'mage_robes',
        name: 'Mantos do Arquimago',
        type: 'armor',
        slot: 'chest',
        rarity: 'epic',
        stats: { inteligência: 25, mp: 80, estamina: 10 },
        description: 'Mantos que amplificam poderes mágicos.',
        passiveEffects: {
            name: 'Amplificação Mágica',
            description: '+20% de efetividade de habilidades mágicas.',
            spellPowerBonus: 0.2
        }
    },

    shadow_cloak: {
        id: 'shadow_cloak',
        name: 'Manto das Sombras',
        type: 'armor',
        slot: 'chest',
        rarity: 'rare',
        stats: { velocidade: 12, sentidos: 15, estamina: 8 },
        description: 'Um manto que oculta o portador nas sombras.',
        passiveEffects: {
            name: 'Camuflagem',
            description: 'Primeiros 3 segundos de combate: +50% esquiva.',
            initialDodgeBonus: 0.5,
            initialDodgeDuration: 3
        }
    },

    // Accessories

    // Anel do Tempo Curto (Short Time Ring)
    time_ring: {
        id: 'time_ring',
        name: 'Anel do Tempo Curto',
        type: 'accessory',
        slot: 'ring',
        rarity: 'legendary',
        stats: { inteligência: 15, velocidade: 10, mp: 40 },
        description: 'Um anel que manipula o fluxo do tempo.',
        passiveEffects: {
            name: 'Aceleração Temporal',
            description: 'Reduz todos os cooldowns em 20%. 15% de chance de reduzir cooldown adicional ao usar habilidade.',
            cooldownReduction: 0.2,
            bonusCooldownChance: 0.15,
            bonusCooldownReduction: 0.3
        },
        activeSkill: {
            name: 'Reset Temporal',
            description: 'Reseta instantaneamente o cooldown da última habilidade usada.',
            manaCost: 50,
            cooldown: 45
        }
    },

    // More Accessories
    bronze_ring: {
        id: 'bronze_ring',
        name: 'Anel de Bronze',
        type: 'accessory',
        slot: 'ring',
        rarity: 'common',
        stats: { força: 2, hp: 10 },
        description: 'Um anel simples de bronze.',
        icon: '../imagens equipamentos/anel e bronze.png'
    },
    silver_ring: {
        id: 'silver_ring',
        name: 'Anel de Prata',
        type: 'accessory',
        slot: 'ring',
        rarity: 'rare',
        stats: { força: 5, inteligência: 5, hp: 25 },
        description: 'Um anel de prata elegante.'
    },
    ring_of_power: {
        id: 'ring_of_power',
        name: 'Anel do Poder',
        type: 'accessory',
        slot: 'ring',
        rarity: 'epic',
        stats: { força: 15, velocidade: 10, inteligência: 10 },
        description: 'Um anel que pulsa com poder.'
    },

    health_amulet: {
        id: 'health_amulet',
        name: 'Amuleto da Vida',
        type: 'accessory',
        slot: 'amulet',
        rarity: 'rare',
        stats: { hp: 100, estamina: 10 },
        description: 'Um amuleto que aumenta sua vitalidade.'
    },
    mana_amulet: {
        id: 'mana_amulet',
        name: 'Amuleto do Mana',
        type: 'accessory',
        slot: 'amulet',
        rarity: 'rare',
        stats: { mp: 50, inteligência: 8 },
        description: 'Um amuleto que aumenta seu poder mágico.'
    },

    // More Accessories
    vampiric_amulet: {
        id: 'vampiric_amulet',
        name: 'Amuleto Vampírico',
        type: 'accessory',
        slot: 'amulet',
        rarity: 'epic',
        stats: { força: 12, hp: 50 },
        description: 'Absorve vida dos inimigos derrotados.',
        passiveEffects: {
            name: 'Roubo de Vida',
            description: '5% do dano causado é convertido em cura.',
            lifeSteal: 0.05
        }
    },

    phoenix_pendant: {
        id: 'phoenix_pendant',
        name: 'Pingente da Fênix',
        type: 'accessory',
        slot: 'amulet',
        rarity: 'legendary',
        stats: { estamina: 20, hp: 80, inteligência: 15 },
        description: 'Uma vez a cada batalha, revive o portador com 50% HP.',
        passiveEffects: {
            name: 'Renascimento',
            description: 'Se morrer, revive com 50% HP (cooldown de 5 minutos).',
            reviveHP: 0.5,
            reviveCooldown: 300
        }
    },

    speed_ring: {
        id: 'speed_ring',
        name: 'Anel da Velocidade',
        type: 'accessory',
        slot: 'ring',
        rarity: 'rare',
        stats: { velocidade: 15, sentidos: 10 },
        description: 'Um anel que acelera todos os movimentos.'
    },

    berserker_ring: {
        id: 'berserker_ring',
        name: 'Anel do Berserker',
        type: 'accessory',
        slot: 'ring',
        rarity: 'epic',
        stats: { força: 20, velocidade: 10 },
        description: 'Quanto menor o HP, maior o dano.',
        passiveEffects: {
            name: 'Fúria Berserker',
            description: '+2% de dano por cada 10% de HP perdido.',
            damagePerMissingHP: 0.02
        }
    },

    scholars_ring: {
        id: 'scholars_ring',
        name: 'Anel do Erudito',
        type: 'accessory',
        slot: 'ring',
        rarity: 'rare',
        stats: { inteligência: 18, mp: 35 },
        description: 'Aumenta regeneração de MP.',
        passiveEffects: {
            name: 'Estudo Profundo',
            description: 'Regenera 2 MP por segundo.',
            mpRegen: 2
        }
    },

    // More Helmets
    crown_of_wisdom: {
        id: 'crown_of_wisdom',
        name: 'Coroa da Sabedoria',
        type: 'armor',
        slot: 'helmet',
        rarity: 'legendary',
        stats: { inteligência: 30, mp: 60, sentidos: 15 },
        description: 'Uma coroa que concede conhecimento supremo.',
        passiveEffects: {
            name: 'Sabedoria Infinita',
            description: 'Reduz custo de MP de habilidades em 20%.',
            manaCostReduction: 0.2
        }
    },

    berserker_helm: {
        id: 'berserker_helm',
        name: 'Elmo do Berserker',
        type: 'armor',
        slot: 'helmet',
        rarity: 'epic',
        stats: { força: 18, estamina: 15, hp: 70 },
        description: 'Um elmo que aumenta ferocidade em batalha.',
        passiveEffects: {
            name: 'Fúria de Batalha',
            description: '+5% de dano para cada inimigo próximo (máx 25%).',
            damagePerNearbyEnemy: 0.05,
            maxBonus: 0.25
        }
    },

    // Consumables
    health_potion: {
        id: 'health_potion',
        name: 'Poção de Vida',
        type: 'consumable',
        rarity: 'common',
        effect: { healHP: 60 },
        stackable: true,
        description: 'Restaura 60 HP.'
    },
    mana_potion: {
        id: 'mana_potion',
        name: 'Poção de Mana',
        type: 'consumable',
        rarity: 'common',
        effect: { healMP: 30 },
        stackable: true,
        description: 'Restaura 30 MP.'
    },
    greater_health_potion: {
        id: 'greater_health_potion',
        name: 'Poção de Vida Maior',
        type: 'consumable',
        rarity: 'rare',
        effect: { healHP: 150 },
        stackable: true,
        description: 'Restaura 150 HP.'
    },
    greater_mana_potion: {
        id: 'greater_mana_potion',
        name: 'Poção de Mana Maior',
        type: 'consumable',
        rarity: 'rare',
        effect: { healMP: 80 },
        stackable: true,
        description: 'Restaura 80 MP.'
    },
    elixir_of_power: {
        id: 'elixir_of_power',
        name: 'Elixir do Poder',
        type: 'consumable',
        rarity: 'epic',
        effect: { buffDamage: 0.5, buffDuration: 60 },
        stackable: true,
        description: 'Aumenta dano em 50% por 60 segundos.'
    },
    elixir_of_swiftness: {
        id: 'elixir_of_swiftness',
        name: 'Elixir da Agilidade',
        type: 'consumable',
        rarity: 'epic',
        effect: { buffSpeed: 0.4, buffDuration: 60 },
        stackable: true,
        description: 'Aumenta velocidade em 40% por 60 segundos.'
    },
    resurrection_scroll: {
        id: 'resurrection_scroll',
        name: 'Pergaminho de Ressurreição',
        type: 'consumable',
        rarity: 'legendary',
        effect: { revive: true, healHP: 0.5 },
        stackable: false,
        description: 'Revive instantaneamente com 50% HP ao morrer.'
    },
    stat_reset_scroll: {
        id: 'stat_reset_scroll',
        name: 'Pergaminho de Reset',
        type: 'consumable',
        rarity: 'epic',
        effect: { resetStats: true },
        stackable: false,
        description: 'Permite redistribuir seus pontos de atributo.'
    },

    // === NEW WEAPONS ===
    bone_scythe: {
        id: 'bone_scythe',
        name: 'Foice de Osso',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'rare',
        stats: { força: 10, sentidos: 8 },
        baseDamage: 65,
        attackSpeed: 0.6,
        range: 95,
        description: 'Uma foice feita de ossos antigos.'
    },
    frost_blade: {
        id: 'frost_blade',
        name: 'Lâmina Gélida',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'rare',
        stats: { força: 14, inteligência: 8 },
        baseDamage: 70,
        attackSpeed: 0.5,
        range: 90,
        description: 'Uma lâmina coberta de gelo eterno.',
        icon: '../imagens equipamentos/lamina gelida.png',
        passiveEffects: {
            name: 'Toque Gélido',
            description: '20% de chance de aplicar Lentidão nos inimigos.',
            slowChance: 0.2,
            slowDuration: 3
        }
    },
    blood_axe: {
        id: 'blood_axe',
        name: 'Machado Sangrento',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'epic',
        stats: { força: 25, estamina: 10 },
        baseDamage: 110,
        attackSpeed: 0.75,
        range: 80,
        description: 'Um machado sedento de sangue.',
        passiveEffects: {
            name: 'Sede de Sangue',
            description: '3% do dano causado é convertido em cura.',
            lifeSteal: 0.03
        }
    },
    arcane_wand: {
        id: 'arcane_wand',
        name: 'Varinha Arcana',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'rare',
        stats: { inteligência: 20, mp: 30 },
        baseDamage: 50,
        attackSpeed: 0.4,
        range: 180,
        description: 'Uma varinha que canaliza energia arcana pura.'
    },
    hellfire_sword: {
        id: 'hellfire_sword',
        name: 'Espada do Fogo Infernal',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'epic',
        stats: { força: 30, inteligência: 15 },
        baseDamage: 120,
        attackSpeed: 0.6,
        range: 95,
        description: 'Uma espada envolta em chamas infernais.',
        passiveEffects: {
            name: 'Chama Infernal',
            description: '25% de chance de aplicar Queimadura.',
            burnChance: 0.25,
            burnDamage: 20,
            burnDuration: 6
        }
    },
    void_scythe: {
        id: 'void_scythe',
        name: 'Foice do Vazio',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'legendary',
        stats: { força: 45, sentidos: 20, velocidade: 15 },
        baseDamage: 160,
        attackSpeed: 0.65,
        range: 100,
        description: 'Uma foice que corta a própria realidade.',
        passiveEffects: {
            name: 'Corte Dimensional',
            description: 'Ignora 40% da defesa inimiga.',
            defenseIgnore: 0.4
        }
    },
    dragon_fang_blade: {
        id: 'dragon_fang_blade',
        name: 'Lâmina Presa de Dragão',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'legendary',
        stats: { força: 50, estamina: 20 },
        baseDamage: 180,
        attackSpeed: 0.7,
        range: 90,
        description: 'Forjada com presas de dragão ancião.',
        passiveEffects: {
            name: 'Fúria Draconiana',
            description: '+10% de dano. 15% de chance de causar dano duplo.',
            bonusDamage: 0.1,
            doubleDamageChance: 0.15
        }
    },
    chaos_staff: {
        id: 'chaos_staff',
        name: 'Cajado do Caos',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'legendary',
        stats: { inteligência: 40, mp: 100 },
        baseDamage: 130,
        attackSpeed: 0.6,
        range: 200,
        description: 'Um cajado que canaliza a energia primordial do caos.',
        passiveEffects: {
            name: 'Canalização do Caos',
            description: 'Habilidades causam 25% mais dano. Regenera 3 MP/s.',
            spellPowerBonus: 0.25,
            mpRegen: 3
        }
    },
    assassin_blade: {
        id: 'assassin_blade',
        name: 'Lâmina do Assassino',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'epic',
        stats: { força: 18, velocidade: 25, sentidos: 15 },
        baseDamage: 85,
        attackSpeed: 0.3,
        range: 75,
        description: 'Uma lâmina silenciosa e mortal.',
        passiveEffects: {
            name: 'Golpe Fatal',
            description: '+15% de chance crítica. Críticos causam 250% de dano.',
            critBonus: 0.15,
            critMultiplier: 2.5
        }
    },
    paladin_mace: {
        id: 'paladin_mace',
        name: 'Maça do Paladino',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'epic',
        stats: { força: 22, estamina: 18, inteligência: 10 },
        baseDamage: 100,
        attackSpeed: 0.6,
        range: 80,
        description: 'Uma maça sagrada que cura ao atacar.',
        passiveEffects: {
            name: 'Toque Sagrado',
            description: 'Cada ataque cura 2% do HP máximo.',
            healOnHit: 0.02
        }
    },

    // === NEW ARMOR ===
    bone_helmet: {
        id: 'bone_helmet',
        name: 'Elmo de Osso',
        type: 'armor',
        slot: 'helmet',
        rarity: 'rare',
        stats: { estamina: 10, hp: 50 },
        description: 'Um elmo esculpido de ossos de monstros.',
        icon: '../imagens equipamentos/elmo de osso.png'
    },
    frost_armor: {
        id: 'frost_armor',
        name: 'Armadura Gélida',
        type: 'armor',
        slot: 'chest',
        rarity: 'rare',
        stats: { estamina: 18, hp: 80 },
        description: 'Armadura revestida de gelo eterno que retarda inimigos próximos.'
    },
    volcanic_helm: {
        id: 'volcanic_helm',
        name: 'Elmo Vulcânico',
        type: 'armor',
        slot: 'helmet',
        rarity: 'epic',
        stats: { estamina: 20, hp: 90, força: 8 },
        description: 'Um elmo forjado em lava vulcânica.',
        passiveEffects: {
            name: 'Calor Vulcânico',
            description: '+5% de dano de fogo.',
            fireDamageBonus: 0.05
        }
    },
    void_robes: {
        id: 'void_robes',
        name: 'Mantos do Vazio',
        type: 'armor',
        slot: 'chest',
        rarity: 'epic',
        stats: { inteligência: 30, mp: 60, estamina: 12 },
        description: 'Mantos tecidos com fibras do vazio.',
        passiveEffects: {
            name: 'Proteção do Vazio',
            description: '15% de chance de anular dano mágico.',
            magicNullifyChance: 0.15
        }
    },
    dragon_helm: {
        id: 'dragon_helm',
        name: 'Elmo de Dragão',
        type: 'armor',
        slot: 'helmet',
        rarity: 'legendary',
        stats: { estamina: 35, hp: 120, força: 12 },
        description: 'Um elmo feito de escamas de dragão ancião.',
        passiveEffects: {
            name: 'Presença Draconiana',
            description: 'Reduz dano recebido em 10%.',
            damageReduction: 0.1
        }
    },
    assassin_garb: {
        id: 'assassin_garb',
        name: 'Trajes do Assassino',
        type: 'armor',
        slot: 'chest',
        rarity: 'epic',
        stats: { velocidade: 20, sentidos: 18, estamina: 10 },
        description: 'Roupas leves que permitem movimentos ágeis.',
        passiveEffects: {
            name: 'Agilidade Sombria',
            description: '+10% de esquiva e velocidade de ataque.',
            dodgeBonus: 0.1,
            attackSpeedBonus: 0.1
        }
    },
    paladin_plate: {
        id: 'paladin_plate',
        name: 'Armadura do Paladino',
        type: 'armor',
        slot: 'chest',
        rarity: 'legendary',
        stats: { estamina: 40, hp: 200, inteligência: 10 },
        description: 'Armadura sagrada que protege e cura.',
        passiveEffects: {
            name: 'Bênção do Paladino',
            description: 'Regenera 3 HP/s. +15% defesa.',
            hpRegen: 3,
            defenseBonus: 0.15
        }
    },
    spectral_boots: {
        id: 'spectral_boots',
        name: 'Botas Espectrais',
        type: 'armor',
        slot: 'boots',
        rarity: 'epic',
        stats: { velocidade: 22, sentidos: 12 },
        description: 'Botas que parecem flutuar sobre o chão.',
        passiveEffects: {
            name: 'Passo Etéreo',
            description: '+20% velocidade de movimento.',
            moveSpeedBonus: 0.2
        }
    },
    titan_ring: {
        id: 'titan_ring',
        name: 'Anel de Titã',
        type: 'accessory',
        slot: 'ring',
        rarity: 'epic',
        stats: { força: 20, estamina: 15 },
        description: 'Um anel forjado pelos antigos titãs.',
        passiveEffects: {
            name: 'Força Titânica',
            description: '+8% de dano corpo-a-corpo.',
            meleeDamageBonus: 0.08
        }
    },
    chaos_crown: {
        id: 'chaos_crown',
        name: 'Coroa do Caos',
        type: 'armor',
        slot: 'helmet',
        rarity: 'legendary',
        stats: { inteligência: 35, força: 20, mp: 80 },
        description: 'Uma coroa que pulsa com energia caótica.',
        passiveEffects: {
            name: 'Domínio do Caos',
            description: '+20% de dano mágico e físico.',
            allDamageBonus: 0.2
        }
    },

    // === NEW CONSUMABLES ===
    escape_scroll: {
        id: 'escape_scroll',
        name: 'Pergaminho de Fuga',
        type: 'consumable',
        rarity: 'rare',
        effect: { escape: true },
        stackable: true,
        description: 'Teleporta instantaneamente para fora da masmorra.'
    },
    strength_elixir: {
        id: 'strength_elixir',
        name: 'Elixir de Força',
        type: 'consumable',
        rarity: 'epic',
        effect: { buffType: 'strength', buffValue: 0.3, buffDuration: 90 },
        stackable: true,
        description: 'Aumenta dano em 30% por 90 segundos.'
    },
    speed_elixir: {
        id: 'speed_elixir',
        name: 'Elixir de Velocidade',
        type: 'consumable',
        rarity: 'epic',
        effect: { buffType: 'speed', buffValue: 0.5, buffDuration: 90 },
        stackable: true,
        description: 'Aumenta velocidade em 50% por 90 segundos.'
    },
    xp_potion: {
        id: 'xp_potion',
        name: 'Poção de Experiência',
        type: 'consumable',
        rarity: 'epic',
        effect: { buffType: 'xp', buffValue: 0.5, buffDuration: 120 },
        stackable: true,
        description: 'Aumenta XP ganha em 50% por 120 segundos.'
    },
    regen_potion: {
        id: 'regen_potion',
        name: 'Poção de Regeneração',
        type: 'consumable',
        rarity: 'rare',
        effect: { buffType: 'regen', buffValue: 10, buffDuration: 30 },
        stackable: true,
        description: 'Regenera 10 HP/s por 30 segundos.'
    },
    defense_potion: {
        id: 'defense_potion',
        name: 'Poção de Defesa',
        type: 'consumable',
        rarity: 'rare',
        effect: { buffType: 'defense', buffValue: 0.4, buffDuration: 60 },
        stackable: true,
        description: 'Aumenta defesa em 40% por 60 segundos.'
    },
    full_restore: {
        id: 'full_restore',
        name: 'Restauração Completa',
        type: 'consumable',
        rarity: 'legendary',
        effect: { healHP: 9999, healMP: 9999 },
        stackable: true,
        description: 'Restaura completamente HP e MP.'
    }
};

// ========== EXCLUSIVE SHOP ITEMS DATABASE ==========
const ShopExclusiveItems = {
    // ⚔️ LÂMINA DO COMERCIANTE SOMBRIO
    shadow_merchant_blade: {
        id: 'shadow_merchant_blade',
        name: 'Lâmina do Comerciante Sombrio',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'epic',
        shopExclusive: true,
        shopPrice: 850,
        stats: { força: 24, velocidade: 12, sentidos: 8 },
        baseDamage: 95,
        attackSpeed: 0.45,
        range: 90,
        description: 'Uma espada vendida apenas por comerciantes misteriosos. Dizem que ela "escolhe" quem pode comprá-la.',
        passiveEffects: {
            name: 'Pacto Sombrio',
            description: 'Cada inimigo derrotado aumenta o dano em +2% por 5s (stack até 10x).',
            killBonusDamage: 0.02,
            killBonusDuration: 5,
            maxStacks: 10
        },
        activeSkill: {
            name: 'Corte da Penumbra',
            description: 'Avança rapidamente causando dano em linha reta.',
            manaCost: 15,
            cooldown: 10,
            damageMultiplier: 2.2,
            range: 250
        },
        scalingRules: { damageScaling: 'força', speedScaling: 'velocidade', critScaling: 'sentidos' }
    },

    // ⚔️ ESPADA DO TEMPO FRATURADO
    fractured_time_sword: {
        id: 'fractured_time_sword',
        name: 'Espada do Tempo Fraturado',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'legendary',
        shopExclusive: true,
        shopPrice: 1800,
        stats: { força: 30, velocidade: 25, inteligência: 15 },
        baseDamage: 110,
        attackSpeed: 0.35,
        range: 95,
        description: 'Uma arma que parece existir em vários momentos ao mesmo tempo.',
        passiveEffects: {
            name: 'Eco Temporal',
            description: '10% de chance de repetir o último ataque automaticamente. +20% velocidade de ataque. +10% redução de cooldown.',
            echoChance: 0.10,
            attackSpeedBonus: 0.20,
            cooldownReduction: 0.10
        },
        activeSkill: {
            name: 'Ruptura Temporal',
            description: 'Congela inimigos próximos por 2 segundos.',
            manaCost: 25,
            cooldown: 18,
            radius: 150,
            freezeDuration: 2
        },
        scalingRules: { damageScaling: 'força', speedScaling: 'velocidade', abilityScaling: 'inteligência' }
    },

    // 🗡️ ADAGA DO VENDEDOR FANTASMA
    ghost_vendor_dagger: {
        id: 'ghost_vendor_dagger',
        name: 'Adaga do Vendedor Fantasma',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'rare',
        shopExclusive: true,
        shopPrice: 520,
        stats: { força: 14, velocidade: 18, sentidos: 12 },
        baseDamage: 70,
        attackSpeed: 0.30,
        range: 75,
        description: 'Sempre aparece na loja… mas nunca duas vezes seguidas.',
        passiveEffects: {
            name: 'Ataque Invisível',
            description: 'Primeiro ataque em um inimigo causa +30% de dano.',
            firstHitBonus: 0.30
        },
        activeSkill: {
            name: 'Passo Fantasma',
            description: 'Teleporte curto para trás do inimigo.',
            manaCost: 10,
            cooldown: 8,
            teleportDistance: 150
        },
        scalingRules: { damageScaling: 'força', speedScaling: 'velocidade', critScaling: 'sentidos' }
    },

    // ⚔️ ESPADA DO CAOS DOURADO
    golden_chaos_sword: {
        id: 'golden_chaos_sword',
        name: 'Espada do Caos Dourado',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'legendary',
        shopExclusive: true,
        shopPrice: 2100,
        stats: { força: 45, inteligência: 10 },
        baseDamage: 160,
        attackSpeed: 0.70,
        range: 95,
        description: 'Uma arma instável, onde cada golpe pode trazer resultados imprevisíveis.',
        passiveEffects: {
            name: 'Caos Instável',
            description: 'Cada ataque tem 15% de chance de aplicar: Queimadura 🔥, Congelamento ❄️ ou Atordoamento ⚡.',
            chaosChance: 0.15,
            possibleEffects: ['burn', 'freeze', 'stun']
        },
        activeSkill: {
            name: 'Golpe do Caos',
            description: 'Ataque poderoso com efeito aleatório massivo.',
            manaCost: 30,
            cooldown: 20,
            damageMultiplier: 3.0
        },
        scalingRules: { damageScaling: 'força', abilityScaling: 'inteligência' }
    },

    // ⚔️ LÂMINA DO CAÇADOR DE REIS
    king_hunter_blade: {
        id: 'king_hunter_blade',
        name: 'Lâmina do Caçador de Reis',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'epic',
        shopExclusive: true,
        shopPrice: 1200,
        stats: { força: 20, sentidos: 12, estamina: 10 },
        baseDamage: 90,
        attackSpeed: 0.50,
        range: 90,
        description: 'Criada para derrotar chefes… e apenas chefes.',
        passiveEffects: {
            name: 'Executor',
            description: '+25% dano contra bosses. Causa dano extra em inimigos com vida abaixo de 30%.',
            bossDamageBonus: 0.25,
            executeDamageBonus: 0.20,
            executeThreshold: 0.30
        },
        activeSkill: {
            name: 'Golpe Final',
            description: 'Causa dano massivo baseado na vida perdida do inimigo.',
            manaCost: 20,
            cooldown: 15,
            damageMultiplier: 2.5
        },
        scalingRules: { damageScaling: 'força', critScaling: 'sentidos' }
    },

    // ⚔️ ESPADA DO LUXO ETERNO
    eternal_luxury_sword: {
        id: 'eternal_luxury_sword',
        name: 'Espada do Luxo Eterno',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'epic',
        shopExclusive: true,
        shopPrice: 1500,
        stats: { força: 18, inteligência: 10, sentidos: 8 },
        baseDamage: 80,
        attackSpeed: 0.50,
        range: 90,
        description: 'Uma arma feita de pura riqueza. Quanto mais dinheiro, mais forte ela fica.',
        passiveEffects: {
            name: 'Poder do Ouro',
            description: 'Quanto mais dinheiro o jogador tiver, maior o dano (+1% por 100💎). +Sorte. +Riqueza.',
            goldDamageScaling: 0.01,
            goldDamagePerUnit: 100,
            luckBonus: 10
        },
        activeSkill: {
            name: 'Investimento Mortal',
            description: 'Consome 5% do dinheiro para causar dano massivo (3x dano base + ouro consumido).',
            cooldown: 12,
            goldCostPercent: 0.05,
            damageMultiplier: 3.0
        },
        scalingRules: { damageScaling: 'força', abilityScaling: 'inteligência' }
    },

    // === NEW USER REQUESTED ITEMS ===
    blue_angel_sword: {
        id: 'blue_angel_sword',
        name: 'Espada Angelical Azul',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'rare',
        stats: { força: 10, velocidade: 8 },
        baseDamage: 28,
        description: 'Espada leve com energia celestial',
        passiveEffects: {
            name: 'Poder Celestial',
            description: '+10% dano contra inimigos voadores',
            bonusDamageTypes: ['flying'],
            bonusDamageMultiplier: 1.1
        }
    },
    purple_arcane_sword: {
        id: 'purple_arcane_sword',
        name: 'Espada Arcana Roxa',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'epic',
        stats: { inteligência: 15, força: 10 },
        baseDamage: 40,
        description: 'Canaliza energia mágica a cada golpe',
        passiveEffects: {
            name: 'Golpe Mágico',
            description: 'Ataques causam dano mágico adicional',
            bonusMagicDamage: 0.2
        }
    },
    flaming_sword: {
        id: 'flaming_sword',
        name: 'Espada Flamejante',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'legendary',
        stats: { força: 20, velocidade: 10 },
        baseDamage: 55,
        description: 'Espada envolta em chamas eternas',
        passiveEffects: {
            name: 'Toque de Fogo',
            description: 'Aplica burn (dano por segundo por 5s)',
            burnChance: 1.0,
            burnDamage: 5,
            burnDuration: 5
        }
    },
    crystal_staff: {
        id: 'crystal_staff',
        name: 'Cajado de Cristal',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'rare',
        stats: { inteligência: 15, mp: 20 },
        baseDamage: 30,
        description: 'Cristal amplifica magia',
        passiveEffects: {
            name: 'Amplificação Cristalina',
            description: '+10% dano mágico',
            spellPowerBonus: 0.1
        }
    },
    supreme_arcane_staff: {
        id: 'supreme_arcane_staff',
        name: 'Cajado Arcano Supremo',
        type: 'weapon',
        slot: 'weapon',
        rarity: 'epic',
        stats: { inteligência: 25, mp: 30 },
        baseDamage: 45,
        description: 'Foco arcano avançado',
        passiveEffects: {
            name: 'Maestria do Tempo',
            description: 'Reduz cooldown em 10%',
            cooldownReduction: 0.1
        }
    },
    dark_purple_armor: {
        id: 'dark_purple_armor',
        name: 'Armadura Sombria Roxa',
        type: 'armor',
        slot: 'chest',
        rarity: 'epic',
        stats: { estamina: 20, hp: 80, defesa: 10 },
        description: 'Armadura viva corrompida',
        passiveEffects: {
            name: 'Barreira Negra',
            description: 'Reduz dano mágico recebido',
            magicResistance: 0.2
        }
    },
    simple_ring: {
        id: 'simple_ring',
        name: 'Anel Simples',
        type: 'accessory',
        slot: 'ring',
        rarity: 'common',
        stats: { sorte: 3 },
        description: 'Anel básico'
    },
    dual_arcane_ring: {
        id: 'dual_arcane_ring',
        name: 'Anel Duplo Arcano',
        type: 'accessory',
        slot: 'ring',
        rarity: 'rare',
        stats: { inteligência: 10, sorte: 5 },
        description: 'Dois anéis fundidos com energia',
        passiveEffects: {
            name: 'Precisão Arcana',
            description: '+5% chance de crítico mágico',
            magicCritChance: 0.05
        }
    },
    arcane_amulet: {
        id: 'arcane_amulet',
        name: 'Colar Arcano',
        type: 'accessory',
        slot: 'amulet',
        rarity: 'epic',
        stats: { mp: 20, inteligência: 10 },
        description: 'Fonte de energia constante',
        passiveEffects: {
            name: 'Fonte Arcana',
            description: 'Regenera 2 MP por segundo',
            mpRegen: 2
        }
    },
    legendary_solar_amulet: {
        id: 'legendary_solar_amulet',
        name: 'Colar Solar Lendário',
        type: 'accessory',
        slot: 'amulet',
        rarity: 'legendary',
        stats: { mp: 30, inteligência: 15, sorte: 10 },
        description: 'Energia pura condensada',
        passiveEffects: {
            name: 'Poder Solar',
            description: 'Aumenta dano geral em 10%',
            damageMultiplier: 1.1
        }
    }
};

// Helper function to get item by ID (checks both databases)
function getItem(itemId) {
    if (ItemDatabase[itemId]) return { ...ItemDatabase[itemId] };
    if (ShopExclusiveItems[itemId]) return { ...ShopExclusiveItems[itemId] };
    return null;
}

// Helper to get all exclusive shop items
function getShopExclusiveItems() {
    return Object.values(ShopExclusiveItems).map(item => ({ ...item }));
}

// Helper function to create random item with stat variations
function createRandomItem(itemId, levelBonus = 0) {
    const baseItem = getItem(itemId);
    if (!baseItem || baseItem.type === 'consumable') return baseItem;

    // Add random stat variations for equipment
    const item = { ...baseItem };
    item.stats = { ...baseItem.stats };

    // Add level bonus (5% per level)
    const bonus = 1 + (levelBonus * 0.05);
    for (let stat in item.stats) {
        item.stats[stat] = Math.floor(item.stats[stat] * bonus);
    }

    return item;
}

