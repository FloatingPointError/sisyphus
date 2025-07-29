import { domElements } from './elements/index.js';
import { getBallColor } from './elements/ballColorModule.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = domElements.animationCanvas;
    const ctx = canvas.getContext('2d');
    const startButton = domElements.startButton;
    const generateMountainsButton = domElements.generateMountainsButton;
    const resetButton = domElements.resetButton;
    const speedSlider = domElements.speedSlider;
    const currentSpeedSpan = domElements.currentSpeedSpan;
    const numMountainsSlider = domElements.numMountainsSlider; // Slider voor aantal bergen
    const currentNumMountainsSpan = domElements.currentNumMountainsSpan; // Span voor huidig aantal bergen
    const includePlateausCheckbox = domElements.includePlateausCheckbox; // Checkbox voor plateaus

    // Nieuwe knoppen
    const toggleControlsButton = document.getElementById('toggleControlsButton');
    const fullscreenButton = document.getElementById('fullscreenButton');
    const controlsContainer = document.getElementById('controlsContainer');

    // Nieuwe controls voor vingerkleuren
    const numFingersSlider = document.getElementById('numFingersSlider');
    const currentNumFingersSpan = document.getElementById('currentNumFingers');
    const fingerColorInputs = [
        document.getElementById('fingerColor1'),
        document.getElementById('fingerColor2'),
        document.getElementById('fingerColor3'),
        document.getElementById('fingerColor4')
    ];

    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;

    function setCanvasWidthCssVariable() {
        document.documentElement.style.setProperty('--canvas-width', `${canvas.clientWidth}px`);
    }

    const ballRadius = 15;
    let ballX = ballRadius;
    let ballY = canvasHeight / 2;
    let ballSpeed = parseFloat(speedSlider.value);
    let animationId = null;
    let countdownIntervalId = null;

    const lineWidth = 2;
    const lineColor = '#2c3e50';

    const flatPath = {
        points: [{ x: 0, y: canvasHeight / 2 }, { x: canvasWidth, y: canvasHeight / 2 }],
        curves: []
    };

    function initializeFlatPathCurves() {
        flatPath.points = [{ x: 0, y: canvasHeight / 2 }, { x: canvasWidth, y: canvasHeight / 2 }];
        flatPath.curves = [{
            p0: { x: 0, y: flatPath.points[0].y },
            p1: { x: canvasWidth / 2, y: flatPath.points[0].y },
            p2: { x: canvasWidth, y: flatPath.points[0].y }
        }];
    }
    initializeFlatPathCurves();

    let currentPathData = flatPath;
    let isCountingDown = false;
    let countdownValue = 4;

    // ... (getPointOnBezier, getYForX, generateMountainPath - deze blijven ongewijzigd) ...

    function getPointOnBezier(t, p0, p1, p2) {
        const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
        const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
        return { x, y };
    }

    function getYForX(x, pathData) {
        if (!pathData || !pathData.curves || pathData.curves.length === 0) {
            return canvasHeight / 2;
        }

        const numSteps = 100;

        for (let i = 0; i < pathData.curves.length; i++) {
            const curve = pathData.curves[i];
            const { p0, p1, p2 } = curve;

            let closestT = 0;
            let smallestDiff = Infinity;

            const curveMinX = Math.min(p0.x, p1.x, p2.x);
            const curveMaxX = Math.max(p0.x, p1.x, p2.x);

            if (x >= curveMinX - 1 && x <= curveMaxX + 1) {
                for (let step = 0; step <= numSteps; step++) {
                    const currentT = step / numSteps;
                    const pointOnCurve = getPointOnBezier(currentT, p0, p1, p2);
                    const diff = Math.abs(pointOnCurve.x - x);

                    if (diff < smallestDiff) {
                        smallestDiff = diff;
                        closestT = currentT;
                    }
                }
                const { y } = getPointOnBezier(closestT, p0, p1, p2);
                return y;
            }
        }
        
        if (x < pathData.points[0].x) return pathData.points[0].y;
        if (x > pathData.points[pathData.points.length - 1].x) return pathData.points[pathData.points.length - 1].y;

        return canvasHeight / 2;
    }

    function generateMountainPath(numSegments, includePlateaus) {
        const generatedPoints = [];
        const curves = [];

        const minHeight = canvasHeight * 0.1;
        const maxHeight = canvasHeight * 0.9;
        const segmentWidth = canvasWidth / numSegments;
        const plateauChance = 0.3;

        generatedPoints.push({ x: 0, y: canvasHeight / 2 });

        for (let i = 0; i < numSegments; i++) {
            const currentX = (i + 1) * segmentWidth;

            if (includePlateaus && Math.random() < plateauChance && i < numSegments - 1) {
                const plateauEndPointX = currentX - (segmentWidth / 2);
                const plateauY = generatedPoints[generatedPoints.length - 1].y;
                generatedPoints.push({ x: plateauEndPointX, y: plateauY });
            }
            
            const nextY = Math.random() * (maxHeight - minHeight) + minHeight;
            generatedPoints.push({ x: currentX, y: nextY });
        }

        let p0 = generatedPoints[0];
        
        for (let i = 0; i < generatedPoints.length - 1; i++) {
            let nextPoint = generatedPoints[i + 1];
            let endPointOfCurve = {};

            if (i === generatedPoints.length - 2) {
                endPointOfCurve = nextPoint;
            } else {
                endPointOfCurve.x = (nextPoint.x + generatedPoints[i+2].x) / 2;
                endPointOfCurve.y = (nextPoint.y + generatedPoints[i+2].y) / 2;
            }

            curves.push({ p0: p0, p1: nextPoint, p2: endPointOfCurve });
            p0 = endPointOfCurve;
        }
        
        if (generatedPoints.length === 2 && !includePlateaus) {
            curves.push({ 
                p0: generatedPoints[0], 
                p1: { x: (generatedPoints[0].x + generatedPoints[1].x) / 2, y: generatedPoints[0].y },
                p2: generatedPoints[1] 
            });
        }

        return { points: generatedPoints, curves: curves };
    }

    // Functie om de bal en de lijn te tekenen, en nu ook de countdown en de dynamische balkleur
    function draw() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        if (currentPathData && currentPathData.curves && currentPathData.curves.length > 0) {
            ctx.beginPath();
            ctx.moveTo(currentPathData.curves[0].p0.x, currentPathData.curves[0].p0.y);

            currentPathData.curves.forEach(curve => {
                ctx.quadraticCurveTo(curve.p1.x, curve.p1.y, curve.p2.x, curve.p2.y);
            });
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = lineColor;
            ctx.stroke();
        }

        // Teken de bal ALLEEN als de countdown NIET loopt
        if (!isCountingDown) {
            // Haal de huidige instellingen op voor de bal kleur
            const numFingers = parseInt(numFingersSlider.value);
            const selectedFingerColors = fingerColorInputs.map(input => input.value);

            // Gebruik de geïmporteerde functie om de balkleur te krijgen
            const ballColor = getBallColor(ballY, canvasHeight, numFingers, selectedFingerColors);

            ctx.beginPath();
            ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = ballColor; // Gebruik de dynamische kleur
            ctx.fill();
            ctx.strokeStyle = '#c0392b'; // Randkleur blijft hetzelfde
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Teken de countdown timer
        if (isCountingDown) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.font = 'bold 80px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(countdownValue, canvasWidth / 2, canvasHeight / 2);
        }
    }

    function update() {
        ballX += ballSpeed;

        if (ballX > canvasWidth + ballRadius) {
            ballX = -ballRadius;
        }

        ballY = getYForX(ballX, currentPathData);
    }

    function animate() {
        if (!isCountingDown) {
            update();
        }
        draw();
        animationId = requestAnimationFrame(animate);
    }

    function startAnimationOrCountdown(pathData) {
        cancelAnimationFrame(animationId);
        clearInterval(countdownIntervalId);
        animationId = null;
        currentPathData = pathData;
        resetBall();
        updateButtonLabels();

        isCountingDown = true;
        countdownValue = 4;
        draw();
        
        const beatInterval = 1200; 

        countdownIntervalId = setInterval(() => {
            countdownValue--;
            if (countdownValue > 0) {
                draw();
            } else {
                clearInterval(countdownIntervalId);
                isCountingDown = false;
                animate();
            }
        }, beatInterval);
    }

    function resetBall() {
        cancelAnimationFrame(animationId);
        clearInterval(countdownIntervalId);
        isCountingDown = false;
        ballX = ballRadius;
        ballY = getYForX(ballX, currentPathData);
        draw();
    }

    function updateButtonLabels() {
        startButton.textContent = "Herstart Vlakke Lijn";
        generateMountainsButton.textContent = "Herstart Bergen";
    }

    // --- Event Listeners voor de knoppen en sliders ---
    startButton.addEventListener('click', () => {
        startAnimationOrCountdown(flatPath);
    });

    generateMountainsButton.addEventListener('click', () => {
        const numMountains = parseInt(numMountainsSlider.value);
        const includePlateaus = includePlateausCheckbox.checked;
        const newMountainPathData = generateMountainPath(numMountains, includePlateaus);
        startAnimationOrCountdown(newMountainPathData);
    });

    resetButton.addEventListener('click', () => {
        resetBall();
        startButton.textContent = "Start Vlakke Lijn";
        generateMountainsButton.textContent = "Genereer & Start Bergen";
    });

    speedSlider.addEventListener('input', () => {
        ballSpeed = parseFloat(speedSlider.value);
        currentSpeedSpan.textContent = ballSpeed.toFixed(1) + 'x';
    });

    numMountainsSlider.addEventListener('input', () => {
        currentNumMountainsSpan.textContent = numMountainsSlider.value;
    });

    // Nieuwe event listener voor aantal vingers slider
    numFingersSlider.addEventListener('input', () => {
        currentNumFingersSpan.textContent = numFingersSlider.value;
        // Forceer een hertekening zodat de balkleur direct update als de bal al beweegt
        if (!isCountingDown && animationId) {
            draw();
        }
    });

    // Event listeners voor de kleur inputvelden
    fingerColorInputs.forEach(input => {
        input.addEventListener('input', () => {
            // Forceer een hertekening zodat de balkleur direct update als de bal al beweegt
            if (!isCountingDown && animationId) {
                draw();
            }
        });
    });


    toggleControlsButton.addEventListener('click', () => {
        controlsContainer.classList.toggle('hidden');
        if (controlsContainer.classList.contains('hidden')) {
            toggleControlsButton.textContent = "Toon Controls";
        } else {
            toggleControlsButton.textContent = "Verberg Controls";
        }
    });

    fullscreenButton.addEventListener('click', () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            appContainer.requestFullscreen().catch(err => {
                alert(`Fout bij fullscreen: ${err.message} (zorg dat de browser dit toestaat)`);
            });
        }
    });

    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            appContainer.classList.add('fullscreen');
            canvasWidth = window.innerWidth * 0.95;
            canvasHeight = window.innerHeight * 0.80;
        } else {
            appContainer.classList.remove('fullscreen');
            canvasWidth = 1000;
            canvasHeight = 300;
        }
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        setCanvasWidthCssVariable();

        if (currentPathData === flatPath) {
            initializeFlatPathCurves();
            currentPathData = flatPath;
        } else {
            const numMountains = parseInt(numMountainsSlider.value);
            const includePlateaus = includePlateausCheckbox.checked;
            const newMountainPathData = generateMountainPath(numMountains, includePlateaus);
            currentPathData = newMountainPathData;
        }
        resetBall(); 
    });

    // --- Initialisatie bij het laden van de pagina ---
    setCanvasWidthCssVariable();
    draw();
});