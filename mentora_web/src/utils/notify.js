// ابزار سراسری Toast و Confirm با زبان بصری دیزاین‌سیستم منتورا
// جایگزین alert() و window.confirm() نیتیو مرورگر

function ensureContainer() {
  let el = document.getElementById("mentora-toast-root");
  if (!el) {
    el = document.createElement("div");
    el.id = "mentora-toast-root";
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.style.cssText =
      "position:fixed;top:20px;right:50%;transform:translateX(50%);z-index:10000;" +
      "display:flex;flex-direction:column;gap:10px;align-items:center;direction:rtl;pointer-events:none;";
    document.body.appendChild(el);
  }
  return el;
}

const PALETTE = {
  success: { bg: "var(--success-tint)", fg: "var(--success)", border: "var(--success)" },
  error: { bg: "var(--danger-tint)", fg: "var(--danger)", border: "var(--danger)" },
  info: { bg: "var(--primary-tint)", fg: "var(--primary-active)", border: "var(--primary)" },
  warning: { bg: "var(--warning-tint)", fg: "var(--warning)", border: "var(--warning)" },
};

export function showToast(message, type = "info", duration = 3200) {
  const root = ensureContainer();
  const colors = PALETTE[type] || PALETTE.info;

  const toast = document.createElement("div");
  toast.style.cssText =
    `background:${colors.bg};color:${colors.fg};border:1px solid ${colors.border};` +
    "border-radius:14px;padding:12px 20px;font-size:14px;font-weight:700;" +
    "box-shadow:0 8px 28px rgba(20,32,30,.14);max-width:min(420px,90vw);" +
    "opacity:0;transform:translateY(-8px);transition:opacity .25s ease,transform .25s ease;" +
    "pointer-events:auto;text-align:center;line-height:1.7;";
  toast.textContent = message;
  root.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-8px)";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

export function confirmDialog(message, { confirmText = "تأیید", cancelText = "انصراف", danger = false } = {}) {
  return new Promise((resolve) => {
    const previousFocus = document.activeElement;
    const overlay = document.createElement("div");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", message);
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:10001;display:flex;align-items:center;justify-content:center;" +
      "background:rgba(20,32,30,.45);backdrop-filter:blur(3px);direction:rtl;padding:20px;";

    const box = document.createElement("div");
    box.style.cssText =
      "background:var(--bg-surface);border:1px solid var(--border);border-radius:20px;padding:24px;" +
      "max-width:360px;width:100%;box-shadow:var(--shadow-pop);text-align:center;";

    const text = document.createElement("p");
    text.style.cssText = "margin:0 0 20px;font-size:15px;font-weight:700;color:var(--text-primary);line-height:1.9;";
    text.textContent = message;

    const row = document.createElement("div");
    row.style.cssText = "display:flex;gap:10px;justify-content:center;";

    const btnBase =
      "min-height:42px;padding:0 22px;border-radius:12px;font-family:inherit;" +
      "font-size:14px;font-weight:700;cursor:pointer;border:none;";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.style.cssText = btnBase + "background:transparent;color:var(--text-primary);border:1.5px solid var(--border);";
    cancelBtn.textContent = cancelText;

    const okBtn = document.createElement("button");
    okBtn.type = "button";
    okBtn.style.cssText =
      btnBase +
      (danger
        ? "background:var(--danger);color:#fff;"
        : "background:linear-gradient(180deg,var(--primary),var(--primary-hover));color:#fff;");
    okBtn.textContent = confirmText;

    let settled = false;
    const close = (result) => {
      if (settled) return;
      settled = true;
      overlay.remove();
      document.removeEventListener("keydown", onKey);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
      resolve(result);
    };
    const onKey = (e) => {
      if (e.key === "Escape") close(false);
    };

    cancelBtn.onclick = () => close(false);
    okBtn.onclick = () => close(true);
    overlay.onclick = (e) => {
      if (e.target === overlay) close(false);
    };
    document.addEventListener("keydown", onKey);

    row.appendChild(cancelBtn);
    row.appendChild(okBtn);
    box.appendChild(text);
    box.appendChild(row);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    okBtn.focus();
  });
}
