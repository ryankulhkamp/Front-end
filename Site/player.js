// ============================================================================
// CLASSE PLAYER - GERENCIA O JOGADOR
// ============================================================================

class Player {
    /**
     * Inicializa o jogador
     * @param {number} x - Posição X inicial em pixels
     * @param {number} y - Posição Y inicial em pixels
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
        
        // Física
        this.velocityX = 0;
        this.velocityY = 0;
        this.isJumping = false;
        this.isOnGround = false;
        
        // Saúde
        this.health = PLAYER_MAX_HEALTH;
        this.maxHealth = PLAYER_MAX_HEALTH;
        this.damageCooldown = 0;
        
        // Inventário
        this.inventory = Array(PLAYER_INVENTORY_SIZE).fill(ITEM_TYPE.EMPTY);
        this.selectedSlot = 0;
        
        // Ferramentas
        this.currentTool = ITEM_TYPE.EMPTY;
        
        // Mineração
        this.miningTarget = null;
        this.miningProgress = 0;
        
        // Combate
        this.attackCooldown = 0;
    }

    /**
     * Retorna o retângulo de colisão do jogador
     */
    getRect() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        };
    }

    /**
     * Atualiza o estado do jogador
     * @param {World} world - Instância do mundo
     * @param {Object} keys - Dicionário de teclas pressionadas
     */
    update(world, keys) {
        // Movimento horizontal
        this.velocityX = 0;
        
        if (keys['a'] || keys['ArrowLeft']) {
            this.velocityX = -PLAYER_SPEED;
        }
        if (keys['d'] || keys['ArrowRight']) {
            this.velocityX = PLAYER_SPEED;
        }
        
        // Aplicar movimento horizontal
        this.x += this.velocityX;
        this._handleCollisionX(world);
        
        // Aplicar gravidade
        this.velocityY += GRAVITY;
        this.velocityY = Math.min(this.velocityY, PLAYER_MAX_VELOCITY_Y);
        
        // Aplicar movimento vertical
        this.y += this.velocityY;
        this.isOnGround = false;
        this._handleCollisionY(world);
        
        // Pulo
        if ((keys[' '] || keys['w'] || keys['ArrowUp']) && this.isOnGround) {
            this.velocityY = JUMP_FORCE;
            this.isJumping = true;
            this.isOnGround = false;
        }
        
        // Atualizar cooldowns
        if (this.damageCooldown > 0) {
            this.damageCooldown--;
        }
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
        
        // Atualizar ferramenta selecionada
        this.currentTool = this.inventory[this.selectedSlot];
    }

    /**
     * Trata colisões horizontais
     */
    _handleCollisionX(world) {
        const rect = this.getRect();
        
        for (let bx = Math.floor(this.x / BLOCK_SIZE) - 1; bx <= Math.floor((this.x + this.width) / BLOCK_SIZE) + 1; bx++) {
            for (let by = Math.floor(this.y / BLOCK_SIZE) - 1; by <= Math.floor((this.y + this.height) / BLOCK_SIZE) + 1; by++) {
                if (world.isSolid(bx, by)) {
                    const blockRect = {
                        x: bx * BLOCK_SIZE,
                        y: by * BLOCK_SIZE,
                        width: BLOCK_SIZE,
                        height: BLOCK_SIZE,
                    };
                    
                    if (this._rectsCollide(rect, blockRect)) {
                        if (this.velocityX > 0) {
                            this.x = blockRect.x - this.width;
                        } else if (this.velocityX < 0) {
                            this.x = blockRect.x + blockRect.width;
                        }
                    }
                }
            }
        }
    }

    /**
     * Trata colisões verticais
     */
    _handleCollisionY(world) {
        const rect = this.getRect();
        
        for (let bx = Math.floor(this.x / BLOCK_SIZE) - 1; bx <= Math.floor((this.x + this.width) / BLOCK_SIZE) + 1; bx++) {
            for (let by = Math.floor(this.y / BLOCK_SIZE) - 1; by <= Math.floor((this.y + this.height) / BLOCK_SIZE) + 1; by++) {
                if (world.isSolid(bx, by)) {
                    const blockRect = {
                        x: bx * BLOCK_SIZE,
                        y: by * BLOCK_SIZE,
                        width: BLOCK_SIZE,
                        height: BLOCK_SIZE,
                    };
                    
                    if (this._rectsCollide(rect, blockRect)) {
                        if (this.velocityY > 0) {
                            this.y = blockRect.y - this.height;
                            this.velocityY = 0;
                            this.isOnGround = true;
                            this.isJumping = false;
                        } else if (this.velocityY < 0) {
                            this.y = blockRect.y + blockRect.height;
                            this.velocityY = 0;
                        }
                    }
                }
            }
        }
    }

    /**
     * Verifica colisão entre dois retângulos
     */
    _rectsCollide(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    /**
     * Minera um bloco
     */
    mineBlock(world, blockX, blockY) {
        const block = world.getBlock(blockX, blockY);
        
        if (block === BLOCK_TYPE.EMPTY) {
            return;
        }
        
        // Verifica se tem a ferramenta necessária
        const requiredTool = MINING_REQUIREMENTS[block] || ITEM_TYPE.EMPTY;
        if (requiredTool !== ITEM_TYPE.EMPTY && this.currentTool !== requiredTool) {
            return;
        }
        
        // Minera o bloco
        const miningTime = MINING_TIME[block] || 1.0;
        this.miningProgress += 1 / (miningTime * 60);
        
        if (this.miningProgress >= 1.0) {
            world.setBlock(blockX, blockY, BLOCK_TYPE.EMPTY);
            this.addItem(block);
            this.miningProgress = 0;
        }
    }

    /**
     * Coloca um bloco
     */
    placeBlock(world, blockX, blockY, blockType) {
        if (world.getBlock(blockX, blockY) === BLOCK_TYPE.EMPTY) {
            world.setBlock(blockX, blockY, blockType);
            this.removeItem(blockType);
        }
    }

    /**
     * Adiciona um item ao inventário
     */
    addItem(itemType, amount = 1) {
        for (let i = 0; i < PLAYER_INVENTORY_SIZE; i++) {
            if (this.inventory[i] === ITEM_TYPE.EMPTY || this.inventory[i] === itemType) {
                this.inventory[i] = itemType;
                return true;
            }
        }
        return false;
    }

    /**
     * Remove um item do inventário
     */
    removeItem(itemType, amount = 1) {
        for (let i = 0; i < PLAYER_INVENTORY_SIZE; i++) {
            if (this.inventory[i] === itemType) {
                this.inventory[i] = ITEM_TYPE.EMPTY;
                return true;
            }
        }
        return false;
    }

    /**
     * Verifica se tem um item
     */
    hasItem(itemType) {
        return this.inventory.includes(itemType);
    }

    /**
     * Conta quantidade de um item
     */
    countItem(itemType) {
        return this.inventory.filter(item => item === itemType).length;
    }

    /**
     * Aplica dano ao jogador
     */
    takeDamage(amount) {
        if (this.damageCooldown <= 0) {
            this.health = Math.max(0, this.health - amount);
            this.damageCooldown = 30;
        }
    }

    /**
     * Cura o jogador
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    /**
     * Realiza um ataque
     */
    attack() {
        if (this.attackCooldown <= 0) {
            this.attackCooldown = 20;
            return true;
        }
        return false;
    }

    /**
     * Retorna o dano do ataque
     */
    getAttackDamage() {
        if (this.currentTool === ITEM_TYPE.SWORD_WOOD) {
            return 10;
        } else if (this.currentTool === ITEM_TYPE.SWORD_STONE) {
            return 20;
        }
        return 5;
    }

    /**
     * Seleciona um slot do inventário
     */
    selectSlot(slot) {
        if (slot >= 0 && slot < PLAYER_INVENTORY_SIZE) {
            this.selectedSlot = slot;
        }
    }

    /**
     * Tenta fazer crafting
     */
    craft(itemType) {
        const recipe = CRAFTING_RECIPES[itemType];
        
        if (!recipe) {
            return false;
        }
        
        // Verifica se tem todos os ingredientes
        for (const [ingredient, amount] of Object.entries(recipe.ingredients)) {
            const count = this.countItem(parseInt(ingredient));
            if (count < amount) {
                return false;
            }
        }
        
        // Remove ingredientes
        for (const [ingredient, amount] of Object.entries(recipe.ingredients)) {
            for (let i = 0; i < amount; i++) {
                this.removeItem(parseInt(ingredient));
            }
        }
        
        // Adiciona resultado
        this.addItem(recipe.result);
        return true;
    }
}
