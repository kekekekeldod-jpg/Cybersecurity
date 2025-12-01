// inputSmartphone.js

export function setupMobileControls() {
    const buttons = document.querySelectorAll('.keys .arr');
    if (!buttons.length) return; // Falls es keine Buttons gibt, abbrechen

    buttons.forEach(btn => {
        const key = btn.dataset.key;
        if (!key) return;

        // Touchstart → KEYDOWN simulieren
        btn.addEventListener('touchstart', e => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key }));
            e.preventDefault();
        });

        // Touchend → KEYUP simulieren
        btn.addEventListener('touchend', e => {
            window.dispatchEvent(new KeyboardEvent("keyup", { key }));
            e.preventDefault();
        });

        // Mousedown → KEYDOWN (für PC)
        btn.addEventListener('mousedown', e => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key }));
            e.preventDefault();
        });

        // Mouseup → KEYUP (für PC)
        btn.addEventListener('mouseup', e => {
            window.dispatchEvent(new KeyboardEvent("keyup", { key }));
            e.preventDefault();
        });
    });
}
