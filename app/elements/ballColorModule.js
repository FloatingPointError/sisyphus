// ballColorModule.js

function hexToRgb(hex) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return { r, g, b };
}

function rgbToCss(rgb) {
    return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
}

// Interne staat van de module
let currentFingerIndex = 0; // De vinger die NU actief is (0-indexed)
let nextColorChangeTime = 0; // Tijdstempel voor wanneer de volgende kleurwisseling moet plaatsvinden
let currentBeatIntervalMs = 1200; // Standaard 50 BPM (60000ms / 50 = 1200ms)

/**
 * Initialiseert de vingerkleurlogica.
 * Wordt aangeroepen bij de start van een animatie of reset.
 * @param {number} initialNumFingers - Het initiële aantal vingers om mee te starten.
 * @param {number} initialTempoBPM - Het initiële tempo in BPM.
 */
export function initializeBallColorLogic(initialNumFingers, initialTempoBPM) {
    // Stel de startvinger willekeurig in, gebaseerd op het aantal vingers
    currentFingerIndex = Math.floor(Math.random() * initialNumFingers);
    // Bereken het beatInterval op basis van het initiële tempo
    currentBeatIntervalMs = 60000 / initialTempoBPM;
    // De eerste wisseling is over 1 beat interval vanaf nu
    nextColorChangeTime = performance.now() + currentBeatIntervalMs;
}

/**
 * Update het tempo voor de kleurverandering.
 * @param {number} newTempoBPM - Het nieuwe tempo in BPM.
 */
export function updateColorTempo(newTempoBPM) {
    const oldBeatIntervalMs = currentBeatIntervalMs;
    currentBeatIntervalMs = 60000 / newTempoBPM;

    // Pas nextColorChangeTime aan om de overgang consistent te houden
    // Als we al bezig zijn met een interval, behoud de relatieve voortgang
    const timeIntoCurrentBeat = performance.now() - (nextColorChangeTime - oldBeatIntervalMs);
    const progressIntoCurrentBeat = timeIntoCurrentBeat / oldBeatIntervalMs;

    // Plan de volgende wisseling met het nieuwe interval, vanaf het huidige 'relatieve' punt
    nextColorChangeTime = performance.now() - (progressIntoCurrentBeat * currentBeatIntervalMs) + currentBeatIntervalMs;
}


/**
 * Berekent de huidige kleur van de bal. De kleur wisselt direct
 * op basis van het ingestelde BPM.
 *
 * @param {number} currentTime - Het huidige tijdstempel (performance.now()).
 * @param {number} numFingers - Het aantal actieve vingers (1-4).
 * @param {string[]} fingerColors - Een array met hex-kleurstrings voor elke vinger.
 * @returns {string} De berekende RGB-kleurstring.
 */
export function getDirectBallColor(currentTime, numFingers, fingerColors) {
    if (numFingers < 1 || numFingers > 4 || !fingerColors || fingerColors.length === 0) {
        return '#e74c3c'; // Fallback naar rode bal
    }

    if (numFingers === 1) { // Als er maar 1 vinger is, toon altijd die kleur
        return fingerColors[0];
    }

    // Controleer of het tijd is om van kleur te wisselen
    if (currentTime >= nextColorChangeTime) {
        // Kies een willekeurige nieuwe vinger, exclusief de huidige als mogelijk
        let newFingerIndex;
        do {
            newFingerIndex = Math.floor(Math.random() * numFingers);
        } while (newFingerIndex === currentFingerIndex && numFingers > 1); // Blijf kiezen totdat het een andere vinger is, tenzij er maar 1 vinger is

        currentFingerIndex = newFingerIndex; // Update de actieve vinger
        nextColorChangeTime = currentTime + currentBeatIntervalMs; // Plan de volgende wisseling met het dynamische interval
    }

    // Retourneer de kleur van de actieve vinger
    const activeColorHex = fingerColors[currentFingerIndex];
    const rgb = hexToRgb(activeColorHex);
    
    return rgbToCss(rgb);
}