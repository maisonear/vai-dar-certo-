// ui.js - Updated UI system with Item Detail Panel and Class Selection improvements

class UISystem {
    constructor(game) {
        this.game = game;
        this.discardMode = false;
        this.selectedItem = null;       // Currently selected item for detail panel
        this.selectedSlot = null;       // If item is from equipment slot
        this.selectedInvIndex = null;   // If item is from inventory
        this.init();
    }

    init() {
        // Setup event listeners for panels
        this.statsPanel = document.getElementById('stats-panel');
        this.inventoryPanel = document.getElementById('inventory-panel');
        this.stagePanel = document.getElementById('stage-panel');
        this.skillsPanel = document.getElementById('skills-panel');

        // Wire up button IDs that replaced inline onclick attributes
        const btnStage = document.getElementById('btn-stage');
        if (btnStage) btnStage.addEventListener('click', () => this.toggleStagePanel());

        const closeStagePanelBtn = document.getElementById('close-stage-panel');
        if (closeStagePanelBtn) closeStagePanelBtn.addEventListener('click', () => this.toggleStagePanel());
    }

    // Update all UI elements
    updateAll(player) {
        this.updateBars(player);
        this.updateStatsDisplay(player);
        this.updateInventoryDisplay(player);
        this.updateSkillsDisplay(player);
        this.updateHotbar(player);
    }

    // Update HP/MP/XP bars
    updateBars(player) {
        // HP Bar
        const hpPercent = (player.currentHP / player.getMaxHP()) * 100;
        document.getElementById('hp-fill').style.width = `${hpPercent}%`;
        document.getElementById('hp-text').textContent = `${Math.floor(player.currentHP)}/${player.getMaxHP()}`;

        // MP Bar
        const mpPercent = (player.currentMP / player.getMaxMP()) * 100;
        document.getElementById('mp-fill').style.width = `${mpPercent}%`;
        document.getElementById('mp-text').textContent = `${Math.floor(player.currentMP)}/${player.getMaxMP()}`;

        // XP Bar
        const xpPercent = (player.xp / player.xpToNextLevel) * 100;
        document.getElementById('xp-fill').style.width = `${xpPercent}%`;
        document.getElementById('xp-text').textContent = `${player.xp}/${player.xpToNextLevel}`;

        // Level
        document.getElementById('player-level').textContent = player.level;

        // Dash Bar
        const dashBar = document.getElementById('dash-fill');
        const dashText = document.querySelector('#dash-bar-wrapper .bar-text');
        
        if (dashBar && dashText) {
            const dashCooldown = player.dashCooldown || 0;
            const maxCooldown = 3; // Fixed 3s according to combat.js
            
            if (dashCooldown > 0) {
                // Barra enche conforme recarrega (de 0% a 100%)
                const dashPercent = (1 - (dashCooldown / maxCooldown)) * 100;
                dashBar.style.width = `${dashPercent}%`;
                dashText.textContent = `${dashCooldown.toFixed(1)}s`;
                dashBar.parentElement.style.opacity = "0.7";
            } else {
                dashBar.style.width = "100%";
                dashText.textContent = "PRONTO (1)";
                dashBar.parentElement.style.opacity = "1";
            }
        }

        // Update Skill Overlays
        this.updateAllCooldownOverlays(player);
    }

    updateAllCooldownOverlays(player) {
        for (let key in player.hotbar) {
            if (player.hotbar[key]) {
                this.updateSkillCooldownOverlay(key, player);
            }
        }
    }

    // Update stats panel
    updateStatsDisplay(player) {
        const statsList = document.getElementById('stats-list');
        statsList.innerHTML = '';

        // Available points
        document.getElementById('available-points').textContent = player.statPoints;

        const stats = ['força', 'velocidade', 'estamina', 'hp', 'mp', 'sentidos', 'inteligência'];
        const statLabels = {
            força: 'Força',
            velocidade: 'Velocidade',
            estamina: 'Estamina',
            hp: 'HP',
            mp: 'MP',
            sentidos: 'Sentidos',
            inteligência: 'Inteligência'
        };

        stats.forEach(stat => {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';

            const baseStat = player.baseStats[stat];
            const equipBonus = player.equipmentStats[stat];
            const totalStat = player.getStat(stat);

            let displayValue = totalStat;
            if (equipBonus > 0) {
                displayValue = `${baseStat} <span style="color: #10b981;">+${equipBonus}</span>`;
            }

            statItem.innerHTML = `
                <div class="stat-name">${statLabels[stat]}</div>
                <div class="stat-value">${displayValue}</div>
                <div class="stat-controls">
                    <button class="stat-btn" onclick="game.addPlayerStat('${stat}')" ${player.statPoints === 0 ? 'disabled' : ''}>+</button>
                </div>
            `;

            statsList.appendChild(statItem);
        });
    }

