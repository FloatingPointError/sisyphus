// Bevat alle event listeners en DOM manipulaties

/**
 * Stelt alle event listeners in voor de knoppen en sliders.
 * @param {object} domElements Een object met alle DOM-elementen.
 * @param {object} state De huidige status van de app.
 * @param {object} functions Externe functies om aan te roepen.
 */
export function setupEventListeners(domElements, state, functions) {
    const {
        startButton, generateMountainsButton, resetButton, speedSlider,
        numMountainsSlider, numFingersSlider, fingerColorInputs, colorTempoSlider,
        includePlateausCheckbox, toggleControlsButton, fullscreenButton,
        controlsContainer, currentSpeedSpan, currentNumMountainsSpan,
        currentColorTempoSpan, currentNumFingersSpan, appContainer, canvas
    } = domElements;

    startButton.addEventListener('click', () => {
        state.flatPath = functions.initializeFlatPathCurves(state.canvasWidth, state.canvasHeight);
        functions.startAnimationOrCountdown(state, functions, state.flatPath);
    });

    generateMountainsButton.addEventListener('click', () => {
        const numMountains = parseInt(numMountainsSlider.value);
        const includePlateaus = includePlateausCheckbox.checked;
        const newMountainPathData = functions.generateMountainPath(numMountains, includePlateaus, state.canvasWidth, state.canvasHeight);
        functions.startAnimationOrCountdown(state, functions, newMountainPathData);
    });

    resetButton.addEventListener('click', () => {
        state.flatPath = functions.initializeFlatPathCurves(state.canvasWidth, state.canvasHeight);
        state.currentPathData = state.flatPath;
        functions.resetBall(state, functions);
        startButton.textContent = "Start plateau";
        generateMountainsButton.textContent = "Generate and start slopes";
    });

    speedSlider.addEventListener('input', () => {
        state.ballSpeed = parseFloat(speedSlider.value);
        currentSpeedSpan.textContent = state.ballSpeed.toFixed(1) + 'x';
    });

    numMountainsSlider.addEventListener('input', () => {
        currentNumMountainsSpan.textContent = numMountainsSlider.value;
    });

    numFingersSlider.addEventListener('input', () => {
        currentNumFingersSpan.textContent = numFingersSlider.value;
        functions.ballColorModule.initializeBallColorLogic(
            parseInt(numFingersSlider.value),
            parseInt(colorTempoSlider.value),
            fingerColorInputs.map(input => input.value)
        );
        if (!state.isCountingDown && state.animationId) {
            functions.draw(state, functions);
        }
    });

    fingerColorInputs.forEach(input => {
        input.addEventListener('input', () => {
            const newColors = fingerColorInputs.map(input => input.value);
            functions.ballColorModule.updateFingerColors(newColors);
            if (!state.isCountingDown && state.animationId) {
                functions.draw(state, functions);
            }
        });
    });

    colorTempoSlider.addEventListener('input', () => {
        const newTempo = parseInt(colorTempoSlider.value);
        currentColorTempoSpan.textContent = newTempo + ' BPM';
        functions.ballColorModule.updateColorTempo(newTempo);
        if (!state.isCountingDown && state.animationId) {
            functions.draw(state, functions);
        }
    });

    toggleControlsButton.addEventListener('click', () => {
        controlsContainer.classList.toggle('hidden');
        if (controlsContainer.classList.contains('hidden')) {
            toggleControlsButton.textContent = "Show settings";
        } else {
            toggleControlsButton.textContent = "Hide settings";
        }
    });

    fullscreenButton.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            appContainer.requestFullscreen().catch(err => {
                alert(`Error at fullscreen: ${err.message} (make sure the browser alows this)`);
            });
        }
    });

    document.addEventListener('fullscreenchange', () => {
        appContainer.classList.toggle('fullscreen', document.fullscreenElement);
        functions.adjustCanvasSizeAndPath(state, functions);
    });

    window.addEventListener('resize', () => functions.adjustCanvasSizeAndPath(state, functions));
    
    // Initialiseer de tekst
    currentSpeedSpan.textContent = speedSlider.value + 'x';
    currentNumMountainsSpan.textContent = numMountainsSlider.value;
    currentColorTempoSpan.textContent = colorTempoSlider.value + ' BPM';
    currentNumFingersSpan.textContent = numFingersSlider.value;

    functions.ballColorModule.setOnColorChangeCallback(() => functions.triggerGlowEffect(canvas));

    functions.updateButtonLabels(domElements);
}

/**
 * Past de grootte van het canvas en het pad aan.
 * @param {object} state De huidige status van de app.
 * @param {object} functions Externe functies om aan te roepen.
 */
export function adjustCanvasSizeAndPath(state, functions) {
    const { appContainer, canvas, numMountainsSlider, includePlateausCheckbox } = state.domElements;

    if (document.fullscreenElement) {
        canvas.width = appContainer.clientWidth * 0.95; 
        canvas.height = appContainer.clientHeight * 0.95; 
    } else {
        const maxNormalWidth = 1000;
        const normalPadding = 40;
        const CANVAS_ASPECT_RATIO = 1000 / 400; // Hardcoded, kan beter in een state-object

        let availableWidth = appContainer.clientWidth - normalPadding;
        if (availableWidth > maxNormalWidth) {
            availableWidth = maxNormalWidth;
        }

        canvas.width = availableWidth;
        canvas.height = availableWidth / CANVAS_ASPECT_RATIO;

        const minCanvasHeight = 150;
        if (canvas.height < minCanvasHeight) {
            canvas.height = minCanvasHeight;
            canvas.width = minCanvasHeight * CANVAS_ASPECT_RATIO;
        }
    }
    
    state.canvasWidth = canvas.width;
    state.canvasHeight = canvas.height;

    functions.setCanvasWidthCssVariable(canvas);

    if (state.currentPathData === state.flatPath) {
        state.flatPath = functions.initializeFlatPathCurves(state.canvasWidth, state.canvasHeight);
        state.currentPathData = state.flatPath;
    } else {
        const numMountains = parseInt(numMountainsSlider.value);
        const includePlateaus = includePlateausCheckbox.checked;
        state.currentPathData = functions.generateMountainPath(numMountains, includePlateaus, state.canvasWidth, state.canvasHeight);
    }
    functions.resetBall(state, functions);
}

/**
 * Past de tekst van de startknoppen aan.
 * @param {object} domElements Een object met DOM-elementen.
 */
export function updateButtonLabels(domElements) {
    domElements.startButton.textContent = "Start plateau";
    domElements.generateMountainsButton.textContent = "Generate & Start slopes";
}

/**
 * Zet de CSS-variabele voor de canvasbreedte.
 * @param {object} canvas Het canvas DOM-element.
 */
export function setCanvasWidthCssVariable(canvas) {
    document.documentElement.style.setProperty('--canvas-width', `${canvas.clientWidth}px`);
}

/**
 * Activeert een gloei-effect op het canvas.
 * @param {object} canvas Het canvas DOM-element.
 */
export function triggerGlowEffect(canvas) {
    canvas.classList.add('glowing');
    setTimeout(() => {
        canvas.classList.remove('glowing');
    }, 400);
}
