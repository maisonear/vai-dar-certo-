// world.js — Sistema Multi-Biomas Procedural
// 4 Biomas Open-World: Tundra, Floresta, Deserto, Vulcânico
// + Sistema legado de dungeons compatível

// ===== TILE TYPES =====
const TILE = {
    FLOOR:   0,
    WALL:    1,
    GRASS:   2,
    ROCK:    3,
    WATER:   4,
    SPECIAL: 5,
    EMPTY:  -1
};

// ===== WORLD OBJECT TYPES =====
const WORLD_OBJECT_TYPES = {
    // Legado (dungeons)
    TREE:        'tree',
    GRAVESTONE:  'gravestone',
    TORCH:       'torch',
    CHEST:       'chest',
    CRYSTAL:     'crystal',
    ALTAR:       'altar',
    MUSHROOM:    'mushroom',
    FENCE:       'fence',
    RUINS:       'ruins',
    SKULL:       'skull',
    // Bioma: Neve/Gelo
    SNOW_PINE:   'snow_pine',
    ICE_SHARD:   'ice_shard',
    SNOW_ROCK:   'snow_rock',
    // Bioma: Floresta
    DEAD_TREE:   'dead_tree',
    ROOT:        'root',
    FOREST_BUSH: 'forest_bush',
    // Bioma: Deserto
    CACTUS:       'cactus',
    DESERT_SHRUB: 'desert_shrub',
    DESERT_ROCK:  'desert_rock',
    // Bioma: Vulcânico
    BURNED_TREE:  'burned_tree',
    LAVA_VENT:    'lava_vent',
    ASH_ROCK:     'ash_rock',
    EMBER_CLUMP:  'ember_clump'
};