    // Get item-specific icon emoji
    getItemIcon(item) {
        if (item.icon) return null; // Has image icon
        if (item.iconEmoji) return item.iconEmoji;

        // Fallback based on type/slot/id
        const iconMap = {
            // Weapons by id keyword
            'dagger': '🗡️', 'sword': '⚔️', 'blade': '⚔️', 'katana': '⚔️',
            'staff': '🪄', 'wand': '🪄', 'cajado': '🪄',
            'axe': '🪓', 'machado': '🪓',
            'hammer': '🔨', 'mace': '🔨', 'maça': '🔨',
            'scythe': '⚒️', 'foice': '⚒️',
            'thread': '✨',
            // Armor
            'helmet': '⛑️', 'helm': '⛑️', 'hood': '🎭', 'cap': '🧢', 'crown': '👑',
            'armor': '🛡️', 'chest': '🛡️', 'robes': '🧥', 'cloak': '🧥', 'garb': '👘', 'plate': '🛡️',
            'boots': '👢',
            // Accessories
            'ring': '💍', 'anel': '💍',
            'amulet': '📿', 'amuleto': '📿', 'pendant': '📿',
            // Consumables
            'potion': '🧪', 'elixir': '⚗️', 'scroll': '📜', 'restore': '✨'
        };

        const itemIdLower = (item.id || '').toLowerCase();
        const itemNameLower = (item.name || '').toLowerCase();

        for (const [key, emoji] of Object.entries(iconMap)) {
            if (itemIdLower.includes(key) || itemNameLower.includes(key)) {
                return emoji;
            }
        }

        // Generic fallbacks
        if (item.type === 'weapon') return '⚔️';
        if (item.type === 'armor') return '🛡️';
        if (item.type === 'accessory') return '💍';
        if (item.type === 'consumable') return '🧪';
        return '📦';
    }

    // Render icon HTML for an item
    renderItemIcon(item, size = 32, isEquipSlot = false) {
        if (item.icon) {
            if (isEquipSlot) {
                return `<img src="${item.icon}" class="equip-slot-img" alt="${item.name}">`;
            }
            return `<img src="${item.icon}" class="inv-item-img" alt="${item.name}">`;
        }
        const emoji = this.getItemIcon(item);
        if (isEquipSlot) {
            return `<div class="equip-slot-emoji">${emoji}</div>`;
        }
        return `<div style="font-size: ${size * 0.75}px;">${emoji}</div>`;
    }

    // Update inventory display
    updateInventoryDisplay(player) {
        // Update equipment slots
        const equipmentSlots = document.getElementById('equipment-slots');
        equipmentSlots.innerHTML = '';

        const slots = ['weapon', 'helmet', 'chest', 'boots', 'ring', 'amulet'];
        const slotLabels = {
            weapon: 'Arma',
            helmet: 'Elmo',
            chest: 'Armadura',
            boots: 'Botas',
            ring: 'Anel',
            amulet: 'Amuleto'
        };

        slots.forEach(slot => {
            const slotDiv = document.createElement('div');
            slotDiv.className = 'equipment-slot';

            const equipped = player.equipment[slot];
            if (equipped) {
                slotDiv.classList.add('equipped', `rarity-${equipped.rarity}`);

                if (this.selectedSlot === slot) {
                    slotDiv.classList.add('selected');
                }

                slotDiv.innerHTML = `
                    <div class="slot-label">${slotLabels[slot]}</div>
                    ${this.renderItemIcon(equipped, 48, true)}
                    <div class="item-name">${equipped.name}</div>
                `;
                slotDiv.onclick = () => this.showItemDetails(equipped, null, slot);
            } else {
                slotDiv.innerHTML = `<div class="slot-label">${slotLabels[slot]}</div>`;
            }

            equipmentSlots.appendChild(slotDiv);
        });

        // Update inventory grid
        const inventoryGrid = document.getElementById('inventory-grid');
        inventoryGrid.innerHTML = '';

        player.inventory.forEach((invItem, index) => {
            const item = invItem.item;
            const itemDiv = document.createElement('div');
            itemDiv.className = `inventory-item rarity-${item.rarity}`;
            itemDiv.title = `${item.name}\n${item.description}`;

            if (this.selectedInvIndex === index) {
                itemDiv.classList.add('selected');
            }

            itemDiv.innerHTML = `
                ${this.renderItemIcon(item, 32)}
                ${invItem.count > 1 ? `<div class="item-count">${invItem.count}</div>` : ''}
            `;

            // Click to show details
            itemDiv.onclick = () => {
                if (this.discardMode) {
                    // Discard mode - remove item
                    if (confirm(`Descartar ${item.name}${invItem.count > 1 ? ' (x' + invItem.count + ')' : ''}?`)) {
                        game.inventorySystem.dropItem(this.game.player, item.id, invItem.count);
                        this.showNotification(`${item.name} descartado`, 'warning');
                        this.hideItemDetails();
                    }
                } else {
                    // Show item details panel
                    this.showItemDetails(item, index, null);
                }
            };

            // Add visual indicator if in discard mode
            if (this.discardMode) {
                itemDiv.classList.add('discard-mode');
            }

            inventoryGrid.appendChild(itemDiv);
        });

        // Fill empty slots
        const emptySlots = player.maxInventorySlots - player.inventory.length;
        for (let i = 0; i < emptySlots; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'inventory-item';
            inventoryGrid.appendChild(emptyDiv);
        }
    }

