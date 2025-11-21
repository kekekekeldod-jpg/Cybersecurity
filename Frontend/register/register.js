document.addEventListener('DOMContentLoaded', () => {
  const authModal = document.getElementById('authModal');
  const authCard  = authModal?.querySelector('.auth-card');
  const closeAuthBtn = authModal?.querySelector('.auth-close');
  const toRegister = authModal?.querySelector('#toRegister');
  const toLogin    = authModal?.querySelector('#toLogin');
  const openAuthBtn = document.getElementById('openAuth') || document.querySelector('.nav-btn');

  const loginForm    = document.getElementById('loginForm');
  const loginEmail   = document.getElementById('loginEmail');
  const loginPass    = document.getElementById('loginPass');
  const registerForm = document.getElementById('registerForm');
  const regEmail     = document.getElementById('regEmail');
  const regPass      = document.getElementById('regPass');

  const API = ''; // gl

  async function apiRegister(email, password) {
    const r = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, ...data };
  }

  async function apiLogin(email, password) {
    const r = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, ...data };
  }

  function openAuth(mode = 'login') {
    if (!authModal || !authCard) return;
    authModal.classList.add('open');
    if (window.innerWidth <= 800){
       document.body.classList.add('no-scroll');
    }
    else{
        document.body.classList.remove('no-scroll');
    }
    if (mode === 'register') authCard.classList.add('show-register');
    else authCard.classList.remove('show-register');
  }
  function closeAuth() {
    authModal?.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }

  openAuthBtn?.addEventListener('click', (e) => { e.preventDefault(); openAuth('login'); 
    authCard.classList.remove('rotate-in'); void authCard.offSetWidth; authCard.classList.add('rotate-in');
  });

  authModal?.addEventListener('click', (e) => {
    if (e.target === authModal || e.target === closeAuthBtn || e.target?.closest('.auth-close')) closeAuth();
    authCard.classList.remove('rotate-in');
  });
  toRegister?.addEventListener('click', () => authCard?.classList.add('show-register'));
  toLogin?.addEventListener('click', () => authCard?.classList.remove('show-register'));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal?.classList.contains('open')) closeAuth();
  });

  // LOGIN
  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginEmail.value.trim();
    const password = loginPass.value;
    if (!email || !password) return alert('Bitte E-Mail und Passwort eingeben.');
    const btn = loginForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const res = await apiLogin(email, password);
      if (res.ok) {
        closeAuth();
        window.location.href = '/member/white-hat-hacker'; // <- deine geschützte Seite
      } else {
        alert(res.error || 'Login fehlgeschlagen');
      }
    } finally { btn.disabled = false; }
  });

  // REGISTER
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = regEmail.value.trim();
    const password = regPass.value;
    if (!email || !password) return alert('Bitte E-Mail und Passwort eingeben.');
    const btn = registerForm.querySelector('button[type="submit"]');
    btn.disabled = true;
    try {
      const res = await apiRegister(email, password);
      if (res.ok) {
        alert('Registriert! Jetzt einloggen.');
        authCard?.classList.remove('show-register');
      } else {
        alert(res.error || 'Registrierung fehlgeschlagen');
      }
    } finally { btn.disabled = false; }
  });
});