// ===== BIOME DEFINITIONS =====
const BIOMES = {

    // ——— DUNGEONS (legado) ———
    overworld: {
        id: 'overworld', name: 'Floresta',
        tileColors: {
            [TILE.FLOOR]:   { base: '#1a3a1a', alt: '#162e16', border: '#2d5a2d' },
            [TILE.WALL]:    { base: '#3a3a2e', alt: '#2e2e24', border: '#6b6b4a', top: '#8b8b5a' },
            [TILE.GRASS]:   { base: '#1f4a1f', alt: '#1a3d1a', border: '#3a7a3a', detail: '#4a9a4a' },
            [TILE.ROCK]:    { base: '#4a4a4a', alt: '#3a3a3a', border: '#6a6a6a', top: '#7a7a7a' },
            [TILE.WATER]:   { base: '#1a3a5a', alt: '#142e4a', border: '#2a6a9a', shimmer: '#4a9ad0' },
            [TILE.SPECIAL]: { base: '#2a1a3a', alt: '#1a1028', border: '#6a3a8a', glow: '#8b5cf6' }
        },
        objectTypes: [WORLD_OBJECT_TYPES.TREE, WORLD_OBJECT_TYPES.MUSHROOM, WORLD_OBJECT_TYPES.CRYSTAL],
        wallChance: 0.04, rockChance: 0.06, waterChance: 0.02, specialChance: 0.01,
        objectDensity: 0.08, ambientLight: 0.85, fogColor: null,
        vignette: 'rgba(0,0,0,0.35)', particles: null
    },
    graveyard: {
        id: 'graveyard', name: 'Cemitério',
        tileColors: {
            [TILE.FLOOR]:   { base: '#1a1a1f', alt: '#14141a', border: '#2a2a38' },
            [TILE.WALL]:    { base: '#2a2034', alt: '#20182a', border: '#4a3a5a', top: '#6b5a7a' },
            [TILE.GRASS]:   { base: '#1a1a28', alt: '#141422', border: '#2a2a42', detail: '#3a3a5a' },
            [TILE.ROCK]:    { base: '#2a2030', alt: '#1e1826', border: '#4a3858', top: '#5a4a6a' },
            [TILE.WATER]:   { base: '#0a0a14', alt: '#080810', border: '#1a1a2a', shimmer: '#2a2a4a' },
            [TILE.SPECIAL]: { base: '#1a1028', alt: '#10081e', border: '#5a2a8a', glow: '#9b3cf6' }
        },
        objectTypes: [WORLD_OBJECT_TYPES.GRAVESTONE, WORLD_OBJECT_TYPES.TORCH, WORLD_OBJECT_TYPES.SKULL, WORLD_OBJECT_TYPES.FENCE],
        wallChance: 0.08, rockChance: 0.05, waterChance: 0.01, specialChance: 0.06,
        objectDensity: 0.12, ambientLight: 0.55, fogColor: 'rgba(180,160,220,0.06)',
        vignette: 'rgba(10,0,20,0.6)', particles: null
    },
    cave: {
        id: 'cave', name: 'Caverna',
        tileColors: {
            [TILE.FLOOR]:   { base: '#141418', alt: '#0e0e12', border: '#1e1e28' },
            [TILE.WALL]:    { base: '#1a1a20', alt: '#141418', border: '#2a2a38', top: '#3a3a4a' },
            [TILE.GRASS]:   { base: '#181820', alt: '#14141a', border: '#282838', detail: '#303048' },
            [TILE.ROCK]:    { base: '#2a2830', alt: '#201e28', border: '#3a3848', top: '#4a4858' },
            [TILE.WATER]:   { base: '#3a0a0a', alt: '#2a0808', border: '#6a1a1a', shimmer: '#ff4400' },
            [TILE.SPECIAL]: { base: '#0a0a2a', alt: '#080820', border: '#3a3a8a', glow: '#5c7cf6' }
        },
        objectTypes: [WORLD_OBJECT_TYPES.CRYSTAL, WORLD_OBJECT_TYPES.TORCH, WORLD_OBJECT_TYPES.ALTAR, WORLD_OBJECT_TYPES.RUINS],
        wallChance: 0.15, rockChance: 0.10, waterChance: 0.03, specialChance: 0.04,
        objectDensity: 0.10, ambientLight: 0.35, fogColor: null,
        vignette: 'rgba(0,0,0,0.75)', particles: null
    },
    magic: {
        id: 'magic', name: 'Templo Arcano',
        tileColors: {
            [TILE.FLOOR]:   { base: '#0d0d28', alt: '#080820', border: '#2a2a5a', rune: '#3a3a8a' },
            [TILE.WALL]:    { base: '#1a1040', alt: '#120c34', border: '#4a3a80', top: '#6a5ab0' },
            [TILE.GRASS]:   { base: '#100a30', alt: '#0c0828', border: '#2a1a5a', detail: '#3a2a7a' },
            [TILE.ROCK]:    { base: '#2a1a4a', alt: '#1e1238', border: '#4a2a6a', top: '#6a3a8a' },
            [TILE.WATER]:   { base: '#0a0a3a', alt: '#080830', border: '#2a2a6a', shimmer: '#6060ff' },
            [TILE.SPECIAL]: { base: '#1a0a3a', alt: '#12082e', border: '#6a3ab0', glow: '#bf5cf6' }
        },
        objectTypes: [WORLD_OBJECT_TYPES.CRYSTAL, WORLD_OBJECT_TYPES.ALTAR, WORLD_OBJECT_TYPES.RUINS],
        wallChance: 0.10, rockChance: 0.05, waterChance: 0.04, specialChance: 0.08,
        objectDensity: 0.07, ambientLight: 0.50, fogColor: 'rgba(100,60,180,0.05)',
        vignette: 'rgba(20,0,40,0.65)', particles: null
    },
    wolf_den: {
        id: 'wolf_den', name: 'Covil dos Lobos',
        tileColors: {
            [TILE.FLOOR]:   { base: '#2e1a0d', alt: '#261508', border: '#4a3018' },
            [TILE.WALL]:    { base: '#3a2010', alt: '#2e1808', border: '#5a3820', top: '#7a5030' },
            [TILE.GRASS]:   { base: '#321c0d', alt: '#28160a', border: '#523010', detail: '#6a3e18' },
            [TILE.ROCK]:    { base: '#3a3020', alt: '#2e2818', border: '#5a4a30', top: '#6a5a40' },
            [TILE.WATER]:   { base: '#1a1208', alt: '#120e06', border: '#2a1e0e', shimmer: '#4a3018' },
            [TILE.SPECIAL]: { base: '#3a1a08', alt: '#2e1406', border: '#6a3010', glow: '#c47820' }
        },
        objectTypes: [WORLD_OBJECT_TYPES.TREE, WORLD_OBJECT_TYPES.SKULL, WORLD_OBJECT_TYPES.FENCE],
        wallChance: 0.06, rockChance: 0.08, waterChance: 0.01, specialChance: 0.03,
        objectDensity: 0.09, ambientLight: 0.70, fogColor: null,
        vignette: 'rgba(20,10,0,0.45)', particles: null
    },
    swamp: {
        id: 'swamp', name: 'Pântano',
        tileColors: {
            [TILE.FLOOR]:   { base: '#0d2010', alt: '#0a1a0c', border: '#1a3a1e' },
            [TILE.WALL]:    { base: '#142814', alt: '#102010', border: '#2a4a2a', top: '#3a5a3a' },
            [TILE.GRASS]:   { base: '#0f2812', alt: '#0c200f', border: '#1e4220', detail: '#2e5a30' },
            [TILE.ROCK]:    { base: '#1a2a18', alt: '#142214', border: '#2a3a26', top: '#3a4a36' },
            [TILE.WATER]:   { base: '#0a2010', alt: '#08180c', border: '#1a3a20', shimmer: '#2aff60' },
            [TILE.SPECIAL]: { base: '#0a2008', alt: '#081806', border: '#2a5018', glow: '#4dff4d' }
        },
        objectTypes: [WORLD_OBJECT_TYPES.MUSHROOM, WORLD_OBJECT_TYPES.RUINS, WORLD_OBJECT_TYPES.CRYSTAL],
        wallChance: 0.05, rockChance: 0.04, waterChance: 0.08, specialChance: 0.03,
        objectDensity: 0.08, ambientLight: 0.60, fogColor: 'rgba(100,200,80,0.04)',
        vignette: 'rgba(0,15,5,0.55)', particles: null
    },

    // ——— BIOMAS OPEN-WORLD ———

    // Tundra Gelada: chão azul-clarobranco, gelo rachado, pedras cobertas de neve
    snow: {
        id: 'snow', name: 'Tundra Gelada',
        tileColors: {
            [TILE.FLOOR]:   { base: '#bed8ea', alt: '#adc8dc', border: '#d6eef8', crack: '#7aacbe' },
            [TILE.GRASS]:   { base: '#cce2ee', alt: '#bcd2e0', border: '#dcf0f8', detail: '#9fc2d4' },
            [TILE.ROCK]:    { base: '#87979c', alt: '#788898', border: '#a0b2bc', top: '#b8cad4' },
            [TILE.WATER]:   { base: '#4e98ca', alt: '#3880b2', border: '#78baea', shimmer: '#c6ecff' },
            [TILE.WALL]:    { base: '#6888a2', alt: '#587892', border: '#8ab2ca', top: '#a8cae0' },
            [TILE.SPECIAL]: { base: '#78b2da', alt: '#589ac2', border: '#a0d2f2', glow: '#d2f2ff' }
        },
        objectTypes: [WORLD_OBJECT_TYPES.SNOW_PINE, WORLD_OBJECT_TYPES.ICE_SHARD, WORLD_OBJECT_TYPES.SNOW_ROCK, WORLD_OBJECT_TYPES.SNOW_PINE],
        wallChance: 0.022, rockChance: 0.042, waterChance: 0.030, specialChance: 0.003,
        objectDensity: 0.060,
        ambientLight: 1.0,
        fogColor: 'rgba(210,235,255,0.05)',
        vignette: 'rgba(50,100,200,0.22)',
        particles: 'snow'
    },

    // Floresta Profunda: terra marrom-escura, raízes, árvores mortas, vegetação intensa
    forest: {
        id: 'forest', name: 'Floresta Profunda',
        tileColors: {
            [TILE.FLOOR]:   { base: '#2b190c', alt: '#21130a', border: '#3b2916', spot: '#42301f' },
            [TILE.GRASS]:   { base: '#192e0f', alt: '#13260b', border: '#294017', detail: '#395020' },
            [TILE.ROCK]:    { base: '#372e24', alt: '#2b2418', border: '#4d3e2c', top: '#5d4e3c' },
            [TILE.WATER]:   { base: '#17341f', alt: '#112b19', border: '#274e2f', shimmer: '#2f7848' },
            [TILE.WALL]:    { base: '#2b1c0e', alt: '#211608', border: '#47301e', top: '#654e3c' },
            [TILE.SPECIAL]: { base: '#172708', alt: '#0f1f08', border: '#375020', glow: '#69aa38' }
        },
        objectTypes: [
            WORLD_OBJECT_TYPES.DEAD_TREE, WORLD_OBJECT_TYPES.DEAD_TREE,
            WORLD_OBJECT_TYPES.ROOT, WORLD_OBJECT_TYPES.ROOT,
            WORLD_OBJECT_TYPES.FOREST_BUSH, WORLD_OBJECT_TYPES.MUSHROOM
        ],
        wallChance: 0.032, rockChance: 0.042, waterChance: 0.016, specialChance: 0.005,
        objectDensity: 0.095,
        ambientLight: 0.70,
        fogColor: 'rgba(18,38,10,0.04)',
        vignette: 'rgba(4,18,2,0.48)',
        particles: null
    },

    // Deserto Árido: areia dourada, pedras marrons, plantas resistentes
    desert: {
        id: 'desert', name: 'Deserto Árido',
        tileColors: {
            [TILE.FLOOR]:   { base: '#c4a05c', alt: '#b09048', border: '#d4b068', spot: '#a87840' },
            [TILE.GRASS]:   { base: '#b89250', alt: '#a88040', border: '#c8a060', detail: '#9a7230' },
            [TILE.ROCK]:    { base: '#78603c', alt: '#685030', border: '#98804c', top: '#a8905c' },
            [TILE.WATER]:   { base: '#306aa0', alt: '#205888', border: '#5088c0', shimmer: '#70bada' },
            [TILE.WALL]:    { base: '#8c6e4e', alt: '#7c5e3e', border: '#9c7e5e', top: '#ac8e6e' },
            [TILE.SPECIAL]: { base: '#c49040', alt: '#b48030', border: '#d4a050', glow: '#ffd060' }
        },
        objectTypes: [
            WORLD_OBJECT_TYPES.CACTUS, WORLD_OBJECT_TYPES.CACTUS,
            WORLD_OBJECT_TYPES.DESERT_SHRUB, WORLD_OBJECT_TYPES.DESERT_SHRUB,
            WORLD_OBJECT_TYPES.DESERT_ROCK
        ],
        wallChance: 0.015, rockChance: 0.05,  waterChance: 0.003, specialChance: 0.003,
        objectDensity: 0.052,
        ambientLight: 1.0,
        fogColor: 'rgba(200,158,80,0.025)',
        vignette: 'rgba(60,26,0,0.28)',
        particles: 'dust'
    },

    // Terra Vulcânica: solo escuro com rachaduras de lava, árvores queimadas, fumaça
    volcanic: {
        id: 'volcanic', name: 'Terra Vulcânica',
        tileColors: {
            [TILE.FLOOR]:   { base: '#1c1510', alt: '#150f0a', border: '#2b1e14', crack: '#360d00' },
            [TILE.GRASS]:   { base: '#1e1610', alt: '#171208', border: '#2d2018', detail: '#3d2c18' },
            [TILE.ROCK]:    { base: '#2c281e', alt: '#241e16', border: '#3c3828', top: '#4c4838' },
            [TILE.WATER]:   { base: '#490800', alt: '#370600', border: '#881f00', shimmer: '#ff5c0e' },
            [TILE.WALL]:    { base: '#241c15', alt: '#1c1610', border: '#3c2b22', top: '#4c3c30' },
            [TILE.SPECIAL]: { base: '#360d00', alt: '#260800', border: '#662500', glow: '#ff4d00' }
        },
        objectTypes: [
            WORLD_OBJECT_TYPES.BURNED_TREE, WORLD_OBJECT_TYPES.BURNED_TREE,
            WORLD_OBJECT_TYPES.LAVA_VENT,
            WORLD_OBJECT_TYPES.ASH_ROCK, WORLD_OBJECT_TYPES.ASH_ROCK,
            WORLD_OBJECT_TYPES.EMBER_CLUMP
        ],
        wallChance: 0.026, rockChance: 0.063, waterChance: 0.052, specialChance: 0.016,
        objectDensity: 0.073,
        ambientLight: 0.60,
        fogColor: 'rgba(60,16,0,0.07)',
        vignette: 'rgba(40,0,0,0.58)',
        particles: 'ash'
    }
};

