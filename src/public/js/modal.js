document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("resourceModal");
  const preview = document.getElementById("previewArea");
  const commentsList = document.getElementById("commentsList");
  const commentForm = document.getElementById("commentForm");
  const shareFB = document.getElementById("shareFacebook");
  const shareTW = document.getElementById("shareTwitter");
  const closeBtn = modal.querySelector(".modal-close");

  // Opens the modal
  document.querySelectorAll("a.button[data-id]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const id = btn.dataset.id;
      commentForm.dataset.resourceId = id;
      // Load resource metadata
      const res = await fetch(`/api/resources/${id}`);
      const resource = await res.json();
      // Render preview
      preview.innerHTML = renderPreview(resource);
      // Load comments
      loadComments(id);
      // Setup share links
      const url = `${window.location.origin}/resource/${id}`;
      shareFB.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`;
      shareTW.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}`;
      modal.classList.add("open");
    });
  });

  closeBtn.addEventListener("click", () => modal.classList.remove("open"));

  // Render preview based on file type
  function renderPreview(r) {
    const ext = r.filename.split(".").pop().toLowerCase();
    const path = `/${r.path}`;
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
      return `<img src="${path}" alt="${r.metadata.titulo}"/>`;
    }
    if (["mp4", "webm"].includes(ext)) {
      return `<video controls src="${path}" style="max-width:100%;"></video>`;
    }
    if (["mp3", "wav"].includes(ext)) {
      return `<audio controls src="${path}"></audio>`;
    }
    if (["pdf"].includes(ext)) {
      return `<iframe src="${path}" style="width:100%;height:100%;"></iframe>`;
    }
    return `<p><a href="${path}" download>${r.filename}</a></p>`;
  }

  async function loadComments(id) {
    commentsList.innerHTML = "";
    const res = await fetch(`/api/resources/${id}/comments`);
    const comments = await res.json();
    comments.forEach((c) => {
      const li = document.createElement("li");
      li.textContent = `${c.author.username}: ${c.content}`;
      commentsList.appendChild(li);
    });
  }

  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = commentForm.dataset.resourceId;
    const data = { content: commentForm.content.value };
    const res = await fetch(`/api/resources/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      commentForm.content.value = "";
      loadComments(id);
    } else {
      alert("Erro ao enviar comentário");
    }
  });
});
