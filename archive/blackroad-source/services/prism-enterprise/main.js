const packetsHost = "packets.json";
const packetsContainer = document.getElementById("packets");
const summaryContainer = document.getElementById("summary");
const reloadButton = document.getElementById("reload");

reloadButton?.addEventListener("click", () => loadPackets());

async function loadPackets() {
  packetsContainer.innerHTML = "<p class=\"loading\">Loading packets…</p>";
  summaryContainer.innerHTML = "";
  try {
    const response = await fetch(packetsHost + `?ts=${Date.now()}`);
    if (!response.ok) {
      throw new Error(`Failed to load packets.json: ${response.status}`);
    }
    const payload = await response.json();
    renderSummary(payload);
    renderPackets(payload.packets ?? []);
  } catch (error) {
    packetsContainer.innerHTML = `<p class="error">${error}</p>`;
  }
}

function renderSummary(payload) {
  const winner = payload.winner ? `<strong>${payload.winner}</strong>` : "n/a";
  summaryContainer.innerHTML = `
    <div class="summary-card">
      <p><span>Prompt:</span> ${escapeHtml(payload.prompt ?? "")}</p>
      <p><span>Consensus score:</span> ${(payload.consensus ?? 0).toFixed(3)}</p>
      <p><span>Winner:</span> ${winner}</p>
      <p><span>Generated at:</span> ${payload.generated_at ?? ""}</p>
    </div>
  `;
}

function renderPackets(packets) {
  if (!packets.length) {
    packetsContainer.innerHTML = "<p>No persona packets available.</p>";
    return;
  }

  packetsContainer.innerHTML = "";
  for (const packet of packets) {
    const card = document.createElement("article");
    card.className = "packet";

    card.innerHTML = `
      <header>
        <h2>${escapeHtml(packet.persona)}</h2>
        <div class="meta">
          <span class="score">Score: ${(packet.score ?? 0).toFixed(3)}</span>
          <span class="confidence">Confidence: ${(packet.confidence ?? 0).toFixed(2)}</span>
        </div>
        ${packet.error ? `<p class="error">${escapeHtml(packet.error)}</p>` : ""}
        <p class="summary">${escapeHtml(packet.summary ?? "")}</p>
      </header>
      <section class="response">${colouriseResponse(packet.tokens ?? [], packet.response ?? "")}</section>
      <footer>
        <pre>${escapeHtml(JSON.stringify(packet.metadata ?? {}, null, 2))}</pre>
      </footer>
    `;

    packetsContainer.appendChild(card);
  }
}

function colouriseResponse(tokens, response) {
  if (!tokens.length) {
    return `<p>${escapeHtml(response)}</p>`;
  }
  const fragments = [];
  for (const token of tokens) {
    const weight = typeof token.weight === "number" ? token.weight : 0;
    const intensity = Math.min(1, Math.max(0, weight));
    const hue = 220 - intensity * 160;
    const background = `hsla(${hue}, 85%, ${80 - intensity * 30}%, 0.9)`;
    const color = intensity > 0.6 ? "#111" : "#1a1a1a";
    fragments.push(
      `<span class="token" style="background:${background};color:${color}">${escapeHtml(
        token.text ?? ""
      )}</span>`
    );
  }
  return `<p>${fragments.join(" ")}</p>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

loadPackets();