// Stage theme → biome (dungeons — legado)
const THEME_TO_BIOME = {
    goblin_cave:      'cave',
    graveyard:        'graveyard',
    wolf_den:         'wolf_den',
    mine:             'cave',
    swamp:            'swamp',
    mage_tower:       'magic',
    orc_fortress:     'wolf_den',
    catacombs:        'graveyard',
    void_temple:      'magic',
    dragon_mountain:  'cave',
    demon_abyss:      'cave',
    chaos_sanctuary:  'magic',
    overworld:        'overworld'
};

// IDs dos biomas que são open-world (não dungeons)
const OPEN_WORLD_BIOMES = new Set(['snow', 'forest', 'desert', 'volcanic']);


// ===== PROCEDURAL NOISE =====
class ProceduralNoise {
    constructor(seed) {
        this.seed = seed;
    }

    // Hash deterministico [0, 1)
    hash(x, y, s) {
        const n = Math.sin(x * 127.1 + y * 311.7 + (s || 0) * 74.3 + this.seed) * 43758.5453;
        return n - Math.floor(n);
    }

    // Smooth (interpolação bicúbica) a uma escala "freq" em coordenadas de pixel do mundo
    smooth(wx, wy, freq, s) {
        const xi = Math.floor(wx * freq);
        const yi = Math.floor(wy * freq);
        const xf = wx * freq - xi;
        const yf = wy * freq - yi;
        // Smoothstep para evitar artefatos
        const ux = xf * xf * (3 - 2 * xf);
        const uy = yf * yf * (3 - 2 * yf);
        const a = this.hash(xi,     yi,     s);
        const b = this.hash(xi + 1, yi,     s);
        const c = this.hash(xi,     yi + 1, s);
        const d = this.hash(xi + 1, yi + 1, s);
        return a + ux * (b - a) + uy * (c - a) + ux * uy * (a - b - c + d);
    }

