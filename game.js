const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configurações
const TILE_SIZE = 32;
const WORLD_WIDTH = 200;
const WORLD_HEIGHT = 100;
const GRAVITY = 0.6;
const JUMP_STRENGTH = 12;

// Tipos de blocos
const BLOCK_TYPES = {
    AIR: 0,
    DIRT: 1,
    STONE: 2,
    GRASS: 3,
    WOOD: 4,
    SAND: 5
};

const BLOCK_COLORS = {
    0: 'transparent',
    1: '#8B6914',
    2: '#808080',
    3: '#228B22',
    4: '#8B4513',
    5: '#FFD700'
};

// Classe do Jogador
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 32;
        this.velocityY = 0;
        this.velocityX = 0;
        this.isJumping = false;
        this.selectedBlock = BLOCK_TYPES.DIRT;
        this.inventory = {};
        this.inventory[BLOCK_TYPES.DIRT] = 50;
        this.inventory[BLOCK_TYPES.WOOD] = 30;
        this.inventory[BLOCK_TYPES.STONE] = 20;
    }

    update(keys, world) {
        // Movimento horizontal
        this.velocityX = 0;
        if (keys['ArrowLeft'] || keys['a']) this.velocityX = -5;
        if (keys['ArrowRight'] || keys['d']) this.velocityX = 5;

        this.x += this.velocityX;

        // Aplicar gravidade
        this.velocityY += GRAVITY;
        this.y += this.velocityY;

        // Pulo
        if ((keys[' '] || keys['w']) && this.isJumping === false) {
            this.velocityY = -JUMP_STRENGTH;
            this.isJumping = true;
        }

        // Colisão com blocos
        this.isJumping = true;
        const tileX1 = Math.floor(this.x / TILE_SIZE);
        const tileX2 = Math.floor((this.x + this.width) / TILE_SIZE);
        const tileY1 = Math.floor(this.y / TILE_SIZE);
        const tileY2 = Math.floor((this.y + this.height) / TILE_SIZE);

        for (let tx = tileX1; tx <= tileX2; tx++) {
            for (let ty = tileY1; ty <= tileY2; ty++) {
                if (world.getBlock(tx, ty) !== BLOCK_TYPES.AIR) {
                    // Colisão por baixo
                    if (this.velocityY > 0) {
                        this.y = ty * TILE_SIZE - this.height;
                        this.velocityY = 0;
                        this.isJumping = false;
                    }
                    // Colisão por cima
                    if (this.velocityY < 0) {
                        this.y = (ty + 1) * TILE_SIZE;
                        this.velocityY = 0;
                    }
                    // Colisão lateral
                    if (this.velocityX > 0) {
                        this.x = tx * TILE_SIZE - this.width;
                    }
                    if (this.velocityX < 0) {
                        this.x = (tx + 1) * TILE_SIZE;
                    }
                }
            }
        }

        // Limite do mundo
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > WORLD_WIDTH * TILE_SIZE) {
            this.x = WORLD_WIDTH * TILE_SIZE - this.width;
        }
        if (this.y > WORLD_HEIGHT * TILE_SIZE) {
            this.y = 0;
        }
    }

    draw(ctx, cameraX, cameraY) {
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(this.x - cameraX, this.y - cameraY, this.width, this.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - cameraX, this.y - cameraY, this.width, this.height);
    }
}

// Classe do Mundo
class World {
    constructor() {
        this.tiles = [];
        this.generate();
    }

    generate() {
        for (let y = 0; y < WORLD_HEIGHT; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < WORLD_WIDTH; x++) {
                // Gerar terreno com ruído simples
                const height = Math.floor(WORLD_HEIGHT * 0.6 + Math.sin(x * 0.05) * 10);
                if (y > height) {
                    if (y === height + 1) {
                        this.tiles[y][x] = BLOCK_TYPES.GRASS;
                    } else if (y < height + 5) {
                        this.tiles[y][x] = BLOCK_TYPES.DIRT;
                    } else {
                        this.tiles[y][x] = BLOCK_TYPES.STONE;
                    }
                } else {
                    this.tiles[y][x] = BLOCK_TYPES.AIR;
                }
            }
        }
    }

    getBlock(x, y) {
        if (x < 0 || x >= WORLD_WIDTH || y < 0 || y >= WORLD_HEIGHT) {
            return BLOCK_TYPES.STONE;
        }
        return this.tiles[y][x];
    }

    setBlock(x, y, blockType) {
        if (x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT) {
            this.tiles[y][x] = blockType;
        }
    }

    draw(ctx, cameraX, cameraY, viewWidth, viewHeight) {
        const startX = Math.max(0, Math.floor(cameraX / TILE_SIZE));
        const startY = Math.max(0, Math.floor(cameraY / TILE_SIZE));
        const endX = Math.min(WORLD_WIDTH, Math.ceil((cameraX + viewWidth) / TILE_SIZE));
        const endY = Math.min(WORLD_HEIGHT, Math.ceil((cameraY + viewHeight) / TILE_SIZE));

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                const blockType = this.getBlock(x, y);
                if (blockType !== BLOCK_TYPES.AIR) {
                    ctx.fillStyle = BLOCK_COLORS[blockType];
                    ctx.fillRect(
                        x * TILE_SIZE - cameraX,
                        y * TILE_SIZE - cameraY,
                        TILE_SIZE,
                        TILE_SIZE
                    );
                    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(
                        x * TILE_SIZE - cameraX,
                        y * TILE_SIZE - cameraY,
                        TILE_SIZE,
                        TILE_SIZE
                    );
                }
            }
        }
    }
}

