// loot.js - Loot system for Solo Leveling RPG

class LootSystem {
    constructor(game) {
        this.game = game;
        this.lootDrops = []; // Active loot on ground

        // Loot tables for different enemy types
        this.lootTables = {
            goblin: {
                items: [
                    { id: 'health_potion', chance: 0.5, stackMin: 1, stackMax: 2 },
                    { id: 'mana_potion', chance: 0.15 },
                    { id: 'rusty_dagger', chance: 0.05 },
                    { id: 'leather_cap', chance: 0.05 },
                    { id: 'bronze_ring', chance: 0.25 },
                    { id: 'leather_boots', chance: 0.15 },
                    { id: 'iron_boots', chance: 0.05 }
                ],
                gold: { min: 5, max: 15 }
            },
            skeleton: {
                items: [
                    { id: 'iron_sword', chance: 0.3 },
                    { id: 'leather_armor', chance: 0.08 },
                    { id: 'health_potion', chance: 0.4, stackMin: 1, stackMax: 3 },
                    { id: 'mana_potion', chance: 0.35, stackMin: 1, stackMax: 2 },
                    { id: 'bone_scythe', chance: 0.08 },
                    { id: 'bone_helmet', chance: 0.1 },
                    { id: 'bronze_ring', chance: 0.15 },
                    { id: 'leather_boots', chance: 0.10 },
                    { id: 'iron_boots', chance: 0.10 }
                ],
                gold: { min: 10, max: 25 }
            },
            undead: {
                items: [
                    { id: 'bone_scythe', chance: 0.15 },
                    { id: 'bone_helmet', chance: 0.12 },
                    { id: 'health_potion', chance: 0.4, stackMin: 1, stackMax: 2 },
                    { id: 'mana_potion', chance: 0.35, stackMin: 1, stackMax: 2 },
                    { id: 'regen_potion', chance: 0.08 },
                    { id: 'bronze_ring', chance: 0.12 },
                    { id: 'health_amulet', chance: 0.06 }
                ],
                gold: { min: 20, max: 50 }
            },
            wolf: {
                items: [
                    { id: 'health_potion', chance: 0.5, stackMin: 2, stackMax: 4 },
                    { id: 'mana_potion', chance: 0.2 },
                    { id: 'iron_boots', chance: 0.15 },
                    { id: 'golden_boots', chance: 0.05 },
                    { id: 'speed_elixir', chance: 0.05 },
                    { id: 'speed_ring', chance: 0.08 }
                ],
                gold: { min: 15, max: 30 }
            },
            golem: {
                items: [
                    { id: 'steel_armor', chance: 0.25 },
                    { id: 'iron_helmet', chance: 0.3 },
                    { id: 'steel_blade', chance: 0.2 },
                    { id: 'greater_health_potion', chance: 0.4, stackMin: 1, stackMax: 2 },
                    { id: 'mana_potion', chance: 0.25 },
                    { id: 'iron_boots', chance: 0.10 },
                    { id: 'golden_boots', chance: 0.08 },
                    { id: 'black_steel_boots', chance: 0.02 },
                    { id: 'defense_potion', chance: 0.06 },
                    { id: 'silver_ring', chance: 0.1 }
                ],
                gold: { min: 30, max: 60 }
            },
            slime: {
                items: [
                    { id: 'health_potion', chance: 0.5, stackMin: 2, stackMax: 3 },
                    { id: 'mana_potion', chance: 0.3 },
                    { id: 'regen_potion', chance: 0.1 }
                ],
                gold: { min: 15, max: 35 }
            },
            beast: {
                items: [
                    { id: 'greater_health_potion', chance: 0.4, stackMin: 1, stackMax: 2 },
                    { id: 'mana_potion', chance: 0.25 },
                    { id: 'regen_potion', chance: 0.1 },
                    { id: 'defense_potion', chance: 0.08 },
                    { id: 'frost_blade', chance: 0.06 },
                    { id: 'health_amulet', chance: 0.1 },
                    { id: 'speed_ring', chance: 0.08 }
                ],
                gold: { min: 25, max: 50 }
            },
            mage: {
                items: [
                    { id: 'arcane_wand', chance: 0.12 },
                    { id: 'crystal_staff', chance: 0.08 },
                    { id: 'dual_arcane_ring', chance: 0.05 },
                    { id: 'purple_arcane_sword', chance: 0.04 },
                    { id: 'magic_staff', chance: 0.1 },
                    { id: 'mana_potion', chance: 0.55, stackMin: 2, stackMax: 4 },
                    { id: 'greater_mana_potion', chance: 0.1 },
                    { id: 'xp_potion', chance: 0.06 },
                    { id: 'void_robes', chance: 0.04 },
                    { id: 'mana_amulet', chance: 0.12 },
                    { id: 'scholars_ring', chance: 0.08 }
                ],
                gold: { min: 40, max: 80 }
            },
            elemental: {
                items: [
                    { id: 'frost_blade', chance: 0.1 },
                    { id: 'blue_angel_sword', chance: 0.05 },
                    { id: 'mana_potion', chance: 0.45, stackMin: 1, stackMax: 3 },
                    { id: 'greater_health_potion', chance: 0.3 },
                    { id: 'greater_mana_potion', chance: 0.12 },
                    { id: 'mana_amulet', chance: 0.1 },
                    { id: 'silver_ring', chance: 0.1 }
                ],
                gold: { min: 35, max: 70 }
            },
            orc: {
                items: [
                    { id: 'blood_axe', chance: 0.06 },
                    { id: 'steel_blade', chance: 0.15 },
                    { id: 'steel_armor', chance: 0.12 },
                    { id: 'greater_health_potion', chance: 0.5, stackMin: 1, stackMax: 3 },
                    { id: 'mana_potion', chance: 0.25 },
                    { id: 'strength_elixir', chance: 0.05 },
                    { id: 'escape_scroll', chance: 0.08 },
                    { id: 'health_amulet', chance: 0.1 },
                    { id: 'silver_ring', chance: 0.08 }
                ],
                gold: { min: 50, max: 100 }
            },
            void: {
                items: [
                    { id: 'void_robes', chance: 0.08 },
                    { id: 'dark_purple_armor', chance: 0.05 },
                    { id: 'arcane_amulet', chance: 0.03 },
                    { id: 'void_scythe', chance: 0.02 },
                    { id: 'spectral_boots', chance: 0.06 },
                    { id: 'greater_health_potion', chance: 0.5, stackMin: 2, stackMax: 4 },
                    { id: 'mana_potion', chance: 0.45, stackMin: 2, stackMax: 3 },
                    { id: 'greater_mana_potion', chance: 0.15 },
                    { id: 'xp_potion', chance: 0.05 },
                    { id: 'vampiric_amulet', chance: 0.06 }
                ],
                gold: { min: 80, max: 150 }
            },
            dragon: {
                items: [
                    { id: 'dragon_fang_blade', chance: 0.03 },
                    { id: 'dragon_helm', chance: 0.05 },
                    { id: 'hellfire_sword', chance: 0.04 },
                    { id: 'greater_health_potion', chance: 0.6, stackMin: 2, stackMax: 5 },
                    { id: 'full_restore', chance: 0.02 },
                    { id: 'escape_scroll', chance: 0.1 }
                ],
                gold: { min: 100, max: 200 }
            },
            demon: {
                items: [
                    { id: 'hellfire_sword', chance: 0.06 },
                    { id: 'flaming_sword', chance: 0.03 },
                    { id: 'demon_blade', chance: 0.08 },
                    { id: 'demon_armor', chance: 0.06 },
                    { id: 'greater_health_potion', chance: 0.6, stackMin: 3, stackMax: 5 },
                    { id: 'greater_mana_potion', chance: 0.2 },
                    { id: 'strength_elixir', chance: 0.08 },
                    { id: 'full_restore', chance: 0.03 },
                    { id: 'vampiric_amulet', chance: 0.06 },
                    { id: 'ring_of_power', chance: 0.04 }
                ],
                gold: { min: 120, max: 250 }
            },
            chaos: {
                items: [
                    { id: 'chaos_staff', chance: 0.03 },
                    { id: 'chaos_crown', chance: 0.03 },
                    { id: 'void_scythe', chance: 0.04 },
                    { id: 'paladin_plate', chance: 0.03 },
                    { id: 'greater_health_potion', chance: 0.7, stackMin: 3, stackMax: 6 },
                    { id: 'full_restore', chance: 0.05 },
                    { id: 'xp_potion', chance: 0.1 }
                ],
                gold: { min: 200, max: 400 }
            },
            boss: {
                items: [
                    { id: 'demon_blade', chance: 0.6 },
                    { id: 'supreme_arcane_staff', chance: 0.4 },
                    { id: 'legendary_solar_amulet', chance: 0.3 },
                    { id: 'demon_armor', chance: 0.5 },
                    { id: 'shadow_dagger', chance: 0.7 },
                    { id: 'shadow_hood', chance: 0.6 },
                    { id: 'ring_of_power', chance: 0.5 },
                    { id: 'health_amulet', chance: 0.6 },
                    { id: 'mana_amulet', chance: 0.6 },
                    { id: 'stat_reset_scroll', chance: 0.3 },
                    { id: 'greater_health_potion', chance: 0.9, stackMin: 3, stackMax: 5 },
                    { id: 'golden_boots', chance: 0.3 },
                    { id: 'black_steel_boots', chance: 0.15 }
                ],
                gold: { min: 200, max: 500 }
            },

            // Boss loot tables
            boss_goblin: {
                items: [
                    { id: 'iron_sword', chance: 0.8 },
                    { id: 'leather_armor', chance: 0.6 },
                    { id: 'health_potion', chance: 1.0, stackMin: 3, stackMax: 5 },
                    { id: 'bone_scythe', chance: 0.3 },
                    { id: 'escape_scroll', chance: 0.3 }
                ],
                gold: { min: 100, max: 200 }
            },
            boss_undead: {
                items: [
                    { id: 'bone_scythe', chance: 0.6 },
                    { id: 'bone_helmet', chance: 0.5 },
                    { id: 'frost_blade', chance: 0.3 },
                    { id: 'regen_potion', chance: 0.4 },
                    { id: 'stat_reset_scroll', chance: 0.2 }
                ],
                gold: { min: 150, max: 300 }
            },
            boss_beast: {
                items: [
                    { id: 'assassin_blade', chance: 0.4 },
                    { id: 'assassin_garb', chance: 0.3 },
                    { id: 'spectral_boots', chance: 0.35 },
                    { id: 'speed_elixir', chance: 0.5 },
                    { id: 'greater_health_potion', chance: 1.0, stackMin: 3, stackMax: 5 }
                ],
                gold: { min: 200, max: 400 }
            },
            boss_golem: {
                items: [
                    { id: 'steel_armor', chance: 0.7 },
                    { id: 'iron_helmet', chance: 0.6 },
                    { id: 'titan_ring', chance: 0.3 },
                    { id: 'defense_potion', chance: 0.5 },
                    { id: 'frost_armor', chance: 0.4 }
                ],
                gold: { min: 300, max: 500 }
            },
            boss_mage: {
                items: [
                    { id: 'arcane_wand', chance: 0.6 },
                    { id: 'void_robes', chance: 0.5 },
                    { id: 'chaos_staff', chance: 0.15 },
                    { id: 'xp_potion', chance: 0.5 },
                    { id: 'mana_potion', chance: 1.0, stackMin: 5, stackMax: 8 }
                ],
                gold: { min: 400, max: 700 }
            },
            boss_orc: {
                items: [
                    { id: 'blood_axe', chance: 0.5 },
                    { id: 'paladin_mace', chance: 0.3 },
                    { id: 'volcanic_helm', chance: 0.4 },
                    { id: 'strength_elixir', chance: 0.6 },
                    { id: 'greater_health_potion', chance: 1.0, stackMin: 5, stackMax: 8 }
                ],
                gold: { min: 500, max: 900 }
            },
            boss_dragon: {
                items: [
                    { id: 'dragon_fang_blade', chance: 0.4 },
                    { id: 'dragon_helm', chance: 0.5 },
                    { id: 'hellfire_sword', chance: 0.35 },
                    { id: 'full_restore', chance: 0.3 },
                    { id: 'escape_scroll', chance: 0.5 }
                ],
                gold: { min: 600, max: 1200 }
            },
            boss_void: {
                items: [
                    { id: 'void_scythe', chance: 0.3 },
                    { id: 'void_robes', chance: 0.5 },
                    { id: 'spectral_boots', chance: 0.5 },
                    { id: 'xp_potion', chance: 0.5 },
                    { id: 'full_restore', chance: 0.4 }
                ],
                gold: { min: 800, max: 1500 }
            },
            boss_demon: {
                items: [
                    { id: 'hellfire_sword', chance: 0.5 },
                    { id: 'demon_blade', chance: 0.5 },
                    { id: 'demon_armor', chance: 0.5 },
                    { id: 'chaos_crown', chance: 0.2 },
                    { id: 'full_restore', chance: 0.5 }
                ],
                gold: { min: 1000, max: 2000 }
            },
            boss_chaos: {
                items: [
                    { id: 'chaos_staff', chance: 0.5 },
                    { id: 'chaos_crown', chance: 0.5 },
                    { id: 'void_scythe', chance: 0.4 },
                    { id: 'paladin_plate', chance: 0.4 },
                    { id: 'dragon_fang_blade', chance: 0.3 },
                    { id: 'full_restore', chance: 0.8, stackMin: 2, stackMax: 3 }
                ],
                gold: { min: 2000, max: 5000 }
            },
            chest: {
                items: [
                    { id: 'steel_blade', chance: 0.4 },
                    { id: 'simple_ring', chance: 0.6 },
                    { id: 'blue_angel_sword', chance: 0.1 },
                    { id: 'steel_armor', chance: 0.35 },
                    { id: 'silver_ring', chance: 0.4 },
                    { id: 'magic_staff', chance: 0.3 },
                    { id: 'greater_health_potion', chance: 0.6, stackMin: 2, stackMax: 3 }
                ],
                gold: { min: 50, max: 150 }
            },

            // === SECRET BOSS LOOT (Guaranteed epic/legendary) ===
            secret_boss_1: {
                items: [
                    { id: 'frost_blade', chance: 1.0 },
                    { id: 'bone_helmet', chance: 0.8 },
                    { id: 'escape_scroll', chance: 1.0, stackMin: 2, stackMax: 3 },
                    { id: 'health_potion', chance: 1.0, stackMin: 5, stackMax: 8 }
                ],
                gold: { min: 200, max: 400 }
            },
            secret_boss_2: {
                items: [
                    { id: 'bone_scythe', chance: 1.0 },
                    { id: 'frost_armor', chance: 0.8 },
                    { id: 'regen_potion', chance: 1.0, stackMin: 3, stackMax: 5 }
                ],
                gold: { min: 300, max: 600 }
            },
            secret_boss_3: {
                items: [
                    { id: 'assassin_blade', chance: 1.0 },
                    { id: 'assassin_garb', chance: 0.8 },
                    { id: 'speed_elixir', chance: 1.0, stackMin: 3, stackMax: 5 }
                ],
                gold: { min: 400, max: 800 }
            },
            secret_boss_4: {
                items: [
                    { id: 'paladin_mace', chance: 1.0 },
                    { id: 'titan_ring', chance: 0.8 },
                    { id: 'defense_potion', chance: 1.0, stackMin: 3, stackMax: 5 }
                ],
                gold: { min: 500, max: 1000 }
            },
            secret_boss_5: {
                items: [
                    { id: 'blood_axe', chance: 1.0 },
                    { id: 'frost_armor', chance: 0.8 },
                    { id: 'regen_potion', chance: 1.0, stackMin: 5, stackMax: 8 }
                ],
                gold: { min: 600, max: 1200 }
            },
            secret_boss_6: {
                items: [
                    { id: 'arcane_wand', chance: 1.0 },
                    { id: 'void_robes', chance: 1.0 },
                    { id: 'xp_potion', chance: 1.0, stackMin: 3, stackMax: 5 }
                ],
                gold: { min: 800, max: 1500 }
            },
            secret_boss_7: {
                items: [
                    { id: 'hellfire_sword', chance: 1.0 },
                    { id: 'volcanic_helm', chance: 1.0 },
                    { id: 'strength_elixir', chance: 1.0, stackMin: 3, stackMax: 5 }
                ],
                gold: { min: 1000, max: 2000 }
            },
            secret_boss_8: {
                items: [
                    { id: 'void_scythe', chance: 0.8 },
                    { id: 'paladin_plate', chance: 0.6 },
                    { id: 'full_restore', chance: 1.0, stackMin: 2, stackMax: 3 }
                ],
                gold: { min: 1500, max: 3000 }
            },
            secret_boss_9: {
                items: [
                    { id: 'void_scythe', chance: 1.0 },
                    { id: 'spectral_boots', chance: 1.0 },
                    { id: 'full_restore', chance: 1.0, stackMin: 3, stackMax: 5 }
                ],
                gold: { min: 2000, max: 4000 }
            },
            secret_boss_10: {
                items: [
                    { id: 'dragon_fang_blade', chance: 1.0 },
                    { id: 'dragon_helm', chance: 1.0 },
                    { id: 'full_restore', chance: 1.0, stackMin: 3, stackMax: 5 }
                ],
                gold: { min: 2500, max: 5000 }
            },
            secret_boss_11: {
                items: [
                    { id: 'chaos_staff', chance: 0.8 },
                    { id: 'chaos_crown', chance: 0.8 },
                    { id: 'paladin_plate', chance: 0.7 },
                    { id: 'full_restore', chance: 1.0, stackMin: 3, stackMax: 5 }
                ],
                gold: { min: 3000, max: 6000 }
            },
            secret_boss_12: {
                items: [
                    { id: 'chaos_staff', chance: 1.0 },
                    { id: 'chaos_crown', chance: 1.0 },
                    { id: 'dragon_fang_blade', chance: 1.0 },
                    { id: 'void_scythe', chance: 0.8 },
                    { id: 'full_restore', chance: 1.0, stackMin: 5, stackMax: 8 }
                ],
                gold: { min: 5000, max: 10000 }
            }
        };
    }

