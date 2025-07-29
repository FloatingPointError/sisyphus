import { domElements } from './elements/index.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvas = domElements.animationCanvas;
    const ctx = canvas.getContext('2d');
    const startButton = domElements.startButton;
    const resetButton = domElements.resetButton;
    const speedSlider = domElements.speedSlider;
    const currentSpeedSpan = domElements.currentSpeedSpan;

    // Canvas afmetingen
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Bal eigenschappen
    const ballRadius = 15;
    let ballX = ballRadius; // Start links op het canvas
    const ballY = canvasHeight / 2; // Midden van het canvas verticaal
    let ballSpeed = parseFloat(speedSlider.value); // Snelheid van de bal in pixels per frame
    let animationId = null; // Voor het bijhouden van de requestAnimationFrame ID

    // Lijn eigenschappen
    const lineWidth = 2;
    const lineColor = '#2c3e50';
    const lineY = ballY; // De lijn loopt op dezelfde hoogte als het midden van de bal

    // Functie om de bal en de lijn te tekenen
    function draw() {
        // Maak het canvas leeg
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // Teken de vlakke lijn
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(canvasWidth, lineY);
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

        // Als de bal de rechterrand bereikt, verplaats hem dan terug naar links
        if (ballX > canvasWidth + ballRadius) {
            ballX = -ballRadius; // Start de bal net buiten beeld aan de linkerkant
        }
    }

    // De animatieloop
    function animate() {
        update();
        draw();
        animationId = requestAnimationFrame(animate); // Vraag de volgende animatie frame aan
    }

    // Event Listeners voor de knoppen en slider
    startButton.addEventListener('click', () => {
        if (!animationId) { // Voorkom dat er meerdere animaties tegelijkertijd draaien
            animate();
            startButton.textContent = "Herstart Animatie"; // Tekst aanpassen voor herstart
        } else {
            // Als de animatie al draait, reset en start opnieuw
            cancelAnimationFrame(animationId);
            animationId = null;
            resetBall();
            animate();
        }
    });

    resetButton.addEventListener('click', () => {
        cancelAnimationFrame(animationId); // Stop de animatie
        animationId = null;
        resetBall();
        startButton.textContent = "Start Animatie"; // Reset de knoptekst
    });

    speedSlider.addEventListener('input', () => {
        ballSpeed = parseFloat(speedSlider.value);
        currentSpeedSpan.textContent = ballSpeed.toFixed(1) + 'x';
    });

    // Functie om de bal te resetten naar de startpositie
    function resetBall() {
        ballX = ballRadius;
        draw(); // Teken de bal op de startpositie
    }

    // Initial tekening bij het laden van de pagina
    draw();
});