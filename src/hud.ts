import { logout } from "./net";

export function mountHUD() {
  document.getElementById("hud-logout")!.addEventListener("click", logout);
}

export function showHUD() {
  document.getElementById("hud")!.style.display = "block";
}

export function hideHUD() {
  document.getElementById("hud")!.style.display = "none";
}
