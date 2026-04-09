// sprites.js - Visual sprite system for Solo Leveling RPG

// Sprite Manager
class SpriteManager {
    constructor() {
        this.sprites = new Map();
        this.placeholders = new Map();
        this.loadedImages = new Map();
    }

    // Load sprite image
    loadSprite(id, path) {
        return new Promise((resolve, reject) => {
            if (this.loadedImages.has(id)) {
                resolve(this.loadedImages.get(id));
                return;
            }

            const img = new Image();
            img.onload = () => {
                this.loadedImages.set(id, img);
                resolve(img);
            };
            img.onerror = () => {
                // Create placeholder on error
                const placeholder = this.createPlaceholder(id);
                this.loadedImages.set(id, placeholder);
                resolve(placeholder);
            };
            img.src = path;
        });
    }

    // Create colored placeholder when sprite doesn't exist
    createPlaceholder(id) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Generate color based on ID hash
        const hash = this.hashCode(id);
        const hue = hash % 360;

        // Draw colored square with border
        ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
        ctx.fillRect(0, 0, 64, 64);

        ctx.strokeStyle = `hsl(${hue}, 70%, 30%)`;
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, 64, 64);

        // Add initial letter if possible
        const letter = id.charAt(0).toUpperCase();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter, 32, 32);

        this.placeholders.set(id, canvas);
        return canvas;
    }

    // Hash function for consistent colors
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }

    // Get sprite or placeholder
    getSprite(id) {
        return this.loadedImages.get(id) || this.createPlaceholder(id);
    }

    // Preload all game sprites
    async preloadSprites() {
        const spritePaths = {
            // Player sprites
            'player_base': 'assets/player_base.png',
            'player_sword': 'assets/player_sword.png',
            'player_staff': 'assets/player_staff.png',

            // Enemy sprites
            'goblin': 'assets/goblin.png',
            'skeleton': 'assets/skeleton.png',
            'wolf': 'assets/wolf.png',
            'golem': 'assets/golem.png',
            'orc': 'assets/orc.png',
            'slime': 'assets/slime.png',

            // Boss sprites
            'goblin_king': 'assets/goblin_king.png',
            'lich': 'assets/lich.png',
            'alpha_wolf': 'assets/alpha_wolf.png',
            'orc_boss': 'assets/orc_boss.png',

            // Weapon sprites
            'rusty_dagger': 'assets/rusty_dagger.png',
            'iron_sword': 'assets/iron_sword.png',
            'echo_blade': 'assets/echo_blade.png',
            'void_sword': 'assets/void_sword.png',
            'solar_thread': 'assets/solar_thread.png',
            'living_weapon': 'assets/living_weapon.png',

            // Equipment sprites
            'leather_armor': 'assets/leather_armor.png',
            'iron_armor': 'assets/iron_armor.png',
            'ghost_boots': 'assets/ghost_boots.png',
            'iron_heart': 'assets/iron_heart.png',

            // Effect sprites
            'fire': 'assets/effect_fire.png',
            'poison': 'assets/effect_poison.png',
            'ice': 'assets/effect_ice.png',
            'lightning': 'assets/effect_lightning.png'
        };

        const promises = [];
        for (const [id, path] of Object.entries(spritePaths)) {
            promises.push(this.loadSprite(id, path));
        }

        await Promise.all(promises);
    }

    // Render entity with sprite
    renderEntity(ctx, entity, spriteId, x, y, width = 64, height = 64) {
        const sprite = this.getSprite(spriteId);

        try {
            ctx.drawImage(sprite, x - width / 2, y - height / 2, width, height);
        } catch (e) {
            // Fallback to colored circle
            ctx.fillStyle = '#ff00ff';
            ctx.beginPath();
            ctx.arc(x, y, width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Render player with equipment
    renderPlayerWithEquipment(ctx, player, x, y) {
        const baseSize = 64;

        // Render base player
        this.renderEntity(ctx, player, 'player_base', x, y, baseSize, baseSize);

        // Render weapon
        if (player.equipment && player.equipment.weapon) {
            const weaponSprite = player.equipment.weapon.id;
            const weaponOffset = { x: 20, y: 0 };
            this.renderEntity(ctx, player, weaponSprite,
                x + weaponOffset.x, y + weaponOffset.y, 48, 48);
        }

        // Render chest armor (behind player)
        if (player.equipment && player.equipment.chest) {
            const armorSprite = player.equipment.chest.id;
            this.renderEntity(ctx, player, armorSprite, x, y, baseSize, baseSize);
        }

        // Render helmet
        if (player.equipment && player.equipment.helmet) {
            const helmetSprite = player.equipment.helmet.id;
            this.renderEntity(ctx, player, helmetSprite, x, y - 10, 50, 50);
        }

        // Render boots (lower position)
        if (player.equipment && player.equipment.boots) {
            const bootsSprite = player.equipment.boots.id;
            this.renderEntity(ctx, player, bootsSprite, x, y + 20, 40, 30);
        }
    }

    // Render effect on entity
    renderEffect(ctx, effect, x, y) {
        if (!effect.visual) return;

        const size = 40;
        const alpha = effect.remainingTime / effect.duration;

        ctx.save();
        ctx.globalAlpha = Math.min(1, alpha);

        // Render effect icon
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Background circle
        ctx.fillStyle = effect.visual.color || '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y - 40, size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Icon
        ctx.fillText(effect.visual.icon || '✨', x, y - 40);

        ctx.restore();
    }

    // Render Living Weapon glow effect
    renderLivingWeaponGlow(ctx, weapon, x, y, state) {
        const glowColors = {
            dormant: '#666666',
            awakened: '#00ccff',
            ascended: '#ffdd00'
        };

        const color = glowColors[state] || glowColors.dormant;
        const time = Date.now() / 1000;
        const pulse = (Math.sin(time * 2) + 1) / 2;
        const glowRadius = 50 + pulse * 20;

        ctx.save();
        ctx.globalAlpha = 0.3 + pulse * 0.2;

        // Outer glow
        const gradient = ctx.createRadialGradient(x, y, 10, x, y, glowRadius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2);

        ctx.restore();
    }
}
