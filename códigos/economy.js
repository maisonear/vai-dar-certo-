// economy.js - Enhanced Currency and Shop System with Rotation, Exclusives & Offers

// Currency Manager
class CurrencyManager {
    constructor() {
        this.currencyName = 'Cristais';
        this.currencyIcon = '💎';
    }

    addCurrency(player, amount) {
        if (!player.currency) player.currency = 0;
        player.currency += amount;
        return player.currency;
    }

    removeCurrency(player, amount) {
        if (!player.currency) player.currency = 0;
        if (player.currency < amount) return false;
        player.currency -= amount;
        return true;
    }

    getCurrency(player) {
        return player.currency || 0;
    }
}

// ========== Enhanced Shop System ==========
class Shop {
    constructor(game) {
        this.game = game;
        this.inventory = [];       // Current shop items for sale
        this.specialOffers = [];   // Current special offers/bundles
        this.refreshCost = 50;
        this.lastRefreshLevel = 0;

        // Rotation system
        this.rotationTimer = 300;      // 5 minutes per rotation
        this.rotationInterval = 300;
        this.rotationCount = 0;

        // Track last exclusive shown (for ghost dagger rule)
        this.lastExclusiveIds = [];

        // Rarity price ranges
        this.rarityPrices = {
            common:    { min: 50,   max: 100 },
            uncommon:  { min: 100,  max: 250 },
            rare:      { min: 250,  max: 600 },
            epic:      { min: 800,  max: 2000 },
            legendary: { min: 3000, max: 10000 }
        };

        // Sell price percentage by rarity
        this.sellPercentages = {
            common: 0.40,
            uncommon: 0.45,
            rare: 0.50,
            epic: 0.55,
            legendary: 0.60
        };

        // Exclusive item appearance chance per slot (5-15%)
        this.exclusiveChance = 0.10;
        // Max exclusive slots per rotation
        this.maxExclusiveSlots = 2;

        // Current shop tab
        this.currentTab = 'buy';
    }

    // ===== ROTATION TIMER =====
    update(deltaTime) {
        if (this.rotationTimer > 0) {
            this.rotationTimer -= deltaTime;
        }
        if (this.rotationTimer <= 0) {
            this.autoRefresh();
        }
    }

    autoRefresh() {
        if (!this.game.player) return;
        this.rotationCount++;
        this.generateInventory(this.game.player.level);
        this.rotationTimer = this.rotationInterval;

        if (this.game.ui) {
            this.game.ui.showNotification('🔄 Loja atualizada! Novos itens disponíveis.', 'info');
        }
    }

    getTimeRemaining() {
        return Math.max(0, Math.floor(this.rotationTimer));
    }

