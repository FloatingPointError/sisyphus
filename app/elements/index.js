// Exports for the elements module
export const domElements = {
    // Elementen die we nodig hebben voor de applicatie
    // Deze elementen worden gebruikt in de app.js en andere modules
    appContainer: document.getElementById('appContainer'),
    canvas: document.getElementById('animationCanvas'),
    startButton: document.getElementById('startButton'),
    generateMountainsButton: document.getElementById('generateMountainsButton'),
    resetButton: document.getElementById('resetButton'),
    speedSlider: document.getElementById('speedSlider'),
    currentSpeedSpan: document.getElementById('currentSpeed'),
    numMountainsSlider: document.getElementById('numMountainsSlider'),
    currentNumMountainsSpan: document.getElementById('currentNumMountains'),
    includePlateausCheckbox: document.getElementById('includePlateausCheckbox'),
    toggleControlsButton: document.getElementById('toggleControlsButton'),
    fullscreenButton: document.getElementById('fullscreenButton'),
    controlsContainer: document.getElementById('controlsContainer'),
    numFingersSlider: document.getElementById('numFingersSlider'),
    currentNumFingersSpan: document.getElementById('currentNumFingers'),
    fingerColorInputs: [
        document.getElementById('fingerColor1'),
        document.getElementById('fingerColor2'),
        document.getElementById('fingerColor3'),
        document.getElementById('fingerColor4')
    ],
    colorTempoSlider: document.getElementById('colorTempoSlider'),
    currentColorTempoSpan: document.getElementById('currentColorTempo'),
    hideExplainerText: document.querySelector('#hideExplainerText'),
    explainerText: document.querySelector('#explainerText'),
}