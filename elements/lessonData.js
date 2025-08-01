const hexColors = {
    yellow: '#f05442',
    green: '#9ce3d3',
    blue: '#97caf3',
    purple: '#c4a2f7',
    pink: '#ed9fca',
    orange: '#fcc7a1',
}

/**
 * Configuraties voor de verschillende oefeningsen in het leerpad.
 * Elke oefening definieert de instellingen voor de animatie.
 * Wordt nog aangepast in de toekomst om meer oefeningsen toe te voegen. Nu in Beta
 */
export const lessonConfigurations = [
    {
        id: 'oefening-1',
        subid: 'oefening-1.0',
        name: 'oefening 1: snaar indrukken (1 vinger)',
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
        id: 'oefening-1',
        subid: 'oefening1.1',
        name: 'oefening 1.1: snaar indrukken (2 vingers)',
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
        id: 'oefening-1',
        subid: 'oefening1.1a',
        name: 'oefening 1.1a: Snaar indrukken (3 vingers)',
        settings: {
            speed: 1.0,
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
        id: 'oefening-1',
        subid: 'oefening1.1b',
        name: 'oefening 1.1b: Snaar indrukken (duimpositie, 1 vinger)',
        settings: {
            speed: 1.0,
            numMountains: 1,
            includePlateaus: false,
            numFingers: 1,
            colorTempo: 40, // BPM
            fingerColors: [hexColors.yellow],
            description: 'Druk de snaar in op de puls van de bal. Wissel de vingers af met de kleur van de bal. Gebruik de duimpositie. Chromatisch.',
        },
        pathType: 'flat'
    },
    {
        id: 'oefening-1',
        subid: 'oefening-1.1c',
        name: 'oefening 1.1c: snaar indrukken (duimpositie, 2 vingers)',
        settings: {
            speed: 1.0,
            numMountains: 1, // Niet relevant voor flat, maar consistentie
            includePlateaus: false,
            numFingers: 2,
            colorTempo: 40, // BPM
            fingerColors: [hexColors.yellow, hexColors.green],
            description: 'Druk de snaar in op de puls van de bal. Wissel de vingers af met de kleur van de bal.',
        },
        pathType: 'flat' // 'flat' of 'mountains'
    },    
    {
        id: 'oefening-1',
        subid: 'oefening-1.1d',
        name: 'oefening 1.1d: snaar indrukken (duimpositie, 3 vingers)',
        settings: {
            speed: 1.0,
            numMountains: 1, // Niet relevant voor flat, maar consistentie
            includePlateaus: false,
            numFingers: 3,
            colorTempo: 40, // BPM
            fingerColors: [hexColors.yellow, hexColors.green, hexColors.blue],
            description: 'Druk de snaar in op de puls van de bal. Wissel de vingers af met de kleur van de bal.',
        },
        pathType: 'flat' // 'flat' of 'mountains'
    },
        {
        id: 'oefening-1',
        subid: 'oefening-1.1d',
        name: 'oefening 1.1c: snaar indrukken (duimpositie, 4 vingers)',
        settings: {
            speed: 1.0,
            numMountains: 1, // Niet relevant voor flat, maar consistentie
            includePlateaus: false,
            numFingers: 2,
            colorTempo: 40, // BPM
            fingerColors: [hexColors.yellow, hexColors.green, hexColors.blue, hexColors.purple],
            description: 'Druk de snaar in op de puls van de bal. Wissel de vingers af met de kleur van de bal.',
        },
        pathType: 'flat' // 'flat' of 'mountains'
    },

];