    getFormattedTimeRemaining() {
        const t = this.getTimeRemaining();
        const m = Math.floor(t / 60);
        const s = t % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // ===== PRICE CALCULATION =====
    calculatePrice(item, playerLevel) {
        // Exclusive items use their fixed shopPrice
        if (item.shopExclusive && item.shopPrice) {
            const levelMultiplier = 1 + (playerLevel * 0.03);
            return Math.floor(item.shopPrice * levelMultiplier);
        }

        const rarity = item.rarity || 'common';
        const priceRange = this.rarityPrices[rarity] || this.rarityPrices.common;
        const basePrice = (priceRange.min + priceRange.max) / 2;
        const levelMultiplier = 1 + (playerLevel * 0.1);
        return Math.floor(basePrice * levelMultiplier);
    }

    calculateSellPrice(item, playerLevel) {
        const rarity = item.rarity || 'common';
        const sellPercent = this.sellPercentages[rarity] || 0.40;
        return Math.floor(this.calculatePrice(item, playerLevel) * sellPercent);
    }

    // ===== INVENTORY GENERATION =====
    generateInventory(playerLevel) {
        this.inventory = [];
        this.specialOffers = [];

        const itemCount = 6 + Math.floor(playerLevel / 5);

        // ---- Normal items ----
        const availableItems = Object.values(ItemDatabase).filter(item => {
            return item.type !== 'consumable' || item.id.includes('potion') || item.id.includes('elixir') || item.id.includes('scroll');
        });

        for (let i = 0; i < itemCount; i++) {
            const item = this.selectRandomItem(availableItems, playerLevel);
            if (item) {
                this.inventory.push({
                    item: { ...item },
                    price: this.calculatePrice(item, playerLevel),
                    stock: item.stackable ? Math.floor(Math.random() * 5) + 1 : 1,
                    isExclusive: false,
                    discount: 0
                });
            }
        }

        // ---- Exclusive items ----
        this.addExclusiveItems(playerLevel);

        // ---- Special offers ----
        this.generateSpecialOffers(playerLevel);

        this.lastRefreshLevel = playerLevel;
    }

    addExclusiveItems(playerLevel) {
        const exclusives = getShopExclusiveItems();
        if (exclusives.length === 0) return;

        // Filter out items that were in the last rotation (ghost dagger rule)
        const available = exclusives.filter(item => !this.lastExclusiveIds.includes(item.id));
        if (available.length === 0) return;

        const newExclusiveIds = [];
        let slotsAdded = 0;

        for (let i = 0; i < this.maxExclusiveSlots && i < available.length; i++) {
            // Each exclusive slot has a chance to appear
            if (Math.random() < this.exclusiveChance + (playerLevel * 0.003)) {
                // Pick a random exclusive
                const idx = Math.floor(Math.random() * available.length);
                const excItem = available.splice(idx, 1)[0];

                // Premium price (20-40% more)
                const premium = 1.2 + (Math.random() * 0.2);
                const price = Math.floor(this.calculatePrice(excItem, playerLevel) * premium);

                this.inventory.push({
                    item: { ...excItem },
                    price: price,
                    stock: 1,
                    isExclusive: true,
                    discount: 0
                });

                newExclusiveIds.push(excItem.id);
                slotsAdded++;
            }
        }

        this.lastExclusiveIds = newExclusiveIds;
    }

    generateSpecialOffers(playerLevel) {
        this.specialOffers = [];

        // 40% chance of a potion bundle
        if (Math.random() < 0.40) {
            const potionBundle = {
                id: 'bundle_potions',
                name: '📦 Pacote de Poções',
                description: '3x Poção de Vida + 2x Poção de Mana por preço reduzido!',
                items: [
                    { itemId: 'health_potion', count: 3 },
                    { itemId: 'mana_potion', count: 2 }
                ],
                originalPrice: Math.floor((75 * 3 + 75 * 2) * (1 + playerLevel * 0.1)),
                discount: 0.25,
                rarity: 'uncommon'
            };
            potionBundle.price = Math.floor(potionBundle.originalPrice * (1 - potionBundle.discount));
            this.specialOffers.push(potionBundle);
        }

        // 25% chance of a greater potion bundle
        if (Math.random() < 0.25 && playerLevel >= 10) {
            const greaterBundle = {
                id: 'bundle_greater',
                name: '📦 Pacote Superior',
                description: '2x Poção de Vida Maior + 2x Poção de Mana Maior',
                items: [
                    { itemId: 'greater_health_potion', count: 2 },
                    { itemId: 'greater_mana_potion', count: 2 }
                ],
                originalPrice: Math.floor((425 * 2 + 425 * 2) * (1 + playerLevel * 0.1)),
                discount: 0.20,
                rarity: 'rare'
            };
            greaterBundle.price = Math.floor(greaterBundle.originalPrice * (1 - greaterBundle.discount));
            this.specialOffers.push(greaterBundle);
        }

        // 20% chance of a random item discount
        if (Math.random() < 0.20 && this.inventory.length > 0) {
            const discountIdx = Math.floor(Math.random() * this.inventory.length);
            const discountAmount = 0.10 + Math.random() * 0.20; // 10-30%
            this.inventory[discountIdx].discount = discountAmount;
            this.inventory[discountIdx].originalPrice = this.inventory[discountIdx].price;
            this.inventory[discountIdx].price = Math.floor(this.inventory[discountIdx].price * (1 - discountAmount));
        }
    }

    // ===== ITEM SELECTION =====
    selectRandomItem(items, playerLevel) {
        const rarityWeights = {
            common: Math.max(1, 50 - playerLevel * 2),
            uncommon: 30,
            rare: 15 + playerLevel,
            epic: Math.min(20, playerLevel * 0.5),
            legendary: Math.min(10, Math.max(0, playerLevel - 20))
        };

        const availableItems = items.filter(item => {
            const reqLevel = item.requiredLevel || 1;
            return reqLevel <= playerLevel + 5;
        });

        if (availableItems.length === 0) return null;

        let totalWeight = 0;
        availableItems.forEach(item => {
            totalWeight += (rarityWeights[item.rarity] || rarityWeights.common);
        });

        let random = Math.random() * totalWeight;
        for (const item of availableItems) {
            random -= (rarityWeights[item.rarity] || rarityWeights.common);
            if (random <= 0) return item;
        }

        return availableItems[0];
    }

    // ===== BUY =====
    buyItem(player, shopItemIndex) {
        if (shopItemIndex < 0 || shopItemIndex >= this.inventory.length) {
            return { success: false, message: 'Item não encontrado!' };
        }

        const shopItem = this.inventory[shopItemIndex];

        if (player.currency < shopItem.price) {
            return { success: false, message: '💎 Cristais insuficientes!' };
        }

        const canAdd = player.inventory.length < player.maxInventorySlots;
        if (!canAdd && !shopItem.item.stackable) {
            return { success: false, message: '🎒 Inventário cheio!' };
        }

        player.currency -= shopItem.price;
        player.addToInventory(shopItem.item);

        shopItem.stock--;
        if (shopItem.stock <= 0) {
            this.inventory.splice(shopItemIndex, 1);
        }

        const exclusiveTag = shopItem.isExclusive ? ' ⭐' : '';
        return {
            success: true,
            message: `Comprou ${shopItem.item.name}${exclusiveTag} por ${shopItem.price} 💎!`
        };
    }

    // ===== BUY BUNDLE =====
    buyBundle(player, bundleIndex) {
        if (bundleIndex < 0 || bundleIndex >= this.specialOffers.length) {
            return { success: false, message: 'Oferta não encontrada!' };
        }

        const bundle = this.specialOffers[bundleIndex];

        if (player.currency < bundle.price) {
            return { success: false, message: '💎 Cristais insuficientes!' };
        }

        // Check inventory space
        const totalItems = bundle.items.reduce((sum, bi) => sum + bi.count, 0);
        const freeSlots = player.maxInventorySlots - player.inventory.length;
        if (freeSlots < 1) {
            return { success: false, message: '🎒 Inventário cheio!' };
        }

        player.currency -= bundle.price;

        bundle.items.forEach(bi => {
            for (let i = 0; i < bi.count; i++) {
                const item = getItem(bi.itemId);
                if (item) player.addToInventory(item);
            }
        });

        this.specialOffers.splice(bundleIndex, 1);

        return {
            success: true,
            message: `📦 Comprou ${bundle.name} por ${bundle.price} 💎!`
        };
    }

    // ===== SELL =====
    sellItem(player, itemId) {
        const invItem = player.inventory.find(i => i.item.id === itemId);
        if (!invItem) {
            return { success: false, message: 'Item não encontrado no inventário!' };
        }

        const sellPrice = this.calculateSellPrice(invItem.item, player.level);

        const removed = player.removeFromInventory(itemId, 1);
        if (!removed) {
            return { success: false, message: 'Erro ao vender item!' };
        }

        player.currency += sellPrice;

        return {
            success: true,
            message: `Vendeu ${invItem.item.name} por ${sellPrice} 💎!`,
            price: sellPrice
        };
    }

    // ===== REFRESH =====
    refreshInventory(player) {
        if (player.currency < this.refreshCost) {
            return { success: false, message: '💎 Cristais insuficientes para atualizar!' };
        }

        player.currency -= this.refreshCost;
        this.rotationCount++;
        this.generateInventory(player.level);
        this.rotationTimer = this.rotationInterval;

        return {
            success: true,
            message: `🔄 Loja atualizada! Custou ${this.refreshCost} 💎.`
        };
    }

    // ===== SHOP DISPLAY RENDERING =====
    updateShopDisplay(player) {
        if (!player) return;

        // Update currency display
        const currencyEl = document.getElementById('shop-currency');
        if (currencyEl) currencyEl.textContent = player.currency || 0;

        // Update player-currency in HUD too
        const hudCurrency = document.getElementById('player-currency');
        if (hudCurrency) hudCurrency.textContent = player.currency || 0;

        // Update timer
        const timerEl = document.getElementById('shop-timer');
        if (timerEl) timerEl.textContent = this.getFormattedTimeRemaining();

        if (this.currentTab === 'buy') {
            this.renderBuyTab(player);
        } else {
            this.renderSellTab(player);
        }
    }

    renderBuyTab(player) {
        const container = document.getElementById('shop-items');
        const sellContainer = document.getElementById('shop-sell-items');
        if (!container) return;

        container.classList.remove('hidden');
        if (sellContainer) sellContainer.classList.add('hidden');
        container.innerHTML = '';

        const rarityColors = {
            common: '#9ca3af', uncommon: '#22c55e', rare: '#3b82f6',
            epic: '#a855f7', legendary: '#f59e0b'
        };
        const rarityLabels = {
            common: 'Comum', uncommon: 'Incomum', rare: 'Raro',
            epic: 'Épico', legendary: 'Lendário'
        };

        // ---- Special Offers Section ----
        if (this.specialOffers.length > 0) {
            const offersHeader = document.createElement('div');
            offersHeader.className = 'shop-section-header';
            offersHeader.innerHTML = '🎁 <span>OFERTAS ESPECIAIS</span>';
            container.appendChild(offersHeader);

            this.specialOffers.forEach((offer, idx) => {
                const card = document.createElement('div');
                card.className = `shop-item-card shop-offer-card rarity-${offer.rarity}`;
                card.innerHTML = `
                    <div class="shop-item-header">
                        <span class="shop-item-name">${offer.name}</span>
                        <span class="shop-discount-badge">-${Math.round(offer.discount * 100)}%</span>
                    </div>
                    <div class="shop-item-desc">${offer.description}</div>
                    <div class="shop-item-price">
                        <span class="shop-price-old">${offer.originalPrice} 💎</span>
                        <span class="shop-price-new">${offer.price} 💎</span>
                    </div>
                    <button class="shop-buy-btn" ${player.currency < offer.price ? 'disabled' : ''}>
                        ${player.currency < offer.price ? '❌ Sem Cristais' : '🛒 Comprar Pacote'}
                    </button>
                `;

                const buyBtn = card.querySelector('.shop-buy-btn');
                buyBtn.addEventListener('click', () => {
                    const result = this.buyBundle(player, idx);
                    this.game.ui.showNotification(result.message, result.success ? 'success' : 'warning');
                    this.updateShopDisplay(player);
                    this.game.ui.updateAll(player);
                });

                container.appendChild(card);
            });
        }

        // ---- Items Section ----
        if (this.inventory.length > 0) {
            // If we have exclusives, show them first
            const exclusives = this.inventory.filter(si => si.isExclusive);
            const normals = this.inventory.filter(si => !si.isExclusive);

            if (exclusives.length > 0) {
                const excHeader = document.createElement('div');
                excHeader.className = 'shop-section-header shop-exclusive-header';
                excHeader.innerHTML = '⭐ <span>ITENS EXCLUSIVOS</span> <small>Disponíveis por tempo limitado!</small>';
                container.appendChild(excHeader);

                exclusives.forEach((shopItem, localIdx) => {
                    const realIdx = this.inventory.indexOf(shopItem);
                    container.appendChild(this.createShopItemCard(shopItem, realIdx, player, rarityColors, rarityLabels));
                });
            }

            if (normals.length > 0) {
                const normHeader = document.createElement('div');
                normHeader.className = 'shop-section-header';
                normHeader.innerHTML = '🏪 <span>ITENS DISPONÍVEIS</span>';
                container.appendChild(normHeader);

                normals.forEach((shopItem, localIdx) => {
                    const realIdx = this.inventory.indexOf(shopItem);
                    container.appendChild(this.createShopItemCard(shopItem, realIdx, player, rarityColors, rarityLabels));
                });
            }
        } else {
            container.innerHTML = '<div class="shop-empty">Nenhum item na loja. Atualize!</div>';
        }
    }

    createShopItemCard(shopItem, shopIndex, player, rarityColors, rarityLabels) {
        const item = shopItem.item;
        const card = document.createElement('div');
        card.className = `shop-item-card rarity-${item.rarity}`;
        if (shopItem.isExclusive) card.classList.add('shop-exclusive');

        const icon = this.game.ui.getItemIcon(item) || '📦';
        const color = rarityColors[item.rarity] || '#fff';
        const rarityLabel = rarityLabels[item.rarity] || item.rarity;

        // Stats preview
        let statsHtml = '';
        if (item.stats) {
            const statEntries = Object.entries(item.stats).slice(0, 3);
            statsHtml = statEntries.map(([k, v]) => `<span class="shop-stat">+${v} ${k}</span>`).join(' ');
        }

        // Passive preview
        let passiveHtml = '';
        if (item.passiveEffects) {
            passiveHtml = `<div class="shop-item-passive">✨ ${item.passiveEffects.name}</div>`;
        }

        // Discount
        let priceHtml = `<span class="shop-price-current">${shopItem.price} 💎</span>`;
        if (shopItem.discount > 0 && shopItem.originalPrice) {
            priceHtml = `
                <span class="shop-price-old">${shopItem.originalPrice} 💎</span>
                <span class="shop-price-current shop-price-discounted">${shopItem.price} 💎</span>
                <span class="shop-discount-badge">-${Math.round(shopItem.discount * 100)}%</span>
            `;
        }

        // Exclusive badge
        const exclusiveBadge = shopItem.isExclusive ?
            '<div class="shop-exclusive-badge">⭐ EXCLUSIVO</div>' : '';

        // Stock
        const stockHtml = shopItem.stock > 1 ?
            `<span class="shop-stock">x${shopItem.stock}</span>` : '';

        card.innerHTML = `
            <div class="shop-item-icon" style="color: ${color}">${icon}</div>
            <div class="shop-item-info">
                <div class="shop-item-header">
                    <span class="shop-item-name" style="color: ${color}">${item.name}</span>
                    ${exclusiveBadge}
                </div>
                <div class="shop-item-rarity" style="color: ${color}">${rarityLabel} ${item.type === 'weapon' ? '⚔️' : item.type === 'armor' ? '🛡️' : item.type === 'accessory' ? '💍' : '🧪'}</div>
                <div class="shop-item-stats">${statsHtml}</div>
                ${passiveHtml}
                <div class="shop-item-price-row">
                    ${priceHtml}
                    ${stockHtml}
                </div>
            </div>
            <div class="shop-item-actions">
                <button class="shop-preview-btn" title="Ver detalhes">🔍</button>
                <button class="shop-buy-btn" ${player.currency < shopItem.price ? 'disabled' : ''}>
                    ${player.currency < shopItem.price ? '❌' : '🛒'}
                </button>
            </div>
        `;

        // Preview button - show item details
        const previewBtn = card.querySelector('.shop-preview-btn');
        previewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showShopItemPreview(shopItem, player);
        });

