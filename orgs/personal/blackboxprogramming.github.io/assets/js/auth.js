function login(e) {
  e.preventDefault();
  localStorage.setItem("blackroad_auth", "true");
  window.location.href = "/dashboard/index.html";
}

function logout() {
  localStorage.removeItem("blackroad_auth");
  window.location.href = "/";
}

function requireAuth() {
  if (!localStorage.getItem("blackroad_auth")) {
    window.location.href = "/auth/login.html";
  }
}
