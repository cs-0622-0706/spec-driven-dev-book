(function () {
  "use strict";

  const MAX_MESSAGE_LENGTH = 300;
  const DEFAULT_NAME = "名無し";

  /** @type {{ name: string, message: string, createdAt: Date }[]} */
  let posts = [];

  const form = document.getElementById("post-form");
  const nameInput = document.getElementById("name");
  const messageInput = document.getElementById("message");
  const formError = document.getElementById("form-error");
  const postList = document.getElementById("post-list");
  const emptyState = document.getElementById("empty-state");
  const charHint = document.getElementById("char-hint");

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  /**
   * @param {Date} d
   * @returns {string}
   */
  function formatDateTime(d) {
    return (
      d.getFullYear() +
      "-" +
      pad2(d.getMonth() + 1) +
      "-" +
      pad2(d.getDate()) +
      " " +
      pad2(d.getHours()) +
      ":" +
      pad2(d.getMinutes())
    );
  }

  function showError(text) {
    formError.textContent = text;
    formError.hidden = false;
  }

  function clearError() {
    formError.textContent = "";
    formError.hidden = true;
  }

  function updateCharHint() {
    const len = messageInput.value.length;
    charHint.textContent = len + " / " + MAX_MESSAGE_LENGTH + " 文字";
  }

  function validateMessage(raw) {
    const trimmed = raw.trim();
    if (trimmed.length === 0) {
      return { ok: false, error: "メッセージを入力してください（空白のみは投稿できません）。" };
    }
    if (raw.length > MAX_MESSAGE_LENGTH) {
      return {
        ok: false,
        error: "メッセージは " + MAX_MESSAGE_LENGTH + " 文字以内にしてください（現在 " + raw.length + " 文字）。",
      };
    }
    return { ok: true, value: raw };
  }

  function normalizeName(raw) {
    const t = raw.trim();
    return t.length === 0 ? DEFAULT_NAME : t;
  }

  function renderPosts() {
    postList.replaceChildren();
    emptyState.hidden = posts.length > 0;

    for (const post of posts) {
      const li = document.createElement("li");
      li.className = "post";

      const meta = document.createElement("div");
      meta.className = "post__meta";

      const nameEl = document.createElement("span");
      nameEl.className = "post__name";
      nameEl.textContent = post.name;

      const dateEl = document.createElement("time");
      dateEl.className = "post__date";
      dateEl.dateTime = post.createdAt.toISOString();
      dateEl.textContent = formatDateTime(post.createdAt);

      meta.append(nameEl, dateEl);

      const body = document.createElement("p");
      body.className = "post__body";
      body.textContent = post.message;

      li.append(meta, body);
      postList.appendChild(li);
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();

    const nameRaw = nameInput.value;
    const messageRaw = messageInput.value;

    const v = validateMessage(messageRaw);
    if (!v.ok) {
      showError(v.error);
      return;
    }

    const entry = {
      name: normalizeName(nameRaw),
      message: v.value,
      createdAt: new Date(),
    };

    posts = [entry, ...posts];
    renderPosts();

    nameInput.value = "";
    messageInput.value = "";
    updateCharHint();
  });

  messageInput.addEventListener("input", updateCharHint);
  updateCharHint();
  renderPosts();
})();
