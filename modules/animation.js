// modules/animation.js

import { ballColorModule } from '../elements/ballColorModule.js';
import { drawSkyElements } from '../elements/skyElements.js';

let lastFrameTime = 0; // Deze blijft hier, wordt alleen intern gebruikt voor animate loop

const BALL_RADIUS_PERCENTAGE = 0.05;
const PULSE_MAGNITUDE = 0.15;
const lineWidth = 2;
const lineColor = '#2c3e50';

/**
 * De hoofdanimatie-loop die frames bijwerkt en tekent.
 * @param {object} state De huidige status van de app.
 * @param {object} functions Externe functies om aan te roepen.
 * @param {number} currentTime De huidige tijd van het frame.
 */
export function animate(state, functions, currentTime) {
    if (!state.isCountingDown) { // Gebruik state.isCountingDown
        update(state, functions);
    }
    draw(state, functions);
    state.animationId = requestAnimationFrame((timestamp) => animate(state, functions, timestamp));
}

/**
 * Werkt de positie van de bal bij op basis van de snelheid.
 * @param {object} state De huidige status van de app.
 * @param {object} functions Externe functies om aan te roepen.
 */
function update(state, functions) {
    state.ballX += state.ballSpeed;

    if (state.ballX > state.canvasWidth + state.ballRadius) {
        state.ballX = -state.ballRadius;
    }

    state.ballY = functions.getYForX(state.ballX, state.currentPathData, state.canvasHeight);
}

/**
 * Tekent alle elementen op het canvas.
 * @param {object} state De huidige status van de app.
 * @param {object} functions Externe functies om aan te roepen.
 */
export function draw(state, functions) {
    const { ctx, currentPathData, ballX, ballY, ballRadius, isCountingDown, countdownValue } = state;
    const { numFingersSlider } = state.domElements; 
    const { ballColorModule } = functions;

    ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    drawSkyElements(ctx, state.canvasWidth, state.canvasHeight);

    // Teken het pad en de vulling eronder
    if (currentPathData && currentPathData.curves && currentPathData.curves.length > 0) {
        ctx.beginPath();
        ctx.moveTo(currentPathData.curves[0].p0.x, currentPathData.curves[0].p0.y);
        currentPathData.curves.forEach(curve => {
            ctx.quadraticCurveTo(curve.p1.x, curve.p1.y, curve.p2.x, curve.p2.y);
        });
        ctx.lineTo(state.canvasWidth, state.canvasHeight);
        ctx.lineTo(0, state.canvasHeight);
        ctx.closePath();
        
        // NIEUW: Maak een lineaire gradiënt voor de bergen
        const mountainGradient = ctx.createLinearGradient(0, state.canvasHeight, 0, 0);
        // mountainGradient.addColorStop(1, '#195e77');    // Donkerste tint aan de basis van het canvas
        // mountainGradient.addColorStop(0.4, '#2a6a77');   // Overgang naar een iets lichtere tint
        //mountainGradient.addColorStop(0.6, '#3b7a87');   // Midden-tint voor het hoofdgedeelte van de berg
        // mountainGradient.addColorStop(0.75, '#5d9aa7');  // Lichtere tint richting de toppen
        // mountainGradient.addColorStop(0.2, '#aeaeaeff');   // Nog lichtere tint, bijna bij de sneeuwgrens
        mountainGradient.addColorStop(1, '#FFFFFF');     // Wit voor de sneeuw op de allerhoogste toppen

        ctx.fillStyle = mountainGradient; // Stel de vulstijl in op de gradiënt
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(currentPathData.curves[0].p0.x, currentPathData.curves[0].p0.y);
        currentPathData.curves.forEach(curve => {
            ctx.quadraticCurveTo(curve.p1.x, curve.p1.y, curve.p2.x, curve.p2.y);
        });
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = lineColor;
        ctx.stroke();

    } else {
        // Voor de vlakke lijn (behoudt de effen kleur)
        ctx.beginPath();
        ctx.moveTo(0, state.canvasHeight / 2);
        ctx.lineTo(state.canvasWidth, state.canvasHeight / 2);
        ctx.lineTo(state.canvasWidth, state.canvasHeight);
        ctx.lineTo(0, state.canvasHeight);
        ctx.closePath();
        ctx.fillStyle = '#FFFFFF'; // Effen lichtgrijze vulling voor de vlakke lijn
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, state.canvasHeight / 2);
        ctx.lineTo(state.canvasWidth, state.canvasHeight / 2);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = lineColor;
        ctx.stroke();
    }

    // Teken de bal
    if (!isCountingDown) {
        const numFingers = parseInt(numFingersSlider.value);
        const ballColor = ballColorModule.getDirectBallColor(performance.now(), numFingers); 
        const pulseTempoMs = ballColorModule.getCurrentBeatIntervalMs();
        const currentTime = performance.now();
        const pulseTime = currentTime % pulseTempoMs;
        const pulseProgress = (Math.sin((pulseTime / pulseTempoMs) * Math.PI * 2) + 1) / 2; 
        const scaledBallRadius = ballRadius * (1 + (PULSE_MAGNITUDE * pulseProgress)); 

        ctx.beginPath();
        ctx.arc(ballX, ballY, scaledBallRadius, 0, Math.PI * 2);
        ctx.fillStyle = ballColor;
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Teken de aftelling
    if (isCountingDown) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(countdownValue, state.canvasWidth / 2, state.canvasHeight / 2);
    }
}

/**
 * Start een aftelling of begint de animatie direct.
 * @param {object} state De huidige status van de app.
 * @param {object} functions Externe functies om aan te roepen.
 * @param {{curves: Array}} pathData De padgegevens voor de animatie.
 */
