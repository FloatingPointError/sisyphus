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

// --- Play Button Event Listener ---
    playButton.addEventListener('click', () => {
        // Stop eventuele lopende animatie of countdown
        cancelAnimationFrame(state.animationId);
        clearInterval(state.countdownIntervalId);
        state.animationId = null;
        state.isCountingDown = false;

        let pathDataToUse;
        const numMountains = parseInt(numMountainsSlider.value);
        const includePlateaus = includePlateausCheckbox.checked;

        if (numMountains > 1) {
            // Genereer een bergpad als aantal hellingen > 1
            pathDataToUse = functions.generateMountainPath(numMountains, includePlateaus, state.canvasWidth, state.canvasHeight);
        } else {
            // Initialiseer een vlak pad als aantal hellingen 1 of minder is
            state.flatPath = functions.initializeFlatPathCurves(state.canvasWidth, state.canvasHeight); // Zorg dat flatPath up-to-date is
            pathDataToUse = state.flatPath;
        }
        
        state.currentPathData = pathDataToUse; // Update de huidige paddata in de state
        
        // Start de animatie of countdown direct met het gekozen pad
        functions.startAnimationOrCountdown(state, functions, pathDataToUse);  
        functions.triggerGlowEffect(canvas); // Trigger glow effect
    });


    // --- Stop Button Event Listener (stopt alleen de animatie) ---
    stopButton.addEventListener('click', () => {
        // Stop alleen als er een animatie loopt of een countdown bezig is
        if (state.animationId || state.isCountingDown) {
            functions.resetBall(state, functions, null); 
        }
    });

    // --- Reset Button Event Listener (reset alle instellingen en stopt animatie) ---
    resetButton.addEventListener('click', () => {
        // Roep resetBall aan met de standaardinstellingen om alles te resetten
        functions.resetBall(state, functions, functions.DEFAULT_SETTINGS); 
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
            console.log("Redrawing with new amount of fingers");
        }
    });

    fingerColorInputs.forEach(input => {
        input.addEventListener('input', () => {
            const newColors = fingerColorInputs.map(input => input.value);
            functions.ballColorModule.updateFingerColors(newColors);
            if (!state.isCountingDown && state.animationId) {
                console.log("Redrawing with new finger colors");
            }
        });
    });

    colorTempoSlider.addEventListener('input', () => {
        const newTempo = parseInt(colorTempoSlider.value);
        currentColorTempoSpan.textContent = newTempo + ' BPM';
        functions.ballColorModule.updateColorTempo(newTempo);
        if (!state.isCountingDown && state.animationId) {
            console.log("Redrawing with new color tempo");
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

    // fullscreenButton.addEventListener('click', () => {
    //     if (document.fullscreenElement) {
    //         document.exitFullscreen();
    //     } else {
    //         appContainer.requestFullscreen().catch(err => {
    //             alert(`Error at fullscreen: ${err.message} (make sure the browser alows this)`);
    //         });
    //     }
    // });

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

    // functions.updateButtonLabels(domElements);
}

/**
 * Past de grootte van het canvas en het pad aan.
 * @param {object} state De huidige status van de app.
 * @param {object} functions Externe functies om aan te roepen.
 */
export function adjustCanvasSizeAndPath(state, functions) {
    const { appContainer, canvas, numMountainsSlider, includePlateausCheckbox, fingerColorInputs, speedSlider, numFingersSlider, colorTempoSlider } = state.domElements; // Toegevoegde DOM-elementen

    if (document.fullscreenElement) {
        canvas.width = appContainer.clientWidth * 0.95; 
        canvas.height = appContainer.clientHeight * 0.95; 
    } else {
        const maxNormalWidth = 1000;
        const normalPadding = 40;
        const CANVAS_ASPECT_RATIO = 1000 / 400;

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

    const numMountains = parseInt(numMountainsSlider.value);
    const includePlateaus = includePlateausCheckbox.checked;

    if (numMountains > 1) {
        state.currentPathData = functions.generateMountainPath(numMountains, includePlateaus, state.canvasWidth, state.canvasHeight);
    } else {
        state.flatPath = functions.initializeFlatPathCurves(state.canvasWidth, state.canvasHeight);
        state.currentPathData = state.flatPath;
    }

    // Bij het aanpassen van het canvas, reset de bal zonder de instellingen te wijzigen
    // Geef de huidige instellingen door als 'default' voor resetBall
    functions.resetBall(state, functions, { 
        speed: parseFloat(speedSlider.value), // Gebruik huidige speedSlider waarde
        numMountains: parseInt(numMountainsSlider.value),
        includePlateaus: includePlateausCheckbox.checked,
        numFingers: parseInt(numFingersSlider.value),
        colorTempo: parseInt(colorTempoSlider.value),
        fingerColors: fingerColorInputs.map(input => input.value)
    });
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
