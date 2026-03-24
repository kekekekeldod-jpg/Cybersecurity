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
 
  // Fingerprint sammeln
 function getGpuInfo() {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');

    if (!gl) {
      return {
        gpuVendor: '',
        gpuRenderer: ''
      };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');

    if (!debugInfo) {
      return {
        gpuVendor: '',
        gpuRenderer: ''
      };
    }

    const gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
    const gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';

    return {
      gpuVendor: String(gpuVendor).slice(0, 200),
      gpuRenderer: String(gpuRenderer).slice(0, 300)
    };
  } catch {
    return {
      gpuVendor: '',
      gpuRenderer: ''
    };
  }
}

function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(10, 10, 100, 30);
    ctx.fillStyle = '#069';
    ctx.fillText('Merdo-Fingerprint', 12, 12);

    return canvas.toDataURL().slice(0, 180);
  } catch {
    return '';
  }
}

function getWebglInfo() {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');

    if (!gl) {
      return {
        webglVendor: '',
        webglRenderer: '',
        webglVersion: '',
        webglShadingLanguageVersion: ''
      };
    }

    return {
      webglVendor: String(gl.getParameter(gl.VENDOR) || '').slice(0, 200),
      webglRenderer: String(gl.getParameter(gl.RENDERER) || '').slice(0, 300),
      webglVersion: String(gl.getParameter(gl.VERSION) || '').slice(0, 200),
      webglShadingLanguageVersion: String(gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || '').slice(0, 200)
    };
  } catch {
    return {
      webglVendor: '',
      webglRenderer: '',
      webglVersion: '',
      webglShadingLanguageVersion: ''
    };
  }
}

async function getHighEntropyUAData() {
  try {
    if (!navigator.userAgentData?.getHighEntropyValues) return {};

    const data = await navigator.userAgentData.getHighEntropyValues([
      'architecture',
      'bitness',
      'model',
      'platformVersion',
      'uaFullVersion',
      'fullVersionList'
    ]);

    return data || {};
  } catch {
    return {};
  }
}

async function createDeviceId(payload) {
  try {
    const text = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return '';
  }
}

async function getFingerprint() {
  const gpu = getGpuInfo();
  const webgl = getWebglInfo();
  const uaData = await getHighEntropyUAData();

  const raw = {
    userAgent: navigator.userAgent || '',
    language: navigator.language || '',
    languages: Array.isArray(navigator.languages) ? navigator.languages.slice(0, 10) : [],
    screen: `${window.screen.width}x${window.screen.height}`,
    availScreen: `${window.screen.availWidth}x${window.screen.availHeight}`,
    colorDepth: Number(window.screen.colorDepth || 0),
    pixelRatio: Number(window.devicePixelRatio || 1),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    platform: navigator.platform || '',
    hardwareConcurrency: Number(navigator.hardwareConcurrency || 0),
    deviceMemory: Number(navigator.deviceMemory || 0),
    maxTouchPoints: Number(navigator.maxTouchPoints || 0),
    cookieEnabled: Boolean(navigator.cookieEnabled),
    online: Boolean(navigator.onLine),

    connection: {
      effectiveType: navigator.connection?.effectiveType || '',
      rtt: Number(navigator.connection?.rtt || 0),
      downlink: Number(navigator.connection?.downlink || 0),
      saveData: Boolean(navigator.connection?.saveData || false)
    },

    gpuVendor: gpu.gpuVendor,
    gpuRenderer: gpu.gpuRenderer,

    webglVendor: webgl.webglVendor,
    webglRenderer: webgl.webglRenderer,
    webglVersion: webgl.webglVersion,
    webglShadingLanguageVersion: webgl.webglShadingLanguageVersion,

    canvasFingerprint: getCanvasFingerprint(),
    uaData
  };

  const deviceId = await createDeviceId(raw);

  return {
    ...raw,
    deviceId
  };
}
  // Fingerprint direkt an Backend senden
 async function sendFingerprint() {
  try {
    const fp = await getFingerprint();

    await fetch(`${API}/api/fingerprint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(fp)
    });
  } catch (err) {
    console.warn('Fingerprint konnte nicht gesendet werden:', err);
  }
}
  // ---------------- API-Helfer ----------------

  async function apiRegister(email, password) {
  const fingerprint = await getFingerprint();

  const r = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email,
      password,
      fingerprint
    })
  });

  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, ...data };
}

async function apiLogin(email, password) {
  const fingerprint = await getFingerprint();

  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email,
      password,
      fingerprint
    })
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

  // Fingerprint beim Laden erfassen
  sendFingerprint();

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

    const email = loginEmail.value.trim();
    const password = loginPass.value;

    if (!email || !password) {
      swal({
        className: "swal-register",
        title: "Schade 🫤",
        text: "Bitte gebe eine gültige E-Mail oder Passwort ein.",
        icon: "error",
        button: "Ok",
      });
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
        swal({
          className: "swal-register",
          title: "Schade 🫤",
          text: res.error || "Login fehlgeschlagen.",
          icon: "error",
          button: "Ok",
        });
      }
    } catch (err) {
      console.error(err);
      swal({
        className: "swal-register",
        title: "Schade 🫤",
        text: "Es ist ein Fehler beim Login aufgetreten.",
        icon: "error",
        button: "Ok",
      });
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
      swal({
        className: "swal-register",
        title: "Upps... 😅",
        text: "Bitte E-Mail und Passwort eingeben.",
        icon: "error",
        button: "Ok",
      });
      return;
    }

    const btn = registerForm.querySelector('button[type="submit"]');
    if (!btn) return;
    btn.disabled = true;

    try {
      const res = await apiRegister(email, password);
      if (res.ok) {
        swal({
          className: "swal-register",
          title: "Super 🤩",
          text: "Registriert! Jetzt logge dich bitte ein.",
          icon: "info",
          button: "Ok",
        });
        authCard?.classList.remove('show-register');
      } else {
        swal({
          className: "swal-register",
          title: "Schade 🫤",
          text: res.error || "Registrierung fehlgeschlagen.",
          icon: "error",
          button: "Ok",
        });
      }
    } catch (err) {
      console.error(err);
      swal({
        className: "swal-register",
        title: "Schade 🫤",
        text: "Es ist ein Fehler bei der Registrierung aufgetreten.",
        icon: "error",
        button: "Ok",
      });
    } finally {
      btn.disabled = false;
    }
  });
});