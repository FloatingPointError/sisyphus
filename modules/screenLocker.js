class ScreenLocker {
    let wakeLock = null;
    
    /**
     * Vraagt een wake lock aan om te voorkomen dat het scherm uitschakelt.
     */
    async function requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake Lock activated!');
                wakeLock.addEventListener('release', () => {
                    console.log('Wake Lock released by the system.');
                    wakeLock = null; // Zorg dat de referentie wordt geleegd
                });
            } catch (err) {
                console.error(`Fout bij aanvragen Wake Lock: ${err.name}, ${err.message}`);
            }
        } else {
            console.warn('Wake Lock API wordt niet ondersteund in deze browser.');
        }
    }

    /**
     * Geeft de actieve wake lock vrij.
     */
    function releaseWakeLock() {
        if (state.wakeLock) {
            state.wakeLock.release();
            state.wakeLock = null;
            console.log('Wake Lock vrijgegeven!');
        }
    }
}
    
    // Een object om alle geëxporteerde functies van de modules te bundelen
