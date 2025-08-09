// modules/screenLocker.js

/**
 * Een klasse om de Screen Wake Lock API te beheren.
 * Voorkomt dat het scherm uitschakelt terwijl de animatie actief is.
 */
export class ScreenLocker {
    constructor() {
        this.wakeLock = null;
    }

    /**
     * Vraagt een wake lock aan om te voorkomen dat het scherm uitschakelt.
     */
    async requestWakeLock() {
        // Controleer of de Wake Lock API wordt ondersteund
        if ('wakeLock' in navigator) {
            try {
                // Vraag de 'screen' wake lock aan
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake Lock activated!');

                // Voeg een listener toe voor wanneer de lock wordt vrijgegeven
                this.wakeLock.addEventListener('release', () => {
                    console.log('Wake Lock released by the system.');
                    this.wakeLock = null;
                });

            } catch (err) {
                // Toon een waarschuwing als er een fout optreedt
                console.error(`Error when requesting Wake Lock: ${err.name}, ${err.message}`);
            }
        } else {
            console.warn('Wake Lock API is not supported by this browser.');
        }
    }

    /**
     * Geeft de actieve wake lock vrij.
     */
    releaseWakeLock() {
        if (this.wakeLock) {
            this.wakeLock.release();
            this.wakeLock = null;
            console.log('Wake Lock released!');
        }
    }
}
