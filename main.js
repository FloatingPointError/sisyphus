// main.js

import { ballColorModule } from './elements/ballColorModule.js';
import { getDomElements } from './modules/index.js';
import { drawSkyElements } from './elements/skyElements.js';
import { initLessonManager } from './elements/lessonManager.js';

// Importeer de nieuwe modules
import { initializeFlatPathCurves, generateMountainPath, getYForX } from './modules/paths.js';
import { animate, startAnimationOrCountdown, resetBall, calculateBallRadius } from './modules/animation.js';
import { setupEventListeners, adjustCanvasSizeAndPath, setCanvasWidthCssVariable, triggerGlowEffect } from './modules/dom.js';

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

    // DEFINIEER DE STANDAARDINSTELLINGEN HIER
    const DEFAULT_SETTINGS = {
        speed: 1.0,
        numMountains: 1, // Standaardwaarde uit HTML
        includePlateaus: false, // Standaardwaarde uit HTML
        numFingers: 1, // Standaardwaarde uit HTML
        colorTempo: 40, // Standaardwaarde uit HTML
        fingerColors: ['#f05442', '#ffe064', '#2980b9', '#944dff'] // Standaardkleuren uit HTML
    };

    // Een object om alle geëxporteerde functies van de modules te bundelen
    // Zo hoeven we ze niet overal apart door te geven
    const functions = {
        initializeFlatPathCurves,
        generateMountainPath,
        getYForX,
        animate,
        startAnimationOrCountdown: (pathData) => startAnimationOrCountdown(state, functions, pathData),
        resetBall,
        calculateBallRadius,
        setupEventListeners,
        adjustCanvasSizeAndPath,
        setCanvasWidthCssVariable,
        triggerGlowEffect,
        ballColorModule,
        DEFAULT_SETTINGS,
        state,
    };

    // Initialiseer het pad en de bal
    state.flatPath = initializeFlatPathCurves(state.canvasWidth, state.canvasHeight);
    state.currentPathData = state.flatPath;

    // Pas de canvasgrootte aan op basis van de venstergrootte
    adjustCanvasSizeAndPath(state, functions);

    // Initialiseer de les manager met de benodigde functies en state
    // initLessonManager(domElements, {
    //     initializeFlatPathCurves: () => {
    //         state.flatPath = initializeFlatPathCurves(state.canvasWidth, state.canvasHeight);
    //         return state.flatPath;
    //     },
    //     generateMountainPath: (numMountains, includePlateaus) => {
    //         return generateMountainPath(numMountains, includePlateaus, state.canvasWidth, state.canvasHeight);
    //     },
    //     startAnimationOrCountdown: (pathData) => startAnimationOrCountdown(state, functions, pathData),
    //     ballColorModule: ballColorModule,
    //     flatPath: state.flatPath,
    //     state: state // BELANGRIJK: Geef de state door aan lessonManager
    // });;
    initLessonManager(domElements, functions); 

    
    // Koppel de event listeners
    setupEventListeners(domElements, state, functions);

    // Start de app door de bal te resetten en te tekenen met de standaardinstellingen
    resetBall(state, functions, functions.DEFAULT_SETTINGS);
});

