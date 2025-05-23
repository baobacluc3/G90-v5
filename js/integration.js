(function () {
  "use strict";

  function loadChatbotWidget() {
    if (document.getElementById("chatbot-widget")) {
      return;
    }

    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "/css/chatbot-widget.css";
    document.head.appendChild(css);

    fetch("/components/chatbot-widget.html")
      .then((response) => response.text())
      .then((html) => {
        const div = document.createElement("div");
        div.innerHTML = html;
        document.body.appendChild(div.firstElementChild);
      })
      .catch((error) => {
        console.warn("Không thể tải chatbot widget:", error);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadChatbotWidget);
  } else {
    loadChatbotWidget();
  }
})();