        // Buy button
        const buyBtn = card.querySelector('.shop-buy-btn');
        buyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const result = this.buyItem(player, shopIndex);
            this.game.ui.showNotification(result.message, result.success ? 'success' : 'warning');
            this.updateShopDisplay(player);
            this.game.ui.updateAll(player);
        });

        // Click on card also shows preview
        card.addEventListener('click', () => {
            this.showShopItemPreview(shopItem, player);
        });

        return card;
    }

    renderSellTab(player) {
        const container = document.getElementById('shop-sell-items');
        const buyContainer = document.getElementById('shop-items');
        if (!container) return;

        container.classList.remove('hidden');
        if (buyContainer) buyContainer.classList.add('hidden');
        container.innerHTML = '';

        const rarityColors = {
            common: '#9ca3af', uncommon: '#22c55e', rare: '#3b82f6',
            epic: '#a855f7', legendary: '#f59e0b'
        };

        if (player.inventory.length === 0) {
            container.innerHTML = '<div class="shop-empty">Inventário vazio.</div>';
            return;
        }

        player.inventory.forEach((invItem, idx) => {
            const item = invItem.item;
            const sellPrice = this.calculateSellPrice(item, player.level);
            const icon = this.game.ui.getItemIcon(item) || '📦';
            const color = rarityColors[item.rarity] || '#fff';
            const sellPercent = Math.round((this.sellPercentages[item.rarity] || 0.40) * 100);

            const card = document.createElement('div');
            card.className = `shop-item-card shop-sell-card rarity-${item.rarity}`;

            card.innerHTML = `
                <div class="shop-item-icon" style="color: ${color}">${icon}</div>
                <div class="shop-item-info">
                    <div class="shop-item-name" style="color: ${color}">${item.name}${invItem.count > 1 ? ' x' + invItem.count : ''}</div>
                    <div class="shop-item-sell-info">Valor de venda (${sellPercent}%): <strong>${sellPrice} 💎</strong></div>
                </div>
                <div class="shop-item-actions">
                    <button class="shop-sell-btn">💰 Vender</button>
                </div>
            `;

            const sellBtn = card.querySelector('.shop-sell-btn');
            sellBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const result = this.sellItem(player, item.id);
                this.game.ui.showNotification(result.message, result.success ? 'success' : 'warning');
                this.updateShopDisplay(player);
                this.game.ui.updateAll(player);
            });

            container.appendChild(card);
        });
    }

    // ===== ITEM PREVIEW IN SHOP =====
    showShopItemPreview(shopItem, player) {
        const item = shopItem.item;
        const preview = document.getElementById('shop-item-preview');
        if (!preview) return;

        const rarityColors = {
            common: '#9ca3af', uncommon: '#22c55e', rare: '#3b82f6',
            epic: '#a855f7', legendary: '#f59e0b'
        };
        const rarityLabels = {
            common: 'Comum', uncommon: 'Incomum', rare: 'Raro',
            epic: 'Épico', legendary: 'Lendário'
        };
        const statLabels = {
            força: '💪 Força', velocidade: '⚡ Velocidade', estamina: '❤️ Estamina',
            hp: '💚 HP', mp: '💙 MP', sentidos: '👁️ Sentidos',
            inteligência: '🧠 Inteligência', defesa: '🛡️ Defesa',
            agilidade: '🦅 Agilidade', sorte: '🍀 Sorte'
        };

        let html = '';

        // Close button
        html += '<button class="shop-preview-close" id="shop-preview-close-btn">×</button>';

        // Exclusive badge
        if (shopItem.isExclusive) {
            html += '<div class="shop-preview-exclusive">⭐ EXCLUSIVO DE LOJA ⭐</div>';
        }

        // Name
        const color = rarityColors[item.rarity] || '#fff';
        html += `<div class="shop-preview-name" style="color:${color}">${item.name}</div>`;

        // Rarity & Type
        html += `<div class="shop-preview-rarity" style="color:${color}">${rarityLabels[item.rarity] || item.rarity}</div>`;

        // Base damage
        if (item.baseDamage) {
            html += `<div class="shop-preview-damage">⚔️ ${item.baseDamage} Dano Base</div>`;
        }
        if (item.attackSpeed) {
            html += `<div class="shop-preview-stat-line">Vel. Ataque: ${item.attackSpeed}s</div>`;
        }
        if (item.range) {
            html += `<div class="shop-preview-stat-line">Alcance: ${item.range}</div>`;
        }

        // Stats
        if (item.stats && Object.keys(item.stats).length > 0) {
            html += '<hr class="shop-preview-divider">';
            html += '<div class="shop-preview-section">Atributos</div>';
            for (const [stat, val] of Object.entries(item.stats)) {
                const label = statLabels[stat] || stat;
                html += `<div class="shop-preview-stat"><span>${label}</span><span class="shop-preview-val">+${val}</span></div>`;
            }
        }

        // Passive
        if (item.passiveEffects) {
            html += '<hr class="shop-preview-divider">';
            html += '<div class="shop-preview-section">Efeito Passivo</div>';
            html += `<div class="shop-preview-passive-name">✨ ${item.passiveEffects.name}</div>`;
            html += `<div class="shop-preview-passive-desc">${item.passiveEffects.description}</div>`;
        }

        // Active skill
        if (item.activeSkill) {
            html += '<hr class="shop-preview-divider">';
            html += '<div class="shop-preview-section">Habilidade Ativa</div>';
            html += `<div class="shop-preview-skill-name">⚡ ${item.activeSkill.name}</div>`;
            html += `<div class="shop-preview-skill-desc">${item.activeSkill.description}</div>`;
            const meta = [];
            if (item.activeSkill.manaCost) meta.push(`Mana: ${item.activeSkill.manaCost}`);
            if (item.activeSkill.cooldown) meta.push(`CD: ${item.activeSkill.cooldown}s`);
            if (meta.length > 0) {
                html += `<div class="shop-preview-skill-meta">${meta.join(' | ')}</div>`;
            }
        }

        // Description
        if (item.description) {
            html += '<hr class="shop-preview-divider">';
            html += `<div class="shop-preview-lore">"${item.description}"</div>`;
        }

        // Price
        html += '<hr class="shop-preview-divider">';
        html += `<div class="shop-preview-price">${shopItem.price} 💎</div>`;

        preview.innerHTML = html;
        preview.classList.remove('hidden');

        // Close button event
        const closeBtn = document.getElementById('shop-preview-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                preview.classList.add('hidden');
            });
        }
    }
}
