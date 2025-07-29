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

    // Canvas afmetingen
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Bal eigenschappen
    const ballRadius = 15;
    let ballX = ballRadius;
    let ballY = canvasHeight / 2; // Initieel op de helft van de hoogte
    let ballSpeed = parseFloat(speedSlider.value);
    let animationId = null;

    // Lijn eigenschappen
    const lineWidth = 2;
    const lineColor = '#2c3e50';
    // De lijn Y-positie wordt nu dynamisch bepaald, of we tekenen hem helemaal niet meer in bergmodus.
    // Voorlopig houden we de lijn voor de vlakke oefening.

// --- Definieer de paden ---
    // Pad voor de vlakke lijn (Y blijft constant)
    const flatPath = {
        // We slaan nu de punten op in een 'points' array
        points: [{ x: 0, y: canvasHeight / 2 }, { x: canvasWidth, y: canvasHeight / 2 }],
        // En genereren hier de 'curve data' voor de vlakke lijn
        curves: [{ p0: { x: 0, y: canvasHeight / 2 }, p1: { x: canvasWidth / 2, y: canvasHeight / 2 }, p2: { x: canvasWidth, y: canvasHeight / 2 } }]
    };


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
        // Iterate over de gedefinieerde curves
        for (let i = 0; i < pathData.curves.length; i++) {
            const curve = pathData.curves[i];
            const { p0, p1, p2 } = curve; // Start, controle, eindpunt van de curve

            // Check of de x-positie van de bal binnen de X-grenzen van deze curve valt
            // (Dit is een vereenvoudiging, want Bezier curves kunnen buiten hun ankerpunten komen)
            const minX = Math.min(p0.x, p1.x, p2.x);
            const maxX = Math.max(p0.x, p1.x, p2.x);

            if (x >= minX && x <= maxX) {
                // Nu moeten we de 't' waarde vinden (0 tot 1) die overeenkomt met de huidige 'x'
                // Dit is complexer voor kwadratische curven, omdat 'x' niet lineair schaalt met 't'.
                // We gebruiken een binaire zoektocht of numerieke benadering hiervoor.
                // Voor simpele gevallen kunnen we uitgaan van een monotone X-beweging.

                // Eenvoudige benadering: veronderstel dat X lineair loopt van p0.x naar p2.x
                // En als het controlepunt p1.x er te veel van afwijkt, dan nemen we de min/max van alle 3 punten.
                // Dit is niet perfect, maar werkt voor de meeste "berg" curven.
                
                let t = 0;
                // Deel het segment in kleine stapjes en zoek de t die het dichtst bij x komt
                // Dit is niet de meest performante oplossing, maar wel eenvoudig te begrijpen.
                const numSteps = 100;
                let closestT = 0;
                let smallestDiff = Infinity;

                for (let step = 0; step <= numSteps; step++) {
                    const currentT = step / numSteps;
                    const pointOnCurve = getPointOnBezier(currentT, p0, p1, p2);
                    const diff = Math.abs(pointOnCurve.x - x);

                    if (diff < smallestDiff) {
                        smallestDiff = diff;
                        closestT = currentT;
                    }
                }
                t = closestT;

                // Bereken de Y-waarde voor deze 't'
                const { y } = getPointOnBezier(t, p0, p1, p2);
                return y;
            }
        }
        
        // Als x buiten alle curves valt (bijv. aan het begin/einde), blijf dan op de start/eind Y
        if (x < pathData.points[0].x) return pathData.points[0].y;
        if (x > pathData.points[pathData.points.length - 1].x) return pathData.points[pathData.points.length - 1].y;

        // Als geen curve gevonden, retourneer de laatste bekende Y of de midden Y.
        return canvasHeight / 2;
    }

    // --- Aangepaste functie: Genereer een willekeurig bergpad met ronde toppen ---
    // Deze functie retourneert nu een object met zowel de 'points' (voor de generator)
    // als de 'curves' (de Bezier curve segmenten voor draw en getYForX).
    function generateMountainPath(numSegments, includePlateaus) {
        const generatedPoints = []; // Dit zijn de 'piek/dal' ankerpunten
        const curves = []; // Dit zijn de eigenlijke Bezier curve definities (p0, p1, p2)

        const minHeight = canvasHeight * 0.1;
        const maxHeight = canvasHeight * 0.9;
        const segmentWidth = canvasWidth / numSegments;
        const plateauChance = 0.3;

        // Startpunt van het hele pad
        generatedPoints.push({ x: 0, y: canvasHeight / 2 });

        // Genereer de hoofdankerpunten (de 'pieken' en 'dalen')
        for (let i = 0; i < numSegments; i++) {
            const currentX = (i + 1) * segmentWidth;

            if (includePlateaus && Math.random() < plateauChance && i < numSegments - 1) {
                // Vlakte: voeg een extra punt toe om een horizontale lijn te forceren
                // Dit werkt door het control point en end point van de curve hetzelfde te maken
                const plateauEndPointX = currentX - (segmentWidth / 2); // Einde van de vlakte
                const plateauY = generatedPoints[generatedPoints.length - 1].y;
                generatedPoints.push({ x: plateauEndPointX, y: plateauY });
            }
            
            const nextY = Math.random() * (maxHeight - minHeight) + minHeight;
            generatedPoints.push({ x: currentX, y: nextY });
        }

        // Nu, genereer de Bezier curves op basis van de gegenereerde punten
        // We gaan van ankerpunt naar ankerpunt.
        // Een kwadratische Bezier curve heeft een startpunt (P0), een controlepunt (P1), en een eindpunt (P2).
        // Om afgevlakte hoeken te krijgen, gebruiken we de middenpunten van de segmenten als ankerpunten (P0, P2)
        // en de oorspronkelijke gegenereerde punten als controlepunten (P1).

        // Voeg het startpunt van de eerste curve toe
        let p0 = generatedPoints[0];
        // En het controlepunt is het tweede generatedPoint
        let p1 = generatedPoints[1];

        for (let i = 0; i < generatedPoints.length - 1; i++) {
            // Het eindpunt (P2) van de huidige curve is het midden tussen het huidige controlepunt (generatedPoints[i+1])
            // en het volgende gegenereerde punt (generatedPoints[i+2])
            let nextPoint = generatedPoints[i + 1];
            let endPointOfCurve = {}; // Dit wordt p2

            if (i === generatedPoints.length - 2) { // Laatste segment
                endPointOfCurve = nextPoint; // Het laatste punt is het echte eindpunt
            } else {
                endPointOfCurve.x = (nextPoint.x + generatedPoints[i+2].x) / 2;
                endPointOfCurve.y = (nextPoint.y + generatedPoints[i+2].y) / 2;
            }

            // De curve bestaat uit P0 (start), P1 (controle), P2 (eind)
            curves.push({ p0: p0, p1: nextPoint, p2: endPointOfCurve });

            // Voor de volgende iteratie wordt het eindpunt van de huidige curve het startpunt
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

        // Teken het huidige pad (als de "lijn")
        ctx.beginPath();
        // Start bij het eerste punt van de eerste curve
        ctx.moveTo(currentPathData.curves[0].p0.x, currentPathData.curves[0].p0.y);

        // Teken elk Bezier curve segment
        currentPathData.curves.forEach(curve => {
            ctx.quadraticCurveTo(curve.p1.x, curve.p1.y, curve.p2.x, curve.p2.y);
        });
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = lineColor;
        ctx.stroke();

        // Teken de bal
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c'; // Rode bal
        ctx.fill();
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Functie om de balpositie te updaten
    function update() {
        ballX += ballSpeed;

        // Reset de bal als hij buiten beeld is
        if (ballX > canvasWidth + ballRadius) {
            ballX = -ballRadius; // Start de bal net buiten beeld aan de linkerkant
        }

        // Bereken de nieuwe Y-positie op basis van het huidige pad
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
        currentPathData = pathData; // Let op: nu is het 'pathData' object
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

    // Initial tekening bij het laden van de pagina
    draw();
});