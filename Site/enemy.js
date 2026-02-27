// ============================================================================
// CLASSE ENEMY - GERENCIA OS INIMIGOS
// ============================================================================

class Enemy {
    /**
     * Inicializa um inimigo (Slime)
     * @param {number} x - Posição X em pixels
     * @param {number} y - Posição Y em pixels
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = SLIME_WIDTH;
        this.height = SLIME_HEIGHT;
        
        // Física
        this.velocityX = 0;
        this.velocityY = 0;
        this.isOnGround = false;
        
        // Saúde
        this.health = SLIME_HEALTH;
        this.maxHealth = SLIME_HEALTH;
        this.damageCooldown = 0;
        
        // Comportamento
        this.direction = Math.random() > 0.5 ? 1 : -1;
        this.changeDirectionTimer = 0;
        this.jumpTimer = 0;
        
        // Combate
        this.attackCooldown = 0;
        this.lastAttackTime = 0;
    }

    /**
     * Retorna o retângulo de colisão do inimigo
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
     * Atualiza o estado do inimigo
     * @param {World} world - Instância do mundo
     * @param {Player} player - Instância do jogador
     */
    update(world, player) {
        // Comportamento: perseguir o jogador
        const distX = player.x - this.x;
        const distY = player.y - this.y;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        // Se o jogador está próximo, perseguir
        if (distance < 300) {
            this.direction = distX > 0 ? 1 : -1;
            this.changeDirectionTimer = 0;
        } else {
            // Comportamento aleatório
            this.changeDirectionTimer--;
            if (this.changeDirectionTimer <= 0) {
                this.direction = Math.random() > 0.5 ? 1 : -1;
                this.changeDirectionTimer = 60 + Math.random() * 60;
            }
        }
        
        // Movimento horizontal
        this.velocityX = this.direction * SLIME_SPEED;
        this.x += this.velocityX;
        this._handleCollisionX(world);
        
        // Aplicar gravidade
        this.velocityY += GRAVITY;
        this.velocityY = Math.min(this.velocityY, PLAYER_MAX_VELOCITY_Y);
        
        // Aplicar movimento vertical
        this.y += this.velocityY;
        this.isOnGround = false;
        this._handleCollisionY(world);
        
        // Pulo aleatório
        this.jumpTimer--;
        if (this.jumpTimer <= 0 && this.isOnGround) {
            this.velocityY = JUMP_FORCE * 0.8;
            this.jumpTimer = 30 + Math.random() * 30;
        }
        
        // Atualizar cooldowns
        if (this.damageCooldown > 0) {
            this.damageCooldown--;
        }
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
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
                        this.direction *= -1;
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
     * Verifica colisão com o jogador
     */
    checkCollisionWithPlayer(player) {
        return this._rectsCollide(this.getRect(), player.getRect());
    }

    /**
     * Aplica dano ao inimigo
     */
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.damageCooldown = 30;
    }

    /**
     * Retorna se o inimigo está vivo
     */
    isAlive() {
        return this.health > 0;
    }

    /**
     * Retorna o dano que o inimigo causa
     */
    getDamage() {
        return SLIME_DAMAGE;
    }
}

/**
 * Gerenciador de inimigos
 */
class EnemyManager {
    constructor() {
        this.enemies = [];
        this.spawnTimer = 0;
        this.maxEnemies = 10;
    }

    /**
     * Atualiza todos os inimigos
     */
    update(world, player) {
        // Atualizar inimigos existentes
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(world, player);
            
            // Remover inimigos mortos
            if (!enemy.isAlive()) {
                this.enemies.splice(i, 1);
            }
        }
        
        // Spawn de novos inimigos
        this.spawnTimer--;
        if (this.spawnTimer <= 0 && this.enemies.length < this.maxEnemies) {
            this._spawnEnemy(world, player);
            this.spawnTimer = 120; // Spawn a cada 2 segundos
        }
    }

    /**
     * Spawna um novo inimigo
     */
    _spawnEnemy(world, player) {
        // Spawna longe do jogador
        const side = Math.random() > 0.5 ? 1 : -1;
        const x = player.x + side * 400 + (Math.random() - 0.5) * 100;
        const y = player.y - 200;
        
        const enemy = new Enemy(x, y);
        this.enemies.push(enemy);
    }

    /**
     * Verifica colisão com o jogador
     */
    checkPlayerCollisions(player) {
        for (const enemy of this.enemies) {
            if (enemy.checkCollisionWithPlayer(player)) {
                return enemy;
            }
        }
        return null;
    }

    /**
     * Aplica dano a inimigos em uma área
     */
    damageInArea(x, y, radius, damage) {
        for (const enemy of this.enemies) {
            const distX = enemy.x - x;
            const distY = enemy.y - y;
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            if (distance < radius) {
                enemy.takeDamage(damage);
            }
        }
    }

    /**
     * Retorna todos os inimigos
     */
    getEnemies() {
        return this.enemies;
    }

    /**
     * Limpa todos os inimigos
     */
    clear() {
        this.enemies = [];
    }
}