    // 2 oitavas de noise — regiões de bioma com ~4000-8000px de largura
    octave(wx, wy, s) {
        return this.smooth(wx, wy, 0.000072, s)     * 0.62 +
               this.smooth(wx, wy, 0.000260, s + 1) * 0.38;
    }
}


// ===== WORLD OBJECT =====
class WorldObject {
    constructor(type, worldX, worldY, biome) {
        this.type      = type;
        this.x         = worldX;
        this.y         = worldY;
        this.biome     = biome;
        this.animTimer = Math.random() * Math.PI * 2;

        // defaults
        this.solid           = false;
        this.collisionRadius = 0;
        this.interactive     = false;
        this.height          = 24;
        this.lightRadius     = 0;
        this.lightColor      = null;

        switch (type) {
            // --- LEGADO ---
            case WORLD_OBJECT_TYPES.TREE:
                this.solid = true;  this.collisionRadius = 14; this.height = 52; break;
            case WORLD_OBJECT_TYPES.GRAVESTONE:
                this.solid = true;  this.collisionRadius = 12; this.height = 36; break;
            case WORLD_OBJECT_TYPES.TORCH:
                this.solid = false; this.height = 20;
                this.lightRadius = 100; this.lightColor = 'rgba(255,160,50,0.18)'; break;
            case WORLD_OBJECT_TYPES.CHEST:
                this.solid = true;  this.collisionRadius = 13; this.interactive = true;
                this.opened = false; this.height = 24; break;
            case WORLD_OBJECT_TYPES.CRYSTAL:
                this.solid = false; this.height = 30;
                this.lightRadius = 60; this.lightColor = 'rgba(130,80,255,0.15)'; break;
            case WORLD_OBJECT_TYPES.ALTAR:
                this.solid = true;  this.collisionRadius = 16; this.interactive = true;
                this.height = 32;
                this.lightRadius = 80; this.lightColor = 'rgba(150,80,255,0.12)'; break;
            case WORLD_OBJECT_TYPES.MUSHROOM:
                this.solid = false; this.height = 20; break;
            case WORLD_OBJECT_TYPES.FENCE:
                this.solid = true;  this.collisionRadius = 10; this.height = 20; break;
            case WORLD_OBJECT_TYPES.RUINS:
                this.solid = true;  this.collisionRadius = 18; this.height = 28; break;
            case WORLD_OBJECT_TYPES.SKULL:
                this.solid = false; this.height = 16; break;

            // --- NEVE ---
            case WORLD_OBJECT_TYPES.SNOW_PINE:
                this.solid = true;  this.collisionRadius = 11; this.height = 54; break;
            case WORLD_OBJECT_TYPES.ICE_SHARD:
                this.solid = false; this.height = 30;
                this.lightRadius = 45; this.lightColor = 'rgba(150,220,255,0.13)'; break;
            case WORLD_OBJECT_TYPES.SNOW_ROCK:
                this.solid = true;  this.collisionRadius = 13; this.height = 22; break;

            // --- FLORESTA ---
            case WORLD_OBJECT_TYPES.DEAD_TREE:
                this.solid = true;  this.collisionRadius = 14; this.height = 62; break;
            case WORLD_OBJECT_TYPES.ROOT:
                this.solid = false; this.height = 10; break;
            case WORLD_OBJECT_TYPES.FOREST_BUSH:
                this.solid = false; this.height = 22; break;

            // --- DESERTO ---
            case WORLD_OBJECT_TYPES.CACTUS:
                this.solid = true;  this.collisionRadius = 9; this.height = 46; break;
            case WORLD_OBJECT_TYPES.DESERT_SHRUB:
                this.solid = false; this.height = 16; break;
            case WORLD_OBJECT_TYPES.DESERT_ROCK:
                this.solid = true;  this.collisionRadius = 13; this.height = 20; break;

            // --- VULCÂNICO ---
            case WORLD_OBJECT_TYPES.BURNED_TREE:
                this.solid = true;  this.collisionRadius = 9; this.height = 44; break;
            case WORLD_OBJECT_TYPES.LAVA_VENT:
                this.solid = false; this.height = 8;
                this.lightRadius = 72; this.lightColor = 'rgba(255,80,0,0.22)'; break;
            case WORLD_OBJECT_TYPES.ASH_ROCK:
                this.solid = true;  this.collisionRadius = 12; this.height = 18; break;
            case WORLD_OBJECT_TYPES.EMBER_CLUMP:
                this.solid = false; this.height = 10;
                this.lightRadius = 38; this.lightColor = 'rgba(255,100,0,0.17)'; break;
        }
    }

