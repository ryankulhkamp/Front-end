# 🚀 Guia: Hospedando no GitHub Pages

## Passo 1: Criar um Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique em "New repository"
3. **IMPORTANTE**: Nomeie o repositório como `seu-usuario.github.io`
   - Exemplo: `joao123.github.io`
4. Deixe como "Public"
5. Clique em "Create repository"

## Passo 2: Preparar os Arquivos

Você precisa apenas de **UM arquivo**:
- `index.html` (versão consolidada - 32KB)

Este arquivo contém TODO o código do jogo em um único arquivo!

## Passo 3: Upload dos Arquivos

### Opção A: Via GitHub Web Interface (Mais Fácil)

1. Abra seu repositório no GitHub
2. Clique em "Add file" → "Upload files"
3. Arraste o arquivo `index.html` para a área de upload
4. Clique em "Commit changes"

### Opção B: Via Git (Terminal)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/seu-usuario.github.io.git
cd seu-usuario.github.io

# Copie o arquivo index.html para o diretório
cp /caminho/para/index.html .

# Commit e push
git add index.html
git commit -m "Adicionar Terraria 2D"
git push origin main
```

## Passo 4: Acessar o Jogo

Após alguns minutos, acesse:
```
https://seu-usuario.github.io
```

**Pronto!** Seu jogo está online! 🎮

## ✅ Verificar se Está Funcionando

- A página deve carregar em segundos
- Você deve ver o título "⛏️ Terraria 2D"
- O canvas com o mundo deve aparecer
- Os botões de controle devem estar visíveis

## 🔧 Solução de Problemas

### Página em branco
- Aguarde 5-10 minutos para o GitHub Pages processar
- Limpe o cache do navegador (Ctrl+F5)
- Verifique se o repositório é público

### Arquivo não carrega
- Verifique se o arquivo `index.html` está na raiz do repositório
- Não coloque em subpastas

### Jogo não funciona
- Abra o console (F12) e procure por erros
- Verifique se JavaScript está habilitado
- Tente em outro navegador

## 📝 Estrutura Recomendada

```
seu-usuario.github.io/
├── index.html          ← Arquivo principal do jogo
├── README.md           ← (Opcional) Descrição do projeto
└── .gitignore          ← (Opcional) Arquivos a ignorar
```

## 🎮 Jogar Online

Uma vez hospedado, qualquer pessoa pode acessar:
- Compartilhe o link: `https://seu-usuario.github.io`
- Funciona em qualquer navegador moderno
- Sem instalação necessária!

## 💾 Salvar Mundos

O jogo salva mundos no localStorage do navegador:
- Cada mundo é salvo localmente
- Os dados persistem entre sessões
- Limite: ~5-10MB por domínio

## 🆙 Atualizações Futuras

Para atualizar o jogo:

1. Edite o arquivo `index.html` localmente
2. Faça upload novamente via GitHub
3. Aguarde alguns minutos para processar
4. Limpe o cache do navegador (Ctrl+F5)

## 📱 Compatibilidade

O jogo funciona em:
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Mobile (com toque)

## 🎯 Próximos Passos

Depois de hospedado, você pode:
1. Adicionar um `README.md` com instruções
2. Criar uma página de apresentação
3. Adicionar mais features ao jogo
4. Compartilhar com amigos!

---

**Dúvidas?** Consulte a [documentação oficial do GitHub Pages](https://docs.github.com/en/pages)
