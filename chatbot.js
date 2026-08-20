(function () {
  "use strict";

  const PAGE_SOURCES = [
    { path: "index.html", label: "Home", kind: "home" },
    { path: "work.html", label: "Work", kind: "work" },
    { path: "projects.html", label: "Projects", kind: "projects" },
  ];

  const STOP_WORDS = new Set([
    "a", "about", "alvin", "an", "and", "are", "as", "at", "be", "can", "do", "for", "from",
    "has", "have", "how", "i", "in", "is", "it", "me", "my", "of", "on",
    "or", "tell", "the", "this", "to", "was", "what", "when", "where", "which", "who",
    "with", "you", "your",
  ]);

  const SYNONYMS = {
    career: ["work", "intern", "experience", "adrenalin"],
    contact: ["email", "reach", "connect"],
    games: ["game", "project", "projects", "play"],
    game: ["games", "project", "projects", "play"],
    job: ["work", "intern", "experience"],
    portfolio: ["project", "projects", "work"],
    skills: ["technology", "technologies", "tools", "engine", "coding"],
  };

  const state = {
    busy: false,
    knowledge: [],
    indexedPages: 0,
  };

  const cleanText = (value) =>
    String(value || "")
      .replace(/\s+/g, " ")
      .replace(/\s+([,.;!?])/g, "$1")
      .trim();

  const escapeHtml = (value) =>
    String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const safeUrl = (value) => {
    try {
      const url = new URL(value, document.baseURI);
      return ["http:", "https:", "mailto:"].includes(url.protocol) ? url.href : "";
    } catch (_error) {
      return "";
    }
  };

  const pageUrl = (path) => new URL(path, document.baseURI).href;

  function tokens(value) {
    const original = cleanText(value)
      .toLowerCase()
      .replace(/[^a-z0-9+#.\-\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token && !STOP_WORDS.has(token));
    const expanded = new Set(original);
    original.forEach((token) => {
      (SYNONYMS[token] || []).forEach((synonym) => expanded.add(synonym));
    });
    return [...expanded];
  }

  function projectIsHidden(card, doc) {
    const imagePath = card.querySelector("img")?.getAttribute("src") || "";
    if (!imagePath) return false;
    const css = [...doc.querySelectorAll("style")].map((style) => style.textContent).join("\n");
    const escapedPath = imagePath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const hiddenRule = new RegExp(
      `project-card:has\\(img\\[src=["']${escapedPath}["']\\]\\)[^{]*\\{[^}]*display\\s*:\\s*none`,
      "i",
    );
    return hiddenRule.test(css);
  }

  function extractProjects(doc, source) {
    return [...doc.querySelectorAll("#projects .project-card")]
      .filter((card) => !projectIsHidden(card, doc))
      .map((card) => {
        const title = cleanText(card.querySelector("h3")?.textContent);
        if (!title) return null;
        const description = cleanText(card.querySelector("h3 + p")?.textContent || card.querySelector("p")?.textContent);
        const tags = [...card.querySelectorAll("span")]
          .map((tag) => cleanText(tag.textContent))
          .filter(Boolean);
        const links = [...card.querySelectorAll("a[href]")]
          .map((anchor) => ({
            label: cleanText(anchor.textContent) || "Open",
            url: safeUrl(anchor.getAttribute("href")),
          }))
          .filter((link) => link.url);
        return {
          type: "project",
          title,
          body: description,
          tags,
          links,
          pageLabel: source.label,
          pageUrl: pageUrl(source.path),
        };
      })
      .filter(Boolean);
  }

  function extractWork(doc, source) {
    const modal = doc.querySelector("#work-modal");
    if (!modal) return [];
    const title = cleanText(modal.querySelector("h2")?.textContent) || "Work Experience";
    const description = cleanText(modal.querySelector(".work-modal-description")?.textContent);
    const details = [...modal.querySelectorAll(".work-detail-card")]
      .map((card) => cleanText(card.textContent))
      .filter(Boolean);
    const captions = [...modal.querySelectorAll("figcaption")]
      .map((caption) => cleanText(caption.textContent))
      .filter(Boolean);
    return [{
      type: "work",
      title,
      body: [description, ...details, ...captions].filter(Boolean).join(" "),
      tags: ["work", "internship", "Adrenalin Group", "games", "AI chatbots"],
      links: [],
      pageLabel: source.label,
      pageUrl: pageUrl(source.path),
    }];
  }

  function extractHome(doc, source) {
    const chunks = [];
    const about = doc.querySelector("#about");
    if (about) {
      chunks.push({
        type: "about",
        title: cleanText(about.querySelector("h2")?.textContent) || "About Alvin",
        body: cleanText(about.textContent).slice(0, 1600),
        tags: ["Alvin", "about", "developer", "education", "skills"],
        links: [...about.querySelectorAll("a[href]")]
          .map((anchor) => ({ label: cleanText(anchor.textContent) || "Contact", url: safeUrl(anchor.getAttribute("href")) }))
          .filter((link) => link.url),
        pageLabel: source.label,
        pageUrl: pageUrl(source.path) + "#about",
      });
    }

    const contact = doc.querySelector("#contact");
    if (contact) {
      const links = [...contact.querySelectorAll("a[href]")]
        .map((anchor) => {
          const url = safeUrl(anchor.getAttribute("href"));
          let label = cleanText(anchor.textContent) || anchor.getAttribute("aria-label") || "";
          if (url.startsWith("mailto:")) label = "Email Alvin";
          else if (/github\.com/i.test(url)) label = "GitHub";
          else if (/linkedin\.com/i.test(url)) label = "LinkedIn";
          else if (/itch\.io/i.test(url)) label = "itch.io";
          else if (/youtube\.com/i.test(url)) label = "YouTube";
          return { label: label || "Open link", url };
        })
        .filter((link) => link.url)
        .sort((a, b) => Number(b.url.startsWith("mailto:")) - Number(a.url.startsWith("mailto:")));
      chunks.push({
        type: "contact",
        title: "Contact Alvin",
        body: cleanText(contact.textContent),
        tags: ["contact", "email", "social", "connect"],
        links,
        pageLabel: source.label,
        pageUrl: pageUrl(source.path) + "#contact",
      });
    }
    return chunks;
  }

  function extractKnowledge(doc, source) {
    if (source.kind === "projects") return extractProjects(doc, source);
    if (source.kind === "work") return extractWork(doc, source);
    return extractHome(doc, source);
  }

  function loadLocalDocument(path) {
    return new Promise((resolve, reject) => {
      const frame = document.createElement("iframe");
      const timeout = window.setTimeout(() => {
        frame.remove();
        reject(new Error(`Timed out loading ${path}`));
      }, 5000);
      frame.hidden = true;
      frame.setAttribute("aria-hidden", "true");
      frame.setAttribute("sandbox", "allow-same-origin");
      frame.addEventListener("load", () => {
        window.clearTimeout(timeout);
        try {
          const html = frame.contentDocument?.documentElement?.outerHTML;
          if (!html) throw new Error(`Unable to read ${path}`);
          resolve(new DOMParser().parseFromString(html, "text/html"));
        } catch (error) {
          reject(error);
        } finally {
          frame.remove();
        }
      }, { once: true });
      frame.addEventListener("error", () => {
        window.clearTimeout(timeout);
        frame.remove();
        reject(new Error(`Unable to load ${path}`));
      }, { once: true });
      frame.src = pageUrl(path);
      document.body.appendChild(frame);
    });
  }

  async function buildKnowledge() {
    const currentPath = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    const loaded = await Promise.allSettled(
      PAGE_SOURCES.map(async (source) => {
        if (currentPath === source.path.toLowerCase()) {
          return { source, doc: document };
        }
        if (location.protocol === "file:") {
          return { source, doc: await loadLocalDocument(source.path) };
        }
        const response = await fetch(pageUrl(source.path), { cache: "no-store" });
        if (!response.ok) throw new Error(`Unable to load ${source.path}`);
        const html = await response.text();
        return { source, doc: new DOMParser().parseFromString(html, "text/html") };
      }),
    );

    const items = [];
    loaded.forEach((result) => {
      if (result.status !== "fulfilled") return;
      state.indexedPages += 1;
      items.push(...extractKnowledge(result.value.doc, result.value.source));
    });

    const seen = new Set();
    state.knowledge = items.filter((item) => {
      const key = `${item.type}:${item.title.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      item.searchTitle = tokens(item.title);
      item.searchBody = tokens(`${item.body} ${item.tags.join(" ")}`);
      return true;
    });
    return state.knowledge;
  }

  function scoreItem(item, query, queryTokens) {
    const title = item.title.toLowerCase();
    let score = title.includes(query.toLowerCase()) ? 28 : 0;
    queryTokens.forEach((token) => {
      if (item.searchTitle.includes(token)) score += 8;
      if (item.searchBody.includes(token)) score += 3;
      if (title.includes(token)) score += 5;
    });
    if (/work|career|job|intern|experience|adrenalin/.test(query) && item.type === "work") score += 18;
    if (/contact|email|reach|connect/.test(query) && item.type === "contact") score += 22;
    if (/about alvin|who is alvin|tell me about alvin/.test(query) && item.type === "about") score += 18;
    if (/game|games|project|projects|play/.test(query) && item.type === "project") score += 10;
    return score;
  }

  function searchKnowledge(query) {
    const queryTokens = tokens(query);
    return state.knowledge
      .map((item) => ({ item, score: scoreItem(item, query, queryTokens) }))
      .filter((result) => result.score > 2)
      .sort((a, b) => b.score - a.score)
      .map((result) => result.item);
  }

  function resultMarkup(item) {
    const links = [...item.links];
    if (!links.some((link) => link.url === item.pageUrl)) {
      links.push({ label: `View ${item.pageLabel}`, url: item.pageUrl });
    }
    const actions = links.slice(0, 3).map((link) => {
      const external = /^https?:/.test(link.url) && new URL(link.url).origin !== location.origin;
      return `<a class="assistant-result-link" href="${escapeHtml(link.url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}><i class="fas fa-arrow-up-right-from-square" aria-hidden="true"></i>${escapeHtml(link.label)}</a>`;
    }).join("");
    return `<article class="assistant-result"><strong class="assistant-result-title">${escapeHtml(item.title)}</strong><p class="assistant-result-copy">${escapeHtml(item.body || item.tags.join(", "))}</p><div class="assistant-result-actions">${actions}</div></article>`;
  }

  function createAnswer(query) {
    const normalized = cleanText(query).toLowerCase();
    if (/^(hi|hello|hey|yo|good morning|good afternoon)\b/.test(normalized)) {
      return {
        text: "Hi! I’m Alvin’s portfolio assistant. Ask me about his games, work experience, tools, or how to contact him.",
        results: [],
      };
    }
    if (/^(help|what can you do|how do you work)/.test(normalized)) {
      return {
        text: "I can search this portfolio, explain projects and work, find playable game links, and point you to the right page. My answers are built from the website’s current content.",
        results: [],
      };
    }

    let matches = searchKnowledge(normalized);
    const asksForWork = /work|career|job|intern|experience|adrenalin/.test(normalized);
    const asksForContact = /contact|email|reach|connect|get in touch/.test(normalized);
    const asksAboutAlvin = /about alvin|who is alvin|tell me about alvin/.test(normalized);
    const asksForProjects = /all|list|show.*games|show.*projects|what.*games|which.*games/.test(normalized);
    const asksForPlayableGames = /can (i|we) play|playable|play.*games|games.*play/.test(normalized);
    const namedProject = state.knowledge.find((item) => {
      if (item.type !== "project") return false;
      const projectName = item.title.toLowerCase().replace(/\s*\(\d{4}\)\s*$/, "");
      return projectName.length > 3 && normalized.includes(projectName);
    });
    if (asksForContact) {
      matches = matches.filter((item) => item.type === "contact");
    } else if (asksForWork) {
      matches = matches.filter((item) => item.type === "work");
    } else if (asksAboutAlvin) {
      matches = matches.filter((item) => item.type === "about");
    } else if (namedProject) {
      matches = [namedProject];
    } else if (asksForProjects) {
      matches = state.knowledge.filter((item) => item.type === "project");
    }
    if (asksForPlayableGames) {
      matches = matches.filter((item) =>
        item.type === "project" && item.links.some((link) => /play game/i.test(link.label)),
      );
    }
    if (!matches.length) {
      return {
        text: "I couldn’t find that in the portfolio yet. Try asking about games, Adrenalin Group, Alvin’s skills, or contact details.",
        results: [],
      };
    }

    let text = "Here’s what I found on the portfolio:";
    let limit = 3;
    if (asksForPlayableGames) {
      text = "These portfolio games currently have a playable link:";
      limit = 6;
    } else if (asksForProjects) {
      text = "These are the projects currently shown in the portfolio:";
      limit = 6;
    } else if (matches[0].type === "work") {
      text = "Here’s Alvin’s relevant work experience:";
    } else if (matches[0].type === "contact") {
      text = "You can reach Alvin using the contact option below:";
    }
    return { text, results: matches.slice(0, limit) };
  }

  function createInterface() {
    const root = document.createElement("aside");
    root.className = "portfolio-assistant";
    root.innerHTML = `
      <button class="assistant-launcher" type="button" aria-label="Open portfolio assistant" aria-expanded="false" aria-controls="portfolio-assistant-panel">
        <i class="fas fa-comment-dots assistant-launcher-icon" aria-hidden="true"></i>
        <span class="assistant-unread" aria-hidden="true"></span>
      </button>
      <div id="portfolio-assistant-panel" class="assistant-panel" role="dialog" aria-label="Portfolio assistant" aria-modal="false" aria-hidden="true">
        <header class="assistant-header">
          <div class="assistant-avatar" aria-hidden="true"><i class="fas fa-robot"></i></div>
          <div class="assistant-heading">
            <h2>Alvin's PA</h2>
            <span class="assistant-status" aria-live="polite">Connecting…</span>
          </div>
          <button class="assistant-icon-button assistant-reset" type="button" aria-label="Start a new chat" title="New chat"><i class="fas fa-rotate-right" aria-hidden="true"></i></button>
          <button class="assistant-icon-button assistant-close" type="button" aria-label="Close assistant"><i class="fas fa-xmark" aria-hidden="true"></i></button>
        </header>
        <div class="assistant-messages" role="log" aria-live="polite" aria-relevant="additions"></div>
        <div class="assistant-suggestions" aria-label="Suggested questions">
          <button class="assistant-suggestion" type="button">Which games can I play?</button>
          <button class="assistant-suggestion" type="button">What did Alvin build at work?</button>
          <button class="assistant-suggestion" type="button">How can I contact Alvin?</button>
        </div>
        <form class="assistant-form">
          <label class="sr-only" for="portfolio-assistant-input">Ask about Alvin’s portfolio</label>
          <input id="portfolio-assistant-input" class="assistant-input" type="text" maxlength="240" autocomplete="off" placeholder="Ask about projects or experience…" />
          <button class="assistant-send" type="submit" aria-label="Send message"><i class="fas fa-paper-plane" aria-hidden="true"></i></button>
        </form>
      </div>`;
    document.body.appendChild(root);
    return root;
  }

  function initAssistant() {
    const root = createInterface();
    const launcher = root.querySelector(".assistant-launcher");
    const panel = root.querySelector(".assistant-panel");
    const closeButton = root.querySelector(".assistant-close");
    const resetButton = root.querySelector(".assistant-reset");
    const messages = root.querySelector(".assistant-messages");
    const suggestions = root.querySelector(".assistant-suggestions");
    const form = root.querySelector(".assistant-form");
    const input = root.querySelector(".assistant-input");
    const sendButton = root.querySelector(".assistant-send");
    const status = root.querySelector(".assistant-status");

    function scrollToLatest() {
      requestAnimationFrame(() => {
        messages.scrollTop = messages.scrollHeight;
      });
    }

    function addMessage(content, role, isHtml) {
      const message = document.createElement("div");
      message.className = `assistant-message ${role}`;
      const bubble = document.createElement("div");
      bubble.className = "assistant-bubble";
      if (isHtml) bubble.innerHTML = content;
      else bubble.textContent = content;
      message.appendChild(bubble);
      messages.appendChild(message);
      scrollToLatest();
      return message;
    }

    function welcome() {
      messages.innerHTML = "";
      addMessage("Hi! I’m Alvin’s portfolio assistant. I automatically learn from this website, so ask me about his projects, work, skills, or contact details.", "assistant", false);
    }

    function setOpen(open) {
      root.classList.toggle("is-open", open);
      launcher.setAttribute("aria-expanded", String(open));
      launcher.setAttribute("aria-label", open ? "Close portfolio assistant" : "Open portfolio assistant");
      panel.setAttribute("aria-hidden", String(!open));
      if (open) setTimeout(() => input.focus(), 180);
      else launcher.focus();
    }

    async function submitQuestion(question) {
      const query = cleanText(question);
      if (!query || state.busy) return;
      state.busy = true;
      input.value = "";
      input.disabled = true;
      sendButton.disabled = true;
      addMessage(query, "user", false);
      const typing = addMessage('<span class="assistant-typing" aria-label="Thinking"><span></span><span></span><span></span></span>', "assistant", true);

      await new Promise((resolve) => setTimeout(resolve, 320));
      const answer = createAnswer(query);
      typing.remove();
      const resultHtml = answer.results.length
        ? `<div class="assistant-results">${answer.results.map(resultMarkup).join("")}</div>`
        : "";
      addMessage(`<p>${escapeHtml(answer.text)}</p>${resultHtml}`, "assistant", true);
      state.busy = false;
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();
    }

    launcher.addEventListener("click", () => setOpen(!root.classList.contains("is-open")));
    closeButton.addEventListener("click", () => setOpen(false));
    resetButton.addEventListener("click", () => {
      welcome();
      input.focus();
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitQuestion(input.value);
    });
    suggestions.addEventListener("click", (event) => {
      const suggestion = event.target.closest(".assistant-suggestion");
      if (suggestion) submitQuestion(suggestion.textContent);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && root.classList.contains("is-open")) setOpen(false);
    });

    welcome();
    buildKnowledge()
      .then(() => {
        status.textContent = "Online";
      })
      .catch(() => {
        status.textContent = "Online";
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAssistant);
  } else {
    initAssistant();
  }
})();
