const hexColors = {
    yellow: '#f05442',
    green: '#9ce3d3',
    blue: '#97caf3',
    purple: '#c4a2f7',
    pink: '#ed9fca',
    orange: '#fcc7a1',
}

/**
 * Configuraties voor de verschillende lessen in het leerpad.
 * Elke les definieert de instellingen voor de animatie.
 * Wordt nog aangepast in de toekomst om meer lessen toe te voegen. Nu in Beta
 */
export const lessonConfigurations = [
    {
        id: 'lesson1.0-flat',
        name: 'Les 1: snaar indrukken',
        settings: {
            speed: 1.0,
            numMountains: 1, // Niet relevant voor flat, maar consistentie
            includePlateaus: false,
            numFingers: 1,
            colorTempo: 40, // BPM
            fingerColors: [hexColors.yellow],
            description: 'Druk de snaar in op de puls van de bal. Wissel de vingers af met de kleur van de bal',
        },
        pathType: 'flat' // 'flat' of 'mountains'
    },
    {
        id: 'lesson1.1-flat',
        name: 'Les 1.1: snaar indrukken',
        settings: {
            speed: 1.0,
            numMountains: 1, // Niet relevant voor flat, maar consistentie
            includePlateaus: false,
            numFingers: 2,
            colorTempo: 40, // BPM
            fingerColors: [hexColors.yellow, hexColors.green],
            description: 'Druk de snaar in op de puls van de bal. Wissel de vingers af met de kleur van de bal. Chromatisch.',
        },
        pathType: 'flat' // 'flat' of 'mountains'
    },
    {
        id: 'lesson1.1a-flat',
        name: 'Les 1.1a: Snaar indrukken',
        settings: {
            speed: 1.2,
            numMountains: 1,
            includePlateaus: false,
            numFingers: 3,
            colorTempo: 40, // BPM
            fingerColors: [hexColors.yellow, hexColors.green, hexColors.blue],
            description: 'Druk de snaar in op de puls van de bal. Wissel de vingers af met de kleur van de bal. Chromatisch.',
        },
        pathType: 'flat'
    },
    {
        id: 'lesson1.1b-flat',
        name: 'Les 1.1b: Snaar indrukken pt.I, duimpositie',
        settings: {
            speed: 1.5,
            numMountains: 1,
            includePlateaus: false,
            numFingers: 3,
            colorTempo: 40, // BPM
            fingerColors: [hexColors.yellow, hexColors.green, hexColors.blue],
            description: 'Druk de snaar in op de puls van de bal. Wissel de vingers af met de kleur van de bal. Gebruik de duimpositie. Chromatisch.',
        },
        pathType: 'flat'
    },
    {
        id: 'lesson1.1c-flat',
        name: 'Les 1.1c: Snaar indrukken pt.II, duimpositie. Chromatisch',
        settings: {
            speed: 1,
            numMountains: 1,
            includePlateaus: false,
            numFingers: 4,
            colorTempo: 40, // BPM
            fingerColors: [hexColors.yellow, hexColors.green, hexColors.blue, hexColors.purple],
            description: 'Druk de snaar in op de puls van de bal. Wissel de vingers af met de kleur van de bal. Gebruik de duimpositie: chromatisch, semichromatisch en diatonisch.',
        },
        pathType: 'flat'
    }
];