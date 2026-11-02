(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const grid = $("gameGrid"), search = $("searchInput"), filters = $("filters");
  const count = $("itemCount"), empty = $("emptyState"), dialog = $("detailsDialog");
  const dialogContent = $("dialogContent"), toast = $("toast");
  const refreshButton = $("refreshCatalog"), favoritesButton = $("favoritesOnly");
  const sortSelect = $("sortSelect"), statusLine = $("catalogStatus");
  const FAVORITES_KEY = "retroplay_ps4_favorites_v1";
  let games = [], activeCategory = "Todos", favoritesOnly = false;
  let favoriteIds = loadFavorites(), toastTimer = null, lastFocused = null;
  let previousPadButtons = [];

  $("year").textContent = new Date().getFullYear();
  $("closeDialog").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => { if (lastFocused && document.contains(lastFocused)) lastFocused.focus(); });
  refreshButton.addEventListener("click", () => loadCatalog(true));
  search.addEventListener("input", render);
  sortSelect.addEventListener("change", render);
  favoritesButton.addEventListener("click", () => {
    favoritesOnly = !favoritesOnly;
    favoritesButton.setAttribute("aria-pressed", String(favoritesOnly));
    favoritesButton.textContent = favoritesOnly ? "♥ FAVORITOS" : "♡ FAVORITOS";
    render();
  });

  function loadFavorites() {
    try {
      const value = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
      return new Set(Array.isArray(value) ? value.filter(v => typeof v === "string") : []);
    } catch (_) { return new Set(); }
  }
  function saveFavorites() {
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favoriteIds])); }
    catch (_) { showToast("Não foi possível salvar favoritos neste navegador."); }
  }
  function isFavorite(game) { return favoriteIds.has(String(game.id || game.nome)); }
  function toggleFavorite(game) {
    const id = String(game.id || game.nome);
    if (favoriteIds.has(id)) favoriteIds.delete(id); else favoriteIds.add(id);
    saveFavorites(); render();
    showToast(favoriteIds.has(id) ? "Adicionado aos favoritos." : "Removido dos favoritos.");
  }
  function safeText(value, fallback = "Não informado") {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
  }
  function safeUrl(value) {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const url = new URL(value, window.location.href);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch (_) { return ""; }
  }
  function showToast(message) {
    toast.textContent = message; toast.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }
  function makeImage(url, alt) {
    const img = document.createElement("img"); img.src = url; img.alt = alt; img.loading = "lazy";
    img.onerror = () => { img.remove(); };
    return img;
  }
  function openDetails(game, card) {
    lastFocused = card || document.activeElement;
    dialogContent.replaceChildren();
    const cover = document.createElement("div"); cover.className = "dialog-cover";
    const imageUrl = safeUrl(game.capa);
    if (imageUrl) cover.appendChild(makeImage(imageUrl, "Capa de " + safeText(game.nome)));
    const top = document.createElement("div"); top.className = "details-topline";
    const title = document.createElement("h2"); title.textContent = safeText(game.nome);
    const fav = document.createElement("button"); fav.className = "details-favorite";
    fav.type = "button"; fav.textContent = isFavorite(game) ? "♥ Favorito" : "♡ Favoritar";
    fav.addEventListener("click", () => { toggleFavorite(game); fav.textContent = isFavorite(game) ? "♥ Favorito" : "♡ Favoritar"; });
    top.append(title, fav);
    const description = document.createElement("p"); description.textContent = safeText(game.descricao, "Sem descrição disponível.");
    const lines = [
      ["Categoria", game.categoria], ["Tamanho informado", game.tamanho],
      ["Versão", game.versao], ["ID", game.id]
    ];
    const metadata = lines.filter(([,v]) => v !== undefined && v !== null && String(v).trim() !== "")
      .map(([label,value]) => { const el=document.createElement("div"); el.className="detail-line"; el.textContent=label+": "+value; return el; });
    const downloadUrl = safeUrl(game.download);
    const link = document.createElement("a"); link.className = "download-link";
    if (downloadUrl && game.autorizado === true) {
      link.href = downloadUrl; link.target = "_blank"; link.rel = "noopener noreferrer";
      link.textContent = "ABRIR DOWNLOAD";
    } else {
      link.href = "#"; link.classList.add("disabled"); link.textContent = "DOWNLOAD INDISPONÍVEL";
      link.addEventListener("click", e => e.preventDefault());
    }
    const note = document.createElement("div"); note.className = "download-note";
    note.textContent = "O download é iniciado pelo navegador. O site não consegue instalar PKG nem garantir barra de progresso em downloads externos; isso depende do navegador e do servidor.";
    dialogContent.append(cover, top, description, ...metadata, link, note);
    if (!dialog.open) dialog.showModal();
    setTimeout(() => (dialog.querySelector(".details-favorite") || link).focus(), 20);
  }
  function makeCard(game) {
    const card = document.createElement("article");
    card.className = "game-card"; card.tabIndex = 0; card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Detalhes: " + safeText(game.nome));
    const cover = document.createElement("div"); cover.className = "cover";
    const imageUrl = safeUrl(game.capa);
    if (imageUrl) {
      const img = makeImage(imageUrl, "Capa de " + safeText(game.nome));
      img.onerror = () => { img.remove(); const p=document.createElement("span"); p.className="cover-placeholder"; p.textContent="RP"; cover.prepend(p); };
      cover.appendChild(img);
    } else {
      const p = document.createElement("span"); p.className = "cover-placeholder"; p.textContent = "RP"; cover.appendChild(p);
    }
    const tag = document.createElement("span"); tag.className = "tag"; tag.textContent = safeText(game.categoria, "Conteúdo");
    const fav = document.createElement("button"); fav.className = "favorite-button" + (isFavorite(game) ? " active" : "");
    fav.type = "button"; fav.setAttribute("aria-label", isFavorite(game) ? "Remover dos favoritos" : "Adicionar aos favoritos");
    fav.textContent = isFavorite(game) ? "♥" : "♡";
    fav.addEventListener("click", e => { e.stopPropagation(); toggleFavorite(game); });
    cover.append(tag, fav);
    const body = document.createElement("div"); body.className = "card-body";
    const title = document.createElement("h3"); title.textContent = safeText(game.nome, "Sem nome");
    const meta = document.createElement("div"); meta.className = "card-meta";
    const cat = document.createElement("span"); cat.textContent = safeText(game.categoria, "Geral");
    const size = document.createElement("span"); size.textContent = safeText(game.tamanho, "—");
    meta.append(cat, size);
    const button = document.createElement("button"); button.className = "card-action"; button.type = "button";
    button.textContent = "VER DETALHES";
    button.addEventListener("click", e => { e.stopPropagation(); openDetails(game, card); });
    body.append(title, meta, button); card.append(cover, body);
    card.addEventListener("click", () => openDetails(game, card));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDetails(game, card); }
    });
    return card;
  }
  function render() {
    const term = search.value.trim().toLocaleLowerCase("pt-BR");
    let filtered = games.filter(game =>
      safeText(game.nome, "").toLocaleLowerCase("pt-BR").includes(term) &&
      (activeCategory === "Todos" || safeText(game.categoria, "") === activeCategory) &&
      (!favoritesOnly || isFavorite(game))
    );
    const sort = sortSelect.value;
    if (sort === "name") filtered.sort((a,b)=>safeText(a.nome,"").localeCompare(safeText(b.nome,""),"pt-BR"));
    if (sort === "newest") filtered.sort((a,b)=>String(b.atualizado||"").localeCompare(String(a.atualizado||"")));
    if (sort === "size") filtered.sort((a,b)=>(Number(a.tamanho_mb)||Infinity)-(Number(b.tamanho_mb)||Infinity));
    grid.replaceChildren();
    filtered.forEach(game => grid.appendChild(makeCard(game)));
    empty.hidden = filtered.length !== 0;
    count.textContent = filtered.length + (filtered.length === 1 ? " ITEM" : " ITENS");
  }
  filters.addEventListener("click", e => {
    const button = e.target.closest("button[data-category]"); if (!button) return;
    activeCategory = button.dataset.category;
    filters.querySelectorAll(".filter").forEach(item=>item.classList.toggle("active",item===button));
    render();
  });
  async function loadCatalog(manual = false) {
    refreshButton.disabled = true; refreshButton.textContent = "CARREGANDO...";
    statusLine.textContent = "Buscando catálogo...";
    try {
      const response = await fetch("jogos.json?v=" + Date.now(), {cache:"no-store"});
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      if (!data || !Array.isArray(data.jogos)) throw new Error("JSON sem lista 'jogos'");
      games = data.jogos.filter(item=>item && typeof item==="object");
      $("catalogVersion").textContent = "Catálogo v" + safeText(data.versao,"1.0");
      statusLine.textContent = data.atualizacao ? "Atualizado em " + data.atualizacao : "Catálogo carregado.";
      render(); if (manual) showToast("Catálogo atualizado.");
    } catch(error) {
      grid.replaceChildren();
      const message=document.createElement("div"); message.className="loading-card";
      message.textContent="Não foi possível carregar jogos.json. Verifique se o arquivo está publicado junto ao site.";
      grid.appendChild(message); count.textContent="CATÁLOGO INDISPONÍVEL";
      statusLine.textContent="Falha ao carregar catálogo."; console.error("RetroPlay:",error);
      if(manual) showToast("Falha ao atualizar catálogo.");
    } finally {
      refreshButton.disabled=false; refreshButton.textContent="↻ ATUALIZAR";
    }
  }

  function visibleCards(){return Array.from(grid.querySelectorAll(".game-card"));}
  function moveFocus(direction) {
    const cards=visibleCards(); if(!cards.length)return;
    let index=cards.indexOf(document.activeElement); if(index<0)index=0;
    const width=cards[0].getBoundingClientRect().width;
    const columns=Math.max(1,Math.round(grid.clientWidth/(width+17)));
    if(direction==="left")index=Math.max(0,index-1);
    if(direction==="right")index=Math.min(cards.length-1,index+1);
    if(direction==="up")index=Math.max(0,index-columns);
    if(direction==="down")index=Math.min(cards.length-1,index+columns);
    cards[index].focus();
  }
  document.addEventListener("keydown",e=>{
    if(dialog.open){if(e.key==="Escape"||e.key==="Backspace"){e.preventDefault();dialog.close();}return;}
    const map={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down"};
    if(map[e.key] && e.target!==search && e.target.tagName!=="SELECT"){e.preventDefault();moveFocus(map[e.key]);}
  });
  function pollGamepad(){
    const pads=navigator.getGamepads?navigator.getGamepads():[];
    const pad=Array.from(pads).find(Boolean);
    if(pad){
      const pressed=pad.buttons.map(b=>b.pressed), just=i=>pressed[i]&&!previousPadButtons[i];
      if(just(14))moveFocus("left"); if(just(15))moveFocus("right");
      if(just(12))moveFocus("up"); if(just(13))moveFocus("down");
      if(just(0)){
        if(dialog.open){const active=dialog.querySelector(":focus");if(active&&active.tagName==="A")active.click();else if(active)active.click();}
        else if(document.activeElement.classList.contains("game-card"))document.activeElement.click();
        else {const first=visibleCards()[0];if(first)first.focus();}
      }
      if(just(1)&&dialog.open)dialog.close();
      previousPadButtons=pressed;
    }else previousPadButtons=[];
    requestAnimationFrame(pollGamepad);
  }
  if("getGamepads" in navigator)requestAnimationFrame(pollGamepad);
  loadCatalog();
})();