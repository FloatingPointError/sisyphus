/**
 * Main.js is the central orchestrator of the app
 * It defines the global state and default settings
 * Controls the main animation cycle
 */

import { ballColorModule } from './elements/ballColorModule.js';
import { getDomElements } from './modules/index.js';
import { initLessonManager } from './modules/lessonManager.js';
import { Metronome } from './modules/metronome.js';
import { ScreenLocker } from './modules/screenLocker.js';
import { initializeFlatPathCurves, generateMountainPath, getYForX } from './modules/paths.js';
import { animate, startAnimationOrCountdown, resetBall, calculateBallRadius } from './modules/animation.js';
import { setupEventListeners, adjustCanvasSizeAndPath, setCanvasWidthCssVariable, triggerGlowEffect } from './modules/dom.js';

// Register Service Worker function for the PWA
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered with scope:', registration.scope);
                }).catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    registerServiceWorker();

    const domElements = getDomElements();
    const ctx = domElements.canvas.getContext('2d');
    
    const DEFAULT_CANVAS_WIDTH = 1000;
    const DEFAULT_CANVAS_HEIGHT = 400;
    const CANVAS_ASPECT_RATIO = DEFAULT_CANVAS_WIDTH / DEFAULT_CANVAS_HEIGHT;

    const screenLocker = new ScreenLocker();

    /**
     * Global state object to control the state
     */
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
        isCountingDown: false,
        countdownValue: 4,
        screenLocker,
    };

    /**
     * Default settings for the app upon loading
     */
    const DEFAULT_SETTINGS = {
        speed: 1.0,
        numMountains: 1, // Standaardwaarde uit HTML
        includePlateaus: false, // Standaardwaarde uit HTML
        numFingers: 1, // Standaardwaarde uit HTML
        colorTempo: 40, // Standaardwaarde uit HTML
        fingerColors: ['#f05442', '#ffe064', '#0851bb', '#944dff'] // Standaardkleuren uit HTML
    };

    /**
     * Callback function executed on each metronome 'tick'
     * Leaving it here for future implementations
     */
    const onMetronomeTick = () => {
        // Do something
    };

    /**
     * The functions object passes on all exported functions of the modules,
     * So it doesn't need to be passed everywhere separately
     */
    const functions = {
        initializeFlatPathCurves,
        generateMountainPath,
        getYForX,
        animate,
        // startAnimationOrCountdown is gewrapped om 'state' en 'functions' automatisch door te geven
        startAnimationOrCountdown: (pathData) => startAnimationOrCountdown(state, functions, pathData), 
        resetBall,
        calculateBallRadius,
        setupEventListeners,
        adjustCanvasSizeAndPath,
        setCanvasWidthCssVariable,
        triggerGlowEffect,
        ballColorModule,
        DEFAULT_SETTINGS,
        state, // IMPORTANT: passes the state.
        metronome: new Metronome(DEFAULT_SETTINGS.colorTempo, onMetronomeTick),
        requestWakeLock: () => state.screenLocker.requestWakeLock(), // Adds the screenlocker methods
        releaseWakeLock: () => state.screenLocker.releaseWakeLock(),
    };

    // Initialises the path and the ball
    state.flatPath = initializeFlatPathCurves(state.canvasWidth, state.canvasHeight);
    state.currentPathData = state.flatPath;

    // Adjusts the canvas based on the screen size
    adjustCanvasSizeAndPath(state, functions);

    // Initialises the lesson manager with the neccesary functions and state
    // Passes the entire functions object, which contains the state and other functions
    initLessonManager(domElements, functions); 
    
    // Coupling the event listeners
    setupEventListeners(domElements, state, functions);

    // Resets the ball with the standard state and defaults
    resetBall(state, functions, functions.DEFAULT_SETTINGS);

    // Adds an event listener for the visibilitychange to request the wake lock again
    // If the page becomes visible again the wake lock springs into action
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && state.animationId !== null) {
            // Only asks again if the animation is active
            state.screenLocker.requestWakeLock();
        } else if (document.visibilityState === 'hidden') {
            // Releases the wake lock if tab is being hidden.
            state.screenLocker.releaseWakeLock();
        }
    });
});
