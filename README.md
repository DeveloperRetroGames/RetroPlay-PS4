# RetroPlay Web — versão 1.0.0

Catálogo web estático, com interface Dark Gamer e foco no navegador do PS4.

## Arquivos
- `index.html`: página principal.
- `style.css`: identidade visual responsiva.
- `app.js`: catálogo, busca, filtros, favoritos, detalhes e navegação.
- `jogos.json`: dados editáveis do catálogo.
- `assets/favicon.svg`: ícone.

## Publicar no GitHub Pages
1. Crie um repositório público, por exemplo `RetroPlay-PS4`.
2. Envie o conteúdo desta pasta para a raiz do repositório.
3. Abra Settings → Pages.
4. Em Build and deployment, selecione `Deploy from a branch`.
5. Escolha `main` e `/ (root)`, depois salve.
6. Aguarde a URL indicada pelo GitHub Pages.

## Cadastrar um item
Edite `jogos.json`, dentro do array `jogos`:

```json
{
  "id": "RP0003",
  "nome": "Meu homebrew",
  "categoria": "Homebrew",
  "descricao": "Descrição do conteúdo.",
  "capa": "https://seu-dominio/capas/meu-homebrew.jpg",
  "tamanho": "25 MB",
  "tamanho_mb": 25,
  "versao": "1.0",
  "atualizado": "2026-11-02",
  "download": "https://seu-dominio/arquivos/meu-homebrew.pkg",
  "autorizado": true
}
```

Use apenas arquivos próprios ou cuja distribuição você tenha autorização. O botão de download só é habilitado se `autorizado` for `true` e `download` for uma URL HTTP(S) válida. Categorias dos filtros predefinidos: `Homebrew`, `Aplicativos` e `Utilitários`.

## Recursos
- Busca por nome.
- Filtros por categoria.
- Favoritos salvos no armazenamento local do navegador.
- Ordenação por nome, data de atualização e tamanho (use `tamanho_mb` numérico).
- Tela de detalhes e link de download.
- Atualização manual do JSON.
- Navegação por teclado e suporte experimental à Gamepad API.

## Limitações importantes
- GitHub Pages hospeda arquivos estáticos; não é um servidor de download com métricas de transferência.
- O progresso real de um download iniciado por link externo não pode ser medido com confiabilidade pela página. CORS, memória e limites do navegador também tornam inadequado baixar arquivos grandes via `fetch` e Blob.
- O navegador do PS4 pode não expor o controle à Gamepad API e pode ter limitações de compatibilidade com JavaScript/CSS modernos.
- Uma página web não instala PKG, não acessa livremente o armazenamento do PS4 e não substitui o instalador do console.
- A instalação de conteúdos depende dos recursos legítimos disponíveis no console e do seu ambiente. Esta página não contorna proteções nem licenças.
- Não é possível declarar compatibilidade "100%" sem testar no modelo, firmware, navegador e servidor reais.

## Teste recomendado
1. Abra o endereço do GitHub Pages em computador e celular.
2. Teste busca, filtros, favoritos, ordenação e links.
3. Abra no navegador do PS4 e teste navegação, abertura de detalhes e download de um arquivo pequeno e autorizado.
4. Se algo falhar no PS4, registre a mensagem e a etapa para ajustar compatibilidade.
