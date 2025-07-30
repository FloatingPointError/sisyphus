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

// Interne staat van de module
let currentFingerIndex = 0; // The finger that is CURRENTLY active (0-indexed)
let nextColorChangeTime = 0; // Timestamp for when the next color change should occur
let currentBeatIntervalMs = 1200; // Default 50 BPM (60000ms / 50 = 1200ms)
let internalFingerColors = []; // Internal array to store the current finger colors

// Callback function for when a color changes
let onColorChangeCallback = null;

/**
 * Initializes the finger color logic.
 * Called at the start of an animation or reset.
 * @param {number} initialNumFingers - The initial number of fingers to start with.
 * @param {number} initialTempoBPM - The initial tempo in BPM.
 * @param {string[]} initialFingerColors - An array with hex color strings for each finger.
 */
function initializeBallColorLogic(initialNumFingers, initialTempoBPM, initialFingerColors) {
    // Set the starting finger randomly, based on the number of fingers
    currentFingerIndex = Math.floor(Math.random() * initialNumFingers);
    // Calculate the beat interval based on the initial tempo
    currentBeatIntervalMs = calculateColorTempoMs(initialTempoBPM);
    // The first change is 1 beat interval from now
    nextColorChangeTime = performance.now() + currentBeatIntervalMs;
    internalFingerColors = initialFingerColors; // Store initial colors internally
}

/**
 * Updates the tempo for the color change.
 * @param {number} newTempoBPM - The new tempo in BPM.
 */
function updateColorTempo(newTempoBPM) {
    const oldBeatIntervalMs = currentBeatIntervalMs;
    currentBeatIntervalMs = 60000 / newTempoBPM;

    // Adjust nextColorChangeTime to keep the transition consistent
    // If we are already in an interval, maintain the relative progress
    const timeIntoCurrentBeat = performance.now() - (nextColorChangeTime - oldBeatIntervalMs);
    const progressIntoCurrentBeat = timeIntoCurrentBeat / oldBeatIntervalMs;

    // Plan the next change with the new interval, from the current 'relative' point
    nextColorChangeTime = performance.now() - (progressIntoCurrentBeat * currentBeatIntervalMs) + currentBeatIntervalMs;
}

/**
 * Updates the internal finger colors array.
 * @param {string[]} newColors - The new array of hex color strings.
 */
function updateFingerColors(newColors) {
    internalFingerColors = newColors;
}

/**
 * Calculates the current color of the ball. The color changes instantly
 * based on the set BPM.
 *
 * @param {number} currentTime - The current timestamp (performance.now()).
 * @param {number} numFingers - The number of active fingers (1-4).
 * @returns {string} The calculated RGB color string.
 */
function getDirectBallColor(currentTime, numFingers) {
    // Ensure numFingers is valid, otherwise use a fallback
    if (numFingers < 1 || numFingers > 4 || !internalFingerColors || internalFingerColors.length === 0) {
        return '#e74c3c'; // Fallback to red ball
    }

    if (numFingers === 1) { // If there's only 1 finger, always show that color
        currentFingerIndex = 0; // Ensure index is 0 for single finger
        return internalFingerColors[0];
    }

    // Check if it's time to change color
    if (currentTime >= nextColorChangeTime) {
        // Choose a random new finger, excluding the current one if possible
        let newFingerIndex;
        do {
            newFingerIndex = Math.floor(Math.random() * numFingers);
        } while (newFingerIndex === currentFingerIndex && numFingers > 1); // Keep choosing until it's a different finger, unless there's only 1 finger

        currentFingerIndex = newFingerIndex; // Update the active finger
        nextColorChangeTime = currentTime + currentBeatIntervalMs; // Plan the next change with the dynamic interval

        // Call the callback when the color changes
        if (onColorChangeCallback) {
            onColorChangeCallback();
        }
    }

    // Return the color of the active finger
    const activeColorHex = internalFingerColors[currentFingerIndex];
    const rgb = hexToRgb(activeColorHex);
    
    return rgbToCss(rgb);
}

/**
 * Sets the callback function to be executed when the ball's color changes.
 * @param {function} callback - The function to call.
 */
function setOnColorChangeCallback(callback) {
    onColorChangeCallback = callback;
}

/**
 * Returns the current beat interval in milliseconds.
 * @returns {number} The current beat interval in milliseconds.
 */
function getCurrentBeatIntervalMs() {
    return currentBeatIntervalMs;
}

// Helper to convert BPM to milliseconds per beat
function calculateColorTempoMs(tempoBPM) {
    if (tempoBPM <= 0) return 60000; // Prevent division by zero or negative values
    return (60000 / tempoBPM); // Convert BPM to milliseconds per 'beat'/change
}

// Exporteer een object met alle functies
export const ballColorModule = {
    initializeBallColorLogic,
    getDirectBallColor,
    updateColorTempo,
    setOnColorChangeCallback,
    updateFingerColors,
    getCurrentBeatIntervalMs
};