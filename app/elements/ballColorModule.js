// ballColorModule.js

// Functie om de RGB-componenten van een hex-kleurstring te converteren naar een object
function hexToRgb(hex) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    return { r, g, b };
}

// Functie om een RGB-object te converteren naar een CSS RGB string
function rgbToCss(rgb) {
    return `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
}

/**
 * Berekent de kleur van de bal op basis van zijn Y-positie, het aantal vingers,
 * de canvashoogte en de kleuren die zijn toegewezen aan elke vinger.
 * De kleur is een graduele overgang tussen de kleuren van de actieve vingers.
 *
 * @param {number} ballY De huidige Y-positie van de bal.
 * @param {number} canvasHeight De hoogte van het canvas.
 * @param {number} numFingers Het aantal actieve vingers (1-4).
 * @param {string[]} fingerColors Een array met hex-kleurstrings voor elke vinger [Vinger1, Vinger2, Vinger3, Vinger4].
 * @returns {string} De berekende RGB-kleurstring (e.g., "rgb(255, 0, 128)").
 */
export function getBallColor(ballY, canvasHeight, numFingers, fingerColors) {
    if (numFingers < 1 || numFingers > 4 || !fingerColors || fingerColors.length === 0) {
        return '#e74c3c'; // Fallback naar rode bal
    }

    // Bereken het 'toongedeelte' van het canvas
    // De bal beweegt tussen 10% en 90% van de canvashoogte.
    // Dit correleert met minHeight en maxHeight in generateMountainPath.
    const playableHeightStart = canvasHeight * 0.1;
    const playableHeightEnd = canvasHeight * 0.9;
    const playableHeightRange = playableHeightEnd - playableHeightStart;

    // Normaliseer de balY-positie naar een waarde tussen 0 en 1,
    // waarbij 0 = laagste toon (hoogste Y), 1 = hoogste toon (laagste Y).
    // Let op: Y-coördinaten in Canvas zijn omgekeerd (hogere Y is lager op scherm).
    let normalizedY = (ballY - playableHeightStart) / playableHeightRange;
    normalizedY = Math.max(0, Math.min(1, normalizedY)); // Zorg dat het tussen 0 en 1 blijft

    // Omkeren zodat 0 bovenaan (hoge toon) is en 1 onderaan (lage toon) is.
    // Vinger 1 is voor de hoge noten (bovenaan), vinger N voor de lage noten (onderaan).
    // Dus 0 = vinger 1, 1 = vinger N.
    normalizedY = 1 - normalizedY;


    // Bepaal het 'vingersegment' waar de bal zich bevindt
    // Bij 4 vingers: 0.0-0.25 (Vinger 1), 0.25-0.50 (Vinger 2), 0.50-0.75 (Vinger 3), 0.75-1.0 (Vinger 4)
    const segmentSize = 1 / numFingers;
    const currentFingerIndex = Math.floor(normalizedY / segmentSize); // 0-indexed

    // Bepaal de kleuren van de twee vingers waartussen geïnterpoleerd wordt
    const startFingerColorIndex = Math.min(currentFingerIndex, numFingers - 1); // Zorg dat we niet buiten de array gaan
    const endFingerColorIndex = Math.min(currentFingerIndex + 1, numFingers - 1);

    const color1Hex = fingerColors[startFingerColorIndex];
    const color2Hex = fingerColors[endFingerColorIndex];

    const rgb1 = hexToRgb(color1Hex);
    const rgb2 = hexToRgb(color2Hex);

    // Bereken de progressie binnen het huidige vingersegment (0 tot 1)
    let progressInSegment = (normalizedY - (currentFingerIndex * segmentSize)) / segmentSize;
    // Als we aan het laatste segment zijn en er is maar 1 vinger, dan is er geen overgang
    if (numFingers === 1) {
        progressInSegment = 0; // Geen overgang
    }

    // Interpolatie van RGB-waarden
    const r = rgb1.r + (rgb2.r - rgb1.r) * progressInSegment;
    const g = rgb1.g + (rgb2.g - rgb1.g) * progressInSegment;
    const b = rgb1.b + (rgb2.b - rgb1.b) * progressInSegment;

    return rgbToCss({ r, g, b });
}