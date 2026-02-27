# ⛏️ Terraria 2D - Sandbox Game

Um jogo 2D estilo Terraria desenvolvido em **JavaScript/Canvas** que funciona diretamente no navegador e pode ser hospedado no **GitHub Pages**.

## 🎮 Características

### 🌍 Mundo
- **Geração Procedural**: Mundo gerado aleatoriamente com diferentes biomas
- **Múltiplos Biomas**: Floresta, Deserto e Caverna
- **Blocos Variados**: Terra, Pedra, Areia, Madeira, Grama
- **Ciclo Dia/Noite**: Sistema dinâmico de dia e noite
- **Salvamento**: Salve e carregue seus mundos

### 👤 Jogador
- **Movimento Fluido**: Controles responsivos com A/D ou Setas
- **Física Realista**: Gravidade, pulo e colisão com blocos
- **Barra de Saúde**: Sistema de vida com dano e cura
- **Inventário**: 10 slots para carregar itens
- **Ferramentas**: Picaretas e espadas com diferentes poderes

### ⛏️ Gameplay
- **Mineração**: Extraia blocos com ferramentas apropriadas
- **Colocação**: Coloque blocos para construir
- **Crafting**: Crie ferramentas e armas a partir de recursos
- **Combate**: Sistema básico de ataque corpo a corpo

### 👾 Inimigos
- **Slimes**: Inimigos que perseguem o jogador
- **IA Inteligente**: Comportamento dinâmico e adaptativo
- **Dano**: Tome dano ao colidir com inimigos
- **Spawn Dinâmico**: Inimigos aparecem durante o jogo

### 🎨 Visual
- **Pixel Art**: Gráficos em estilo pixel art
- **Animações**: Movimento fluido e responsivo
- **Interface Clara**: UI intuitiva e fácil de usar
- **Efeitos Visuais**: Barras de progresso e indicadores

## 🎮 Controles

| Ação | Tecla |
|------|-------|
| Mover Esquerda | **A** ou **Seta Esquerda** |
| Mover Direita | **D** ou **Seta Direita** |
| Pular | **Espaço** ou **W** |
| Minerar | **Clique do Mouse** |
| Colocar Bloco | **Shift + Clique** |
| Selecionar Slot 1-5 | **1-5** |
| Abrir Crafting | **C** |
| Salvar Mundo | **Ctrl + S** |

## 📦 Como Usar

### Opção 1: Executar Localmente

1. **Clone ou baixe os arquivos**:
```bash
git clone https://github.com/seu-usuario/terraria-game.git
cd terraria-game
```

2. **Abra um servidor local** (escolha um):

**Python 3**:
```bash
python -m http.server 8000
```

**Node.js**:
```bash
npx http-server
```

**PHP**:
```bash
php -S localhost:8000
```

3. **Abra no navegador**:
```
http://localhost:8000
```

### Opção 2: GitHub Pages

1. **Faça fork ou crie um novo repositório** chamado `seu-usuario.github.io`

2. **Copie todos os arquivos** para a raiz do repositório:
```
index.html
style.css
constants.js
world.js
player.js
enemy.js
game.js
README.md
```

3. **Faça commit e push**:
```bash
git add .
git commit -m "Adicionar Terraria 2D"
git push origin main
```

4. **Acesse**:
```
https://seu-usuario.github.io
```

## 📁 Estrutura de Arquivos

```
terraria-game/
├── index.html          # Página principal do jogo
├── style.css           # Estilos CSS
├── constants.js        # Constantes do jogo
├── world.js            # Classe World (geração procedural)
├── player.js           # Classe Player (jogador)
├── enemy.js            # Classe Enemy (inimigos)
├── game.js             # Classe Game (lógica principal)
└── README.md           # Este arquivo
```

## 🔧 Arquitetura

### Classes Principais

#### `World`
Gerencia o mundo procedural, blocos e biomas.
- `getBlock(x, y)` - Retorna o tipo de bloco
- `setBlock(x, y, type)` - Define um bloco
- `isSolid(x, y)` - Verifica se é sólido
- `save(name)` - Salva o mundo
- `load(name)` - Carrega um mundo