    // ===== ITEM DETAIL PANEL =====
    showItemDetails(item, invIndex = null, equipSlot = null) {
        this.selectedItem = item;
        this.selectedInvIndex = invIndex;
        this.selectedSlot = equipSlot;

        const panel = document.getElementById('item-detail-panel');
        const content = document.getElementById('item-detail-content');
        const actions = document.getElementById('item-detail-actions');

        if (!panel || !content) return;

        // Refresh inventory to update selection highlight
        this.updateInventoryDisplay(this.game.player);

        const typeLabels = {
            weapon: '⚔️ Arma',
            armor: '🛡️ Armadura',
            accessory: '💎 Acessório',
            consumable: '🧪 Consumível'
        };

        const rarityLabels = {
            common: 'Comum',
            uncommon: 'Incomum',
            rare: 'Raro',
            epic: 'Épico',
            legendary: 'Lendário'
        };

        const statLabels = {
            força: '💪 Força', velocidade: '⚡ Velocidade', estamina: '❤️ Estamina',
            hp: '💚 HP', mp: '💙 MP', sentidos: '👁️ Sentidos',
            inteligência: '🧠 Inteligência', constituição: '🏛️ Constituição',
            agilidade: '🦅 Agilidade', destreza: '🎯 Destreza', sorte: '🍀 Sorte',
            defesa: '🛡️ Defesa'
        };

        let html = '';

        // Icon
        html += `<div class="item-detail-icon">${this.getItemIcon(item) || ''}</div>`;
        if (item.icon) {
            html += `<div class="item-detail-icon"><img src="${item.icon}" style="width:48px;height:48px;image-rendering:pixelated;"></div>`;
        }

        // Name
        const rarityColors = {
            common: '#9ca3af', uncommon: '#22c55e', rare: '#3b82f6',
            epic: '#a855f7', legendary: '#f59e0b'
        };
        html += `<div class="item-detail-name" style="color:${rarityColors[item.rarity] || '#fff'}">${item.name}</div>`;

        // Rarity
        html += `<div class="item-detail-rarity rarity-${item.rarity}">${rarityLabels[item.rarity] || item.rarity}</div>`;

        // Type
        html += `<div class="item-detail-type">${typeLabels[item.type] || item.type}</div>`;

        // Base Damage (weapons)
        if (item.baseDamage) {
            html += `<div class="item-detail-damage">⚔️ ${item.baseDamage} Dano</div>`;
        }

        // Attack Speed
        if (item.attackSpeed) {
            html += `<div class="item-detail-type">Vel. Ataque: ${item.attackSpeed}s</div>`;
        }

        // Range
        if (item.range) {
            html += `<div class="item-detail-type">Alcance: ${item.range}</div>`;
        }

        // Defense for armor (estimate from estamina)
        if (item.type === 'armor' && item.stats && item.stats.estamina) {
            html += `<div class="item-detail-defense">🛡️ +${item.stats.estamina} Defesa</div>`;
        }

        // Stats
        if (item.stats && Object.keys(item.stats).length > 0) {
            html += `<hr class="item-detail-divider">`;
            html += `<div class="item-detail-section-title">Atributos</div>`;
            for (const [stat, val] of Object.entries(item.stats)) {
                const label = statLabels[stat] || stat;
                html += `<div class="item-detail-stat">
                    <span class="stat-label">${label}</span>
                    <span class="stat-val">+${val}</span>
                </div>`;
            }
        }

        // Consumable effects
        if (item.type === 'consumable' && item.effect) {
            html += `<hr class="item-detail-divider">`;
            html += `<div class="item-detail-section-title">Efeito</div>`;
            if (item.effect.healHP) html += `<div class="item-detail-stat"><span class="stat-label">💚 Cura HP</span><span class="stat-val">+${item.effect.healHP}</span></div>`;
            if (item.effect.healMP) html += `<div class="item-detail-stat"><span class="stat-label">💙 Cura MP</span><span class="stat-val">+${item.effect.healMP}</span></div>`;
            if (item.effect.buffDamage) html += `<div class="item-detail-stat"><span class="stat-label">⚔️ Dano</span><span class="stat-val">+${Math.round(item.effect.buffDamage*100)}%</span></div>`;
            if (item.effect.buffSpeed) html += `<div class="item-detail-stat"><span class="stat-label">⚡ Velocidade</span><span class="stat-val">+${Math.round(item.effect.buffSpeed*100)}%</span></div>`;
            if (item.effect.buffType) html += `<div class="item-detail-stat"><span class="stat-label">⏱️ Duração</span><span class="stat-val">${item.effect.buffDuration}s</span></div>`;
            if (item.effect.escape) html += `<div class="item-detail-stat"><span class="stat-label">🚪 Fuga</span><span class="stat-val">Instantâneo</span></div>`;
            if (item.effect.resetStats) html += `<div class="item-detail-stat"><span class="stat-label">🔄 Reset</span><span class="stat-val">Atributos</span></div>`;
        }

        // Passive Effects
        if (item.passiveEffects) {
            html += `<hr class="item-detail-divider">`;
            html += `<div class="item-detail-section-title">Efeito Passivo</div>`;
            html += `<div class="item-detail-passive">
                <div class="passive-name">✨ ${item.passiveEffects.name}</div>
                <div class="passive-desc">${item.passiveEffects.description}</div>
            </div>`;
        }

        // Active Skill
        if (item.activeSkill) {
            html += `<hr class="item-detail-divider">`;
            html += `<div class="item-detail-section-title">Habilidade Ativa</div>`;
            html += `<div class="item-detail-skill">
                <div class="skill-name">⚡ ${item.activeSkill.name}</div>
                <div class="skill-desc">${item.activeSkill.description}</div>
                <div class="skill-meta">Mana: ${item.activeSkill.manaCost} | CD: ${item.activeSkill.cooldown}s</div>
            </div>`;
        }

        // Description
        if (item.description) {
            html += `<hr class="item-detail-divider">`;
            html += `<div class="item-detail-desc">"${item.description}"</div>`;
        }

        content.innerHTML = html;

        // Actions
        actions.innerHTML = '';
        if (equipSlot !== null) {
            // Viewing equipped item - offer unequip
            const unequipBtn = document.createElement('button');
            unequipBtn.className = 'btn-unequip';
            unequipBtn.textContent = '⬇️ Desequipar';
            unequipBtn.onclick = () => {
                game.unequipItem(equipSlot);
                this.hideItemDetails();
            };
            actions.appendChild(unequipBtn);
        } else if (invIndex !== null) {
            // Viewing inventory item - offer equip/use/discard
            if (item.type === 'consumable') {
                const useBtn = document.createElement('button');
                useBtn.className = 'btn-use';
                useBtn.textContent = '🧪 Usar';
                useBtn.onclick = () => {
                    game.useConsumable(item.id);
                    this.hideItemDetails();
                };
                actions.appendChild(useBtn);
            } else if (item.slot) {
                const equipBtn = document.createElement('button');
                equipBtn.className = 'btn-equip';
                equipBtn.textContent = '⬆️ Equipar';
                equipBtn.onclick = () => {
                    game.equipItem(item);
                    this.hideItemDetails();
                };
                actions.appendChild(equipBtn);
            }

            const discardBtn = document.createElement('button');
            discardBtn.className = 'btn-discard';
            discardBtn.textContent = '🗑️ Descartar';
            discardBtn.onclick = () => {
                const invItem = this.game.player.inventory[invIndex];
                if (invItem && confirm(`Descartar ${item.name}?`)) {
                    game.inventorySystem.dropItem(this.game.player, item.id, invItem.count);
                    this.showNotification(`${item.name} descartado`, 'warning');
                    this.hideItemDetails();
                }
            };
            actions.appendChild(discardBtn);
        }

        panel.classList.remove('hidden');
    }

