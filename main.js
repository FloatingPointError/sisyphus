// main.js

import { ballColorModule } from './elements/ballColorModule.js';
import { getDomElements } from './modules/index.js';
import { drawSkyElements } from './elements/skyElements.js';
import { initLessonManager } from './modules/lessonManager.js';
import { Metronome } from './modules/metronome.js';

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
        ballSpeed: parseFloat(domElements.speedSlider.value), // Wordt overschreven door DEFAULT_SETTINGS
        animationId: null,
        countdownIntervalId: null,
        currentPathData: null,
        flatPath: null,
        isCountingDown: false,
        countdownValue: 4,
        wakeLock: null, // NIEUW: Property om de WakeLockSentinel op te slaan
    };

    // DEFINIEER DE STANDAARDINSTELLINGEN HIER
    const DEFAULT_SETTINGS = {
        speed: 1.0,
        numMountains: 1, // Standaardwaarde uit HTML
        includePlateaus: false, // Standaardwaarde uit HTML
        numFingers: 1, // Standaardwaarde uit HTML
        colorTempo: 40, // Standaardwaarde uit HTML
        fingerColors: ['#f05442', '#ffe064', '#0851bb', '#944dff'] // Standaardkleuren uit HTML
    };

    // Callback function executed on each metronome 'tick'
    const onMetronomeTick = () => {
        // Trigger the ball color pulse effect here
        
    };

    /**
     * Vraagt een wake lock aan om te voorkomen dat het scherm uitschakelt.
     */
    async function requestWakeLock() {
        if ('wakeLock' in navigator) {
            try {
                state.wakeLock = await navigator.wakeLock.request('screen');
                console.log('Wake Lock geactiveerd!');
                state.wakeLock.addEventListener('release', () => {
                    console.log('Wake Lock vrijgegeven door systeem.');
                    state.wakeLock = null; // Zorg dat de referentie wordt geleegd
                });
            } catch (err) {
                console.error(`Fout bij aanvragen Wake Lock: ${err.name}, ${err.message}`);
            }
        } else {
            console.warn('Wake Lock API wordt niet ondersteund in deze browser.');
        }
    }

    /**
     * Geeft de actieve wake lock vrij.
     */
    function releaseWakeLock() {
        if (state.wakeLock) {
            state.wakeLock.release();
            state.wakeLock = null;
            console.log('Wake Lock vrijgegeven!');
        }
    }

    // Een object om alle geëxporteerde functies van de modules te bundelen
    // Zo hoeven we ze niet overal apart door te geven
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
        state, // BELANGRIJK: Geef de state door
        requestWakeLock, // NIEUW: Voeg wake lock functies toe
        releaseWakeLock,  // NIEUW: Voeg wake lock functies toe
        metronome: new Metronome(DEFAULT_SETTINGS.colorTempo, onMetronomeTick),
    };

    // Initialiseer het pad en de bal
    state.flatPath = initializeFlatPathCurves(state.canvasWidth, state.canvasHeight);
    state.currentPathData = state.flatPath;

    // Pas de canvasgrootte aan op basis van de venstergrootte
    adjustCanvasSizeAndPath(state, functions);

    // Initialiseer de les manager met de benodigde functies en state
    // Geef het hele 'functions' object door, dat 'state' en alle andere functies bevat
    initLessonManager(domElements, functions); 
    
    // Koppel de event listeners
    setupEventListeners(domElements, state, functions);

    // Start de app door de bal te resetten en te tekenen met de standaardinstellingen
    resetBall(state, functions, functions.DEFAULT_SETTINGS);

    // Voeg een event listener toe voor 'visibilitychange' om wake lock opnieuw aan te vragen
    // als de pagina weer zichtbaar wordt (wake lock kan automatisch worden vrijgegeven wanneer de tab onzichtbaar is)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && state.animationId !== null) {
            // Vraag alleen opnieuw aan als de animatie actief is
            requestWakeLock();
        } else if (document.visibilityState === 'hidden') {
            // Optioneel: geef wake lock vrij als de tab verborgen wordt
            // Dit kan nuttig zijn om batterij te sparen als de animatie niet stopt.
            // releaseWakeLock(); // Kan hier worden aangeroepen, maar resetBall dekt dit ook af bij stoppen.
        }
    });
});
