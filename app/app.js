import { domElements } from './elements/index.js';

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

    // Canvas afmetingen (worden nu dynamisch bijgehouden)
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;

    // Bal eigenschappen
    const ballRadius = 15;
    let ballX = ballRadius;
    let ballY = canvasHeight / 2;
    let ballSpeed = parseFloat(speedSlider.value);
    let animationId = null;

    // Lijn eigenschappen
    const lineWidth = 2;
    const lineColor = '#2c3e50';

    // --- Definieer de paden ---
    // Pad voor de vlakke lijn (Y blijft constant)
    const flatPath = {
        points: [{ x: 0, y: canvasHeight / 2 }, { x: canvasWidth, y: canvasHeight / 2 }],
        curves: [] // Deze wordt later gevuld door generateMountainPath voor de vlakke lijn
    };
    // Initialize flatPath.curves for the plain line immediately after canvasWidth/Height are known
    flatPath.curves = [{
        p0: { x: 0, y: flatPath.points[0].y },
        p1: { x: canvasWidth / 2, y: flatPath.points[0].y }, // Control point op dezelfde Y
        p2: { x: canvasWidth, y: flatPath.points[0].y }
    }];


    let currentPathData = flatPath; // Start met de vlakke lijn

    // Functie om een punt op een kwadratische Bezier curve te berekenen
    function getPointOnBezier(t, p0, p1, p2) {
        const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
        const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
        return { x, y };
    }

    // Functie om de Y-positie van de bal te berekenen op basis van zijn X-positie
    // Dit gebruikt nu de voorgedefinieerde Bezier curve segmenten
    function getYForX(x, pathData) {
        if (!pathData || !pathData.curves || pathData.curves.length === 0) {
            return canvasHeight / 2; // Valback als er geen pad is
        }

        // Deel het segment in kleine stapjes en zoek de t die het dichtst bij x komt
        const numSteps = 100;

        for (let i = 0; i < pathData.curves.length; i++) {
            const curve = pathData.curves[i];
            const { p0, p1, p2 } = curve;

            let closestT = 0;
            let smallestDiff = Infinity;

            // Check of de x-positie van de bal binnen de X-grenzen van deze curve valt
            // (Dit is een vereenvoudiging, want Bezier curves kunnen buiten hun ankerpunten komen)
            const curveMinX = Math.min(p0.x, p1.x, p2.x);
            const curveMaxX = Math.max(p0.x, p1.x, p2.x);

            if (x >= curveMinX - 1 && x <= curveMaxX + 1) { // Kleine marge toevoegen
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
        
        // Als x buiten alle curves valt (bijv. aan het begin/einde), blijf dan op de start/eind Y
        if (x < pathData.points[0].x) return pathData.points[0].y;
        if (x > pathData.points[pathData.points.length - 1].x) return pathData.points[pathData.points.length - 1].y;

        return canvasHeight / 2; // Valback
    }

    // --- Aangepaste functie: Genereer een willekeurig bergpad met ronde toppen ---
    function generateMountainPath(numSegments, includePlateaus) {
        const generatedPoints = [];
        const curves = [];

        const minHeight = canvasHeight * 0.1;
        const maxHeight = canvasHeight * 0.9;
        const segmentWidth = canvasWidth / numSegments;
        const plateauChance = 0.3;

        // Startpunt van het hele pad
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
        
        // Speciale afhandeling voor vlakke lijn: als er maar twee punten zijn (start en eind),
        // maak dan een enkele Bezier curve die een rechte lijn voorstelt.
        if (generatedPoints.length === 2) {
            curves.push({ 
                p0: generatedPoints[0], 
                p1: { x: (generatedPoints[0].x + generatedPoints[1].x) / 2, y: generatedPoints[0].y }, // Controlepunt op dezelfde Y
                p2: generatedPoints[1] 
            });
        }


        return { points: generatedPoints, curves: curves };
    }

    // Functie om de bal en de lijn te tekenen (nu met Bezier curves)
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

        // Teken de bal
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Functie om de balpositie te updaten
    function update() {
        ballX += ballSpeed;

        if (ballX > canvasWidth + ballRadius) {
            ballX = -ballRadius;
        }

        ballY = getYForX(ballX, currentPathData);
    }

    // De animatieloop
    function animate() {
        update();
        draw();
        animationId = requestAnimationFrame(animate);
    }

    // Functie om de animatie te starten met een specifiek pad
    function startAnimation(pathData) {
        cancelAnimationFrame(animationId);
        animationId = null;
        currentPathData = pathData;
        resetBall();
        animate();
        updateButtonLabels();
    }

    // Functie om de bal te resetten naar de startpositie van het huidige pad
    function resetBall() {
        ballX = ballRadius;
        // Zorg ervoor dat ballY ook correct gezet wordt bij reset
        ballY = getYForX(ballX, currentPathData);
        draw();
    }

    // Update de teksten op de startknoppen
    function updateButtonLabels() {
        startButton.textContent = "Herstart Vlakke Lijn";
        generateMountainsButton.textContent = "Herstart Bergen";
    }

    // --- Event Listeners voor de knoppen en sliders ---
    startButton.addEventListener('click', () => {
        startAnimation(flatPath);
    });

    generateMountainsButton.addEventListener('click', () => {
        const numMountains = parseInt(numMountainsSlider.value);
        const includePlateaus = includePlateausCheckbox.checked;
        const newMountainPathData = generateMountainPath(numMountains, includePlateaus);
        startAnimation(newMountainPathData);
    });

    resetButton.addEventListener('click', () => {
        cancelAnimationFrame(animationId);
        animationId = null;
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

    // --- Nieuwe Event Listeners voor togglen controls en fullscreen ---

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

    // Pas canvas afmetingen aan bij (de)activeren fullscreen
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            appContainer.classList.add('fullscreen');
            // Pas canvas afmetingen aan voor fullscreen
            canvasWidth = window.innerWidth * 0.95; // Bijna volle breedte
            canvasHeight = window.innerHeight * 0.80; // Bijna volle hoogte
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            resetBall(); // Reset de balpositie en herteken de lijn op de nieuwe schaal
        } else {
            appContainer.classList.remove('fullscreen');
            // Herstel canvas afmetingen naar initieel
            canvasWidth = 1000;
            canvasHeight = 300;
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            resetBall(); // Reset de balpositie en herteken de lijn
        }
        // Forceer een hergeneratie van het bergpad om aan de nieuwe afmetingen aan te passen
        if (currentPathData !== flatPath) { // Alleen als het geen vlakke lijn is
            const numMountains = parseInt(numMountainsSlider.value);
            const includePlateaus = includePlateausCheckbox.checked;
            const newMountainPathData = generateMountainPath(numMountains, includePlateaus);
            currentPathData = newMountainPathData;
        } else {
             // Zorg dat flatPath ook de juiste canvas afmetingen gebruikt
            flatPath.points = [{ x: 0, y: canvasHeight / 2 }, { x: canvasWidth, y: canvasHeight / 2 }];
            flatPath.curves = [{
                p0: { x: 0, y: flatPath.points[0].y },
                p1: { x: canvasWidth / 2, y: flatPath.points[0].y },
                p2: { x: canvasWidth, y: flatPath.points[0].y }
            }];
            currentPathData = flatPath;
        }
        // Na aanpassing van de afmetingen en paden, herteken.
        draw();
    });


    // Initial tekening bij het laden van de pagina
    draw();
});