    hideItemDetails() {
        const panel = document.getElementById('item-detail-panel');
        if (panel) panel.classList.add('hidden');
        this.selectedItem = null;
        this.selectedInvIndex = null;
        this.selectedSlot = null;
        this.updateInventoryDisplay(this.game.player);
    }

    // Update Skills Display
    updateSkillsDisplay(player) {
        const skillsList = document.getElementById('skills-list');
        if (!skillsList) return;

        skillsList.innerHTML = '';
        document.getElementById('skill-points').textContent = player.level;

        // 1. Load and Sort skills by power
        const allSkills = Object.values(ActiveSkills).map(s => ({
            id: s.id,
            name: s.name,
            desc: s.description,
            cost: s.manaCost || 0,
            requiredLevel: s.requiredLevel || Math.max(1, Math.floor((s.cost || 0) / 10)),
            icon: s.icon || '❓'
        }));

        // Dash first, then by MP cost
        allSkills.sort((a, b) => {
            if (a.id === 'dash') return -1;
            if (b.id === 'dash') return 1;
            return a.cost - b.cost;
        });

        const hotbarKeys = ['1','2','3','4','5','6','7','8','9','0'];

        allSkills.forEach((skill, index) => {
            const isUnlocked = player.level >= skill.requiredLevel;
            const key = hotbarKeys[index] || '?';
            const isActivated = player.activatedSkills[key] && player.hotbar[key] === skill.id;

            const skillItem = document.createElement('div');
            skillItem.className = `skill-item ${isActivated ? 'active-on-hotbar' : ''}`;
            if (!isUnlocked) skillItem.style.opacity = '0.4';

            skillItem.innerHTML = `
                 <div class="skill-info">
                     <div class="skill-name" style="font-size: 24px; font-weight: 900;">${skill.name} ${!isUnlocked ? '(Bloqueado)' : ''}</div>
                     <div class="skill-desc" style="font-size: 16px; margin: 8px 0; color: #ccc;">${skill.desc}</div>
                     <div class="skill-cost" style="color: var(--secondary-color); font-weight: 700;">Custo: ${skill.cost} MP | Nível Req: ${skill.requiredLevel}</div>
                 </div>
                 <div class="skill-action-row">
                     <div class="skill-key-hint">Tecla ${key}</div>
                     <div class="skill-act-btns">
                        <button class="skill-act-btn activate" onclick="game.ui.toggleSkillActivation('${key}', true, '${skill.id}')" ${!isUnlocked || isActivated ? 'disabled' : ''}>ATIVAR</button>
                        <button class="skill-act-btn deactivate" onclick="game.ui.toggleSkillActivation('${key}', false, '${skill.id}')" ${!isActivated ? 'disabled' : ''}>DESATIVAR</button>
                     </div>
                 </div>
             `;

            skillsList.appendChild(skillItem);
        });
    }

