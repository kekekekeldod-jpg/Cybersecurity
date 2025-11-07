// === AUTH MODAL + BACKEND-KOMMUNIKATION ===
document.addEventListener('DOMContentLoaded', () => {
  // ---- UI-Elemente ----
  const openRegisterBtn = document.querySelector('.nav-btn');      // Header-Button (optional)
  const authModal       = document.getElementById('authModal');
  const authCard        = authModal.querySelector('.auth-card');
  const closeAuthBtn    = authModal.querySelector('.auth-close');
  const toRegister      = authModal.querySelector('#toRegister');
  const toLogin         = authModal.querySelector('#toLogin');

  // Formulare + Eingaben (IDs wie in index.html)
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPass  = document.getElementById('loginPass');
  const registerForm = document.getElementById('registerForm');
  const regEmail  = document.getElementById('regEmail');
  const regPass   = document.getElementById('regPass');

  // ---- Basis-URL (gleiches Origin) ----
  const API = ''; // leer = gleicher Server (http://localhost:3000)

  // ---- API-Helper ----
  async function apiRegister(username, password) {
    const r = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    return r.json();
  }

  async function apiLogin(username, password) {
    const r = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });
    return r.json();
  }

  async function apiLogout() {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
  }

  // ---- Modal Steuerung ----
  function openAuth(mode = 'login') {
    authModal.classList.add('open');
    document.body.classList.add('no-scroll');
    if (mode === 'register') authCard.classList.add('show-register');
    else authCard.classList.remove('show-register');
  }

  function closeAuth() {
    authModal.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }

  // Header-Button (optional) öffnet Login
  openRegisterBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openAuth('login');
  });

  // Overlay-Klick schließt (Hintergrund oder X)
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal || e.target === closeAuthBtn || e.target.closest('.auth-close')) {
      closeAuth();
    }
  });

  // Wechsel Login <-> Register
  toRegister.addEventListener('click', () => authCard.classList.add('show-register'));
  toLogin.addEventListener('click', () => authCard.classList.remove('show-register'));

  // ESC zum Schließen
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal.classList.contains('open')) closeAuth();
  });

  // ---- LOGIN ----
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginEmail.value.trim();
    const pass  = loginPass.value;
    if (!email || !pass) return alert('Bitte E-Mail und Passwort eingeben.');
    const res = await apiLogin(email, pass);
    if (res.ok) {
      closeAuth();
      // Nach Login: geschützte Seite anfordern
      window.location.href = '/member/anime';
    } else {
      alert(res.error || 'Login fehlgeschlagen');
    }
  });

  // ---- REGISTRIERUNG ----
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = regEmail.value.trim();
    const pass  = regPass.value;
    if (!email || !pass) return alert('Bitte E-Mail und Passwort eingeben.');
    const res = await apiRegister(email, pass);
    if (res.ok) {
      alert('Registriert! Jetzt einloggen.');
      authCard.classList.remove('show-register'); // zurück zum Login-Screen
    } else {
      alert(res.error || 'Registrierung fehlgeschlagen');
    }
  });
});