    update(dt) {
        this.animTimer += dt * 2;
    }
}


// ===== TILEMAP WORLD =====
class TilemapWorld {
    constructor() {
        this.TILE_SIZE       = 32;
        this.CHUNK_SIZE      = 512;
        this.TILES_PER_CHUNK = this.CHUNK_SIZE / this.TILE_SIZE; // 16

        // Compatibilidade com interface antiga (ChunkManager)
        this.tileSize      = this.TILE_SIZE;
        this.chunkSize     = this.CHUNK_SIZE;
        this.tilesPerChunk = this.TILES_PER_CHUNK;

        this.chunks       = new Map();
        this.worldObjects = [];
        this._objectSpatialCache    = new Map();
        this._objectCacheRegionSize = 256;
        this.animTime     = 0;

        // Dungeon mode (legado) — quando em dungeon usa currentBiome fixo
        this.currentBiome = 'overworld';
        this.biomeData    = BIOMES.overworld;
        this.isDungeon    = false;

        // Seed e noise para open world
        this.seed  = Math.floor(Math.random() * 999999);
        this.noise = new ProceduralNoise(this.seed);

        // Chunk de cidade/origem (permanece limpo)
        this.townChunkX = 0;
        this.townChunkY = 0;

        // Bounds do mundo
        this.worldMinX = -8192;
        this.worldMinY = -8192;
        this.worldMaxX = 16384;
        this.worldMaxY = 16384;
    }

