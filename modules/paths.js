// modules/paths.js

/**
 * Berekent een punt op een kwadratische Bézier-curve.
 * @param {number} t De parameter van 0 tot 1.
 * @param {{x: number, y: number}} p0 Het startpunt.
 * @param {{x: number, y: number}} p1 Het controlepunt.
 * @param {{x: number, y: number}} p2 Het eindpunt.
 * @returns {{x: number, y: number}} Het punt op de curve.
 */
function getPointOnBezier(t, p0, p1, p2) {
    const x = Math.pow(1 - t, 2) * p0.x + 2 * (1 - t) * t * p1.x + Math.pow(t, 2) * p2.x;
    const y = Math.pow(1 - t, 2) * p0.y + 2 * (1 - t) * t * p1.y + Math.pow(t, 2) * p2.y;
    return { x, y };
}

/**
 * Berekent de y-coördinaat voor een gegeven x-coördinaat op een pad.
 * @param {number} x De x-coördinaat.
 * @param {{curves: Array}} pathData De padgegevens.
 * @param {number} canvasHeight De hoogte van het canvas.
 * @returns {number} De berekende y-coördinaat.
 */
export function getYForX(x, pathData, canvasHeight) {
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

/**
 * Genereert de gegevens voor een vlakke lijn over het canvas.
 * @param {number} canvasWidth De breedte van het canvas.
 * @param {number} canvasHeight De hoogte van het canvas.
 * @returns {{points: Array, curves: Array}} De padgegevens voor een vlakke lijn.
 */
export function initializeFlatPathCurves(canvasWidth, canvasHeight) {
    return {
        points: [{ x: 0, y: canvasHeight / 2 }, { x: canvasWidth, y: canvasHeight / 2 }],
        curves: [{
            p0: { x: 0, y: canvasHeight / 2 },
            p1: { x: canvasWidth / 2, y: canvasHeight / 2 },
            p2: { x: canvasWidth, y: canvasHeight / 2 }
        }]
    };
}

/**
 * Genereert de gegevens voor een berglandschap.
 * @param {number} numSegments Het aantal bergen.
 * @param {boolean} includePlateaus Of er plateaus moeten worden opgenomen.
 * @param {number} canvasWidth De breedte van het canvas.
 * @param {number} canvasHeight De hoogte van het canvas.
 * @returns {{points: Array, curves: Array}} De padgegevens voor een berglandschap.
 */
export function generateMountainPath(numSegments, includePlateaus, canvasWidth, canvasHeight) {
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
