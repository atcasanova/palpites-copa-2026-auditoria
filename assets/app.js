const REPOSITORY = {
  owner: "atcasanova",
  name: "palpites-copa-2026-auditoria",
};

const FALLBACK_BLOCK_FILES = [
  "block_000001_match_1.json",
  "block_000002_match_2.json",
  "block_000003_match_7.json",
  "block_000004_match_19.json",
  "block_000005_match_8.json",
  "block_000006_match_13.json",
  "block_000007_match_14.json",
  "block_000008_match_20.json",
  "block_000009_match_25.json",
  "block_000010_match_31.json",
  "block_000011_match_26.json",
  "block_000012_match_32.json",
  "block_000013_match_43.json",
  "block_000014_match_37.json",
  "block_000015_match_44.json",
  "block_000016_match_38.json",
  "block_000017_match_49.json",
  "block_000018_match_50.json",
  "block_000019_match_55.json",
  "block_000020_match_56.json",
  "block_000021_match_61.json",
  "block_000022_match_67.json",
  "block_000023_match_68.json",
  "block_000024_match_62.json",
  "block_000025_match_3.json",
  "block_000026_match_9.json",
  "block_000027_match_10.json",
  "block_000028_match_4.json",
  "block_000029_match_21.json",
  "block_000030_match_15.json",
  "block_000031_match_16.json",
  "block_000032_match_22.json",
  "block_000033_match_33.json",
  "block_000034_match_27.json",
  "block_000035_match_28.json",
  "block_000036_match_34.json",
  "block_000037_match_45.json",
  "block_000038_match_39.json",
  "block_000039_match_46.json",
  "block_000040_match_40.json",
  "block_000041_match_57.json",
  "block_000042_match_51.json",
  "block_000043_match_52.json",
  "block_000044_match_58.json",
  "block_000045_match_63.json",
  "block_000046_match_69.json",
  "block_000047_match_70.json",
  "block_000048_match_64.json",
  "block_000049_match_11.json",
  "block_000050_match_12.json",
  "block_000051_match_17.json",
  "block_000052_match_18.json",
  "block_000053_match_5.json",
  "block_000054_match_6.json",
  "block_000055_match_29.json",
  "block_000056_match_30.json",
  "block_000057_match_35.json",
  "block_000058_match_36.json",
  "block_000059_match_23.json",
  "block_000060_match_24.json",
  "block_000061_match_53.json",
  "block_000062_match_54.json",
  "block_000063_match_47.json",
  "block_000064_match_48.json",
  "block_000065_match_41.json",
  "block_000066_match_42.json",
  "block_000067_match_71.json",
  "block_000068_match_72.json",
  "block_000069_match_65.json",
  "block_000070_match_66.json",
  "block_000071_match_59.json",
  "block_000072_match_60.json",
  "block_000073_match_73.json",
  "block_000074_match_76.json",
  "block_000075_match_74.json",
  "block_000076_match_75.json",
  "block_000077_match_78.json",
  "block_000078_match_77.json",
  "block_000079_match_79.json",
  "block_000080_match_80.json",
  "block_000081_match_82.json",
  "block_000082_match_81.json",
  "block_000083_match_84.json",
  "block_000084_match_83.json",
  "block_000085_match_85.json",
  "block_000086_match_88.json",
  "block_000087_match_86.json",
  "block_000088_match_87.json",
  "block_000089_match_90.json",
  "block_000090_match_89.json",
  "block_000091_match_91.json",
  "block_000092_match_92.json",
  "block_000093_match_93.json",
  "block_000094_match_94.json",
  "block_000095_match_95.json",
  "block_000096_match_96.json",
];

const state = {
  blocks: [],
  maxPredictionsInBlock: 0,
  selectedNumber: null,
  query: "",
  statusFilter: "all",
};

