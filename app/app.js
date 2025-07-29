// script.js
import { initializeBallColorLogic, getDirectBallColor, updateColorTempo } from './elements/ballColorModule.js';
import { domElements } from './elements/index.js';

document.addEventListener('DOMContentLoaded', () => {
    const {
        appContainer,
        canvas,
        startButton,
        generateMountainsButton,
        resetButton,
        speedSlider,
        currentSpeedSpan,
        numMountainsSlider,
        currentNumMountainsSpan,
        includePlateausCheckbox,
        toggleControlsButton,
        fullscreenButton,
        controlsContainer,
        numFingersSlider,
        currentNumFingersSpan,
        fingerColorInputs,
        colorTempoSlider,
        currentColorTempoSpan,
        hideExplainerText,
        explainerText
    } = domElements;
    const ctx = canvas.getContext('2d');

    // Canvas ratio bewaren voor proportioneel schalen
    const DEFAULT_CANVAS_WIDTH = 1000;
    const DEFAULT_CANVAS_HEIGHT = 400;
    const CANVAS_ASPECT_RATIO = DEFAULT_CANVAS_WIDTH / DEFAULT_CANVAS_HEIGHT;

    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;

    function setCanvasWidthCssVariable() {
        document.documentElement.style.setProperty('--canvas-width', `${canvas.clientWidth}px`);
    }

    const BALL_RADIUS_PERCENTAGE = 0.05;
    let ballRadius;
    
    function calculateBallRadius() {
        ballRadius = Math.min(canvasWidth, canvasHeight) * BALL_RADIUS_PERCENTAGE;
        ballX = ballRadius;
        ballY = getYForX(ballX, currentPathData); 
    }

    let ballX = 0;
    let ballY = 0;
    let ballSpeed = parseFloat(speedSlider.value);
    let animationId = null;
    let countdownIntervalId = null;

    const lineWidth = 2;
    const lineColor = '#2c3e50';

    let flatPath = {
        points: [{ x: 0, y: canvasHeight / 2 }, { x: canvasWidth, y: canvasHeight / 2 }],
        curves: []
    };

    function initializeFlatPathCurves() {
        flatPath = {
            points: [{ x: 0, y: canvasHeight / 2 }, { x: canvasWidth, y: canvasHeight / 2 }],
            curves: [{
                p0: { x: 0, y: canvasHeight / 2 },
                p1: { x: canvasWidth / 2, y: canvasHeight / 2 },
                p2: { x: canvasWidth, y: canvasHeight / 2 }
            }]
        };
    }
    initializeFlatPathCurves(); 

    let currentPathData = flatPath;
    let isCountingDown = false;
    let countdownValue = 4;
    let lastFrameTime = 0;

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
        generatedPoints.push({ x: canvasWidth, y: generatedPoints[generatedPoints.length -1].y || canvasHeight / 2 });

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
        } else {
            ctx.beginPath();
            ctx.moveTo(0, canvasHeight / 2);
            ctx.lineTo(canvasWidth, canvasHeight / 2);
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = lineColor;
            ctx.stroke();
        }

        if (!isCountingDown) {
            const numFingers = parseInt(numFingersSlider.value);
            const selectedFingerColors = fingerColorInputs.map(input => input.value);
            
            const ballColor = getDirectBallColor(performance.now(), numFingers, selectedFingerColors); 

            ctx.beginPath();
            ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
            ctx.fillStyle = ballColor;
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

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

    function animate(currentTime) {
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
        
        initializeBallColorLogic(
            parseInt(numFingersSlider.value),
            parseInt(colorTempoSlider.value)
        );

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
                lastFrameTime = performance.now();
                animate(lastFrameTime);
            }
        }, beatInterval);
    }

    function resetBall() {
        cancelAnimationFrame(animationId);
        clearInterval(countdownIntervalId);
        isCountingDown = false;
        
        // Zorg dat canvasWidth en canvasHeight variabelen up-to-date zijn VOORDAT ballRadius wordt berekend
        // Ze worden geüpdatet door adjustCanvasSizeAndPath()
        
        calculateBallRadius(); 
        ballX = ballRadius; 
        ballY = getYForX(ballX, currentPathData); 
        
        draw();
        initializeBallColorLogic(
            parseInt(numFingersSlider.value),
            parseInt(colorTempoSlider.value)
        );
    }

    function updateButtonLabels() {
        startButton.textContent = "Herstart Vlakke Lijn";
        generateMountainsButton.textContent = "Herstart Hellingen";
    }

    // --- Event Listeners voor de knoppen en sliders ---
    startButton.addEventListener('click', () => {
        initializeFlatPathCurves(); 
        startAnimationOrCountdown(flatPath);
    });

    generateMountainsButton.addEventListener('click', () => {
        const numMountains = parseInt(numMountainsSlider.value);
        const includePlateaus = includePlateausCheckbox.checked;
        const newMountainPathData = generateMountainPath(numMountains, includePlateaus);
        startAnimationOrCountdown(newMountainPathData);
    });

    resetButton.addEventListener('click', () => {
        initializeFlatPathCurves(); 
        currentPathData = flatPath;
        resetBall();
        startButton.textContent = "Start Vlakke Lijn";
        generateMountainsButton.textContent = "Genereer & Start Hellingen";
    });

    speedSlider.addEventListener('input', () => {
        ballSpeed = parseFloat(speedSlider.value);
        currentSpeedSpan.textContent = ballSpeed.toFixed(1) + 'x';
    });

    numMountainsSlider.addEventListener('input', () => {
        currentNumMountainsSpan.textContent = numMountainsSlider.value;
    });

    numFingersSlider.addEventListener('input', () => {
        currentNumFingersSpan.textContent = numFingersSlider.value;
        initializeBallColorLogic(
            parseInt(numFingersSlider.value),
            parseInt(colorTempoSlider.value)
        );
        if (!isCountingDown && animationId) {
            draw();
        }
    });

    fingerColorInputs.forEach(input => {
        input.addEventListener('input', () => {
            if (!isCountingDown && animationId) {
                draw();
            }
        });
    });

    colorTempoSlider.addEventListener('input', () => {
        const newTempo = parseInt(colorTempoSlider.value);
        currentColorTempoSpan.textContent = newTempo + ' BPM';
        updateColorTempo(newTempo);
        if (!isCountingDown && animationId) {
            draw();
        }
    });

    toggleControlsButton.addEventListener('click', () => {
        controlsContainer.classList.toggle('hidden');
        if (controlsContainer.classList.contains('hidden')) {
            toggleControlsButton.textContent = "Toon Knoppen";
        } else {
            toggleControlsButton.textContent = "Verberg Knoppen";
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

    // NIEUWE FUNCTIE om canvasgrootte en paden aan te passen
    function adjustCanvasSizeAndPath() {
        if (document.fullscreenElement) {
            // In fullscreen modus: vul de appContainer
            canvas.width = appContainer.clientWidth * 0.95; 
            canvas.height = appContainer.clientHeight * 0.95; 
        } else {
            // Niet in fullscreen modus
            // Gebruik de breedte van de appContainer voor responsiviteit op normale schermen
            // en behoud de aspect ratio
            const maxNormalWidth = 1000; // Maximale breedte op desktop
            const normalPadding = 40; // Totaal padding van appContainer (20px links + 20px rechts)

            // Bereken de beschikbare breedte minus de padding van de appContainer
            let availableWidth = appContainer.clientWidth - normalPadding;

            // Zorg ervoor dat het canvas niet breder wordt dan de standaard desktop breedte
            if (availableWidth > maxNormalWidth) {
                availableWidth = maxNormalWidth;
            }

            canvas.width = availableWidth;
            canvas.height = availableWidth / CANVAS_ASPECT_RATIO;

            // Zorg ervoor dat de hoogte niet te klein wordt op extreem smalle schermen
            const minCanvasHeight = 150; // Minimum hoogte om de animatie zichtbaar te houden
            if (canvas.height < minCanvasHeight) {
                canvas.height = minCanvasHeight;
                // Als de hoogte de beperkende factor wordt, bereken dan de breedte opnieuw om de ratio te behouden
                canvas.width = minCanvasHeight * CANVAS_ASPECT_RATIO;
            }
        }
        
        // Update de JS variabelen canvasWidth en canvasHeight na elke wijziging
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;

        setCanvasWidthCssVariable(); // Update de CSS variabele

        // Herbereken de paden direct na het wijzigen van de afmetingen
        if (currentPathData === flatPath) { // Controleer of het vlakke pad actief is
            initializeFlatPathCurves(); // Initialiseert flatPath met nieuwe canvas afmetingen
            currentPathData = flatPath; // Zorg dat currentPathData verwijst naar het bijgewerkte flatPath
        } else {
            // Als het bergpad actief is, genereer een nieuw bergpad met de nieuwe afmetingen
            const numMountains = parseInt(numMountainsSlider.value);
            const includePlateaus = includePlateausCheckbox.checked;
            currentPathData = generateMountainPath(numMountains, includePlateaus);
        }
        resetBall(); // Reset de bal en zijn positie na resize
    }

    document.addEventListener('fullscreenchange', () => {
        appContainer.classList.toggle('fullscreen', document.fullscreenElement);
        adjustCanvasSizeAndPath(); // Roep de nieuwe functie aan
    });

    // NIEUW: Event listener voor de uitlegtekst toggle
    console.log("Explainer text element:", hideExplainerText, explainerText);
    hideExplainerText.addEventListener('click', () => {
        explainerText.classList.toggle('hidden');
        if (explainerText.classList.contains('hidden')) {
            hideExplainerText.textContent = "Toon uitleg";
        } else {
            hideExplainerText.textContent = "Verberg uitleg";
        }
    });

    // --- INITIALISATIE BIJ HET LADEN VAN DE PAGINA ---
    // Start met het aanpassen van de canvasgrootte
    adjustCanvasSizeAndPath(); 
    
    // Luister naar resize events op het window om de canvasgrootte en paden aan te passen
    window.addEventListener('resize', adjustCanvasSizeAndPath);
    
    currentSpeedSpan.textContent = speedSlider.value + 'x';
    currentNumMountainsSpan.textContent = numMountainsSlider.value;
    currentColorTempoSpan.textContent = colorTempoSlider.value + ' BPM';
    currentNumFingersSpan.textContent = numFingersSlider.value;

    // calculateBallRadius() wordt al aangeroepen door adjustCanvasSizeAndPath via resetBall()
    // calculateBallRadius(); 

    initializeBallColorLogic(
        parseInt(numFingersSlider.value),
        parseInt(colorTempoSlider.value)
    );

    draw();
});