    // Assign skill to hotkey
    assignSkill(key, skillId) {
        if (this.game.player) {
            this.game.player.hotbar[key] = skillId;
            this.updateHotbar(this.game.player);
            this.showNotification(`Habilidade atribuída a tecla ${key.toUpperCase()}`, 'success');
        }
    }

    // Update Hotbar UI (Vertical)
    updateHotbar(player) {
        const hotbarContainer = document.getElementById('hotbar');
        if (!hotbarContainer) return;

        hotbarContainer.innerHTML = '';

        // 1. Collect all skills in hotbar
        const equippedSkills = [];
        for (let key in player.hotbar) {
            const skillId = player.hotbar[key];
            if (skillId) {
                const skillDef = Object.values(ActiveSkills).find(s => s.id === skillId);
                if (skillDef) {
                    equippedSkills.push({
                        key: key,
                        id: skillId,
                        name: skillDef.name,
                        icon: skillDef.icon || '❓',
                        manaCost: skillDef.manaCost || 0,
                        cooldown: skillDef.cooldown || 0,
                        isDash: skillId === 'dash'
                    });
                }
            }
        }

        // 2. Sort skills: Dash first, then by manaCost (weakest to strongest)
        equippedSkills.sort((a, b) => {
            if (a.isDash) return -1;
            if (b.isDash) return 1;
            return a.manaCost - b.manaCost;
        });

        // 3. Render skills
        equippedSkills.forEach(skill => {
            const isActivated = player.activatedSkills[skill.key];
            if (!isActivated) return; // Only show actually activated skills

            const itemDiv = document.createElement('div');
            itemDiv.className = `hotbar-item active`;
            
            // Skill icon slot
            const slotDiv = document.createElement('div');
            slotDiv.className = 'hotbar-slot';
            slotDiv.innerHTML = `
                <div class="key-hint">${skill.key}</div>
                <div style="font-size: 30px;">${skill.icon}</div>
                <div class="cooldown-overlay" id="cd-overlay-${skill.key}"></div>
            `;
            
            const labelDiv = document.createElement('div');
            labelDiv.className = 'skill-name-label';
            labelDiv.textContent = skill.name;
            
            itemDiv.appendChild(slotDiv);
            itemDiv.appendChild(labelDiv);
            hotbarContainer.appendChild(itemDiv);

            // Update Cooldown Overlay
            this.updateSkillCooldownOverlay(skill.key, player);
        });
    }