    // Generate loot from enemy drop
    generateLoot(dropInfo, x, y) {
        const { lootTable, level } = dropInfo;
        const table = this.lootTables[lootTable];

        if (!table) return;

        const drops = [];

        // Roll for items
        table.items.forEach(itemDef => {
            if (Math.random() < itemDef.chance) {
                let item = createRandomItem(itemDef.id, level);

                // Handle stackable items
                if (itemDef.stackMin && itemDef.stackMax) {
                    const count = itemDef.stackMin + Math.floor(Math.random() * (itemDef.stackMax - itemDef.stackMin + 1));
                    for (let i = 0; i < count; i++) {
                        drops.push(getItem(itemDef.id));
                    }
                } else {
                    drops.push(item);
                }
            }
        });

        // Create loot drop object
        if (drops.length > 0) {
            const lootDrop = {
                x: x,
                y: y,
                items: drops,
                lifetime: 30,
                pulseTimer: 0
            };

            this.lootDrops.push(lootDrop);
        }
    }

    // Generate chest loot
    generateChestLoot(chestLevel, x, y) {
        this.generateLoot({ lootTable: 'chest', level: chestLevel }, x, y);
    }

    // Player picks up loot
    pickupLoot(player, lootDrop) {
        let pickedUpAll = true;

        lootDrop.items.forEach(item => {
            const added = this.game.inventorySystem.addItem(player, item);
            if (!added) {
                pickedUpAll = false;
            }
        });

        if (pickedUpAll) {
            const index = this.lootDrops.indexOf(lootDrop);
            if (index !== -1) {
                this.lootDrops.splice(index, 1);
            }
        }

        return pickedUpAll;
    }

