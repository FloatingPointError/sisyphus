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
    // isCountingDown en countdownValue komen nu direct uit state
    const { ctx, currentPathData, ballX, ballY, ballRadius, isCountingDown, countdownValue } = state;
    const { numFingersSlider, fingerColorInputs } = state.domElements; 
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
        ctx.fillStyle = '#E0E0E0';
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
        ctx.beginPath();
        ctx.moveTo(0, state.canvasHeight / 2);
        ctx.lineTo(state.canvasWidth, state.canvasHeight / 2);
        ctx.lineTo(state.canvasWidth, state.canvasHeight);
        ctx.lineTo(0, state.canvasHeight);
        ctx.closePath();
        ctx.fillStyle = '#E0E0E0';
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
    cancelAnimationFrame(state.animationId);
    clearInterval(state.countdownIntervalId);
    state.animationId = null;
    state.currentPathData = pathData;
    
    functions.ballColorModule.initializeBallColorLogic(
        parseInt(state.domElements.numFingersSlider.value),
        parseInt(state.domElements.colorTempoSlider.value),
        state.domElements.fingerColorInputs.map(input => input.value)
    );

    functions.resetBall(state, functions);
    functions.updateButtonLabels(state.domElements);

    state.isCountingDown = true; // Gebruik state.isCountingDown
    state.countdownValue = 4;    // Gebruik state.countdownValue
    draw(state, functions);
    
    const beatInterval = 1200; 

    state.countdownIntervalId = setInterval(() => { // Gebruik state.countdownIntervalId
        state.countdownValue--; // Gebruik state.countdownValue
        if (state.countdownValue > 0) { // Gebruik state.countdownValue
            draw(state, functions);
        } else {
            clearInterval(state.countdownIntervalId); // Gebruik state.countdownIntervalId
            state.isCountingDown = false; // Gebruik state.isCountingDown
            lastFrameTime = performance.now();
            animate(state, functions, lastFrameTime);
        }
    }, beatInterval);
}

/**
 * Reset de bal naar de startpositie en de animatie.
 * @param {object} state De huidige status van de app.
 * @param {object} functions Externe functies om aan te roepen.
 */
export function resetBall(state, functions) {
    cancelAnimationFrame(state.animationId);
    clearInterval(state.countdownIntervalId);
    state.isCountingDown = false; // Gebruik state.isCountingDown
    
    functions.calculateBallRadius(state); 
    state.ballX = state.ballRadius; 
    state.ballY = functions.getYForX(state.ballX, state.currentPathData, state.canvasHeight); 
    
    draw(state, functions);
    functions.ballColorModule.initializeBallColorLogic(
        parseInt(state.domElements.numFingersSlider.value),
        parseInt(state.domElements.colorTempoSlider.value),
        state.domElements.fingerColorInputs.map(input => input.value)
    );
}

/**
 * Berekent de straal van de bal.
 * @param {object} state De huidige status van de app.
 */
export function calculateBallRadius(state) {
    state.ballRadius = Math.min(state.canvasWidth, state.canvasHeight) * BALL_RADIUS_PERCENTAGE;
}