    // ===== CONTROLE DE BIOMA (dungeons) =====
    setBiome(biomeId) {
        const bId = THEME_TO_BIOME[biomeId] || biomeId || 'overworld';
        this.currentBiome = bId;
        this.biomeData    = BIOMES[bId] || BIOMES.overworld;
        this.isDungeon    = !OPEN_WORLD_BIOMES.has(bId) && bId !== 'overworld';
        this.chunks.clear();
        this.worldObjects = [];
        this._objectSpatialCache.clear();
    }

    getBiome() { return this.biomeData; }

    // ===== BIOMA OPEN-WORLD por posição =====
    // Temperatura + Umidade → bioma
    getBiomeAt(wx, wy) {
        // Zona de spawn segura perto da origem — sempre floresta
        const distFromOrigin = Math.sqrt(wx * wx + wy * wy);
        if (distFromOrigin < 2000) return 'forest';

        const t = this.noise.octave(wx, wy, 0); // temperatura: frio→quente
        const m = this.noise.octave(wx, wy, 3); // umidade: seco→úmido
        if (t < 0.33)  return 'snow';
        if (t < 0.58)  return m > 0.50 ? 'forest' : 'desert';
        return m > 0.46 ? 'volcanic' : 'desert';
    }

    getBiomeDataAt(wx, wy) {
        return BIOMES[this.getBiomeAt(wx, wy)] || BIOMES.snow;
    }

    // ===== RANDOM SEEDED =====
    seededRandom(x, y, salt) {
        const n = Math.sin(x * 12.9898 + y * 78.233 + (salt || 0) * 43.758 + this.seed) * 43758.5453;
        return n - Math.floor(n);
    }

    // ===== COORDENADAS DE CHUNK =====
    worldToChunk(wx, wy) {
        return { cx: Math.floor(wx / this.CHUNK_SIZE), cy: Math.floor(wy / this.CHUNK_SIZE) };
    }
    chunkKey(cx, cy) { return `${cx},${cy}`; }

