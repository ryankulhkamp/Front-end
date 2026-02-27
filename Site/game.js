// ============================================================================
// CLASSE GAME - LÓGICA PRINCIPAL DO JOGO
// ============================================================================

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Mundo e jogador
        this.world = null;
        this.player = null;
        this.enemies = new EnemyManager();
        
        // Câmera
        this.cameraX = 0;
        this.cameraY = 0;
        
        // Tempo
        this.dayTime = 0;
        this.isNight = false;
        this.gameTime = 0;
        
        // Input
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        this.isMouseDown = false;
        this.isShiftDown = false;
        
        // UI
        this.showCrafting = false;
        this.miningBlockX = null;
        this.miningBlockY = null;
        
        // Loop
        this.lastTime = Date.now();
        this.deltaTime = 0;
        
        this._setupEventListeners();
        this._startNewGame();
    }

    /**
     * Configura listeners de eventos
     */
    _setupEventListeners() {
        // Teclado
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Seleção de inventário
            if (e.key >= '1' && e.key <= '5') {
                const slot = parseInt(e.key) - 1;
                this.player.selectSlot(slot);
            }
            
            // Crafting
            if (e.key.toLowerCase() === 'c') {
                this.showCrafting = !this.showCrafting;
            }
            
            // Salvar
            if (e.key.toLowerCase() === 's' && e.ctrlKey) {
                e.preventDefault();
                this._saveWorld();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            if (e.key === 'Shift') {
                this.isShiftDown = false;
            }
        });
        
        // Mouse
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.isShiftDown = e.shiftKey;
        });
        
        this.canvas.addEventListener('mouseup', (e) => {
            this.isMouseDown = false;
        });
        
        // Botões
        document.getElementById('saveBtn').addEventListener('click', () => this._saveWorld());
        document.getElementById('loadBtn').addEventListener('click', () => this._loadWorld());
        document.getElementById('newBtn').addEventListener('click', () => this._startNewGame());
    }

    /**
     * Inicia um novo jogo
     */
    _startNewGame() {
        this.world = new World();
        
        // Encontra um local seguro para spawnar o jogador
        let playerX = this.world.width / 2 * BLOCK_SIZE;
        let playerY = 0;
        
        for (let y = 0; y < this.world.height; y++) {
            if (this.world.isSolid(Math.floor(playerX / BLOCK_SIZE), y)) {
                playerY = (y - 2) * BLOCK_SIZE;
                break;
            }
        }
        
        this.player = new Player(playerX, playerY);
        this.enemies.clear();
        this.gameTime = 0;
        this.dayTime = 0;
        this.isNight = false;
        
        console.log('Novo jogo iniciado!');
    }

    /**
     * Salva o mundo
     */
    _saveWorld() {
        const name = prompt('Nome do mundo:', 'mundo1');
        if (name) {
            this.world.save(name);
            alert(`Mundo salvo: ${name}`);
        }
    }

    /**
     * Carrega um mundo
     */
    _loadWorld() {
        const saves = World.listSaves();
        
        if (saves.length === 0) {
            alert('Nenhum mundo salvo encontrado!');
            return;
        }
        
        const names = saves.map(s => s.name).join(', ');
        const name = prompt(`Mundos disponíveis: ${names}\n\nQual mundo carregar?`, saves[0].name);
        
        if (name) {
            const loaded = World.load(name);
            if (loaded) {
                this.world = loaded;
                
                // Spawna o jogador
                let playerX = this.world.width / 2 * BLOCK_SIZE;
                let playerY = 0;
                
                for (let y = 0; y < this.world.height; y++) {
                    if (this.world.isSolid(Math.floor(playerX / BLOCK_SIZE), y)) {
                        playerY = (y - 2) * BLOCK_SIZE;
                        break;
                    }
                }
                
                this.player = new Player(playerX, playerY);
                this.enemies.clear();
                alert(`Mundo carregado: ${name}`);
            }
        }
    }

    /**
     * Atualiza o jogo
     */
    update() {
        // Atualizar tempo
        this.gameTime++;
        this.dayTime = (this.gameTime / (DAY_LENGTH * 60)) % 1;
        this.isNight = this.dayTime > NIGHT_START && this.dayTime < NIGHT_END;
        
        // Atualizar jogador
        this.player.update(this.world, this.keys);
        
        // Atualizar inimigos
        this.enemies.update(this.world, this.player);
        
        // Verificar colisão com inimigos
        const collidingEnemy = this.enemies.checkPlayerCollisions(this.player);
        if (collidingEnemy) {
            this.player.takeDamage(collidingEnemy.getDamage());
        }
        
        // Mineração
        if (this.isMouseDown && !this.isShiftDown && !this.showCrafting) {
            const blockX = Math.floor((this.mouseX + this.cameraX) / BLOCK_SIZE);
            const blockY = Math.floor((this.mouseY + this.cameraY) / BLOCK_SIZE);
            
            if (this.miningBlockX !== blockX || this.miningBlockY !== blockY) {
                this.miningBlockX = blockX;
                this.miningBlockY = blockY;
                this.player.miningProgress = 0;
            }
            
            this.player.mineBlock(this.world, blockX, blockY);
        } else {
            this.player.miningProgress = 0;
        }
        
        // Colocação de blocos
        if (this.isMouseDown && this.isShiftDown && !this.showCrafting) {
            const blockX = Math.floor((this.mouseX + this.cameraX) / BLOCK_SIZE);
            const blockY = Math.floor((this.mouseY + this.cameraY) / BLOCK_SIZE);
            const currentTool = this.player.inventory[this.player.selectedSlot];
            
            if (currentTool >= ITEM_TYPE.DIRT && currentTool <= ITEM_TYPE.WOOD) {
                this.player.placeBlock(this.world, blockX, blockY, currentTool);
            }
        }
        
        // Ataque
        if (this.isMouseDown && !this.isShiftDown && this.showCrafting) {
            if (this.player.attack()) {
                const damage = this.player.getAttackDamage();
                const range = 100;
                this.enemies.damageInArea(this.player.x, this.player.y, range, damage);
            }
        }
        
        // Atualizar câmera para seguir o jogador
        this._updateCamera();
        
        // Verificar morte
        if (this.player.health <= 0) {
            alert('Você morreu! Novo jogo iniciado.');
            this._startNewGame();
        }
    }

    /**
     * Atualiza a câmera
     */
    _updateCamera() {
        const targetX = this.player.x - this.canvas.width / 2;
        const targetY = this.player.y - this.canvas.height / 2;
        
        this.cameraX = targetX;
        this.cameraY = targetY;
        
        // Limitar câmera aos limites do mundo
        this.cameraX = Math.max(0, Math.min(this.cameraX, this.world.width * BLOCK_SIZE - this.canvas.width));
        this.cameraY = Math.max(0, Math.min(this.cameraY, this.world.height * BLOCK_SIZE - this.canvas.height));
    }

    /**
     * Renderiza o jogo
     */
    render() {
        // Limpar canvas
        const bgColor = this.isNight ? COLORS.CAVE_BG : COLORS.FOREST_BG;
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Salvar contexto
        this.ctx.save();
        
        // Aplicar câmera
        this.ctx.translate(-this.cameraX, -this.cameraY);
        
        // Renderizar blocos
        this._renderBlocks();
        
        // Renderizar inimigos
        this._renderEnemies();
        
        // Renderizar jogador
        this._renderPlayer();
        
        // Renderizar mineração
        if (this.player.miningProgress > 0) {
            this._renderMiningProgress();
        }
        
        // Restaurar contexto
        this.ctx.restore();
        
        // Renderizar UI
        this._renderUI();
    }

    /**
     * Renderiza os blocos
     */
    _renderBlocks() {
        const startX = Math.floor(this.cameraX / BLOCK_SIZE);
        const startY = Math.floor(this.cameraY / BLOCK_SIZE);
        const endX = Math.ceil((this.cameraX + this.canvas.width) / BLOCK_SIZE);
        const endY = Math.ceil((this.cameraY + this.canvas.height) / BLOCK_SIZE);
        
        for (let y = Math.max(0, startY); y < Math.min(this.world.height, endY); y++) {
            for (let x = Math.max(0, startX); x < Math.min(this.world.width, endX); x++) {
                const block = this.world.getBlock(x, y);
                
                if (block !== BLOCK_TYPE.EMPTY) {
                    const color = BLOCK_COLORS[block];
                    this.ctx.fillStyle = color;
                    this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    
                    // Borda do bloco
                    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
                    this.ctx.lineWidth = 1;
                    this.ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            }
        }
    }

    /**
     * Renderiza o jogador
     */
    _renderPlayer() {
        // Corpo
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Borda
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Olhos
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.player.x + 6, this.player.y + 8, 4, 4);
        this.ctx.fillRect(this.player.x + 14, this.player.y + 8, 4, 4);
    }

    /**
     * Renderiza os inimigos
     */
    _renderEnemies() {
        for (const enemy of this.enemies.getEnemies()) {
            // Corpo (Slime)
            this.ctx.fillStyle = '#90EE90';
            this.ctx.beginPath();
            this.ctx.ellipse(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 
                           enemy.width / 2, enemy.height / 2, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Borda
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Olhos
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(enemy.x + 6, enemy.y + 8, 4, 4);
            this.ctx.fillRect(enemy.x + 14, enemy.y + 8, 4, 4);
            
            // Barra de saúde
            const barWidth = 24;
            const barHeight = 3;
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(enemy.x - 2, enemy.y - 8, barWidth, barHeight);
            this.ctx.fillStyle = '#00FF00';
            this.ctx.fillRect(enemy.x - 2, enemy.y - 8, (enemy.health / enemy.maxHealth) * barWidth, barHeight);
        }
    }

    /**
     * Renderiza progresso de mineração
     */
    _renderMiningProgress() {
        if (this.miningBlockX !== null && this.miningBlockY !== null) {
            const x = this.miningBlockX * BLOCK_SIZE;
            const y = this.miningBlockY * BLOCK_SIZE;
            
            // Sobreposição de mineração
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            this.ctx.fillRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
            
            // Barra de progresso
            const barWidth = BLOCK_SIZE - 4;
            const barHeight = 4;
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(x + 2, y + BLOCK_SIZE - 6, barWidth, barHeight);
            this.ctx.fillStyle = '#FFD700';
            this.ctx.fillRect(x + 2, y + BLOCK_SIZE - 6, barWidth * this.player.miningProgress, barHeight);
        }
    }

    /**
     * Renderiza UI
     */
    _renderUI() {
        // Atualizar saúde
        const healthPercent = (this.player.health / this.player.maxHealth) * 100;
        document.getElementById('healthFill').style.width = healthPercent + '%';
        document.getElementById('healthText').textContent = `${Math.floor(this.player.health)}/${this.player.maxHealth}`;
        
        // Atualizar tempo
        const hour = Math.floor((this.dayTime * 24) % 24);
        const timeText = this.isNight ? `Noite (${hour}h)` : `Dia (${hour}h)`;
        document.getElementById('timeText').textContent = timeText;
        
        // Atualizar inventário
        this._updateInventoryUI();
        
        // Atualizar crafting
        if (this.showCrafting) {
            this._updateCraftingUI();
        } else {
            document.getElementById('craftingPanel').style.display = 'none';
        }
    }

    /**
     * Atualiza UI do inventário
     */
    _updateInventoryUI() {
        const grid = document.getElementById('inventoryGrid');
        grid.innerHTML = '';
        
        for (let i = 0; i < PLAYER_INVENTORY_SIZE; i++) {
            const item = this.player.inventory[i];
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            
            if (i === this.player.selectedSlot) {
                slot.classList.add('selected');
            }
            
            if (item === ITEM_TYPE.EMPTY) {
                slot.classList.add('empty');
                slot.textContent = '';
            } else {
                const icon = ITEM_ICONS[item] || '?';
                const name = ITEM_NAMES[item] || 'Desconhecido';
                slot.innerHTML = `<div class="slot-item"><div class="slot-icon">${icon}</div><div style="font-size: 9px;">${name.substring(0, 8)}</div></div>`;
            }
            
            slot.addEventListener('click', () => this.player.selectSlot(i));
            grid.appendChild(slot);
        }
    }

    /**
     * Atualiza UI de crafting
     */
    _updateCraftingUI() {
        const panel = document.getElementById('craftingPanel');
        const recipes = document.getElementById('craftingRecipes');
        
        panel.style.display = 'block';
        recipes.innerHTML = '';
        
        for (const [itemType, recipe] of Object.entries(CRAFTING_RECIPES)) {
            const div = document.createElement('div');
            div.className = 'recipe-item';
            
            let ingredientsText = '';
            for (const [ingredient, amount] of Object.entries(recipe.ingredients)) {
                const name = ITEM_NAMES[ingredient];
                const count = this.player.countItem(parseInt(ingredient));
                ingredientsText += `${name}: ${count}/${amount} `;
            }
            
            const canCraft = Object.entries(recipe.ingredients).every(([ingredient, amount]) => {
                return this.player.countItem(parseInt(ingredient)) >= amount;
            });
            
            div.innerHTML = `
                <div class="recipe-name">${recipe.name}</div>
                <div class="recipe-ingredients">${ingredientsText}</div>
                <button class="recipe-button" ${!canCraft ? 'disabled' : ''}>Craftar</button>
            `;
            
            const button = div.querySelector('button');
            button.addEventListener('click', () => {
                if (this.player.craft(parseInt(itemType))) {
                    console.log(`Craftado: ${recipe.name}`);
                }
            });
            
            recipes.appendChild(div);
        }
    }

    /**
     * Loop principal do jogo
     */
    loop() {
        const now = Date.now();
        this.deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.loop());
    }

    /**
     * Inicia o jogo
     */
    start() {
        console.log('🎮 Terraria 2D iniciado!');
        this.loop();
    }
}

// Iniciar o jogo quando a página carregar
window.addEventListener('load', () => {
    const game = new Game();
    game.start();
});
