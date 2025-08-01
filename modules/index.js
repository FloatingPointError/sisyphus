// app/elements/index.js

/**
 * Retourneert een object met verwijzingen naar alle benodigde DOM-elementen.
 * Deze functie moet worden aangeroepen nadat de DOM volledig is geladen (bijv. in DOMContentLoaded).
 * @returns {object} Een object met DOM-elementen.
 */
export function getDomElements() {
    return {
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
        lessonPathContainer: document.getElementById('lessonPathContainer'),
        parentLessonButtons: document.getElementById('parentLessonButtons'),
    };
}
