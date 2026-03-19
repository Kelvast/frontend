export function showLoginScreen(): Promise<{ email: string; pass: string }> {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.id = "login-overlay";
    overlay.innerHTML = `
      <div id="login-box">
        <h1>MMO</h1>
        <input id="login-email" type="email" placeholder="Email" autocomplete="email" />
        <input id="login-pass" type="password" placeholder="Password" autocomplete="current-password" />
        <button id="login-btn">Login</button>
        <p id="login-error"></p>
      </div>
    `;
    document.body.appendChild(overlay);

    const emailInput = overlay.querySelector("#login-email") as HTMLInputElement;
    const passInput = overlay.querySelector("#login-pass") as HTMLInputElement;
    const btn = overlay.querySelector("#login-btn") as HTMLButtonElement;
    const error = overlay.querySelector("#login-error") as HTMLParagraphElement;

    emailInput.focus();

    function attempt() {
      const email = emailInput.value.trim();
      const pass = passInput.value;
      if (!email || !pass) {
        error.textContent = "Please enter email and password.";
        return;
      }
      btn.disabled = true;
      btn.textContent = "Logging in...";
      window.removeEventListener("authFailed", onAuthFailed);
      resolve({ email, pass });
    }

    btn.addEventListener("click", attempt);
    passInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") attempt();
    });

    function onAuthFailed(e: Event) {
      const detail = (e as CustomEvent).detail;
      console.warn(`❌ Auth failed: ${detail}`);
      error.textContent = detail ?? "Login failed.";
      btn.disabled = false;
      btn.textContent = "Login";
      passInput.value = "";
      passInput.focus();
    }

    window.addEventListener("authFailed", onAuthFailed);
  });
}

export function hideLoginScreen() {
  const overlay = document.getElementById("login-overlay");
  if (!overlay) return;
  console.log("🎮 Login successful, loading game...");
  overlay.classList.add("fade-out");
  overlay.addEventListener("transitionend", () => overlay.remove());
}
