// inventory.js - Inventory system for Solo Leveling RPG

class InventorySystem {
    constructor(game) {
        this.game = game;
    }

    // Add item to player inventory
    addItem(player, item) {
        const added = player.addToInventory(item);

        if (added && this.game.ui) {
            this.game.ui.showNotification(`Obtido: ${item.name}`, 'item-obtained');
            this.game.ui.updateInventoryDisplay(player);
        }

        return added;
    }

    // Load item blindly from save data (no UI effects or stacking checks logic needed, just push it)
    loadItemRaw(player, parsedItem, count) {
        player.inventory.push({
            item: parsedItem,
            count: count
        });
    }

    // Equip item from inventory
    equipItem(player, item) {
        // Check if item is equippable
        if (!item.slot) return false;

        // Remove from inventory first
        const removed = player.removeFromInventory(item.id, 1);
        if (!removed) return false;

        // Unequip current item and add to inventory
        const unequipped = player.equipment[item.slot];
        if (unequipped) {
            player.addToInventory(unequipped);
        }

        // Equip new item
        player.equip(item);

        // Update UI
        if (this.game.ui) {
            this.game.ui.updateInventoryDisplay(player);
            this.game.ui.updateStatsDisplay(player);
            this.game.ui.showNotification(`Equipado: ${item.name}`, 'item-obtained');
        }

        return true;
    }

    // Unequip item
    unequipItem(player, slot) {
        const item = player.unequip(slot);

        if (item) {
            // Add to inventory
            const added = player.addToInventory(item);

            if (!added) {
                // Inventory full, re-equip
                player.equip(item);
                if (this.game.ui) {
                    this.game.ui.showNotification('Inventário cheio!', 'warning');
                }
                return false;
            }

            // Update UI
            if (this.game.ui) {
                this.game.ui.updateInventoryDisplay(player);
                this.game.ui.updateStatsDisplay(player);
                this.game.ui.showNotification(`Desequipado: ${item.name}`, 'info');
            }

            return true;
        }

        return false;
    }

    // Use consumable item
    useConsumable(player, itemId) {
        const used = player.useItem(itemId);

        if (used && this.game.ui) {
            this.game.ui.updateInventoryDisplay(player);
            this.game.ui.updateStatsDisplay(player);
        }

        return used;
    }

    // Drop item from inventory
    dropItem(player, itemId, count = 1) {
        const removed = player.removeFromInventory(itemId, count);

        if (removed && this.game.ui) {
            this.game.ui.updateInventoryDisplay(player);
        }

        return removed;
    }

    // Sort inventory by rarity
    sortInventory(player) {
        const rarityOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };

        player.inventory.sort((a, b) => {
            const rarityA = rarityOrder[a.item.rarity] || 999;
            const rarityB = rarityOrder[b.item.rarity] || 999;
            return rarityA - rarityB;
        });

        if (this.game.ui) {
            this.game.ui.updateInventoryDisplay(player);
        }
    }

    // Get total inventory value (for selling)
    getInventoryValue(player) {
        let total = 0;
        player.inventory.forEach(invItem => {
            const itemValue = this.getItemValue(invItem.item);
            total += itemValue * invItem.count;
        });
        return total;
    }

    // Get item sell value
    getItemValue(item) {
        const baseValues = {
            common: 10,
            rare: 50,
            epic: 200,
            legendary: 1000
        };
        return baseValues[item.rarity] || 10;
    }
}
