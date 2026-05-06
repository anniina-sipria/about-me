function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatTime(d) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function updateClock() {
  const el = document.getElementById("clock");
  if (!el) return;
  const now = new Date();
  el.textContent = formatTime(now);
  el.setAttribute("aria-label", `Clock: ${el.textContent}`);
}

function setupStartMenu() {
  const button = document.getElementById("startButton");
  const menu = document.getElementById("startmenu");
  if (!button || !menu) return;

  function setOpen(nextOpen) {
    menu.hidden = !nextOpen;
    button.setAttribute("aria-expanded", String(nextOpen));
    if (nextOpen) {
      const firstLink = menu.querySelector('a:not([aria-disabled="true"])');
      if (firstLink) firstLink.focus();
    } else {
      button.focus();
    }
  }

  function toggle() {
    const open = !menu.hidden;
    setOpen(!open);
  }

  button.addEventListener("click", (e) => {
    e.preventDefault();
    toggle();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      e.preventDefault();
      setOpen(false);
    }
  });

  document.addEventListener("click", (e) => {
    if (menu.hidden) return;
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (menu.contains(target) || button.contains(target)) return;
    setOpen(false);
  });

  menu.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest("a, button")) setOpen(false);
  });
}

function setupSoftNavigation() {
  const currentMain = document.getElementById("content");
  if (!currentMain) return;

  let activeController = null;
  let renderedUrl = window.location.href;

  function isSamePage(url) {
    return url.toString() === renderedUrl;
  }

  function shouldHandleLink(anchor, url) {
    if (!anchor || !(anchor instanceof HTMLAnchorElement)) return false;
    if (!url) return false;

    if (anchor.hasAttribute("download")) return false;
    if (anchor.target && anchor.target !== "_self") return false;
    if (url.origin !== window.location.origin) return false;

    // Let the browser handle in-page hash changes.
    if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return false;

    // Decap CMS admin is a standalone document; don't PJAX it.
    // (On GitHub Pages the site may be served under a path prefix like /about-me/.)
    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/") || url.pathname.includes("/admin/")) return false;

    return true;
  }

  async function loadUrl(nextUrl, { push = true } = {}) {
    if (isSamePage(nextUrl)) return;

    try {
      if (activeController) activeController.abort();
      activeController = new AbortController();

      const res = await fetch(nextUrl.toString(), {
        signal: activeController.signal,
        headers: { "X-Requested-With": "fetch" }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      const nextMain = doc.getElementById("content");
      if (!nextMain) throw new Error("Missing #content");

      // Swap main content.
      currentMain.innerHTML = nextMain.innerHTML;

      // Keep title + taskbar in sync.
      const nextTitle = doc.querySelector("title");
      if (nextTitle) document.title = nextTitle.textContent || document.title;

      const nextTasks = doc.querySelector(".taskbar .tasks");
      const currentTasks = document.querySelector(".taskbar .tasks");
      if (nextTasks && currentTasks) currentTasks.innerHTML = nextTasks.innerHTML;

      if (push) history.pushState({ spa: true }, "", nextUrl.toString());
      renderedUrl = nextUrl.toString();

      if (nextUrl.hash) {
        const id = decodeURIComponent(nextUrl.hash.slice(1));
        const el = document.getElementById(id);
        if (el) el.scrollIntoView();
        else window.scrollTo(0, 0);
      } else {
        window.scrollTo(0, 0);
      }
    } catch (err) {
      // Abort is expected when clicking quickly.
      if (err && err.name === "AbortError") return;
      window.location.assign(nextUrl.toString());
    }
  }

  document.addEventListener("click", (e) => {
    if (e.defaultPrevented) return;
    if (e.button !== 0) return; // only left click
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const target = e.target;
    if (!(target instanceof Element)) return;
    const anchor = target.closest("a");
    if (!anchor) return;

    let url;
    try {
      url = new URL(anchor.getAttribute("href") || "", window.location.href);
    } catch {
      return;
    }

    if (!shouldHandleLink(anchor, url)) return;
    e.preventDefault();
    loadUrl(url, { push: true });
  });

  window.addEventListener("popstate", () => {
    loadUrl(new URL(window.location.href), { push: false });
  });
}

updateClock();
setInterval(updateClock, 15_000);
setupStartMenu();
setupSoftNavigation();
