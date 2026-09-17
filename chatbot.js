// Divine Glow Hub — Chat Widget
// Include this script (and chatbot.css) on any page to add the chat widget.
// It talks to /api/chat (a serverless function) — never call the Claude API
// directly from the browser, or you'd expose your API key.

(function () {
  const API_ENDPOINT = "/api/chat";
  const STORAGE_KEY = "dgh_chat_history";

  // ---- Build widget markup ----
  const launcher = document.createElement("button");
  launcher.id = "dgh-chat-launcher";
  launcher.setAttribute("aria-label", "Open chat");
  launcher.innerHTML = "&#128172;"; // speech balloon emoji

  const chatWindow = document.createElement("div");
  chatWindow.id = "dgh-chat-window";
  chatWindow.innerHTML = `
    <div id="dgh-chat-header">
      <div>
        Divine Glow Assistant
        <span class="dgh-subtitle">Ask about products or your order</span>
      </div>
      <button id="dgh-chat-close" aria-label="Close chat">&times;</button>
    </div>
    <div id="dgh-chat-messages"></div>
    <div id="dgh-chat-input-row">
      <input id="dgh-chat-input" type="text" placeholder="Type a message..." autocomplete="off" />
      <button id="dgh-chat-send">Send</button>
    </div>
  `;

  document.body.appendChild(launcher);
  document.body.appendChild(chatWindow);

  const messagesEl = chatWindow.querySelector("#dgh-chat-messages");
  const inputEl = chatWindow.querySelector("#dgh-chat-input");
  const sendBtn = chatWindow.querySelector("#dgh-chat-send");
  const closeBtn = chatWindow.querySelector("#dgh-chat-close");

  // ---- Conversation state (persists per-tab via sessionStorage) ----
  let history = [];
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) history = JSON.parse(saved);
  } catch (e) {
    history = [];
  }

  function saveHistory() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      /* ignore quota errors */
    }
  }

  function renderMessage(role, text) {
    const div = document.createElement("div");
    div.className = "dgh-msg " + (role === "user" ? "dgh-msg-user" : "dgh-msg-bot");
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function renderAll() {
    messagesEl.innerHTML = "";
    if (history.length === 0) {
      renderMessage(
        "assistant",
        "Hi! I'm the Divine Glow assistant. Ask me about our skincare products, ingredients, or your order — how can I help?"
      );
      return;
    }
    history.forEach((m) => renderMessage(m.role, m.content));
  }

  renderAll();

  // ---- Open/close ----
  launcher.addEventListener("click", () => {
    chatWindow.classList.toggle("dgh-open");
    if (chatWindow.classList.contains("dgh-open")) {
      inputEl.focus();
    }
  });
  closeBtn.addEventListener("click", () => {
    chatWindow.classList.remove("dgh-open");
  });

  // ---- Sending messages ----
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text) return;

    inputEl.value = "";
    sendBtn.disabled = true;

    history.push({ role: "user", content: text });
    renderMessage("user", text);
    saveHistory();

    const typingEl = document.createElement("div");
    typingEl.className = "dgh-msg-typing";
    typingEl.textContent = "Typing...";
    messagesEl.appendChild(typingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) throw new Error("Request failed: " + res.status);

      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't process that. Please try again.";

      typingEl.remove();
      history.push({ role: "assistant", content: reply });
      renderMessage("assistant", reply);
      saveHistory();
    } catch (err) {
      typingEl.remove();
      renderMessage(
        "assistant",
        "Sorry, something went wrong reaching the assistant. Please try again in a moment."
      );
      console.error("Chat widget error:", err);
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
})();
