export class InputHandler {
    constructor() {
        this.keys = [];

        window.addEventListener('keydown', e => {
            console.log(e.key);

            if (   e.key === 'ArrowDown' ||
                   e.key === 'ArrowUp' || 
                   e.key === 'ArrowRight' ||
                   e.key === 'ArrowLeft' ||
                   e.key === 'Enter'
            ) {
                // Browser-Standardverhalten (Scrollen etc.) immer blockieren
                e.preventDefault();

                // Nur hinzufügen, wenn noch nicht drin
                if (this.keys.indexOf(e.key) === -1) {
                    this.keys.push(e.key);
                }
            }

            console.log('keydown:', e.key, this.keys);
        });

        window.addEventListener('keyup', e =>  {
            if (   e.key === 'ArrowDown' ||
                   e.key === 'ArrowUp' ||
                   e.key === 'ArrowRight' ||
                   e.key === 'ArrowLeft' ||
                   e.key === 'Enter') {

                // Auch beim Loslassen Standardverhalten blockieren
                e.preventDefault();

                const index = this.keys.indexOf(e.key);
                if (index > -1) {
                    this.keys.splice(index, 1);
                }
            }

            console.log('keyup:', e.key, this.keys);
        });
    }
}
