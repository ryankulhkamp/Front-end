// ============================================================================
// CLASSE WORLD - GERENCIA O MUNDO PROCEDURAL
// ============================================================================

class World {
    /**
     * Inicializa o mundo
     * @param {number} width - Largura do mundo em blocos
     * @param {number} height - Altura do mundo em blocos
     * @param {number} seed - Seed para geração procedural
     */
    constructor(width = WORLD_WIDTH, height = WORLD_HEIGHT, seed = null) {
        this.width = width;
        this.height = height;
        this.seed = seed || Math.floor(Math.random() * 1000000);
        
        // Inicializa arrays de blocos e biomas
        this.blocks = Array(height).fill(null).map(() => Array(width).fill(BLOCK_TYPE.EMPTY));
        this.biomes = Array(height).fill(null).map(() => Array(width).fill(BIOME_TYPE.FOREST));
        
        this._generateWorld();
    }

    /**
     * Gera o mundo proceduralmente
     */
    _generateWorld() {
        // Define seed para geração determinística
        this.random = this._seededRandom(this.seed);
        
        // Gera altura do terreno para cada coluna
        const heights = this._generateTerrainHeights();
        
        // Preenche o mundo com blocos
        for (let x = 0; x < this.width; x++) {
            const height = heights[x];
            const biome = this._getBiomeAt(x);
            
            for (let y = 0; y < this.height; y++) {
                if (y < height) {
                    const block = this._getBlockForPosition(x, y, height, biome);
                    this.blocks[y][x] = block;
                    this.biomes[y][x] = biome;
                }
            }
        }
    }

    /**
     * Gera alturas do terreno usando ruído procedural
     */
    _generateTerrainHeights() {
        const heights = [];
        
        for (let x = 0; x < this.width; x++) {
            let noise = 0;
            
            // Múltiplas oitavas de ruído
            for (let octave = 0; octave < 3; octave++) {
                const frequency = Math.pow(2, octave);
                const amplitude = 1 / (octave + 1);
                
                const value = this._seededRandom(this.seed + x + octave * 1000)();
                noise += value * amplitude;
            }
            
            // Normaliza a altura
            let height = Math.floor(this.height * 0.6 - noise * 20);
            height = Math.max(10, Math.min(this.height - 10, height));
            heights.push(height);
        }
        
        // Suaviza as alturas
        let smoothed = [...heights];
        for (let iter = 0; iter < 2; iter++) {
            for (let x = 1; x < this.width - 1; x++) {
                smoothed[x] = Math.floor((heights[x - 1] + heights[x] * 2 + heights[x + 1]) / 4);
            }
            heights.splice(0, heights.length, ...smoothed);
        }
        
        return heights;
    }

    /**
     * Determina o bioma em uma posição X
     */
    _getBiomeAt(x) {
        const region = Math.floor(x / (this.width / 3));
        
        if (region === 0) return BIOME_TYPE.FOREST;
        if (region === 1) return BIOME_TYPE.DESERT;
        return BIOME_TYPE.CAVE;
    }

    /**
     * Determina qual bloco colocar em uma posição
     */
    _getBlockForPosition(x, y, surfaceHeight, biome) {
        const depth = y - surfaceHeight;
        
        // Superfície
        if (depth === 0) {
            return biome === BIOME_TYPE.DESERT ? BLOCK_TYPE.SAND : BLOCK_TYPE.GRASS;
        }
        
        // Camada superficial
        if (depth <= 5) {
            return biome === BIOME_TYPE.DESERT ? BLOCK_TYPE.SAND : BLOCK_TYPE.DIRT;
        }
        
        // Camada de pedra
        if (depth <= 30) {
            if (this._seededRandom(this.seed + x * 73 + y * 97)() < 0.1) {
                return BLOCK_TYPE.EMPTY;
            }
            return BLOCK_TYPE.STONE;
        }
        
        // Camada profunda
        if (this._seededRandom(this.seed + x * 73 + y * 97)() < 0.3) {
            return BLOCK_TYPE.EMPTY;
        }
        return BLOCK_TYPE.STONE;
    }

    /**
     * Gerador de números aleatórios com seed
     */
    _seededRandom(seed) {
        return function() {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
    }

    /**
     * Retorna o bloco em uma posição
     */
    getBlock(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.blocks[y][x];
        }
        return BLOCK_TYPE.EMPTY;
    }

    /**
     * Define um bloco em uma posição
     */
    setBlock(x, y, blockType) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.blocks[y][x] = blockType;
        }
    }

    /**
     * Retorna o bioma em uma posição
     */
    getBiome(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.biomes[y][x];
        }
        return BIOME_TYPE.FOREST;
    }

    /**
     * Verifica se um bloco é sólido
     */
    isSolid(x, y) {
        const block = this.getBlock(x, y);
        return block !== BLOCK_TYPE.EMPTY;
    }

    /**
     * Salva o mundo em localStorage
     */
    save(name = 'world') {
        const data = {
            seed: this.seed,
            width: this.width,
            height: this.height,
            blocks: this.blocks,
            biomes: this.biomes,
            timestamp: Date.now(),
        };
        
        localStorage.setItem(`terraria_${name}`, JSON.stringify(data));
        console.log(`Mundo salvo: ${name}`);
    }

    /**
     * Carrega um mundo do localStorage
     */
    static load(name = 'world') {
        const data = localStorage.getItem(`terraria_${name}`);
        
        if (!data) {
            console.log('Mundo não encontrado');
            return null;
        }
        
        const parsed = JSON.parse(data);
        const world = new World(parsed.width, parsed.height, parsed.seed);
        world.blocks = parsed.blocks;
        world.biomes = parsed.biomes;
        
        console.log(`Mundo carregado: ${name}`);
        return world;
    }

    /**
     * Lista todos os mundos salvos
     */
    static listSaves() {
        const saves = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('terraria_')) {
                const name = key.replace('terraria_', '');
                const data = JSON.parse(localStorage.getItem(key));
                saves.push({
                    name,
                    timestamp: data.timestamp,
                });
            }
        }
        return saves;
    }

    /**
     * Deleta um mundo salvo
     */
    static delete(name = 'world') {
        localStorage.removeItem(`terraria_${name}`);
        console.log(`Mundo deletado: ${name}`);
    }
}