// Game Loop
class Game {
    constructor() {
        this.world = new World();
        this.player = new Player(100, 100);
        this.keys = {};
        this.mouse = { x: 0, y: 0, down: false, shift: false };
        this.setupEventListeners();
        this.gameLoop();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (e.key === '1') this.player.selectedBlock = BLOCK_TYPES.DIRT;
            if (e.key === '2') this.player.selectedBlock = BLOCK_TYPES.STONE;
            if (e.key === '3') this.player.selectedBlock = BLOCK_TYPES.GRASS;
            if (e.key === '4') this.player.selectedBlock = BLOCK_TYPES.WOOD;
            if (e.key === '5') this.player.selectedBlock = BLOCK_TYPES.SAND;
            this.updateInventoryUI();
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mousedown', (e) => {
            this.mouse.down = true;
            this.mouse.shift = e.shiftKey;
        });

        window.addEventListener('mouseup', (e) => {
            this.mouse.down = false;
        });

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    handleMining() {
        if (!this.mouse.down) return;

        const cameraX = this.player.x - canvas.width / 2;
        const cameraY = this.player.y - canvas.height / 2;

        const worldX = this.mouse.x + cameraX;
        const worldY = this.mouse.y + cameraY;

        const tileX = Math.floor(worldX / TILE_SIZE);
        const tileY = Math.floor(worldY / TILE_SIZE);

        if (this.mouse.shift) {
            // Colocar bloco
            if (this.player.inventory[this.player.selectedBlock] > 0) {
                this.world.setBlock(tileX, tileY, this.player.selectedBlock);
                this.player.inventory[this.player.selectedBlock]--;
            }
        } else {
            // Minerar bloco
            const blockType = this.world.getBlock(tileX, tileY);
            if (blockType !== BLOCK_TYPES.AIR) {
                this.world.setBlock(tileX, tileY, BLOCK_TYPES.AIR);
                this.player.inventory[blockType] = (this.player.inventory[blockType] || 0) + 1;
            }
        }
    }

    updateInventoryUI() {
        const inventory = document.getElementById('inventory');
        inventory.innerHTML = '';

        for (let i = 1; i <= 5; i++) {
            const slot = document.createElement('div');
            slot.className = 'slot';
            if (i === this.player.selectedBlock) {
                slot.classList.add('selected');
            }

            let blockName = '';
            let count = 0;

            if (i === BLOCK_TYPES.DIRT) {
                blockName = 'Terra';
                count = this.player.inventory[BLOCK_TYPES.DIRT] || 0;
            } else if (i === BLOCK_TYPES.STONE) {
                blockName = 'Pedra';
                count = this.player.inventory[BLOCK_TYPES.STONE] || 0;
            } else if (i === BLOCK_TYPES.GRASS) {
                blockName = 'Grama';
                count = this.player.inventory[BLOCK_TYPES.GRASS] || 0;
            } else if (i === BLOCK_TYPES.WOOD) {
                blockName = 'Madeira';
                count = this.player.inventory[BLOCK_TYPES.WOOD] || 0;
            } else if (i === BLOCK_TYPES.SAND) {
                blockName = 'Areia';
                count = this.player.inventory[BLOCK_TYPES.SAND] || 0;
            }

            slot.innerHTML = `<div style="text-align: center;"><div style="font-size: 10px;">${blockName}</div><div>${count}</div></div>`;
            slot.style.backgroundColor = BLOCK_COLORS[i];
            inventory.appendChild(slot);
        }
    }

    gameLoop() {
        // Atualizar
        this.player.update(this.keys, this.world);
        this.handleMining();

        // Câmera segue o jogador
        const cameraX = this.player.x - canvas.width / 2;
        const cameraY = this.player.y - canvas.height / 2;

        // Desenhar
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.world.draw(ctx, cameraX, cameraY, canvas.width, canvas.height);
        this.player.draw(ctx, cameraX, cameraY);

        // UI
        document.getElementById('posX').textContent = Math.floor(this.player.x / TILE_SIZE);
        document.getElementById('posY').textContent = Math.floor(this.player.y / TILE_SIZE);
        document.getElementById('blockCount').textContent = 
            Object.values(this.player.inventory).reduce((a, b) => a + b, 0);

        this.updateInventoryUI();

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Iniciar o jogo
window.addEventListener('load', () => {
    new Game();
});
