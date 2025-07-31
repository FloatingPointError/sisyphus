// main.js

import { ballColorModule } from './elements/ballColorModule.js';
import { getDomElements } from './modules/index.js';
import { drawSkyElements } from './elements/skyElements.js';
import { initLessonManager } from './elements/lessonManager.js';

// Importeer de nieuwe modules
import { initializeFlatPathCurves, generateMountainPath, getYForX } from './modules/paths.js';
import { animate, startAnimationOrCountdown, resetBall, calculateBallRadius } from './modules/animation.js';
import { setupEventListeners, adjustCanvasSizeAndPath, updateButtonLabels, setCanvasWidthCssVariable, triggerGlowEffect } from './modules/dom.js';

document.addEventListener('DOMContentLoaded', () => {
    const domElements = getDomElements();
    const ctx = domElements.canvas.getContext('2d');
    
    const DEFAULT_CANVAS_WIDTH = 1000;
    const DEFAULT_CANVAS_HEIGHT = 400;
    const CANVAS_ASPECT_RATIO = DEFAULT_CANVAS_WIDTH / DEFAULT_CANVAS_HEIGHT;

    // Globaal state-object om de status te beheren
    const state = {
        domElements,
        ctx,
        canvasWidth: domElements.canvas.width,
        canvasHeight: domElements.canvas.height,
        canvasAspectRatio: CANVAS_ASPECT_RATIO,
        ballSpeed: parseFloat(domElements.speedSlider.value),
        animationId: null,
        countdownIntervalId: null,
        currentPathData: null,
        flatPath: null,
        isCountingDown: false, // AANGEPAST: isCountingDown toegevoegd aan state
        countdownValue: 4     // AANGEPAST: countdownValue toegevoegd aan state
    };

    // Een object om alle geëxporteerde functies van de modules te bundelen
    // Zo hoeven we ze niet overal apart door te geven
    const functions = {
        initializeFlatPathCurves,
        generateMountainPath,
        getYForX,
        animate,
        startAnimationOrCountdown,
        resetBall,
        calculateBallRadius,
        setupEventListeners,
        adjustCanvasSizeAndPath,
        updateButtonLabels,
        setCanvasWidthCssVariable,
        triggerGlowEffect,
        ballColorModule,
    };

    // Initialiseer het pad en de bal
    state.flatPath = initializeFlatPathCurves(state.canvasWidth, state.canvasHeight);
    state.currentPathData = state.flatPath;

    // Pas de canvasgrootte aan op basis van de venstergrootte
    adjustCanvasSizeAndPath(state, functions);

    // Initialiseer de les manager met de benodigde functies en state
    initLessonManager(domElements, {
        initializeFlatPathCurves: () => {
            state.flatPath = initializeFlatPathCurves(state.canvasWidth, state.canvasHeight);
            return state.flatPath;
        },
        generateMountainPath: (numMountains, includePlateaus) => {
            return generateMountainPath(numMountains, includePlateaus, state.canvasWidth, state.canvasHeight);
        },
        startAnimationOrCountdown: (pathData) => startAnimationOrCountdown(state, functions, pathData),
        ballColorModule: ballColorModule,
        flatPath: state.flatPath
    });
    
    // Koppel de event listeners
    setupEventListeners(domElements, state, functions);

    // Start de app door de bal te resetten en te tekenen
    resetBall(state, functions);
});