#### `Player`
Controla o jogador, movimento, saúde e inventário.
- `update(world, keys)` - Atualiza o estado
- `mineBlock(world, x, y)` - Minera um bloco
- `placeBlock(world, x, y, type)` - Coloca um bloco
- `addItem(type)` - Adiciona item ao inventário
- `craft(itemType)` - Realiza crafting

#### `Enemy`
Representa um inimigo (Slime).
- `update(world, player)` - Atualiza comportamento
- `takeDamage(amount)` - Aplica dano
- `isAlive()` - Verifica se está vivo

#### `EnemyManager`
Gerencia todos os inimigos.
- `update(world, player)` - Atualiza todos
- `checkPlayerCollisions(player)` - Verifica colisão
- `damageInArea(x, y, radius, damage)` - Dano em área

#### `Game`
Lógica principal do jogo.
- `update()` - Atualiza o jogo
- `render()` - Renderiza na tela
- `loop()` - Loop principal

## 🛠️ Desenvolvimento

### Adicionar Novo Bloco

1. Adicione a constante em `constants.js`:
```javascript
BLOCK_TYPE.NOVO_BLOCO = 6;
BLOCK_COLORS[6] = '#FFFFFF';
BLOCK_NAMES[6] = 'Novo Bloco';
```

2. Configure mineração em `constants.js`:
```javascript
MINING_TIME[6] = 0.5;
MINING_REQUIREMENTS[6] = ITEM_TYPE.PICKAXE_STONE;
```

### Adicionar Nova Ferramenta

1. Adicione em `constants.js`:
```javascript
ITEM_TYPE.NOVA_FERRAMENTA = 9;
ITEM_NAMES[9] = 'Nova Ferramenta';
ITEM_ICONS[9] = '🔧';
```

2. Configure a receita de crafting:
```javascript
CRAFTING_RECIPES[9] = {
    name: 'Nova Ferramenta',
    ingredients: { [ITEM_TYPE.WOOD]: 5 },
    result: 9,
};
```

### Modificar Física

Edite em `constants.js`:
```javascript
GRAVITY = 0.6;           // Aumentar = mais pesado
JUMP_FORCE = -15;        // Mais negativo = pulo mais alto
PLAYER_SPEED = 5;        // Velocidade do jogador
```

## 💾 Sistema de Salvamento

O jogo usa **localStorage** do navegador para salvar mundos:
- Cada mundo é salvo como um objeto JSON
- Máximo de dados: ~5-10MB por domínio
- Os dados persistem entre sessões

### Gerenciar Saves

```javascript
// Salvar
world.save('meu_mundo');

// Carregar
const world = World.load('meu_mundo');

// Listar
const saves = World.listSaves();

// Deletar
World.delete('meu_mundo');
```

## 🐛 Troubleshooting

### Jogo não carrega
- Verifique se todos os arquivos `.js` estão no mesmo diretório
- Abra o console (F12) e procure por erros

### Mundo muito lento
- Reduza `WORLD_WIDTH` e `WORLD_HEIGHT` em `constants.js`
- Diminua `maxEnemies` em `enemy.js`

### Não consegue salvar
- Verifique se localStorage está habilitado
- Tente limpar o cache do navegador

## 📊 Estatísticas

- **Linhas de Código**: ~1500+
- **Classes**: 5 principais
- **Biomas**: 3
- **Blocos**: 6 tipos
- **Itens**: 9 tipos
- **Receitas**: 4

## 🎯 Roadmap Futuro

- [ ] Mais biomas (Nether, Céu)
- [ ] Mais inimigos (Zumbis, Esqueletos)
- [ ] Boss fights
- [ ] Sistema de magia
- [ ] NPCs e comércio
- [ ] Multiplayer online
- [ ] Mobile touch controls
- [ ] Modo criativo

## 📝 Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais e pessoais.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se livre para:
- Reportar bugs
- Sugerir novas features
- Melhorar o código
- Adicionar novos conteúdos

## 👨‍💻 Autor

Desenvolvido como um projeto educacional de jogo 2D em JavaScript.

---

**Divirta-se explorando o mundo de Terraria 2D!** ⛏️🎮