    // Toggle skill activation (called from Skills menu)
    toggleSkillActivation(key, state, skillId) {
        if (this.game.player) {
            if (state) {
                this.game.player.activatedSkills[key] = true;
                this.game.player.hotbar[key] = skillId;
                this.showNotification(`Habilidade ATIVADA na tecla ${key}`, 'success');
            } else {
                this.game.player.activatedSkills[key] = false;
                this.game.player.hotbar[key] = null;
                this.showNotification(`Habilidade DESATIVADA`, 'warning');
            }
            this.updateHotbar(this.game.player);
            this.updateSkillsDisplay(this.game.player);
        }
    }

    updateSkillCooldownOverlay(key, player) {
        const overlay = document.getElementById(`cd-overlay-${key}`);
        if (!overlay) return;

        const skillId = player.hotbar[key];
        if (!skillId) return;

        let cooldown = 0;
        let maxCooldown = 1;

        if (skillId === 'dash') {
            cooldown = player.dashCooldown || 0;
            maxCooldown = ActiveSkills.DASH.cooldown || 6;
        } else {
            // Find cooldown in player._cooldowns or skill definition
            cooldown = (player._cooldowns && player._cooldowns[skillId]) || 0;
            const skillDef = Object.values(ActiveSkills).find(s => s.id === skillId);
            maxCooldown = skillDef ? skillDef.cooldown : 1;
        }

        if (cooldown > 0) {
            const percent = (cooldown / maxCooldown) * 100;
            overlay.style.height = `${percent}%`;
        } else {
            overlay.style.height = '0%';
        }
    }

    highlightHotbarSlot(key) {
        let elementId = `hotbar-${key}`;
        if (key === 'q') elementId = 'hotbar-potion-weak';
        if (key === 'l') elementId = 'hotbar-potion-mp';
        if (key === 'k') elementId = 'hotbar-potion-strong';

        const slot = document.getElementById(elementId)?.parentElement;
        if (slot) {
            slot.classList.add('active');
            setTimeout(() => slot.classList.remove('active'), 200);
        }
    }

    // Update stage panel
    updateStagePanel(player) {
        const stagesList = document.getElementById('stages-list');
        stagesList.innerHTML = '';

        const stages = this.game.stageSystem.getAvailableStages(player.level);

        for (let stageId in this.game.stageSystem.stages) {
            const stage = this.game.stageSystem.stages[stageId];
            const isAvailable = player.level >= stage.requiredLevel;
            const isCompleted = this.game.stageSystem.completedStages.includes(stage.id);

            const stageDiv = document.createElement('div');
            stageDiv.className = 'stage-item';

            if (!isAvailable) stageDiv.classList.add('locked');
            if (isCompleted) stageDiv.classList.add('completed');

            stageDiv.innerHTML = `
                <div class="stage-name">${stage.name} ${isCompleted ? '✓' : ''}</div>
                <div class="stage-difficulty">Dificuldade: ${stage.difficulty} | Nível Recomendado: ${stage.requiredLevel}</div>
                <div class="stage-description">${stage.description}</div>
                <div class="stage-rewards">Recompensas: +${stage.rewards.xpBonus} XP</div>
            `;

            if (isAvailable) {
                stageDiv.onclick = () => {
                    this.toggleStagePanel();
                    game.startStage(stage.id);
                };
            }

            stagesList.appendChild(stageDiv);
        }
    }

    // Toggle panels
    toggleStatsPanel() {
        this.statsPanel.classList.toggle('hidden');
        if (!this.statsPanel.classList.contains('hidden')) {
            this.updateStatsDisplay(this.game.player);
        }
    }

    toggleInventory() {
        this.inventoryPanel.classList.toggle('hidden');
        if (!this.inventoryPanel.classList.contains('hidden')) {
            this.updateInventoryDisplay(this.game.player);
        } else {
            this.hideItemDetails();
        }
    }

    toggleStagePanel() {
        this.stagePanel.classList.toggle('hidden');
        if (!this.stagePanel.classList.contains('hidden')) {
            this.updateStagePanel(this.game.player);
        }
    }