const el = {
  loadStatus: document.querySelector("#loadStatus"),
  totalBlocks: document.querySelector("#totalBlocks"),
  totalPredictions: document.querySelector("#totalPredictions"),
  totalMatches: document.querySelector("#totalMatches"),
  chainStatus: document.querySelector("#chainStatus"),
  chainStatusCard: document.querySelector("#chainStatusCard"),
  searchInput: document.querySelector("#searchInput"),
  chainTrack: document.querySelector("#chainTrack"),
  visibleBlocks: document.querySelector("#visibleBlocks"),
  blockList: document.querySelector("#blockList"),
  blockDetail: document.querySelector("#blockDetail"),
  blockButtonTemplate: document.querySelector("#blockButtonTemplate"),
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  bindEvents();

  try {
    const blockFiles = await loadBlockFileList();
    const blocks = await loadBlocks(blockFiles);
    state.blocks = await verifyBlocks(blocks);
    state.maxPredictionsInBlock = getMaxPredictionsInBlock(state.blocks);
    const initialBlock = getBlockFromLocation() ?? state.blocks.at(-1)?.block_number ?? null;
    state.selectedNumber = initialBlock;
    render();
    el.loadStatus.textContent = `${state.blocks.length} blocos carregados`;
  } catch (error) {
    el.loadStatus.textContent = "Falha ao carregar";
    el.blockDetail.innerHTML = `
      <div class="error-state">
        <h2>Não foi possível carregar os blocos</h2>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
  }
}

function bindEvents() {
  el.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderLists();
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      state.statusFilter = button.dataset.filter;
      renderLists();
    });
  });

  window.addEventListener("hashchange", () => {
    const blockNumber = getBlockFromLocation();
    if (blockNumber && blockNumber !== state.selectedNumber) {
      selectBlock(blockNumber, { updateHash: false });
    }
  });
}

async function loadBlockFileList() {
  const apiUrl = `https://api.github.com/repos/${REPOSITORY.owner}/${REPOSITORY.name}/contents/blocks`;

  try {
    const response = await fetch(apiUrl, {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`GitHub API ${response.status}`);
    }

    const files = await response.json();
    const jsonFiles = files
      .filter((file) => file.type === "file" && /^block_\d+.*\.json$/.test(file.name))
      .map((file) => ({
        name: file.name,
        url: file.download_url ?? getRawBlockUrl(file.name),
      }))
      .sort(compareBlockFileNames);

    return jsonFiles.length ? jsonFiles : getFallbackBlockSources();
  } catch (_error) {
    const manifestFiles = await loadLocalBlockManifest();
    return manifestFiles.length ? manifestFiles : getFallbackBlockSources();
  }
}

async function loadBlocks(blockSources) {
  const responses = await Promise.all(
    blockSources.map(async (source) => {
      const fileName = getBlockSourceName(source);
      const response = await fetch(getBlockSourceUrl(source), { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Arquivo não encontrado: ${fileName}`);
      }

      return {
        fileName,
        data: await response.json(),
      };
    }),
  );

  return responses
    .map(({ fileName, data }) => ({ ...data, fileName }))
    .sort((a, b) => Number(a.block_number) - Number(b.block_number));
}

async function verifyBlocks(blocks) {
  const verified = [];

  for (const block of blocks) {
    const previousBlock = verified.at(-1);
    const canonicalPayload = canonicalJson(block.payload ?? []);
    const computedHash = await sha256Hex(`${canonicalPayload}${block.previous_hash ?? ""}`);
    const linkValid = block.block_number === 1
      ? block.previous_hash === "0".repeat(64)
      : block.previous_hash === previousBlock?.hash;
    const hashValid = computedHash === block.hash;

    verified.push({
      ...block,
      computedHash,
      verificationResult: {
        hashValid,
        linkValid,
        valid: hashValid && linkValid,
      },
    });
  }

  return verified;
}

function render() {
  renderSummary();
  renderLists();
  renderDetail();
}

function renderSummary() {
  const totalPredictions = state.blocks.reduce((sum, block) => sum + getPredictions(block).length, 0);
  const totalMatches = state.blocks.reduce((sum, block) => sum + getMatches(block).length, 0);
  const isChainValid = state.blocks.every((block) => block.verificationResult.valid);

  el.totalBlocks.textContent = state.blocks.length.toLocaleString("pt-BR");
  el.totalPredictions.textContent = totalPredictions.toLocaleString("pt-BR");
  el.totalMatches.textContent = totalMatches.toLocaleString("pt-BR");
  el.chainStatus.textContent = isChainValid ? "OK" : "Alerta";
  el.chainStatusCard.classList.toggle("is-valid", isChainValid);
  el.chainStatusCard.classList.toggle("is-invalid", !isChainValid);
}

function renderLists() {
  const visibleBlocks = getVisibleBlocks();
  el.visibleBlocks.textContent = `${visibleBlocks.length} visíveis`;
  renderChain(visibleBlocks);
  renderBlockList(visibleBlocks);
}

function renderChain(blocks) {
  el.chainTrack.innerHTML = "";

  if (!blocks.length) {
    el.chainTrack.innerHTML = `<div class="empty-state"><h2>Nenhum bloco encontrado</h2></div>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  blocks.forEach((block) => {
    const button = document.createElement("button");
    const predictions = getPredictions(block).length;
    const fillPercent = getBlockFillPercent(block);
    button.type = "button";
    button.className = "chain-node";
    button.classList.toggle("is-selected", block.block_number === state.selectedNumber);
    button.classList.toggle("is-invalid", !block.verificationResult.valid);
    button.title = `Bloco ${block.block_number}: ${predictions}/${state.maxPredictionsInBlock} palpites (${Math.round(fillPercent)}%)`;
    button.innerHTML = `
      <span class="chain-node__cube" style="--fill-level: ${fillPercent.toFixed(2)}%;">
        <span class="chain-node__number">${padBlock(block.block_number)}</span>
      </span>
      <span class="chain-node__label">${escapeHtml(getBlockTitle(block))}</span>
      <span class="chain-node__hash">${predictions.toLocaleString("pt-BR")} palpite(s)</span>
    `;
    button.addEventListener("click", () => selectBlock(block.block_number));
    fragment.append(button);
  });

  el.chainTrack.append(fragment);
}

function renderBlockList(blocks) {
  el.blockList.innerHTML = "";

  if (!blocks.length) {
    el.blockList.innerHTML = `<div class="empty-state"><h2>Nenhum resultado</h2></div>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  blocks.forEach((block) => {
    const row = el.blockButtonTemplate.content.firstElementChild.cloneNode(true);
    const matches = getMatches(block);
    const predictions = getPredictions(block);
    row.classList.toggle("is-selected", block.block_number === state.selectedNumber);
    row.querySelector(".block-row__number").textContent = padBlock(block.block_number);
    row.querySelector(".block-row__title").textContent = getBlockTitle(block);
    row.querySelector(".block-row__meta").textContent = `${matches.length} jogo(s) · ${predictions.length} palpite(s)`;

    const badge = row.querySelector(".block-row__badge");
    badge.textContent = block.verificationResult.valid ? "OK" : "Alerta";
    badge.classList.add(block.verificationResult.valid ? "is-valid" : "is-invalid");

    row.addEventListener("click", () => selectBlock(block.block_number));
    fragment.append(row);
  });

  el.blockList.append(fragment);
}

function renderDetail() {
  const block = getSelectedBlock();

  if (!block) {
    el.blockDetail.innerHTML = `
      <div class="empty-state">
        <h2>Nenhum bloco selecionado</h2>
        <p>Selecione um bloco na cadeia.</p>
      </div>
    `;
    return;
  }

  const matches = getMatches(block);
  const predictions = getPredictions(block);
  const previousBlock = getNeighbor(block, -1);
  const nextBlock = getNeighbor(block, 1);
  const statusClass = block.verificationResult.valid ? "is-valid" : "is-invalid";

  el.blockDetail.innerHTML = `
    <header class="detail-header">
      <div class="detail-header__top">
        <div>
          <span class="status-pill ${statusClass}">${block.verificationResult.valid ? "Bloco verificado" : "Verificação com alerta"}</span>
          <h2>Bloco ${padBlock(block.block_number)}</h2>
          <p class="detail-subtitle">${escapeHtml(getBlockTitle(block))}</p>
        </div>
        <div class="detail-actions">
          <button class="nav-button" type="button" data-nav="prev" ${previousBlock ? "" : "disabled"}>Anterior</button>
          <button class="nav-button" type="button" data-nav="next" ${nextBlock ? "" : "disabled"}>Próximo</button>
          <button class="copy-button" type="button" data-copy-hash>Copiar hash</button>
        </div>
      </div>
      <div class="hash-line">
        <code class="hash-box">${escapeHtml(block.hash)}</code>
      </div>
    </header>

    <div class="detail-grid">
      <div class="fact">
        <span>Criado em</span>
        <strong>${formatDateTime(block.created_at)}</strong>
      </div>
      <div class="fact">
        <span>Palpites</span>
        <strong>${predictions.length.toLocaleString("pt-BR")}</strong>
      </div>
      <div class="fact">
        <span>Arquivo</span>
        <strong>${escapeHtml(block.fileName)}</strong>
      </div>
      <div class="fact">
        <span>Hash anterior</span>
        <strong>${escapeHtml(shortHash(block.previous_hash))}</strong>
      </div>
      <div class="fact">
        <span>Hash recalculado</span>
        <strong>${escapeHtml(shortHash(block.computedHash))}</strong>
      </div>
      <div class="fact">
        <span>Schema</span>
        <strong>${escapeHtml(block.schema ?? "não informado")}</strong>
      </div>
    </div>

    <div class="content-grid">
      <div class="section-panel">
        <h3>Jogos no bloco</h3>
        <div class="match-list">${matches.map(renderMatch).join("")}</div>
      </div>

      <div class="section-panel">
        <h3>Distribuição dos palpites</h3>
        <div class="score-list">${renderScoreDistribution(predictions)}</div>
      </div>

      <div class="section-panel">
        <h3>Verificação</h3>
        <div class="verification-list">
          ${renderVerificationItem("Hash do payload", block.verificationResult.hashValid)}
          ${renderVerificationItem("Link com bloco anterior", block.verificationResult.linkValid)}
          ${renderVerificationItem(block.verification?.algorithm ?? "SHA-256", block.verificationResult.valid)}
        </div>
      </div>

      <div class="section-panel">
        <h3>Palpites</h3>
        ${renderPredictionsTable(predictions)}
      </div>
    </div>

    <div class="section-panel" style="margin-top: 1rem;">
      <h3>JSON bruto</h3>
      <pre class="raw-json">${escapeHtml(JSON.stringify(stripRuntimeFields(block), null, 2))}</pre>
    </div>
  `;

  bindDetailActions(block);
}

function bindDetailActions(block) {
  el.blockDetail.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.dataset.nav === "next" ? 1 : -1;
      const neighbor = getNeighbor(block, direction);
      if (neighbor) {
        selectBlock(neighbor.block_number);
      }
    });
  });

  el.blockDetail.querySelector("[data-copy-hash]")?.addEventListener("click", async (event) => {
    await navigator.clipboard.writeText(block.hash);
    event.currentTarget.textContent = "Hash copiado";
    setTimeout(() => {
      event.currentTarget.textContent = "Copiar hash";
    }, 1400);
  });
}

function renderMatch(match) {
  return `
    <article class="match-item">
      <strong>${escapeHtml(match.team1_name ?? "Time 1")} x ${escapeHtml(match.team2_name ?? "Time 2")}</strong>
      <span class="match-meta">
        ${escapeHtml(match.group_name ?? "Grupo não informado")} ·
        ${escapeHtml(match.round ?? "Rodada não informada")} ·
        ${formatDateTime(match.kickoff_time)}
      </span>
    </article>
  `;
}

function renderScoreDistribution(predictions) {
  if (!predictions.length) {
    return `<p class="muted">Sem palpites neste bloco.</p>`;
  }

  const counts = new Map();
  predictions.forEach((prediction) => {
    const score = `${prediction.goals_team1 ?? "?"}-${prediction.goals_team2 ?? "?"}`;
    counts.set(score, (counts.get(score) ?? 0) + 1);
  });

  const max = Math.max(...counts.values());

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([score, count]) => `
      <div class="score-item">
        <span class="score-item__score">${escapeHtml(score)}</span>
        <div class="score-bar" aria-hidden="true"><span style="width: ${(count / max) * 100}%"></span></div>
        <span class="muted">${count.toLocaleString("pt-BR")}</span>
      </div>
    `)
    .join("");
}

function renderVerificationItem(label, valid) {
  return `
    <div class="verification-item">
      <strong>${escapeHtml(label)}</strong>
      <span class="status-pill ${valid ? "is-valid" : "is-invalid"}">${valid ? "OK" : "Alerta"}</span>
    </div>
  `;
}

function renderPredictionsTable(predictions) {
  if (!predictions.length) {
    return `<p class="muted">Sem palpites neste bloco.</p>`;
  }

  const rows = predictions
    .slice()
    .sort((a, b) => String(a.username ?? "").localeCompare(String(b.username ?? ""), "pt-BR"))
    .map((prediction) => `
      <tr>
        <td>${escapeHtml(prediction.username ?? "sem usuário")}</td>
        <td>${escapeHtml(getPredictionMatchLabel(prediction))}</td>
        <td>${escapeHtml(`${prediction.goals_team1 ?? "?"} x ${prediction.goals_team2 ?? "?"}`)}</td>
      </tr>
    `)
    .join("");

  return `
    <table class="predictions-table">
      <thead>
        <tr>
          <th>Usuário</th>
          <th>Jogo</th>
          <th>Palpite</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function selectBlock(blockNumber, options = {}) {
  state.selectedNumber = blockNumber;
  if (options.updateHash !== false) {
    window.history.replaceState(null, "", `#block-${blockNumber}`);
  }
  renderLists();
  renderDetail();
}

function getVisibleBlocks() {
  return state.blocks.filter((block) => {
    const statusMatches = state.statusFilter === "all"
      || (state.statusFilter === "valid" && block.verificationResult.valid)
      || (state.statusFilter === "invalid" && !block.verificationResult.valid);

    if (!statusMatches) {
      return false;
    }

    if (!state.query) {
      return true;
    }

    return getSearchText(block).includes(state.query);
  });
}

function getSearchText(block) {
  const matchesText = getMatches(block)
    .map((match) => Object.values(match).join(" "))
    .join(" ");
  const predictionsText = getPredictions(block)
    .map((prediction) => Object.values(prediction).join(" "))
    .join(" ");

  return [
    block.block_number,
    block.hash,
    block.previous_hash,
    block.fileName,
    matchesText,
    predictionsText,
  ].join(" ").toLowerCase();
}

function getSelectedBlock() {
  return state.blocks.find((block) => block.block_number === state.selectedNumber) ?? null;
}

function getNeighbor(block, direction) {
  const index = state.blocks.findIndex((item) => item.block_number === block.block_number);
  return state.blocks[index + direction] ?? null;
}

function getMatches(block) {
  if (Array.isArray(block.matches)) {
    return block.matches;
  }

  if (Array.isArray(block.games)) {
    return block.games;
  }

  return block.match ? [block.match] : [];
}

function getPredictions(block) {
  return Array.isArray(block.payload) ? block.payload : [];
}

function getMaxPredictionsInBlock(blocks) {
  return blocks.reduce((max, block) => Math.max(max, getPredictions(block).length), 0);
}

function getBlockFillPercent(block) {
  if (!state.maxPredictionsInBlock) {
    return 0;
  }

  return Math.min(100, (getPredictions(block).length / state.maxPredictionsInBlock) * 100);
}

function getBlockTitle(block) {
  const matches = getMatches(block);

  if (matches.length === 0) {
    return "Sem jogo associado";
  }

  if (matches.length === 1) {
    const [match] = matches;
    return `${match.team1_name ?? "Time 1"} x ${match.team2_name ?? "Time 2"}`;
  }

  const kickoff = matches[0]?.kickoff_time ? formatTime(matches[0].kickoff_time) : "horário";
  return `${matches.length} jogos · ${kickoff}`;
}

function getPredictionMatchLabel(prediction) {
  if (prediction.match_id || prediction.matchId) {
    return `Jogo ${prediction.match_id ?? prediction.matchId}`;
  }

  return "Bloco";
}

function getBlockFromLocation() {
  const match = window.location.hash.match(/block-(\d+)/);
  return match ? Number(match[1]) : null;
}

function stripRuntimeFields(block) {
  const { fileName, computedHash, verificationResult, ...raw } = block;
  return raw;
}

function getFallbackBlockSources() {
  return FALLBACK_BLOCK_FILES.map((fileName) => ({
    name: fileName,
    url: `blocks/${fileName}`,
  }));
}

async function loadLocalBlockManifest() {
  try {
    const response = await fetch("blocks/manifest.json", { cache: "no-store" });
    if (!response.ok) {
      return [];
    }

    const files = await response.json();
    if (!Array.isArray(files)) {
      return [];
    }

    return files
      .filter((fileName) => /^block_\d+.*\.json$/.test(fileName))
      .map((fileName) => ({
        name: fileName,
        url: `blocks/${fileName}`,
      }))
      .sort(compareBlockFileNames);
  } catch (_error) {
    return [];
  }
}

function getBlockSourceName(source) {
  return typeof source === "string" ? source : source.name;
}

function getBlockSourceUrl(source) {
  return typeof source === "string" ? `blocks/${source}` : source.url;
}

function getRawBlockUrl(fileName) {
  return `https://raw.githubusercontent.com/${REPOSITORY.owner}/${REPOSITORY.name}/main/blocks/${fileName}`;
}

function compareBlockFileNames(a, b) {
  const blockA = getBlockSourceName(a).match(/block_(\d+)/)?.[1] ?? 0;
  const blockB = getBlockSourceName(b).match(/block_(\d+)/)?.[1] ?? 0;
  return Number(blockA) - Number(blockB);
}

function padBlock(blockNumber) {
  return String(blockNumber).padStart(3, "0");
}

function shortHash(hash) {
  if (!hash) {
    return "não informado";
  }

  return hash.length > 16 ? `${hash.slice(0, 10)}...${hash.slice(-8)}` : hash;
}

function formatDateTime(value) {
  if (!value) {
    return "não informado";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

async function sha256Hex(input) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function canonicalJson(value) {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }

  if (typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${pythonJsonString(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }

  if (typeof value === "string") {
    return pythonJsonString(value);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "null";
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return "null";
}

function pythonJsonString(value) {
  let output = '"';

  for (const char of value) {
    const codePoint = char.codePointAt(0);

    if (char === '"') {
      output += '\\"';
    } else if (char === "\\") {
      output += "\\\\";
    } else if (char === "\b") {
      output += "\\b";
    } else if (char === "\f") {
      output += "\\f";
    } else if (char === "\n") {
      output += "\\n";
    } else if (char === "\r") {
      output += "\\r";
    } else if (char === "\t") {
      output += "\\t";
    } else if (codePoint < 0x20) {
      output += `\\u${codePoint.toString(16).padStart(4, "0")}`;
    } else if (codePoint > 0x7f) {
      output += escapeUnicode(codePoint);
    } else {
      output += char;
    }
  }

  output += '"';
  return output;
}

function escapeUnicode(codePoint) {
  if (codePoint <= 0xffff) {
    return `\\u${codePoint.toString(16).padStart(4, "0")}`;
  }

  const adjusted = codePoint - 0x10000;
  const high = 0xd800 + (adjusted >> 10);
  const low = 0xdc00 + (adjusted & 0x3ff);
  return `\\u${high.toString(16).padStart(4, "0")}\\u${low.toString(16).padStart(4, "0")}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