export function startAnimationOrCountdown(state, functions, pathData) {

    if (state.animationId) {
        cancelAnimationFrame(state.animationId);
    }
    
    if (state.countdownIntervalId) {
        clearInterval(state.countdownIntervalId);
    }

    state.animationId = null; // Zorg dat animationId null is bij start

    // Stop de metronoom, deze wordt hieronder opnieuw gestart
    functions.metronome.stop();    

    // Initialiseer kleurenlogica met HUIDIGE instellingen (niet default)
    functions.ballColorModule.initializeBallColorLogic(
        parseInt(state.domElements.numFingersSlider.value),
        parseInt(state.domElements.colorTempoSlider.value),
        state.domElements.fingerColorInputs.map(input => input.value)
    );

    // Reset balpositie naar start van het huidige pad
    functions.calculateBallRadius(state); 
    state.ballX = state.ballRadius + 50; // Met offset
    state.ballY = functions.getYForX(state.ballX, state.currentPathData, state.canvasHeight); 

    state.isCountingDown = true;
    state.countdownValue = 4;
    draw(state, functions); // Eerste tekening voor countdown
    
    const beatInterval = 1200; 

    state.countdownIntervalId = setInterval(() => {
        state.countdownValue--;
        if (state.countdownValue > 0) {
            draw(state, functions);
        } else {
            clearInterval(state.countdownIntervalId);
            state.isCountingDown = false;
            lastFrameTime = performance.now();
            animate(state, functions, lastFrameTime);
            functions.metronome.start();
        }
    }, beatInterval);
}


/**
 * Reset de bal naar de startpositie en de animatie, en reset alle instellingen naar standaardwaarden.
 * Deze functie kan ook gebruikt worden om alleen de animatie te stoppen en de bal te verbergen,
 * zonder de UI-instellingen te resetten, door 'defaultSettings' als null/undefined door te geven.
 * @param {object} state De huidige status van de app.
 * @param {object} functions Externe functies om aan te roepen.
 * @param {object} [defaultSettings] De standaardinstellingen om naar te resetten (optioneel).
 */
export function resetBall(state, functions, defaultSettings) {
    cancelAnimationFrame(state.animationId);
    clearInterval(state.countdownIntervalId);
    state.animationId = null; // Belangrijk: zet animationId op null bij reset
    state.isCountingDown = false;
    
    // Als er defaultSettings zijn meegegeven, pas deze toe. Anders, behoud de huidige instellingen.
    if (defaultSettings) {
        // Reset de state variabelen naar standaardwaarden
        state.ballSpeed = defaultSettings.speed;
        state.countdownValue = 4; // Reset countdown waarde

        // Reset de UI-elementen naar standaardwaarden
        state.domElements.speedSlider.value = defaultSettings.speed;
        state.domElements.currentSpeedSpan.textContent = defaultSettings.speed.toFixed(1) + 'x';

        state.domElements.numMountainsSlider.value = defaultSettings.numMountains;
        state.domElements.currentNumMountainsSpan.textContent = defaultSettings.numMountains;

        state.domElements.includePlateausCheckbox.checked = defaultSettings.includePlateaus;

        state.domElements.numFingersSlider.value = defaultSettings.numFingers;
        state.domElements.currentNumFingersSpan.textContent = defaultSettings.numFingers;

        state.domElements.colorTempoSlider.value = defaultSettings.colorTempo;
        state.domElements.currentColorTempoSpan.textContent = defaultSettings.colorTempo + ' BPM';

        // Reset vingerkleuren
        defaultSettings.fingerColors.forEach((color, index) => {
            if (state.domElements.fingerColorInputs[index]) {
                state.domElements.fingerColorInputs[index].value = color;
            }
        });

        // Initialiseer het pad opnieuw op basis van default numMountains (vlak of hellingen)
        if (defaultSettings.numMountains > 1) {
            state.currentPathData = functions.generateMountainPath(
                defaultSettings.numMountains,
                defaultSettings.includePlateaus,
                state.canvasWidth,
                state.canvasHeight
            );
        } else {
            state.flatPath = functions.initializeFlatPathCurves(state.canvasWidth, state.canvasHeight);
            state.currentPathData = state.flatPath;
        }

        functions.ballColorModule.initializeBallColorLogic(
            defaultSettings.numFingers,
            defaultSettings.colorTempo,
            defaultSettings.fingerColors
        );
    } else { // Dit is de tak voor de stop-knop of adjustCanvasSizeAndPath
        // Initialiseer ballColorLogic met de HUIDIGE UI-waarden
        functions.ballColorModule.initializeBallColorLogic(
            parseInt(state.domElements.numFingersSlider.value),
            parseInt(state.domElements.colorTempoSlider.value),
            state.domElements.fingerColorInputs.map(input => input.value)
        );
        // BELANGRIJK: Hier wordt het pad NIET opnieuw gegenereerd,
        // zodat state.currentPathData behouden blijft zoals het was ingesteld door playButton.
    }



    // Reset de balpositie en straal
    functions.calculateBallRadius(state); 
    state.ballX = state.ballRadius + 50; // Met offset
    state.ballY = functions.getYForX(state.ballX, state.currentPathData, state.canvasHeight); 
    
    draw(state, functions); // Teken de canvas in de geresette positie (zonder bal als animationId null is)
}

/**
 * Berekent de straal van de bal.
 * @param {object} state De huidige status van de app.
 */
export function calculateBallRadius(state) {
    state.ballRadius = Math.min(state.canvasWidth, state.canvasHeight) * BALL_RADIUS_PERCENTAGE;
    
    // Voeg hier een waarde toe om de bal naar rechts te verschuiven
    const offsetX = 50; // Bijvoorbeeld 50 pixels naar rechts
    state.ballX = state.ballRadius + offsetX; 
}