    toggleSkillsPanel() {
        this.skillsPanel.classList.toggle('hidden');
        if (!this.skillsPanel.classList.contains('hidden')) {
            this.updateSkillsDisplay(this.game.player);
        }
    }

    toggleShop() {
        const shopPanel = document.getElementById('shop-panel');
        if (shopPanel) {
            shopPanel.classList.toggle('hidden');
            if (!shopPanel.classList.contains('hidden') && this.game.shop) {
                this.game.shop.updateShopDisplay(this.game.player);
            }
            // Hide preview when closing shop
            if (shopPanel.classList.contains('hidden')) {
                const preview = document.getElementById('shop-item-preview');
                if (preview) preview.classList.add('hidden');
            }
        }
    }

    showShopTab(tab) {
        if (this.game.shop) {
            this.game.shop.currentTab = tab;
        }
        // Update tab buttons
        document.querySelectorAll('.shop-tab').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.includes(tab === 'buy' ? 'Comprar' : 'Vender')) {
                btn.classList.add('active');
            }
        });
        // Hide preview
        const preview = document.getElementById('shop-item-preview');
        if (preview) preview.classList.add('hidden');

        if (this.game.shop) {
            this.game.shop.updateShopDisplay(this.game.player);
        }
    }

    refreshShop() {
        if (!this.game.shop || !this.game.player) return;
        const result = this.game.shop.refreshInventory(this.game.player);
        this.showNotification(result.message, result.success ? 'success' : 'warning');
        if (result.success) {
            this.game.shop.updateShopDisplay(this.game.player);
            this.updateAll(this.game.player);
        }
    }

    // Show damage number
    showDamageNumber(x, y, value, type, isCritical) {
        const damageContainer = document.getElementById('damage-numbers');

        const damageDiv = document.createElement('div');
        damageDiv.className = `damage-number ${type}-damage`;
        if (isCritical) {
            damageDiv.classList.add('critical');
        }
        damageDiv.textContent = value;
        damageDiv.style.left = `${x}px`;
        damageDiv.style.top = `${y}px`;

        damageContainer.appendChild(damageDiv);

        setTimeout(() => {
            damageDiv.remove();
        }, 1000);
    }

    // Toggle discard mode
    toggleDiscardMode() {
        this.discardMode = !this.discardMode;
        const btn = document.getElementById('discard-mode-btn');

        if (this.discardMode) {
            btn.classList.add('active');
            btn.innerHTML = '✓ Modo Descartar';
            this.showNotification('Modo Descartar Ativado - Clique nos itens para descartá-los', 'warning');
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '🗑️ Descartar';
            this.showNotification('Modo Normal', 'info');
        }

        this.updateInventoryDisplay(this.game.player);
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notificationsContainer = document.getElementById('notifications');

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        notificationsContainer.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // ===== CLASS SELECTION =====
    showClassSelection(showRare = false) {
        const panel = document.getElementById('class-selection-panel');
        const grid = document.getElementById('class-grid');
        const gridRare = document.getElementById('class-grid-rare');
        const rareSection = document.getElementById('class-section-rare');
        const descEl = document.getElementById('class-selection-description');
        if (!panel || !grid) return;

        grid.innerHTML = '';
        if (gridRare) gridRare.innerHTML = '';

        const player = this.game.player;
        const classSystem = this.game.classSystem;

        // Update description based on context
        if (descEl) {
            if (showRare) {
                descEl.textContent = 'Nível 25! Classes raras especiais estão disponíveis. Escolha sabiamente ou aguarde.';
            } else {
                descEl.textContent = 'Você alcançou o nível 15! Escolha sua especialização baseada nos seus atributos.';
            }
        }

        // Show/hide rare section
        if (rareSection) {
            rareSection.classList.toggle('hidden', !showRare);
        }

        for (const classId in ClassDefinitions) {
            const classDef = ClassDefinitions[classId];
            const isRare = classDef.isRare || false;
            const isUnlocked = classSystem.meetsRequirements(player, classId);
            const missing = classSystem.getMissingRequirements(player, classId);

            const card = document.createElement('div');
            card.className = `class-card ${isUnlocked ? '' : 'locked'} ${isRare ? 'rare-class' : ''}`;
            card.style.borderColor = isUnlocked ? classDef.color : '#555';

            if (isUnlocked) {
                card.onclick = () => this.game.selectClass(classId);
                card.style.cursor = 'pointer';
            } else {
                card.style.cursor = 'not-allowed';
            }

            // Build bonus text
            const bonusTexts = [];
            if (classDef.bonuses.attackPower) bonusTexts.push(`+${Math.round(classDef.bonuses.attackPower * 100)}% Dano`);
            if (classDef.bonuses.defense > 0) bonusTexts.push(`+${Math.round(classDef.bonuses.defense * 100)}% Defesa`);
            if (classDef.bonuses.critChance) bonusTexts.push(`+${Math.round(classDef.bonuses.critChance * 100)}% Crit`);
            if (classDef.bonuses.dodgeChance) bonusTexts.push(`+${Math.round(classDef.bonuses.dodgeChance * 100)}% Esquiva`);
            if (classDef.bonuses.magicPower) bonusTexts.push(`+${Math.round(classDef.bonuses.magicPower * 100)}% Dano Mág.`);
            if (classDef.bonuses.maxHP) bonusTexts.push(`+${classDef.bonuses.maxHP} HP`);
            if (classDef.bonuses.hpRegen) bonusTexts.push(`+${classDef.bonuses.hpRegen} HP/s`);
            if (classDef.bonuses.mpRegen) bonusTexts.push(`+${classDef.bonuses.mpRegen} MP/s`);
            if (classDef.bonuses.attackSpeed) bonusTexts.push(`+${Math.round(classDef.bonuses.attackSpeed * 100)}% Vel. Ataque`);

            // Build requirements text
            const reqTexts = [];
            if (classDef.requirements) {
                for (const [stat, val] of Object.entries(classDef.requirements)) {
                    const playerVal = player.baseStats[stat] || 0;
                    const met = playerVal >= val;
                    reqTexts.push(`<span style="color:${met ? '#4ade80' : '#f87171'}">${stat}: ${playerVal}/${val} ${met ? '✓' : '✗'}</span>`);
                }
            }

            // Evolution info
            let evolutionHtml = '';
            if (classDef.evolution) {
                evolutionHtml = `<div style="font-size:11px;color:#f59e0b;margin-top:6px;">🔄 Evolui para: ${classDef.evolution.evolvesTo}</div>`;
            }

            card.innerHTML = `
                <div class="class-icon">${classDef.icon}</div>
                <h3 style="color: ${isUnlocked ? classDef.color : '#666'}">${classDef.name}</h3>
                ${isRare ? '<small style="color:#f59e0b;">⭐ Classe Rara</small>' : ''}
                <p class="class-desc">${classDef.description}</p>
                <div class="class-bonuses">${bonusTexts.join(' · ')}</div>
                <div class="class-requirements">${reqTexts.join(' ')}</div>
                ${evolutionHtml}
                ${!isUnlocked ? '<div class="class-locked-label">🔒 Requisitos não atendidos</div>' : '<div class="class-unlocked-label">✅ Disponível</div>'}
            `;

            // Place in correct grid
            if (isRare && gridRare) {
                gridRare.appendChild(card);
            } else {
                grid.appendChild(card);
            }
        }

        panel.classList.remove('hidden');
    }

    // Dismiss class selection
    dismissClassSelection() {
        const panel = document.getElementById('class-selection-panel');
        if (panel) panel.classList.add('hidden');

        if (this.game.classSystem) {
            this.game.classSystem.classPromptDismissed = true;
        }

        this.showNotification('Você pode escolher sua classe mais tarde.', 'info');
    }

    // Hide class selection screen
    hideClassSelection() {
        const panel = document.getElementById('class-selection-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }

    // Update class display in top bar
    updateClassDisplay(player) {
        const classDisplay = document.getElementById('player-class-display');
        if (!classDisplay) return;

        if (player.classData) {
            classDisplay.style.display = 'inline-block';
            classDisplay.textContent = `${player.classData.icon} ${player.classData.name}`;
            classDisplay.style.color = player.classData.color;
            classDisplay.style.borderLeft = `3px solid ${player.classData.color}`;
            classDisplay.style.paddingLeft = '6px';
        } else {
            classDisplay.style.display = 'none';
        }

        // Hide class selection panel after selecting
        this.hideClassSelection();
    }

    // Show a small save indicator animation
    showSaveIndicator() {
        let indicator = document.getElementById('save-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'save-indicator';
            document.body.appendChild(indicator);
        }
        
        indicator.innerHTML = '💾 Salvando...';
        indicator.className = 'save-indicator show';
        
        if (this.saveIndicatorTimeout) {
            clearTimeout(this.saveIndicatorTimeout);
        }
        
        this.saveIndicatorTimeout = setTimeout(() => {
            indicator.classList.remove('show');
            indicator.classList.add('hide');
        }, 2000);
    }
}
