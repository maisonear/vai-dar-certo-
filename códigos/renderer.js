// renderer.js - Sistema de Renderização Multi-Bioma + Partículas Atmosféricas

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.canvas.width  = 1920;
        this.canvas.height = 1080;
        this.ctx.imageSmoothingEnabled = false;

        // Assets
        this.assets = {
            player:  new Image(),
            enemies: new Image(),
            icons:   new Image(),
            tileset: new Image()
        };
        this.assetsLoaded = 0;
        this.totalAssets  = 4;

        this.themeColors           = null;
        this.backgroundImages      = {};
        this.currentBackgroundImage = null;

        this.defaultTileColors = {
            floor1: '#1a1a2e', floor2: '#16161d',
            wall: '#2a2a3e', obstacle: '#1e1e30',
            wallBorder: 'rgba(139,92,246,0.3)',
            obstacleBorder: 'rgba(245,158,11,0.2)',
            gridLine: 'rgba(139,92,246,0.08)'
        };

        this.animTime = 0;

        // ===== SISTEMA DE PARTÍCULAS =====
        this.particles     = [];
        this.maxParticles  = 250;
        this._activeBiomeParticles = null; // 'snow' | 'ash' | 'dust' | null

        // Bioma ativo (para iluminação e partículas)
        this._currentActiveBiomeId = null;
        this._biomeBlend     = 0; // 0→1 para transição suave
        this._prevBiomeId    = null;

        this.loadAssets();
    }

    loadAssets() {
        this.assets.player.src  = '../entidades/player.png';
        this.assets.enemies.src = '../entidades/enemies.png';
        this.assets.icons.src   = '';
        this.assets.tileset.src = '../cenários/tileset.png';

        const onLoad  = (name) => () => {
            this.assetsLoaded++;
            console.log(`[Asset] Carregado: ${name} (${this.assetsLoaded}/${this.totalAssets})`);
        };
        const onError = (name) => () => {
            console.warn(`[Asset] Falha: ${name} — usando fallback canvas`);
        };

        this.assets.player.onload   = onLoad('player');
        this.assets.player.onerror  = onError('player');
        this.assets.enemies.onload  = onLoad('enemies');
        this.assets.enemies.onerror = onError('enemies');
        this.assets.icons.onload    = onLoad('icons');
        this.assets.icons.onerror   = onError('icons');
        this.assets.tileset.onload  = onLoad('tileset');
        this.assets.tileset.onerror = onError('tileset');
    }

    clear() {
        const bg = this.themeColors ? this.themeColors.bg : '#0f0f23';
        this.ctx.fillStyle = bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    loadBackgroundImage(src) {
        if (this.backgroundImages[src]) return this.backgroundImages[src];
        const img = new Image();
        img.src = src;
        this.backgroundImages[src] = img;
        return img;
    }

    darkenColor(hex, amount) {
        if (!hex || hex[0] !== '#') return '#111';
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const f = 1 - amount;
        return `rgb(${Math.floor(r*f)},${Math.floor(g*f)},${Math.floor(b*f)})`;
    }

    // ===== DRAW BACKGROUND =====
    drawBackground(game) {
        const camera = game.camera;
        const world  = game.world;

        if (game.stageSystem) {
            this.themeColors = game.stageSystem.getCurrentThemeColors();
            const stage = game.stageSystem.currentStage;
            if (stage && stage.backgroundImage) {
                this.currentBackgroundImage = this.loadBackgroundImage(stage.backgroundImage);
            } else {
                this.currentBackgroundImage = null;
            }
        } else {
            this.currentBackgroundImage = null;
        }

        // Imagem de fundo customizada (dungeon arte)
        if (this.currentBackgroundImage &&
            this.currentBackgroundImage.complete &&
            this.currentBackgroundImage.naturalWidth > 0) {
            this.ctx.drawImage(this.currentBackgroundImage, 0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'rgba(0,0,0,0.15)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }

        if (camera && world) {
            this.drawTilemapSystem(camera, world, game);
        } else {
            // Fallback: tabuleiro simples
            const ts = 64;
            for (let y = 0; y < this.canvas.height; y += ts) {
                for (let x = 0; x < this.canvas.width; x += ts) {
                    const d = ((x/ts) + (y/ts)) % 2 === 0;
                    this.ctx.fillStyle = d ? '#1a1a2e' : '#16161d';
                    this.ctx.fillRect(x, y, ts, ts);
                }
            }
        }
    }

    // ===== SISTEMA DE TILEMAP 3 CAMADAS =====
    drawTilemapSystem(camera, world, game) {
        const chunks = world.getVisibleChunks(camera.x, camera.y, this.canvas.width, this.canvas.height);
        const offX   = camera.getOffsetX();
        const offY   = camera.getOffsetY();
        const biome  = world.biomeData || {};
        const anim   = this.animTime;

        this.drawGroundLayer(chunks, world, camera, offX, offY, biome, anim);
        this.drawDecorLayer(chunks, world, camera, offX, offY, biome, anim);
    }

    // ===== CAMADA DE CHÃO — por bioma por tile =====
    drawGroundLayer(chunks, world, camera, offX, offY, globalBiome, animTime) {
        const ctx = this.ctx;
        const ts  = world.TILE_SIZE || 32;
        const tpc = world.TILES_PER_CHUNK || 16;

        for (const chunk of chunks) {
            const csx = chunk.worldX + offX;
            const csy = chunk.worldY + offY;
            if (!this._isChunkVisible(csx, csy, world.CHUNK_SIZE || 512)) continue;

            const groundLayer = chunk.ground;
            const biomeMap    = chunk.biomeMap; // pode ser null em chunks antigos
            if (!groundLayer) continue;

            for (let ty = 0; ty < tpc; ty++) {
                for (let tx = 0; tx < tpc; tx++) {
                    const tileType = groundLayer[ty][tx];
                    const sx = csx + tx * ts;
                    const sy = csy + ty * ts;
                    if (!this._isTileVisible(sx, sy, ts)) continue;

                    // Bioma do tile ou fallback global
                    const tileBiomeId = (biomeMap && biomeMap[ty]) ? biomeMap[ty][tx] : (globalBiome.id || 'overworld');
                    const checker     = ((chunk.cx * tpc + tx) + (chunk.cy * tpc + ty)) % 2 === 0;
                    const noise2      = (tx * 3 + ty * 7 + chunk.cx * 13 + chunk.cy * 19) % 100 / 100;

                    this._drawBiomeGroundTile(ctx, sx, sy, ts, tileBiomeId, tileType, animTime, tx, ty, checker, noise2);
                }
            }
        }
    }

    // Desenha um tile de chão com estilo específico do bioma
    _drawBiomeGroundTile(ctx, sx, sy, ts, biomeId, tileType, animTime, tx, ty, checker, noise2) {
        switch (biomeId) {
            case 'snow':    this._drawSnowGround(ctx, sx, sy, ts, tileType, animTime, tx, ty, checker, noise2); break;
            case 'forest':  this._drawForestGround(ctx, sx, sy, ts, tileType, animTime, tx, ty, checker, noise2); break;
            case 'desert':  this._drawDesertGround(ctx, sx, sy, ts, tileType, animTime, tx, ty, checker, noise2); break;
            case 'volcanic':this._drawVolcanicGround(ctx, sx, sy, ts, tileType, animTime, tx, ty, checker, noise2); break;
            default:        this._drawLegacyGround(ctx, sx, sy, ts, tileType, checker, biomeId); break;
        }
    }

    // ——— NEVE: gelo azul-claro com rachaduras e faíscas ———
    _drawSnowGround(ctx, sx, sy, ts, tileType, anim, tx, ty, checker, n2) {
        const base = checker ? '#bed8ea' : '#adc8dc';
        const alt  = tileType === 2 ? (checker ? '#cce2ee' : '#bcd2e0') : base;
        ctx.fillStyle = tileType === 2 ? alt : base;
        ctx.fillRect(sx, sy, ts, ts);

        // Linhas de rachadura no gelo
        if (n2 < 0.18) {
            ctx.strokeStyle = 'rgba(122,172,190,0.55)';
            ctx.lineWidth = 0.8;
            const angle = n2 * Math.PI * 4;
            const len   = ts * (0.3 + n2 * 0.5);
            ctx.beginPath();
            ctx.moveTo(sx + ts * 0.5, sy + ts * 0.5);
            ctx.lineTo(sx + ts * 0.5 + Math.cos(angle) * len, sy + ts * 0.5 + Math.sin(angle) * len);
            if (n2 < 0.08) {
                // Segunda rachadura
                ctx.moveTo(sx + ts * 0.5, sy + ts * 0.5);
                ctx.lineTo(sx + ts * 0.5 + Math.cos(angle + 1.8) * len * 0.5, sy + ts * 0.5 + Math.sin(angle + 1.8) * len * 0.5);
            }
            ctx.stroke();
        }

        // Sparkle/estrelinhas de gelo
        if (n2 > 0.88) {
            const s2 = Math.sin(anim * 2 + tx * 0.9 + ty * 1.1) * 0.5 + 0.5;
            ctx.fillStyle = `rgba(255,255,255,${s2 * 0.65})`;
            const px = sx + (n2 * 37) % ts;
            const py = sy + (n2 * 53) % ts;
            ctx.fillRect(px, py, 1.5, 1.5);
            ctx.fillRect(px + 2, py - 2, 1, 3);
            ctx.fillRect(px - 2, py, 3, 1);
        }

        // Grid sutil azul-gelo
        ctx.strokeStyle = 'rgba(180,220,240,0.12)';
        ctx.lineWidth = 0.4;
        ctx.strokeRect(sx, sy, ts, ts);
    }

    // ——— FLORESTA: terra marrom-escura com textura orgânica ———
    _drawForestGround(ctx, sx, sy, ts, tileType, anim, tx, ty, checker, n2) {
        const base = tileType === 2
            ? (checker ? '#192e0f' : '#13260b')
            : (checker ? '#2b190c' : '#21130a');
        ctx.fillStyle = base;
        ctx.fillRect(sx, sy, ts, ts);

        // Manchas de solo (variação de cor)
        if (n2 < 0.30) {
            ctx.fillStyle = 'rgba(66,48,31,0.35)';
            const sp = n2 * ts;
            ctx.beginPath();
            ctx.ellipse(sx + sp * 0.6, sy + sp * 0.7, ts * 0.18, ts * 0.13, n2 * 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Pegadas de raizinha fina
        if (n2 > 0.76 && n2 < 0.82) {
            ctx.strokeStyle = 'rgba(58,40,20,0.50)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sx + ts * 0.1, sy + ts * 0.8);
            ctx.quadraticCurveTo(sx + ts * 0.4, sy + ts * 0.3, sx + ts * 0.9, sy + ts * 0.6);
            ctx.stroke();
        }

        // Musgo (GRASS tiles ficam mais verdes)
        if (tileType === 2) {
            ctx.fillStyle = 'rgba(57,80,32,0.28)';
            ctx.fillRect(sx + 2, sy + 2, ts - 4, ts - 4);
        }

        ctx.strokeStyle = 'rgba(35,22,10,0.12)';
        ctx.lineWidth = 0.4;
        ctx.strokeRect(sx, sy, ts, ts);
    }

    // ——— DESERTO: areia dourada com salpicos e textura ———
    _drawDesertGround(ctx, sx, sy, ts, tileType, anim, tx, ty, checker, n2) {
        const base = tileType === 2
            ? (checker ? '#b89250' : '#a88040')
            : (checker ? '#c4a05c' : '#b09048');
        ctx.fillStyle = base;
        ctx.fillRect(sx, sy, ts, ts);

        // Salpicos de areia escura (pedras minúsculas)
        const dotCount = Math.floor(n2 * 6);
        ctx.fillStyle = 'rgba(120,90,50,0.38)';
        for (let i = 0; i < dotCount; i++) {
            const dx = ((n2 * 97 + i * 31) % ts);
            const dy = ((n2 * 43 + i * 67) % ts);
            const dr = 1 + (i % 2);
            ctx.beginPath();
            ctx.arc(sx + dx, sy + dy, dr, 0, Math.PI * 2);
            ctx.fill();
        }

        // Highlight de luz solar (topo levemente mais claro)
        ctx.fillStyle = 'rgba(255,240,180,0.07)';
        ctx.fillRect(sx, sy, ts, Math.ceil(ts * 0.25));

        // Padrão de ondulação de areia (dunas)
        if (n2 > 0.55) {
            ctx.strokeStyle = 'rgba(140,100,50,0.20)';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(sx, sy + ts * 0.6);
            ctx.quadraticCurveTo(sx + ts * 0.5, sy + ts * 0.5, sx + ts, sy + ts * 0.7);
            ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(150,105,50,0.10)';
        ctx.lineWidth = 0.4;
        ctx.strokeRect(sx, sy, ts, ts);
    }

    // ——— VULCÂNICO: cinzas escuras com veias de lava ———
    _drawVolcanicGround(ctx, sx, sy, ts, tileType, anim, tx, ty, checker, n2) {
        const base = tileType === 2
            ? (checker ? '#1e1610' : '#171208')
            : (checker ? '#1c1510' : '#150f0a');
        ctx.fillStyle = base;
        ctx.fillRect(sx, sy, ts, ts);

        // Rachadura de lava brilhante
        if (n2 < 0.12) {
            const glow  = Math.sin(anim * 2 + tx * 0.8 + ty * 1.2) * 0.4 + 0.6;
            const alpha = glow * 0.75;
            ctx.strokeStyle = `rgba(255,${Math.floor(60 + glow * 50)},0,${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.shadowBlur  = 6;
            ctx.shadowColor = 'rgba(255,60,0,0.5)';
            ctx.beginPath();
            // Rachadura irregular
            ctx.moveTo(sx + ts * 0.2, sy + ts * 0.8);
            ctx.lineTo(sx + ts * 0.5, sy + ts * 0.4);
            ctx.lineTo(sx + ts * 0.8, sy + ts * 0.6);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Pó cinza de cinzas
        if (n2 > 0.62 && n2 < 0.72) {
            ctx.fillStyle = 'rgba(120,110,100,0.22)';
            ctx.beginPath();
            ctx.ellipse(sx + ts * 0.5 + (n2 - 0.67) * ts * 4,
                        sy + ts * 0.5 + (n2 - 0.67) * ts * 2,
                        ts * 0.25, ts * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Grade sutil carvão
        ctx.strokeStyle = 'rgba(40,28,14,0.15)';
        ctx.lineWidth = 0.4;
        ctx.strokeRect(sx, sy, ts, ts);
    }

    // ——— LEGADO (dungeons) ———
    _drawLegacyGround(ctx, sx, sy, ts, tileType, checker, biomeId) {
        const biome  = (typeof BIOMES !== 'undefined' && BIOMES[biomeId]) ? BIOMES[biomeId] : {};
        const colors = biome.tileColors || {};
        const FLOOR = 0, GRASS = 2;

        if (tileType === GRASS) {
            const c = colors[GRASS];
            const baseColor = c ? (checker ? c.base : c.alt) : (checker ? '#1f4a1f' : '#1a3d1a');
            ctx.fillStyle = baseColor;
            ctx.fillRect(sx, sy, ts, ts);
            if (c && c.detail) {
                ctx.fillStyle = c.detail + '40';
                ctx.fillRect(sx + 2, sy + 2, 4, 4);
                ctx.fillRect(sx + ts - 6, sy + ts - 6, 4, 4);
            }
        } else {
            const c = colors[FLOOR];
            const baseColor = c ? (checker ? c.base : c.alt) : (checker ? '#1a1a2e' : '#16161d');
            ctx.fillStyle = baseColor;
            ctx.fillRect(sx, sy, ts, ts);
            const bc = c ? c.border : '#2a2a5a';
            ctx.strokeStyle = bc + '18';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(sx, sy, ts, ts);
        }
    }

    // ===== CAMADA DE DECOR — tiles sólidos =====
    drawDecorLayer(chunks, world, camera, offX, offY, biome, animTime) {
        const ctx = this.ctx;
        const ts  = world.TILE_SIZE || 32;
        const tpc = world.TILES_PER_CHUNK || 16;

        const WALL = 1, ROCK = 3, WATER = 4, SPECIAL = 5;

        for (const chunk of chunks) {
            const csx = chunk.worldX + offX;
            const csy = chunk.worldY + offY;
            if (!this._isChunkVisible(csx, csy, world.CHUNK_SIZE || 512)) continue;

            const decorLayer = chunk.decor;
            const biomeMap   = chunk.biomeMap;
            if (!decorLayer) continue;

            for (let ty = 0; ty < tpc; ty++) {
                for (let tx = 0; tx < tpc; tx++) {
                    const tileType = decorLayer[ty][tx];
                    if (tileType < 0) continue;
                    const sx = csx + tx * ts;
                    const sy = csy + ty * ts;
                    if (!this._isTileVisible(sx, sy, ts)) continue;

                    const checker    = ((chunk.cx * tpc + tx) + (chunk.cy * tpc + ty)) % 2 === 0;
                    const tileBiomeId = (biomeMap && biomeMap[ty]) ? biomeMap[ty][tx] : (biome.id || 'overworld');
                    const bData       = (typeof BIOMES !== 'undefined' && BIOMES[tileBiomeId]) ? BIOMES[tileBiomeId] : biome;
                    const colors      = bData.tileColors || {};

                    if (tileType === WALL) {
                        this._drawWallTile(ctx, sx, sy, ts, colors[WALL], checker, tileBiomeId, animTime, tx, ty);
                    } else if (tileType === ROCK) {
                        this._drawRockTile(ctx, sx, sy, ts, colors[ROCK], checker, tileBiomeId);
                    } else if (tileType === WATER) {
                        this._drawWaterTile(ctx, sx, sy, ts, colors[WATER], checker, animTime, tx, ty, tileBiomeId);
                    } else if (tileType === SPECIAL) {
                        this._drawSpecialTile(ctx, sx, sy, ts, colors[SPECIAL], animTime, tx, ty, tileBiomeId);
                    }
                }
            }
        }
    }

    // Objetos de mundo ABAIXO do player
    drawWorldObjectsBelow(world, camera, game) {
        const ctx  = this.ctx;
        const offX = camera.getOffsetX();
        const offY = camera.getOffsetY();
        const objs = world.getVisibleObjects(camera.x, camera.y, this.canvas.width, this.canvas.height);
        const anim = this.animTime;
        const sorted = objs.slice().sort((a, b) => a.y - b.y);
        for (const obj of sorted) {
            this._drawWorldObjectBase(ctx, obj, obj.x + offX, obj.y + offY, anim);
        }
    }

    // Topos de objetos ACIMA do player
    drawWorldObjectsAbove(world, camera, game) {
        const ctx  = this.ctx;
        const offX = camera.getOffsetX();
        const offY = camera.getOffsetY();
        const objs = world.getVisibleObjects(camera.x, camera.y, this.canvas.width, this.canvas.height);
        const anim = this.animTime;
        const sorted = objs.slice().sort((a, b) => a.y - b.y);
        for (const obj of sorted) {
            this._drawWorldObjectTop(ctx, obj, obj.x + offX, obj.y + offY, anim);
        }
    }

    // Efeitos atmosféricos (névoa, iluminação, partículas, vinheta)
    drawEffectLayer(world, camera, game) {
        const ctx  = this.ctx;
        const anim = this.animTime;
        const W    = this.canvas.width;
        const H    = this.canvas.height;

        // Detectar bioma atual baseado na posição do jogador
        let activeBiome = world.biomeData;
        if (game.player && world.getBiomeDataAt && !world.isDungeon) {
            activeBiome = world.getBiomeDataAt(game.player.x, game.player.y);
        }
        const biomeId = activeBiome ? activeBiome.id : 'overworld';
        this._currentActiveBiomeId = biomeId;

        // Névoa
        if (activeBiome && activeBiome.fogColor) {
            this._drawFogEffect(ctx, activeBiome.fogColor, anim, W, H);
        }

        // Overlay de escuridão para masmorras
        if (biomeId === 'cave') {
            ctx.fillStyle = 'rgba(0,0,0,0.30)';
            ctx.fillRect(0, 0, W, H);
        }

        // Overlay de calor para deserto (saturação quente)
        if (biomeId === 'desert') {
            const heatPulse = Math.sin(anim * 0.5) * 0.02;
            ctx.fillStyle = `rgba(200,120,30,${0.03 + heatPulse})`;
            ctx.fillRect(0, 0, W, H);
        }

        // Overlay frio para neve
        if (biomeId === 'snow') {
            ctx.fillStyle = 'rgba(180,220,255,0.03)';
            ctx.fillRect(0, 0, W, H);
        }

        // Overlay lava para vulcânico (pulsação)
        if (biomeId === 'volcanic') {
            const lavaPulse = Math.sin(anim * 0.8) * 0.025;
            ctx.fillStyle = `rgba(100,20,0,${0.05 + lavaPulse})`;
            ctx.fillRect(0, 0, W, H);
        }

        // Luzes de tochas, cristais, lava vents
        const offX   = camera.getOffsetX();
        const offY   = camera.getOffsetY();
        const lights = world.getVisibleLights(camera.x, camera.y, W, H);
        for (const light of lights) {
            const lx    = light.x + offX;
            const ly    = light.y + offY;
            const r     = light.lightRadius || 80;
            const color = light.lightColor  || 'rgba(255,180,50,0.18)';
            const pulse = 1 + Math.sin(anim * 2 + light.animTimer) * 0.10;
            const grad  = ctx.createRadialGradient(lx, ly, 0, lx, ly, r * pulse);
            grad.addColorStop(0, color);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(lx, ly, r * pulse, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }

        // === PARTÍCULAS ATMOSFÉRICAS ===
        const particleType = activeBiome ? activeBiome.particles : null;
        this._updateAndDrawParticles(ctx, game.deltaTime || 0.016, particleType, W, H, anim);

        // Vinheta (borda escura)
        if (activeBiome && activeBiome.vignette) {
            this._drawVignette(ctx, activeBiome.vignette, W, H);
        }
    }

    // ===== SISTEMA DE PARTÍCULAS =====
    _updateAndDrawParticles(ctx, dt, particleType, W, H, anim) {
        // Mudar tipo de partícula suavemente
        if (this._activeBiomeParticles !== particleType) {
            this._activeBiomeParticles = particleType;
            // Limpar partículas do bioma anterior
            this.particles = this.particles.filter(p => p.type === particleType);
        }

        // Spawnar novas partículas
        if (particleType) {
            const spawnRate = particleType === 'snow' ? 3 : (particleType === 'ash' ? 2 : 1);
            for (let i = 0; i < spawnRate; i++) {
                if (this.particles.length < this.maxParticles) {
                    this.particles.push(this._spawnParticle(particleType, W, H));
                }
            }
        }

        // Atualizar e desenhar
        this.particles = this.particles.filter(p => p.life > 0);
        for (const p of this.particles) {
            p.x    += p.vx * dt * 60;
            p.y    += p.vy * dt * 60;
            p.life -= dt;
            p.alpha = Math.min(1, p.life / p.maxLife * 1.5);

            if (p.type === 'snow') {
                // Leve balanço
                p.vx += Math.sin(anim * 2 + p.x * 0.01) * 0.02;
                ctx.fillStyle = `rgba(220,240,255,${p.alpha * 0.75})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                // Floco de neve (cruz) para partículas maiores
                if (p.size > 2) {
                    ctx.strokeStyle = `rgba(200,230,255,${p.alpha * 0.60})`;
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(p.x - p.size, p.y); ctx.lineTo(p.x + p.size, p.y);
                    ctx.moveTo(p.x, p.y - p.size); ctx.lineTo(p.x, p.y + p.size);
                    ctx.stroke();
                }
            } else if (p.type === 'ash') {
                // Cinzas sobem e derivam
                p.vy -= 0.015;
                p.vx += (Math.random() - 0.5) * 0.08;
                const gray = Math.floor(80 + p.alpha * 60);
                ctx.fillStyle = `rgba(${gray},${gray-10},${gray-20},${p.alpha * 0.55})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'dust') {
                // Poeira deriva na horizontal
                ctx.fillStyle = `rgba(210,180,120,${p.alpha * 0.35})`;
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, p.size * 1.5, p.size * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    _spawnParticle(type, W, H) {
        if (type === 'snow') {
            return {
                type, x: Math.random() * W, y: -10,
                vx: (Math.random() - 0.5) * 0.5,
                vy: 0.5 + Math.random() * 0.8,
                size: 1 + Math.random() * 2.5,
                life: 8 + Math.random() * 6, maxLife: 14, alpha: 1
            };
        } else if (type === 'ash') {
            return {
                type, x: Math.random() * W, y: H + 10,
                vx: (Math.random() - 0.5) * 0.6,
                vy: -(0.3 + Math.random() * 0.6),
                size: 1 + Math.random() * 1.8,
                life: 10 + Math.random() * 8, maxLife: 18, alpha: 1
            };
        } else { // dust
            return {
                type, x: -20, y: H * 0.3 + Math.random() * H * 0.5,
                vx: 0.8 + Math.random() * 1.2,
                vy: (Math.random() - 0.5) * 0.3,
                size: 2 + Math.random() * 4,
                life: 6 + Math.random() * 5, maxLife: 11, alpha: 1
            };
        }
    }

    // ===== HELPERS DE TILES =====

    _drawWallTile(ctx, sx, sy, ts, c, checker, biomeId, animTime, tx, ty) {
        let base   = c ? (checker ? c.base : c.alt) : '#2a2a3e';
        let border = c ? c.border : '#6b6b4a';
        let top    = c ? c.top    : '#8b8b5a';

        // Para neve: paredes são pedras cobertas de neve
        if (biomeId === 'snow') {
            ctx.fillStyle = base;
            ctx.fillRect(sx, sy, ts, ts);
            ctx.fillStyle = '#d8eef6';
            ctx.fillRect(sx, sy, ts, Math.ceil(ts * 0.35)); // neve no topo
            ctx.strokeStyle = (border || '#8ab2ca') + '55';
            ctx.lineWidth = 1;
            ctx.strokeRect(sx + 0.5, sy + 0.5, ts - 1, ts - 1);
            return;
        }

        ctx.fillStyle = base;
        ctx.fillRect(sx, sy, ts, ts);
        ctx.fillStyle = top || border;
        ctx.fillRect(sx, sy, ts, Math.max(3, ts * 0.10));
        ctx.strokeStyle = border + '66';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sx + 0.75, sy + 0.75, ts - 1.5, ts - 1.5);
        ctx.fillStyle = 'rgba(0,0,0,0.20)';
        ctx.fillRect(sx + ts / 2 - 1, sy + 4, 1, ts - 8);
        ctx.fillRect(sx + 4, sy + ts / 2 - 1, ts - 8, 1);
    }

    _drawRockTile(ctx, sx, sy, ts, c, checker, biomeId) {
        let base   = c ? (checker ? c.base : c.alt) : '#4a4a4a';
        let border = c ? c.border : '#6a6a6a';
        let top    = c ? c.top    : '#7a7a7a';

        ctx.fillStyle = base;
        ctx.fillRect(sx, sy, ts, ts);

        const pad = ts * 0.10;
        ctx.fillStyle = top || border;
        ctx.beginPath();
        ctx.roundRect(sx + pad, sy + pad, ts - pad * 2, ts - pad * 2, ts * 0.22);
        ctx.fill();

        // Camada de neve no topo para bioma neve
        if (biomeId === 'snow') {
            ctx.fillStyle = 'rgba(210,235,250,0.75)';
            ctx.beginPath();
            ctx.ellipse(sx + ts * 0.5, sy + pad + 2, ts * 0.32, ts * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = 'rgba(255,255,255,0.09)';
        ctx.beginPath();
        ctx.ellipse(sx + ts * 0.35, sy + ts * 0.35, ts * 0.18, ts * 0.12, -0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = border + '55';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(sx + pad, sy + pad, ts - pad * 2, ts - pad * 2, ts * 0.22);
        ctx.stroke();
    }

    _drawWaterTile(ctx, sx, sy, ts, c, checker, animTime, tx, ty, biomeId) {
        const base    = c ? c.base    : '#1a3a5a';
        const alt     = c ? c.alt     : '#142e4a';
        const shimmer = c ? c.shimmer : '#4a9ad0';

        // Lava (vulcânico) vs água normal
        const isLava = (biomeId === 'volcanic');

        ctx.fillStyle = checker ? base : alt;
        ctx.fillRect(sx, sy, ts, ts);

        const wave  = Math.sin(animTime * 2 + tx * 0.7 + ty * 0.5) * 0.5 + 0.5;
        const sAlpha = wave * (isLava ? 0.55 : 0.30);
        ctx.fillStyle = shimmer + Math.floor(sAlpha * 255).toString(16).padStart(2, '0');
        const ww = ts * 0.60;
        const wh = ts * 0.15;
        const wx = sx + ts * 0.2 + Math.sin(animTime + tx) * ts * 0.10;
        const wy = sy + ts * 0.4 + Math.cos(animTime + ty) * ts * 0.10;
        ctx.beginPath();
        ctx.ellipse(wx + ww / 2, wy, ww / 2, wh / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glow de lava
        if (isLava) {
            ctx.shadowBlur  = 8;
            ctx.shadowColor = 'rgba(255,80,0,0.6)';
            ctx.fillStyle   = `rgba(255,${Math.floor(60 + wave * 40)},0,0.3)`;
            ctx.fillRect(sx, sy, ts, ts);
            ctx.shadowBlur  = 0;
        }
    }

    _drawSpecialTile(ctx, sx, sy, ts, c, animTime, tx, ty, biomeId) {
        const base   = c ? c.base   : '#2a1a3a';
        const border = c ? c.border : '#6a3a8a';
        const glow   = c ? c.glow   : '#8b5cf6';

        ctx.fillStyle = base;
        ctx.fillRect(sx, sy, ts, ts);

        const pulse     = Math.sin(animTime * 1.5 + tx * 0.8 + ty * 0.9) * 0.5 + 0.5;
        const glowAlpha = Math.floor((0.3 + pulse * 0.4) * 255).toString(16).padStart(2, '0');
        ctx.fillStyle = glow + glowAlpha;
        ctx.shadowBlur  = biomeId === 'volcanic' ? 12 : 6;
        ctx.shadowColor = glow;

        const cx2 = sx + ts / 2;
        const cy2 = sy + ts / 2;
        const r   = ts * 0.25 * (1 + pulse * 0.12);
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            if (i === 0) ctx.moveTo(cx2 + r * Math.cos(angle), cy2 + r * Math.sin(angle));
            else         ctx.lineTo(cx2 + r * Math.cos(angle), cy2 + r * Math.sin(angle));
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = border + 'aa';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 1, sy + 1, ts - 2, ts - 2);
    }

    // ===== OBJETOS DE MUNDO — BASE =====
    _drawWorldObjectBase(ctx, obj, sx, sy, anim) {
        switch (obj.type) {

            // ——— LEGADO ———
            case 'tree': {
                ctx.fillStyle = '#5d3a1a';
                ctx.fillRect(sx - 4, sy - 4, 8, 16);
                break;
            }
            case 'gravestone': {
                ctx.fillStyle = '#555566';
                ctx.beginPath();
                ctx.roundRect(sx - 10, sy - 14, 20, 22, 5);
                ctx.fill();
                ctx.fillStyle = '#888899';
                ctx.fillRect(sx - 8, sy - 12, 16, 3);
                ctx.fillStyle = 'rgba(255,255,255,0.15)';
                ctx.fillRect(sx - 3, sy - 8, 6, 1);
                ctx.fillRect(sx - 1, sy - 10, 2, 5);
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.ellipse(sx, sy + 8, 12, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'torch': {
                ctx.fillStyle = '#6b4a2a';
                ctx.fillRect(sx - 2, sy - 12, 4, 16);
                const flicker = Math.sin(anim * 5 + obj.animTimer) * 0.3 + 0.85;
                ctx.fillStyle = `rgba(255,${Math.floor(120 + flicker * 60)},20,0.9)`;
                ctx.beginPath();
                ctx.ellipse(sx, sy - 14, 5 * flicker, 7 * flicker, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,240,100,0.8)';
                ctx.beginPath();
                ctx.ellipse(sx, sy - 14, 3 * flicker, 4 * flicker, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'chest': {
                ctx.fillStyle = obj.opened ? '#4a2e0a' : '#7a4e1a';
                ctx.beginPath();
                ctx.roundRect(sx - 13, sy - 8, 26, 16, 3);
                ctx.fill();
                ctx.fillStyle = obj.opened ? '#2a1a06' : '#5a3a10';
                ctx.fillRect(sx - 12, sy - 8, 24, 6);
                ctx.fillStyle = obj.opened ? '#333' : '#d4af37';
                ctx.beginPath();
                ctx.arc(sx, sy - 1, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.ellipse(sx, sy + 8, 14, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'crystal': {
                const cp = Math.sin(anim * 2 + obj.animTimer) * 0.15 + 1;
                ctx.save();
                ctx.translate(sx, sy);
                ctx.scale(cp, cp);
                ctx.fillStyle = 'rgba(150,100,255,0.85)';
                ctx.beginPath();
                ctx.moveTo(0, -14);
                ctx.lineTo(7, -4);
                ctx.lineTo(5, 8);
                ctx.lineTo(-5, 8);
                ctx.lineTo(-7, -4);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = 'rgba(200,160,255,0.7)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath();
                ctx.moveTo(-2, -12); ctx.lineTo(3, -5); ctx.lineTo(0, -5);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                break;
            }
            case 'altar': {
                ctx.fillStyle = '#3a2a4a';
                ctx.beginPath();
                ctx.roundRect(sx - 16, sy - 8, 32, 16, 4);
                ctx.fill();
                ctx.fillStyle = '#5a3a7a';
                ctx.fillRect(sx - 14, sy - 12, 28, 6);
                const rp = Math.sin(anim * 1.2 + obj.animTimer);
                ctx.fillStyle = `rgba(180,120,255,${0.4 + rp * 0.2})`;
                ctx.fillRect(sx - 8, sy - 10, 4, 2);
                ctx.fillRect(sx + 2, sy - 10, 4, 2);
                ctx.fillRect(sx - 3, sy - 10, 4, 2);
                ctx.fillStyle = 'rgba(0,0,0,0.35)';
                ctx.beginPath();
                ctx.ellipse(sx, sy + 8, 18, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'mushroom': {
                ctx.fillStyle = '#6b3a2a';
                ctx.fillRect(sx - 2, sy, 4, 8);
                ctx.fillStyle = '#c03030';
                ctx.beginPath();
                ctx.arc(sx, sy - 2, 10, Math.PI, 0);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.7)';
                ctx.beginPath();
                ctx.arc(sx - 3, sy - 5, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.arc(sx + 3, sy - 3, 1.5, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'fence': {
                ctx.fillStyle = '#7a5a2a';
                ctx.fillRect(sx - 14, sy - 2, 4, 12);
                ctx.fillRect(sx + 10, sy - 2, 4, 12);
                ctx.fillRect(sx - 14, sy - 2, 28, 3);
                ctx.fillRect(sx - 14, sy + 5, 28, 3);
                break;
            }
            case 'ruins': {
                ctx.fillStyle = '#4a4a5a';
                ctx.fillRect(sx - 16, sy - 4, 10, 20);
                ctx.fillStyle = '#3a3a4a';
                ctx.fillRect(sx + 4, sy - 8, 12, 24);
                ctx.fillStyle = '#5a5a6a';
                ctx.fillRect(sx - 16, sy - 4, 8, 3);
                ctx.fillRect(sx + 4, sy - 8, 10, 3);
                ctx.fillStyle = 'rgba(0,0,0,0.3)';
                ctx.beginPath();
                ctx.ellipse(sx, sy + 14, 16, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'skull': {
                ctx.fillStyle = '#d0c8b0';
                ctx.beginPath();
                ctx.arc(sx, sy - 5, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(sx - 5, sy - 2, 10, 5);
                ctx.fillStyle = '#1a1a2a';
                ctx.beginPath();
                ctx.arc(sx - 3, sy - 5, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.arc(sx + 3, sy - 5, 2, 0, Math.PI * 2);
                ctx.fill();
                break;
            }

            // ——— NEVE ———
            case 'snow_pine': {
                // Tronco fino escuro
                ctx.fillStyle = '#3a2a1a';
                ctx.fillRect(sx - 3, sy - 6, 6, 18);
                // Sombra base
                ctx.fillStyle = 'rgba(0,0,0,0.25)';
                ctx.beginPath();
                ctx.ellipse(sx, sy + 12, 10, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'ice_shard': {
                const gp = Math.sin(anim * 1.8 + obj.animTimer) * 0.12 + 1;
                ctx.save();
                ctx.translate(sx, sy);
                ctx.scale(gp, gp);
                // Cristal de gelo (azul-claro)
                ctx.fillStyle = 'rgba(160,220,250,0.80)';
                ctx.beginPath();
                ctx.moveTo(0, -14); ctx.lineTo(5, -4); ctx.lineTo(4, 8);
                ctx.lineTo(-4, 8); ctx.lineTo(-5, -4);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = 'rgba(200,240,255,0.8)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.fillStyle = 'rgba(255,255,255,0.4)';
                ctx.beginPath();
                ctx.moveTo(-1, -12); ctx.lineTo(2, -6); ctx.lineTo(0, -6);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                break;
            }
            case 'snow_rock': {
                // Rocha coberta de neve
                ctx.fillStyle = '#7a8890';
                ctx.beginPath();
                ctx.roundRect(sx - 11, sy - 8, 22, 16, 7);
                ctx.fill();
                // Neve em cima
                ctx.fillStyle = '#ddeef8';
                ctx.beginPath();
                ctx.ellipse(sx, sy - 6, 11, 6, 0, 0, Math.PI * 2);
                ctx.fill();
                // Highlight
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath();
                ctx.ellipse(sx - 3, sy - 3, 5, 3, -0.5, 0, Math.PI * 2);
                ctx.fill();
                break;
            }

            // ——— FLORESTA ———
            case 'dead_tree': {
                // Tronco
                ctx.fillStyle = '#3d2810';
                ctx.fillRect(sx - 5, sy - 10, 10, 24);
                // Raízes laterais
                ctx.strokeStyle = '#3d2810';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(sx - 5, sy + 8);
                ctx.quadraticCurveTo(sx - 18, sy + 14, sx - 22, sy + 20);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(sx + 5, sy + 8);
                ctx.quadraticCurveTo(sx + 18, sy + 14, sx + 22, sy + 20);
                ctx.stroke();
                ctx.fillStyle = 'rgba(0,0,0,0.30)';
                ctx.beginPath();
                ctx.ellipse(sx, sy + 14, 12, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'root': {
                // Raízes rasteiras no chão
                ctx.strokeStyle = 'rgba(62,40,18,0.72)';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(sx - 14, sy);
                ctx.quadraticCurveTo(sx, sy - 6, sx + 14, sy + 4);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(sx - 8, sy + 4);
                ctx.quadraticCurveTo(sx + 2, sy - 2, sx + 10, sy - 8);
                ctx.stroke();
                ctx.lineCap = 'butt';
                break;
            }
            case 'forest_bush': {
                const bp = Math.sin(anim * 0.7 + obj.animTimer) * 0.05 + 1;
                ctx.save();
                ctx.translate(sx, sy);
                // Base
                ctx.fillStyle = '#1a2e0c';
                ctx.beginPath();
                ctx.arc(0, 0, 12 * bp, 0, Math.PI * 2);
                ctx.fill();
                // Detalhe
                ctx.fillStyle = '#2a4a18';
                ctx.beginPath();
                ctx.arc(-4, -4, 8 * bp, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(4, -3, 7 * bp, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#3a6020';
                ctx.beginPath();
                ctx.arc(-1, -6, 5 * bp, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                break;
            }

            // ——— DESERTO ———
            case 'cactus': {
                // Tronco central
                ctx.fillStyle = '#3a7030';
                ctx.beginPath();
                ctx.roundRect(sx - 4, sy - 18, 8, 28, 3);
                ctx.fill();
                // Braços
                ctx.fillStyle = '#3a7030';
                ctx.beginPath();
                ctx.roundRect(sx - 14, sy - 8, 10, 5, 2);
                ctx.fill();
                ctx.beginPath();
                ctx.roundRect(sx - 14, sy - 16, 5, 10, 2);
                ctx.fill();
                ctx.beginPath();
                ctx.roundRect(sx + 4, sy - 6, 10, 5, 2);
                ctx.fill();
                ctx.beginPath();
                ctx.roundRect(sx + 9, sy - 14, 5, 10, 2);
                ctx.fill();
                // Espinhos (tracejados brancos)
                ctx.strokeStyle = 'rgba(220,200,150,0.6)';
                ctx.lineWidth = 0.8;
                for (let i = 0; i < 5; i++) {
                    const cy2 = sy - 16 + i * 6;
                    ctx.beginPath();
                    ctx.moveTo(sx - 4, cy2); ctx.lineTo(sx - 7, cy2 - 2);
                    ctx.moveTo(sx + 4, cy2); ctx.lineTo(sx + 7, cy2 - 2);
                    ctx.stroke();
                }
                // Sombra
                ctx.fillStyle = 'rgba(0,0,0,0.22)';
                ctx.beginPath();
                ctx.ellipse(sx + 6, sy + 10, 10, 4, 0.4, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'desert_shrub': {
                // Arbusto do deserto (planta suculenta verde)
                ctx.fillStyle = '#4a8830';
                ctx.beginPath();
                ctx.arc(sx, sy - 2, 9, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#5aa040';
                ctx.beginPath();
                ctx.arc(sx - 5, sy - 5, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(sx + 5, sy - 4, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#72bc50';
                ctx.beginPath();
                ctx.arc(sx, sy - 7, 5, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'desert_rock': {
                // Rocha do deserto (marrom terrosa)
                ctx.fillStyle = '#806040';
                ctx.beginPath();
                ctx.roundRect(sx - 10, sy - 7, 20, 14, 6);
                ctx.fill();
                ctx.fillStyle = '#a08058';
                ctx.beginPath();
                ctx.ellipse(sx - 1, sy - 2, 8, 5, -0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,220,140,0.15)';
                ctx.beginPath();
                ctx.ellipse(sx - 3, sy - 4, 5, 3, -0.5, 0, Math.PI * 2);
                ctx.fill();
                break;
            }

            // ——— VULCÂNICO ———
            case 'burned_tree': {
                // Tronco carbonizado — preto e fino
                ctx.fillStyle = '#181010';
                ctx.fillRect(sx - 4, sy - 12, 8, 26);
                // Galhos quebrados para cima
                ctx.strokeStyle = '#201618';
                ctx.lineWidth = 2.5;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(sx - 1, sy - 10);
                ctx.lineTo(sx - 14, sy - 22);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(sx + 1, sy - 8);
                ctx.lineTo(sx + 16, sy - 20);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(sx - 1, sy - 4);
                ctx.lineTo(sx - 10, sy - 10);
                ctx.stroke();
                ctx.lineCap = 'butt';
                // Brasa incandescente no topo
                const ep = Math.sin(anim * 3 + obj.animTimer) * 0.5 + 0.5;
                ctx.fillStyle = `rgba(255,${Math.floor(40 + ep * 50)},0,${ep * 0.6})`;
                ctx.beginPath();
                ctx.arc(sx - 14, sy - 22, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(sx + 16, sy - 20, 1.5, 0, Math.PI * 2);
                ctx.fill();
                // Sombra
                ctx.fillStyle = 'rgba(0,0,0,0.30)';
                ctx.beginPath();
                ctx.ellipse(sx, sy + 14, 9, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'lava_vent': {
                // Rachadura no chão com lava
                const lp = Math.sin(anim * 3 + obj.animTimer) * 0.4 + 0.6;
                ctx.fillStyle = '#1a0a00';
                ctx.beginPath();
                ctx.ellipse(sx, sy, 10, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur  = 12;
                ctx.shadowColor = 'rgba(255,70,0,0.8)';
                ctx.fillStyle = `rgba(255,${Math.floor(50 + lp * 60)},0,${lp * 0.9})`;
                ctx.beginPath();
                ctx.ellipse(sx, sy, 6, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                break;
            }
            case 'ash_rock': {
                // Rocha de cinzas vulcânicas
                ctx.fillStyle = '#302820';
                ctx.beginPath();
                ctx.roundRect(sx - 10, sy - 6, 20, 12, 5);
                ctx.fill();
                ctx.fillStyle = '#484038';
                ctx.beginPath();
                ctx.ellipse(sx - 1, sy - 1, 7, 4, -0.2, 0, Math.PI * 2);
                ctx.fill();
                // Cinza no topo
                ctx.fillStyle = 'rgba(150,140,130,0.4)';
                ctx.beginPath();
                ctx.ellipse(sx, sy - 5, 8, 3, 0, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'ember_clump': {
                // Brasa no chão
                const ep2 = Math.sin(anim * 4 + obj.animTimer) * 0.5 + 0.5;
                ctx.fillStyle = '#1a0800';
                ctx.beginPath();
                ctx.ellipse(sx, sy, 6, 4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur  = 8;
                ctx.shadowColor = `rgba(255,80,0,${ep2 * 0.7})`;
                ctx.fillStyle = `rgba(255,${Math.floor(60 + ep2 * 50)},0,${ep2 * 0.7})`;
                ctx.beginPath();
                ctx.arc(sx - 2, sy, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(sx + 2, sy - 1, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                break;
            }

            default: {
                ctx.fillStyle = '#888';
                ctx.beginPath();
                ctx.arc(sx, sy, 8, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
        }
    }

    // Topos de objetos ACIMA do player (copa de árvores)
    _drawWorldObjectTop(ctx, obj, sx, sy, anim) {
        switch (obj.type) {
            case 'tree': {
                const sway = Math.sin(anim * 0.8 + obj.animTimer) * 1.5;
                ctx.save();
                ctx.shadowBlur  = 8;
                ctx.shadowColor = 'rgba(0,60,0,0.5)';
                ctx.fillStyle = '#1a4a1a';
                ctx.beginPath();
                ctx.arc(sx + sway, sy - 32, 18, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#2a6a2a';
                ctx.beginPath();
                ctx.arc(sx + sway * 0.7, sy - 36, 14, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#3a8a3a';
                ctx.beginPath();
                ctx.arc(sx + sway * 0.5 - 3, sy - 40, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();
                break;
            }
            case 'snow_pine': {
                const sway = Math.sin(anim * 0.6 + obj.animTimer) * 0.8;
                ctx.save();
                // Camadas cônicas de pinheiro com neve
                const layers = [
                    { r: 18, ry: 10, y: -10, green: '#2a4a20', snow: 'rgba(210,235,250,0.85)' },
                    { r: 14, ry: 8,  y: -24, green: '#335a28', snow: 'rgba(215,240,255,0.80)' },
                    { r: 10, ry: 6,  y: -36, green: '#3a6a30', snow: 'rgba(220,245,255,0.85)' },
                    { r: 6,  ry: 4,  y: -46, green: '#4a7a3a', snow: 'rgba(230,250,255,0.90)' }
                ];
                for (const l of layers) {
                    ctx.fillStyle = l.green;
                    ctx.beginPath();
                    ctx.ellipse(sx + sway, sy + l.y, l.r, l.ry, 0, 0, Math.PI * 2);
                    ctx.fill();
                    // Neve em cima
                    ctx.fillStyle = l.snow;
                    ctx.beginPath();
                    ctx.ellipse(sx + sway, sy + l.y - l.ry * 0.3, l.r * 0.85, l.ry * 0.5, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
                break;
            }
            case 'dead_tree': {
                const sway = Math.sin(anim * 0.5 + obj.animTimer) * 2;
                ctx.save();
                ctx.strokeStyle = '#2a1a0c';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                // Galhos principais
                ctx.beginPath();
                ctx.moveTo(sx, sy - 10);
                ctx.lineTo(sx + sway - 20, sy - 36);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(sx, sy - 10);
                ctx.lineTo(sx + sway + 22, sy - 30);
                ctx.stroke();
                // Galhos secundários
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(sx + sway - 14, sy - 28);
                ctx.lineTo(sx + sway - 22, sy - 40);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(sx + sway - 14, sy - 28);
                ctx.lineTo(sx + sway - 6, sy - 38);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(sx + sway + 16, sy - 25);
                ctx.lineTo(sx + sway + 24, sy - 38);
                ctx.stroke();
                ctx.lineCap = 'butt';
                ctx.restore();
                break;
            }
            case 'cactus': {
                // Ponta do tronco com topo arredondado
                ctx.fillStyle = '#3a7030';
                ctx.beginPath();
                ctx.arc(sx, sy - 18, 4, 0, Math.PI * 2);
                ctx.fill();
                break;
            }
            case 'burned_tree': {
                // Nada acima — árvore queimada é baixa
                break;
            }
            default:
                break;
        }
    }

    // ===== EFEITOS ATMOSFÉRICOS =====
    _drawFogEffect(ctx, fogColor, animTime, W, H) {
        for (let i = 0; i < 3; i++) {
            const t = animTime * 0.3 + i * 2.1;
            const x = Math.sin(t) * W * 0.2;
            const y = Math.cos(t * 0.7) * H * 0.15;
            const grad = ctx.createRadialGradient(
                W * 0.3 + x, H * 0.5 + y, 0,
                W * 0.3 + x, H * 0.5 + y, W * 0.5
            );
            grad.addColorStop(0, fogColor);
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, W, H);
        }
    }

    _drawVignette(ctx, vignetteColor, W, H) {
        const grad = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, vignetteColor);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
    }

    // ===== VISIBILITY HELPERS =====
    _isChunkVisible(csx, csy, chunkSize) {
        return !(csx + chunkSize < -128 || csx > this.canvas.width + 128 ||
                 csy + chunkSize < -128 || csy > this.canvas.height + 128);
    }
    _isTileVisible(sx, sy, ts) {
        return !(sx + ts < -2 || sx > this.canvas.width + 2 ||
                 sy + ts < -2 || sy > this.canvas.height + 2);
    }

    // ===== DRAW PLAYER =====
    drawPlayer(player) {
        const ctx = this.ctx;
        ctx.save();

        const playerImg = this.assets.player;

        if (playerImg && playerImg.complete && playerImg.naturalWidth > 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(player.x, player.y + 20, 20, 10, 0, 0, Math.PI * 2);
            ctx.fill();

            const numFrames = 4;
            const fw = playerImg.naturalWidth / numFrames;
            const fh = playerImg.naturalHeight;

            let frameIndex = 0;
            const attackSpeed = (typeof player.getAttackSpeed === 'function') ? player.getAttackSpeed() : 0.5;
            if (player.attackCooldown && player.attackCooldown > attackSpeed * 0.5) {
                frameIndex = 3;
            } else if (player.velocityX !== 0 || player.velocityY !== 0) {
                frameIndex = (Math.floor(this.animTime * 6) % 2 === 0) ? 1 : 2;
            }

            let flip = player.facingX < 0;
            ctx.translate(player.x, player.y);
            if (flip) ctx.scale(-1, 1);

            const displayHeight = 128;
            const displayWidth  = (fw / fh) * displayHeight;
            ctx.drawImage(
                playerImg,
                frameIndex * fw, 0, fw, fh,
                -displayWidth / 2, -displayHeight / 2 - 20,
                displayWidth, displayHeight
            );

            if (flip) ctx.scale(-1, 1);
            ctx.translate(-player.x, -player.y);
        } else {
            // Fallback
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(player.x, player.y + 20, 20, 10, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#8b5cf6';
            ctx.strokeStyle = '#a78bfa';
            ctx.lineWidth = 3;
            ctx.shadowBlur  = 20;
            ctx.shadowColor = '#8b5cf6';
            ctx.beginPath();
            ctx.arc(player.x, player.y, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#c4b5fd';
            ctx.beginPath();
            ctx.arc(player.x - 4, player.y - 5, 5, 0, Math.PI * 2);
            ctx.fill();

            if (player.velocityX !== 0 || player.velocityY !== 0) {
                const ax = player.x + player.facingX * 25;
                const ay = player.y + player.facingY * 25;
                ctx.fillStyle = '#f59e0b';
                ctx.beginPath();
                ctx.arc(ax, ay, 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.fillStyle = '#e0e7ff';
        ctx.font = 'bold 12px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(player.name || 'Caçador', player.x, player.y - 85);

        ctx.restore();
    }

    // ===== DRAW ENEMY =====
    drawEnemy(enemy) {
        const ctx = this.ctx;
        if (enemy.isDead) {
            ctx.globalAlpha = Math.max(0, enemy.deathTimer || 0);
        }

        ctx.save();

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(enemy.x, enemy.y + 15, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        const colors = {
            goblin: '#10b981', skeleton: '#e5e5e5', wolf: '#475569',
            golem: '#94a3b8', orc_boss: '#ef4444'
        };
        const sizes = {
            goblin: 14, skeleton: 14, wolf: 16,
            golem: 22, orc_boss: 28
        };
        const size  = sizes[enemy.type] || 14;
        const color = colors[enemy.type] || '#ef4444';

        ctx.fillStyle   = color;
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth   = 2;
        ctx.shadowBlur  = 12;
        ctx.shadowColor = color;

        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle  = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.arc(enemy.x - size * 0.2, enemy.y - size * 0.25, size * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle  = '#fca5a5';
        ctx.font       = '10px Rajdhani, sans-serif';
        ctx.textAlign  = 'center';
        const names = { goblin: 'Goblin', skeleton: 'Esqueleto', wolf: 'Lobo', golem: 'Golem', orc_boss: 'Orc Boss' };
        ctx.fillText(names[enemy.type] || enemy.type, enemy.x, enemy.y - size - 8);

        if (!enemy.isDead) {
            const hpBarWidth  = 40;
            const hpBarHeight = 4;
            const hpPercent   = enemy.currentHP / enemy.maxHP;
            const yOffset     = enemy.type === 'orc_boss' ? 50 : 30;

            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(enemy.x - hpBarWidth / 2, enemy.y - yOffset, hpBarWidth, hpBarHeight);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(enemy.x - hpBarWidth / 2, enemy.y - yOffset, hpBarWidth * hpPercent, hpBarHeight);
        }

        ctx.restore();
        ctx.globalAlpha = 1;
    }

    // ===== DRAW LOOT =====
    drawLoot(loot) {
        const ctx   = this.ctx;
        ctx.save();
        const pulse = Math.sin(loot.pulseTimer * 3) * 0.2 + 1;

        ctx.shadowBlur  = 20;
        ctx.shadowColor = '#f59e0b';
        ctx.fillStyle   = '#f59e0b';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth   = 2;
        const size = 12 * pulse;
        ctx.beginPath();
        ctx.rect(loot.x - size / 2, loot.y - size / 2, size, size);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    // ===== RENDER PRINCIPAL =====
    render(game) {
        this.animTime += (game.deltaTime || 0.016);

        this.clear();

        if (game.world) {
            game.world.update(game.deltaTime || 0.016);
        }

        const camera    = game.camera;
        const world     = game.world;
        const hasCamera = !!camera;

        // === CHÃO + DECOR TILES ===
        this.drawBackground(game);

        if (hasCamera) {
            const offX = camera.getOffsetX();
            const offY = camera.getOffsetY();
            this.ctx.save();
            this.ctx.translate(offX, offY);

            // Objetos abaixo do player
            if (world && game.player) {
                this.drawWorldObjectsBelow(world, camera, game);
            }

            // Loot
            if (game.lootSystem) {
                game.lootSystem.getAllLoot().forEach(loot => {
                    if (camera.isVisible(loot.x, loot.y, 50)) {
                        this.drawLoot(loot);
                    }
                });
            }

            // Inimigos (por Y depth)
            if (game.enemySpawner) {
                const enemies = [...game.enemySpawner.getAllEnemies()].sort((a, b) => a.y - b.y);
                enemies.forEach(enemy => {
                    if (camera.isVisible(enemy.x, enemy.y, 100)) {
                        this.drawEnemy(enemy);
                    }
                });
            }

            // Player
            if (game.player) {
                this.drawPlayer(game.player);
            }

            // Topos de objetos (copas acima do player)
            if (world && game.player) {
                this.drawWorldObjectsAbove(world, camera, game);
            }

            this.ctx.restore();

            // Efeitos atmosféricos (screen-space)
            if (world) {
                this.drawEffectLayer(world, camera, game);
            }
        } else {
            if (game.lootSystem)    game.lootSystem.getAllLoot().forEach(l => this.drawLoot(l));
            if (game.enemySpawner)  game.enemySpawner.getAllEnemies().sort((a, b) => a.y - b.y).forEach(e => this.drawEnemy(e));
            if (game.player)        this.drawPlayer(game.player);
        }

        // HUD stage
        if (game.stageSystem && game.stageSystem.isInStage()) {
            this.drawStageInfo(game.stageSystem);
        }

        // Minimap
        if (camera && world && game.player) {
            this.drawMinimap(game);
        }
    }

    // ===== STAGE INFO HUD =====
    drawStageInfo(stageSystem) {
        if (!stageSystem.currentStage) return;
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle   = '#8b5cf6';
        ctx.font        = 'bold 24px Orbitron';
        ctx.textAlign   = 'center';
        ctx.shadowBlur  = 10;
        ctx.shadowColor = '#8b5cf6';
        ctx.fillText(stageSystem.currentStage.name, this.canvas.width / 2, 50);

        if (!stageSystem.currentStage.bossType && stageSystem.currentWave > 0) {
            ctx.font      = '18px Rajdhani';
            ctx.fillStyle = '#a5b4fc';
            ctx.fillText(
                `Onda ${stageSystem.currentWave}/${stageSystem.currentStage.waves}`,
                this.canvas.width / 2, 75
            );
        }
        ctx.restore();
    }

    // ===== MINIMAP (com cores por bioma) =====
    drawMinimap(game) {
        const ctx = this.ctx;
        const mmW = 160, mmH = 120;
        const mmX = this.canvas.width - mmW - 15;
        const mmY = this.canvas.height - mmH - 80;

        ctx.fillStyle   = 'rgba(10,10,30,0.85)';
        ctx.fillRect(mmX, mmY, mmW, mmH);
        ctx.strokeStyle = 'rgba(139,92,246,0.5)';
        ctx.lineWidth   = 2;
        ctx.strokeRect(mmX, mmY, mmW, mmH);

        const worldViewRange = 3000;
        const scale          = mmW / worldViewRange;
        const playerWorldX   = game.player.x;
        const playerWorldY   = game.player.y;

        if (game.world) {
            const chunks = game.world.getVisibleChunks(
                playerWorldX - worldViewRange / 2,
                playerWorldY - worldViewRange / 2,
                worldViewRange, worldViewRange * (mmH / mmW)
            );

            // Cores de chão por bioma no minimap
            const biomeMiniColors = {
                snow: '#8ab8cc', forest: '#2a4818', desert: '#b09050', volcanic: '#2c2018',
                overworld: '#1a3a1a', graveyard: '#1a1a2a', cave: '#141418',
                magic: '#1a0a3a', wolf_den: '#2e1a0d', swamp: '#0d2010'
            };

            for (const chunk of chunks) {
                const biomeMap = chunk.biomeMap;
                if (!biomeMap) continue;

                for (let ty = 0; ty < game.world.tilesPerChunk; ty += 2) {
                    for (let tx = 0; tx < game.world.tilesPerChunk; tx += 2) {
                        const decorLayer = chunk.decor || chunk.tiles;
                        const tileType   = decorLayer ? decorLayer[ty][tx] : -1;
                        const tileBiome  = biomeMap[ty] ? biomeMap[ty][tx] : 'overworld';

                        const tileWorldX = chunk.worldX + tx * game.world.tileSize + game.world.tileSize / 2;
                        const tileWorldY = chunk.worldY + ty * game.world.tileSize + game.world.tileSize / 2;
                        const dx = tileWorldX - playerWorldX;
                        const dy = tileWorldY - playerWorldY;
                        const px = mmX + mmW / 2 + dx * scale;
                        const py = mmY + mmH / 2 + dy * scale;

                        if (px < mmX || px > mmX + mmW || py < mmY || py > mmY + mmH) continue;

                        if (tileType === 1 || tileType === 3) {
                            ctx.fillStyle = 'rgba(80,60,40,0.7)';
                        } else if (tileType === 4) {
                            // Água/Lava
                            ctx.fillStyle = tileBiome === 'volcanic' ? 'rgba(180,40,0,0.8)' : 'rgba(50,120,200,0.7)';
                        } else {
                            ctx.fillStyle = (biomeMiniColors[tileBiome] || '#1a1a2e') + 'cc';
                        }
                        ctx.fillRect(px - 1, py - 1, 3, 3);
                    }
                }
            }
        }

        // Inimigos
        if (game.enemySpawner) {
            game.enemySpawner.getAllEnemies().forEach(enemy => {
                if (enemy.isDead) return;
                const dx = enemy.x - playerWorldX;
                const dy = enemy.y - playerWorldY;
                const px = mmX + mmW / 2 + dx * scale;
                const py = mmY + mmH / 2 + dy * scale;
                if (px >= mmX && px <= mmX + mmW && py >= mmY && py <= mmY + mmH) {
                    ctx.fillStyle = '#ef4444';
                    ctx.fillRect(px - 2, py - 2, 4, 4);
                }
            });
        }

        // Player
        ctx.fillStyle = '#8b5cf6';
        ctx.beginPath();
        ctx.arc(mmX + mmW / 2, mmY + mmH / 2, 3, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle  = 'rgba(255,255,255,0.4)';
        ctx.font       = '10px Rajdhani';
        ctx.textAlign  = 'center';
        ctx.fillText('MAPA', mmX + mmW / 2, mmY + mmH + 12);
    }
}
