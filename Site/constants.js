// ============================================================================
// CONSTANTES DO JOGO - TERRARIA 2D
// ============================================================================

// Configurações de Tela
const SCREEN_WIDTH = 1280;
const SCREEN_HEIGHT = 720;
const FPS = 60;

// Configurações de Blocos
const BLOCK_SIZE = 32;
const WORLD_WIDTH = 200;
const WORLD_HEIGHT = 100;

// Cores de Blocos
const COLORS = {
    BLACK: '#000000',
    WHITE: '#FFFFFF',
    GRAY: '#808080',
    DARK_GRAY: '#404040',
    LIGHT_GRAY: '#C0C0C0',
    
    // Blocos
    DIRT: '#8B4513',
    STONE: '#808080',
    SAND: '#EECB7F',
    WOOD: '#654321',
    GRASS: '#228B22',
    CAVE: '#696969',
    
    // Biomas
    FOREST_BG: '#87CEEB',
    DESERT_BG: '#FFE4B5',
    CAVE_BG: '#323232',
    
    // UI
    UI_BG: '#1E1E1E',
    UI_TEXT: '#FFFFFF',
    UI_BORDER: '#646464',
    HEALTH_BAR: '#FF0000',
    HEALTH_BG: '#640000',
};

// Tipos de Blocos
const BLOCK_TYPE = {
    EMPTY: 0,
    DIRT: 1,
    STONE: 2,
    SAND: 3,
    WOOD: 4,
    GRASS: 5,
};

const BLOCK_NAMES = {
    0: 'Vazio',
    1: 'Terra',
    2: 'Pedra',
    3: 'Areia',
    4: 'Madeira',
    5: 'Grama',
};

const BLOCK_COLORS = {
    0: COLORS.BLACK,
    1: COLORS.DIRT,
    2: COLORS.STONE,
    3: COLORS.SAND,
    4: COLORS.WOOD,
    5: COLORS.GRASS,
};

// Tipos de Biomas
const BIOME_TYPE = {
    FOREST: 0,
    DESERT: 1,
    CAVE: 2,
};

const BIOME_COLORS = {
    0: COLORS.FOREST_BG,
    1: COLORS.DESERT_BG,
    2: COLORS.CAVE_BG,
};

// Tipos de Itens
const ITEM_TYPE = {
    EMPTY: 0,
    DIRT: 1,
    STONE: 2,
    SAND: 3,
    WOOD: 4,
    PICKAXE_STONE: 5,
    PICKAXE_IRON: 6,
    SWORD_WOOD: 7,
    SWORD_STONE: 8,
};

const ITEM_NAMES = {
    0: 'Vazio',
    1: 'Terra',
    2: 'Pedra',
    3: 'Areia',
    4: 'Madeira',
    5: 'Picareta de Pedra',
    6: 'Picareta de Ferro',
    7: 'Espada de Madeira',
    8: 'Espada de Pedra',
};

const ITEM_ICONS = {
    0: '⬜',
    1: '🟫',
    2: '⬛',
    3: '🟨',
    4: '🟶',
    5: '⛏️',
    6: '⛏️',
    7: '🗡️',
    8: '🗡️',
};

// Física
const GRAVITY = 0.6;
const JUMP_FORCE = -15;
const PLAYER_SPEED = 5;
const PLAYER_MAX_VELOCITY_Y = 20;

// Jogador
const PLAYER_WIDTH = 24;
const PLAYER_HEIGHT = 32;
const PLAYER_MAX_HEALTH = 100;
const PLAYER_INVENTORY_SIZE = 10;

// Inimigos
const SLIME_WIDTH = 24;
const SLIME_HEIGHT = 24;
const SLIME_SPEED = 2;
const SLIME_DAMAGE = 10;
const SLIME_HEALTH = 20;

// Crafting
const CRAFTING_RECIPES = {
    [ITEM_TYPE.PICKAXE_STONE]: {
        name: 'Picareta de Pedra',
        ingredients: { [ITEM_TYPE.WOOD]: 3, [ITEM_TYPE.STONE]: 3 },
        result: ITEM_TYPE.PICKAXE_STONE,
    },
    [ITEM_TYPE.PICKAXE_IRON]: {
        name: 'Picareta de Ferro',
        ingredients: { [ITEM_TYPE.WOOD]: 3, [ITEM_TYPE.STONE]: 5 },
        result: ITEM_TYPE.PICKAXE_IRON,
    },
    [ITEM_TYPE.SWORD_WOOD]: {
        name: 'Espada de Madeira',
        ingredients: { [ITEM_TYPE.WOOD]: 5 },
        result: ITEM_TYPE.SWORD_WOOD,
    },
    [ITEM_TYPE.SWORD_STONE]: {
        name: 'Espada de Pedra',
        ingredients: { [ITEM_TYPE.WOOD]: 3, [ITEM_TYPE.STONE]: 5 },
        result: ITEM_TYPE.SWORD_STONE,
    },
};

// Mineração
const MINING_TIME = {
    [BLOCK_TYPE.DIRT]: 0.3,
    [BLOCK_TYPE.STONE]: 1.0,
    [BLOCK_TYPE.SAND]: 0.3,
    [BLOCK_TYPE.WOOD]: 0.5,
    [BLOCK_TYPE.GRASS]: 0.2,
};

const MINING_REQUIREMENTS = {
    [BLOCK_TYPE.DIRT]: ITEM_TYPE.EMPTY,
    [BLOCK_TYPE.STONE]: ITEM_TYPE.PICKAXE_STONE,
    [BLOCK_TYPE.SAND]: ITEM_TYPE.EMPTY,
    [BLOCK_TYPE.WOOD]: ITEM_TYPE.EMPTY,
    [BLOCK_TYPE.GRASS]: ITEM_TYPE.EMPTY,
};

// Ciclo Dia/Noite
const DAY_LENGTH = 600; // Segundos (10 minutos)
const NIGHT_START = 0.5;
const NIGHT_END = 0.8;