    // ===== ACESSO A CHUNKS =====
    getChunk(cx, cy) {
        const key = this.chunkKey(cx, cy);
        if (this.chunks.has(key)) return this.chunks.get(key);
        const chunk = this.generateChunk(cx, cy);
        this.chunks.set(key, chunk);
        return chunk;
    }

    // ===== GERAÇÃO DE CHUNK =====
    generateChunk(cx, cy) {
        const isTown     = (cx === this.townChunkX && cy === this.townChunkY);
        const isNearTown = Math.abs(cx - this.townChunkX) <= 1 && Math.abs(cy - this.townChunkY) <= 1;
        const n  = this.TILES_PER_CHUNK;
        const ts = this.TILE_SIZE;

        // Três camadas do tilemap
        const ground   = [];
        const decor    = [];
        const effect   = [];
        const biomeMap = []; // bioma ID por tile

        for (let ty = 0; ty < n; ty++) {
            ground[ty]   = [];
            decor[ty]    = [];
            effect[ty]   = [];
            biomeMap[ty] = [];
            for (let tx = 0; tx < n; tx++) {
                ground[ty][tx]   = TILE.FLOOR;
                decor[ty][tx]    = TILE.EMPTY;
                effect[ty][tx]   = TILE.EMPTY;

                const twx = cx * this.CHUNK_SIZE + tx * ts;
                const twy = cy * this.CHUNK_SIZE + ty * ts;
                // Dungeon → bioma fixo; open world → bioma procedural
                biomeMap[ty][tx] = this.isDungeon ? this.currentBiome : this.getBiomeAt(twx, twy);
            }
        }

        if (!isTown) {
            for (let ty = 0; ty < n; ty++) {
                for (let tx = 0; tx < n; tx++) {
                    const tBiome = BIOMES[biomeMap[ty][tx]] || this.biomeData;
                    const near   = isNearTown;

                    const wallChance    = near ? tBiome.wallChance * 0.3    : tBiome.wallChance;
                    const rockChance    = near ? tBiome.rockChance * 0.4    : tBiome.rockChance;
                    const waterChance   = near ? tBiome.waterChance * 0.2   : tBiome.waterChance;
                    const specialChance = near ? tBiome.specialChance * 0.2  : tBiome.specialChance;

                    const r  = this.seededRandom(cx * 100 + tx, cy * 100 + ty, 0);
                    const r2 = this.seededRandom(cx * 100 + tx, cy * 100 + ty, 1);
                    const r3 = this.seededRandom(cx * 100 + tx, cy * 100 + ty, 2);

                    // Variação de chão (GRASS = variante decorativa)
                    if (r < 0.22) ground[ty][tx] = TILE.GRASS;

                    const isEdge   = (tx === 0 || tx === n - 1 || ty === 0 || ty === n - 1);
                    const wallMult = isEdge ? 2.0 : 1.0;

                    if (r < wallChance * wallMult) {
                        decor[ty][tx] = TILE.WALL;
                    } else if (r < (wallChance + rockChance) * wallMult) {
                        decor[ty][tx] = TILE.ROCK;
                    } else if (r2 < waterChance) {
                        decor[ty][tx] = TILE.WATER;
                    } else if (r3 < specialChance) {
                        decor[ty][tx] = TILE.SPECIAL;
                        effect[ty][tx] = TILE.SPECIAL;
                    }
                }
            }
        }

        // Centro do chunk sempre aberto (área de 5x5 tiles)
        const mid = Math.floor(n / 2);
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                const ty2 = mid + dy, tx2 = mid + dx;
                if (ty2 >= 0 && ty2 < n && tx2 >= 0 && tx2 < n) {
                    decor[ty2][tx2]  = TILE.EMPTY;
                    effect[ty2][tx2] = TILE.EMPTY;
                }
            }
        }

        const worldX = cx * this.CHUNK_SIZE;
        const worldY = cy * this.CHUNK_SIZE;

        if (!isTown) {
            this._generateChunkObjects(cx, cy, worldX, worldY, decor, biomeMap, isNearTown);
        }

        return { cx, cy, worldX, worldY, ground, decor, effect, biomeMap, tiles: decor, generated: true };
    }

    // ===== GERAÇÃO DE OBJETOS POR CHUNK =====
    _generateChunkObjects(cx, cy, chunkWorldX, chunkWorldY, decor, biomeMap, isNearTown) {
        const n  = this.TILES_PER_CHUNK;
        const ts = this.TILE_SIZE;

        for (let ty = 1; ty < n - 1; ty++) {
            for (let tx = 1; tx < n - 1; tx++) {
                if (decor[ty][tx] !== TILE.EMPTY) continue;

                const tileBiome = BIOMES[biomeMap[ty][tx]] || this.biomeData;
                const density   = isNearTown ? tileBiome.objectDensity * 0.3 : tileBiome.objectDensity;

                const r = this.seededRandom(cx * 200 + tx, cy * 200 + ty, 5);
                if (r >= density) continue;

                const objTypes = tileBiome.objectTypes;
                if (!objTypes || objTypes.length === 0) continue;

                const typeIdx = Math.floor(this.seededRandom(cx * 200 + tx, cy * 200 + ty, 6) * objTypes.length);
                const objType = objTypes[typeIdx];

                const offX = (this.seededRandom(cx * 200 + tx, cy * 200 + ty, 7) - 0.5) * ts * 0.4;
                const offY = (this.seededRandom(cx * 200 + tx, cy * 200 + ty, 8) - 0.5) * ts * 0.4;
                const wx   = chunkWorldX + tx * ts + ts / 2 + offX;
                const wy   = chunkWorldY + ty * ts + ts / 2 + offY;

                const obj = new WorldObject(objType, wx, wy, biomeMap[ty][tx]);
                this.worldObjects.push(obj);

                if (obj.solid) {
                    decor[ty][tx] = TILE.ROCK;
                }
            }
        }
    }

    // ===== ACESSO A TILES =====
    getTileAt(wx, wy, layer) {
        const { cx, cy } = this.worldToChunk(wx, wy);
        const chunk = this.getChunk(cx, cy);
        const localX = wx - chunk.worldX;
        const localY = wy - chunk.worldY;
        const tx = Math.floor(localX / this.TILE_SIZE);
        const ty = Math.floor(localY / this.TILE_SIZE);
        if (tx < 0 || tx >= this.TILES_PER_CHUNK || ty < 0 || ty >= this.TILES_PER_CHUNK) return TILE.WALL;
        if (layer === 'ground') return chunk.ground[ty][tx];
        if (layer === 'effect') return chunk.effect[ty][tx];
        return chunk.decor[ty][tx];
    }

    isTileSolid(t) {
        return t === TILE.WALL || t === TILE.ROCK || t === TILE.WATER || t === TILE.SPECIAL;
    }

    // ===== COLISÃO =====
    isWalkable(wx, wy, radius) {
        const r = radius || 14;
        const pts = [
            { x: wx,     y: wy     },
            { x: wx - r, y: wy - r }, { x: wx + r, y: wy - r },
            { x: wx - r, y: wy + r }, { x: wx + r, y: wy + r }
        ];
        for (const p of pts) {
            if (this.isTileSolid(this.getTileAt(p.x, p.y, 'decor'))) return false;
        }
        return true;
    }

    // ===== CHUNKS VISÍVEIS =====
    getVisibleChunks(camX, camY, vW, vH, margin) {
        const mg = margin || 64;
        const startCX = Math.floor((camX - mg) / this.CHUNK_SIZE);
        const startCY = Math.floor((camY - mg) / this.CHUNK_SIZE);
        const endCX   = Math.floor((camX + vW + mg) / this.CHUNK_SIZE);
        const endCY   = Math.floor((camY + vH + mg) / this.CHUNK_SIZE);
        const visible = [];
        for (let cy = startCY; cy <= endCY; cy++) {
            for (let cx = startCX; cx <= endCX; cx++) {
                visible.push(this.getChunk(cx, cy));
            }
        }
        return visible;
    }

    getVisibleObjects(camX, camY, vW, vH, margin) {
        const mg = margin || 128;
        return this.worldObjects.filter(o =>
            o.x > camX - mg && o.x < camX + vW + mg &&
            o.y > camY - mg && o.y < camY + vH + mg
        );
    }

    getVisibleLights(camX, camY, vW, vH) {
        return this.getVisibleObjects(camX, camY, vW, vH, 220).filter(o => o.lightRadius > 0);
    }

    // ===== UPDATE =====
    update(dt) {
        this.animTime += dt;
        for (const o of this.worldObjects) o.update(dt);
    }

    clearChunks() {
        this.chunks.clear();
        this.worldObjects = [];
        this._objectSpatialCache.clear();
    }

    // Manter compatibilidade com código antigo
    setDungeonMode(enabled) { /* obsoleto — use setBiome() */ }
}

// Compatibilidade: ChunkManager é alias de TilemapWorld
const ChunkManager = TilemapWorld;