    // Check if player is near loot
    checkLootPickup(player) {
        for (let i = 0; i < this.lootDrops.length; i++) {
            const loot = this.lootDrops[i];
            const dx = loot.x - player.x;
            const dy = loot.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 40) {
                this.pickupLoot(player, loot);
                i--;
            }
        }
    }

    // Update loot system
    update(deltaTime, player) {
        for (let i = this.lootDrops.length - 1; i >= 0; i--) {
            const loot = this.lootDrops[i];
            loot.lifetime -= deltaTime;
            loot.pulseTimer += deltaTime;

            if (loot.lifetime <= 0) {
                this.lootDrops.splice(i, 1);
            }
        }

        this.checkLootPickup(player);
    }

    getAllLoot() {
        return this.lootDrops;
    }

    clearAll() {
        this.lootDrops = [];
    }

    // Stage completion rewards (expanded)
    generateStageRewards(stageLevel, isFirstClear) {
        const rewards = [];
        const rewardCount = 2 + (isFirstClear ? 2 : 0);

        const possibleItems = [
            { id: 'steel_blade', minLevel: 3 },
            { id: 'steel_armor', minLevel: 3 },
            { id: 'magic_staff', minLevel: 4 },
            { id: 'shadow_dagger', minLevel: 5 },
            { id: 'shadow_hood', minLevel: 5 },
            { id: 'ring_of_power', minLevel: 6 },
            { id: 'health_amulet', minLevel: 4 },
            { id: 'mana_amulet', minLevel: 4 },
            { id: 'frost_blade', minLevel: 5 },
            { id: 'bone_scythe', minLevel: 3 },
            { id: 'arcane_wand', minLevel: 8 },
            { id: 'blood_axe', minLevel: 10 },
            { id: 'assassin_blade', minLevel: 12 },
            { id: 'paladin_mace', minLevel: 14 },
            { id: 'hellfire_sword', minLevel: 16 },
            { id: 'void_robes', minLevel: 18 },
            { id: 'dragon_helm', minLevel: 25 },
            { id: 'void_scythe', minLevel: 28 },
            { id: 'dragon_fang_blade', minLevel: 30 },
            { id: 'chaos_staff', minLevel: 35 },
            { id: 'blue_angel_sword', minLevel: 10 },
            { id: 'purple_arcane_sword', minLevel: 15 },
            { id: 'flaming_sword', minLevel: 25 },
            { id: 'crystal_staff', minLevel: 8 },
            { id: 'supreme_arcane_staff', minLevel: 20 },
            { id: 'dark_purple_armor', minLevel: 15 },
            { id: 'simple_ring', minLevel: 2 },
            { id: 'dual_arcane_ring', minLevel: 12 },
            { id: 'arcane_amulet', minLevel: 18 },
            { id: 'legendary_solar_amulet', minLevel: 30 }
        ];

        const availableItems = possibleItems.filter(item => stageLevel >= item.minLevel);

        for (let i = 0; i < rewardCount; i++) {
            if (availableItems.length > 0) {
                const itemDef = availableItems[Math.floor(Math.random() * availableItems.length)];
                const item = createRandomItem(itemDef.id, stageLevel);
                if (item) rewards.push(item);
            }
        }

        // Add potions
        for (let i = 0; i < 3; i++) {
            rewards.push(getItem('greater_health_potion'));
        }
        for (let i = 0; i < 2; i++) {
            rewards.push(getItem('mana_potion'));
        }

        // Bonus consumables for higher stages
        if (stageLevel >= 10) {
            rewards.push(getItem('escape_scroll'));
        }
        if (stageLevel >= 15) {
            rewards.push(getItem('regen_potion'));
        }
        if (stageLevel >= 25) {
            rewards.push(getItem('xp_potion'));
        }

        return rewards;
    }
}

