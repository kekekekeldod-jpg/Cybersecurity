document.addEventListener('DOMContentLoaded', () => {
  const authModal   = document.getElementById('authModal');
  const authCard    = authModal?.querySelector('.auth-card');
  const closeAuthBtn = authModal?.querySelector('.auth-close');
  const toRegister  = authModal?.querySelector('#toRegister');
  const toLogin     = authModal?.querySelector('#toLogin');

  // Öffnen-Button: nimm zuerst #openAuth, sonst .nav-btn
  const openAuthBtn = document.getElementById('openAuth') || document.querySelector('.nav-btn');

  const loginForm    = document.getElementById('loginForm');
  const loginEmail   = document.getElementById('loginEmail');
  const loginPass    = document.getElementById('loginPass');
  const registerForm = document.getElementById('registerForm');
  const regEmail     = document.getElementById('regEmail');
  const regPass      = document.getElementById('regPass');

  // Wenn Backend und Frontend auf derselben Domain / Port laufen, bleibt das leer:
  const API = ''; 

  // ---------------- API-Helfer ----------------

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

  // ---------------- Modal öffnen / schließen ----------------

  function openAuth(mode = 'login') {
    if (!authModal || !authCard) return;

    authModal.classList.add('open');

    if (window.innerWidth <= 800) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    if (mode === 'register') {
      authCard.classList.add('show-register');
    } else {
      authCard.classList.remove('show-register');
    }

    // Kleine 3D-Animation neu triggern
    authCard.classList.remove('rotate-in');
    // Reflow erzwingen, damit die Animation neu startet
    void authCard.offsetWidth;
    authCard.classList.add('rotate-in');
  }

  function closeAuth() {
    authModal?.classList.remove('open');
    authCard?.classList.remove('rotate-in');
    document.body.classList.remove('no-scroll');
  }

  // ---------------- Event-Listener ----------------

  // Modal über Button öffnen
  openAuthBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openAuth('login');
  });

  // Modal durch Klick außerhalb / auf X schließen
  authModal?.addEventListener('click', (e) => {
    if (
      e.target === authModal ||
      e.target === closeAuthBtn ||
      e.target?.closest('.auth-close')
    ) {
      closeAuth();
    }
  });

  // Tabs Login <-> Register
  toRegister?.addEventListener('click', () => authCard?.classList.add('show-register'));
  toLogin?.addEventListener('click', () => authCard?.classList.remove('show-register'));

  // ESC schließt Modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal?.classList.contains('open')) {
      closeAuth();
    }
  });

  // ---------------- LOGIN ----------------

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = loginEmail.value.trim();
    const password = loginPass.value;

    if (!email || !password) {
      alert('Bitte E-Mail und Passwort eingeben.');
      return;
    }

    const btn = loginForm.querySelector('button[type="submit"]');
    if (!btn) return;
    btn.disabled = true;

    try {
      const res = await apiLogin(email, password);
      if (res.ok) {
        closeAuth();
        // Geschützte Seite nach Login:
        window.location.href = '/member/white-hat-hacker';
      } else {
        alert(res.error || 'Login fehlgeschlagen');
      }
    } catch (err) {
      console.error(err);
      alert('Es ist ein Fehler beim Login aufgetreten.');
    } finally {
      btn.disabled = false;
    }
  });

  // ---------------- REGISTER ----------------

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = regEmail.value.trim();
    const password = regPass.value;

    if (!email || !password) {
      alert('Bitte E-Mail und Passwort eingeben.');
      return;
    }

    const btn = registerForm.querySelector('button[type="submit"]');
    if (!btn) return;
    btn.disabled = true;

    try {
      const res = await apiRegister(email, password);
      if (res.ok) {
        alert('Registriert! Jetzt einloggen.');
        authCard?.classList.remove('show-register');
      } else {
        alert(res.error || 'Registrierung fehlgeschlagen');
      }
    } catch (err) {
      console.error(err);
      alert('Es ist ein Fehler bei der Registrierung aufgetreten.');
    } finally {
      btn.disabled = false;
    }
  });
});