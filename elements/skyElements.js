// Horizontale verschuivingen voor elke wolkenset
let cloudOffsets = [0, 0, 0]; 

// Snelheden van de wolken (pixels per frame), willekeurig tussen 0.1 en 0.4
const cloudSpeeds = [
    Math.random() * (0.4 - 0.1) + 0.1, // Snelheid voor de eerste wolkenset
    Math.random() * (0.4 - 0.1) + 0.1,  // Snelheid voor de tweede wolkenset
    Math.random() * (0.4 - 0.1) + 0.1   // Snelheid voor de derde wolkenset
];

/**
 * Tekent de zon en de bewegende wolken op het canvas.
 * @param {CanvasRenderingContext2D} ctx - De 2D rendering context van het canvas.
 * @param {number} canvasWidth - De huidige breedte van het canvas.
 * @param {number} canvasHeight - De huidige hoogte van het canvas.
 */
export function drawSkyElements(ctx, canvasWidth, canvasHeight) {
    // Update de positie van de wolken individueel
    for (let i = 0; i < cloudOffsets.length; i++) {
        cloudOffsets[i] = (cloudOffsets[i] + cloudSpeeds[i]); // Beweeg de wolken van links naar rechts

        // Als de wolk volledig van het scherm is, reset de offset
        if (cloudOffsets[i] > canvasWidth) {
            cloudOffsets[i] = 0; // Reset naar de linkerkant van het canvas
        }
    }

    // Teken de zon
    const sunRadius = Math.min(canvasWidth, canvasHeight) * 0.1; // 10% van de kleinste dimensie
    const sunX = canvasWidth - sunRadius - 20; // 20px van de rechterrand
    const sunY = sunRadius + 20; // 20px van de bovenrand
    const sunColor = '#ffe064'; // Goudgele kleur

    ctx.beginPath();
    ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
    ctx.fillStyle = sunColor;
    ctx.fill();
    ctx.closePath();

    // Functie om een wolk te tekenen op een gegeven offset
    function drawCloud(offsetX, cloudBaseX, cloudBaseY, cloudSize, cloudColor) {
        ctx.save(); // Sla de huidige canvas staat op
        ctx.globalAlpha = 0.8; // Maak de wolk semi-transparant
        ctx.lineWidth = 2; // Dikte van de wolkrand
        ctx.strokeStyle = '#FFFFFF'; // Witte rand voor de wolk

        ctx.fillStyle = cloudColor;
        ctx.beginPath();
        // Hoofdsegmenten van de wolk
        ctx.arc(offsetX + cloudBaseX, cloudBaseY, cloudSize, 0, Math.PI * 2);
        ctx.arc(offsetX + cloudBaseX + cloudSize * 0.8, cloudBaseY - cloudSize * 0.3, cloudSize * 0.7, 0, Math.PI * 2);
        ctx.arc(offsetX + cloudBaseX + cloudSize * 1.5, cloudBaseY, cloudSize * 0.9, 0, Math.PI * 2);
        ctx.arc(offsetX + cloudBaseX + cloudSize * 0.5, cloudBaseY + cloudSize * 0.5, cloudSize * 0.6, 0, Math.PI * 2);
        ctx.arc(offsetX + cloudBaseX + cloudSize * 1.2, cloudBaseY + cloudSize * 0.4, cloudSize * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke(); // Teken de rand
        ctx.restore(); // Herstel de canvas staat (globalAlpha, lineWidth, strokeStyle)
    }

    // Teken de eerste wolkenset (en herhaal voor naadloze loop)
    const cloudBaseX1 = Math.min(canvasWidth, canvasHeight) * 0.15;
    const cloudBaseY1 = Math.min(canvasWidth, canvasHeight) * 0.15;
    const cloudSize1 = Math.min(canvasWidth, canvasHeight) * 0.08;
    const cloudColor1 = '#ADD8E6';

    drawCloud(cloudOffsets[0], cloudBaseX1, cloudBaseY1, cloudSize1, cloudColor1);
    // Teken dezelfde wolk opnieuw, verschoven naar links, voor een naadloze loop
    // Dit zorgt ervoor dat als de eerste wolk van het scherm verdwijnt, de tweede al klaar staat
    drawCloud(cloudOffsets[0] - canvasWidth, cloudBaseX1, cloudBaseY1, cloudSize1, cloudColor1);


    // Teken de tweede wolkenset (en herhaal voor naadloze loop)
    const cloudBaseX2 = cloudBaseX1 + cloudSize1 * 4.5;
    const cloudBaseY2 = cloudBaseY1 + cloudSize1 * 0.5;
    const cloudSize2 = cloudSize1 * 0.8;
    const cloudColor2 = '#B0E0E6';

    drawCloud(cloudOffsets[1], cloudBaseX2, cloudBaseY2, cloudSize2, cloudColor2);
    // Teken dezelfde wolk opnieuw, verschoven naar links, voor een naadloze loop
    drawCloud(cloudOffsets[1] - canvasWidth, cloudBaseX2, cloudBaseY2, cloudSize2, cloudColor2);

    // Teken de derde wolkenset (en herhaal voor naadloze loop)
    const cloudBaseX3 = cloudBaseX2 + cloudSize2 * 3.
    const cloudBaseY3 = cloudBaseY2 - cloudSize2 * 0.5;
    const cloudSize3 = cloudSize2 * 0.9;
    const cloudColor3 = '#87CEFA';
    
    // Teken de derde wolk
    drawCloud(cloudOffsets[2], cloudBaseX3, cloudBaseY3, cloudSize3, cloudColor3);
    // Teken dezelfde wolk opnieuw, verschoven naar links, voor een naadloze
    drawCloud(cloudOffsets[2] - canvasWidth, cloudBaseX3, cloudBaseY3, cloudSize3, cloudColor3);

}
