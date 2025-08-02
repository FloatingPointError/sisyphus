// fingerColors: ['#f05442', '#ffe064', '#0851bb', '#944dffff'] // Standaardkleuren uit HTML
// maak een nieuws object met hex kleuren voor de vingers
export const hexColors = {
    yellow: '#ffe064', // f05442
    red: '#2980b9',
    blue: '#0851bb',
    purple: '#944dff',
    green: '#9ce3d3',
    pink: '#ed9fca',
    orange: '#fcc7a1',
};

/**
 * Configuraties voor de verschillende oefeningsen in het leerpad.
 * Elke oefening definieert de instellingen voor de animatie.
 * Wordt nog aangepast in de toekomst om meer oefeningsen toe te voegen. Nu in Beta
 */
export const lessonConfigurations = [
    {
        parentId: 1,
        lessons: [
            {
                id: 'oefening-1',
                subid: 'exercise 1.0',
                name: 'oefening 1: pushing the string (1 finger)',
                settings: {
                    speed: 1.0,
                    numMountains: 1, // Niet relevant voor flat, maar consistentie
                    includePlateaus: false,
                    numFingers: 1,
                    colorTempo: 40, // BPM
                    fingerColors: [hexColors.red],
                },
                pathType: 'flat' // 'flat' of 'mountains'
            },
            {
                id: 'oefening-1',
                subid: 'exercise 1.1',
                name: 'oefening 1.1: pushing the string (2 fingers)',
                settings: {
                    speed: 1.0,
                    numMountains: 1, // Niet relevant voor flat, maar consistentie
                    includePlateaus: false,
                    numFingers: 2,
                    colorTempo: 40, // BPM
                    fingerColors: [hexColors.red, hexColors.yellow],
                },
                pathType: 'flat' // 'flat' of 'mountains'
            },
            {
                id: 'oefening-1',
                subid: 'exercise 1.1a',
                name: 'exercise 1.1a: pushing the string (3 fingers)',
                settings: {
                    speed: 1.0,
                    numMountains: 1,
                    includePlateaus: false,
                    numFingers: 3,
                    colorTempo: 40, // BPM
                    fingerColors: [hexColors.red, hexColors.yellow, hexColors.blue],
                },
                pathType: 'flat'
            },
            {
                id: 'oefening-1',
                subid: 'exercise 1.1b',
                name: 'exercise 1.1b: pushing the string in thumbpostion (1 finger)',
                settings: {
                    speed: 1.0,
                    numMountains: 1,
                    includePlateaus: false,
                    numFingers: 1,
                    colorTempo: 40, // BPM
                    fingerColors: [hexColors.red],
                },
                pathType: 'flat'
            },
            {
                id: 'oefening-1',
                subid: 'exercise-1.1c',
                name: 'exercise 1.1c: pushing the string in thumbpostion (2 fingers)',
                settings: {
                    speed: 1.0,
                    numMountains: 1, // Niet relevant voor flat, maar consistentie
                    includePlateaus: false,
                    numFingers: 2,
                    colorTempo: 40, // BPM
                    fingerColors: [hexColors.red, hexColors.yellow],
                },
                pathType: 'flat' // 'flat' of 'mountains'
            },    
            {
                id: 'oefening-1',
                subid: 'exercise 1.1d',
                name: 'exercise 1.1d: pushing the string in thumbpostion (3 fingers)',
                settings: {
                    speed: 1.0,
                    numMountains: 1, // Niet relevant voor flat, maar consistentie
                    includePlateaus: false,
                    numFingers: 3,
                    colorTempo: 40, // BPM
                    fingerColors: [hexColors.red, hexColors.yellow, hexColors.blue],
                },
                pathType: 'flat' // 'flat' of 'mountains'
            },
                {
                id: 'oefening-1',
                subid: 'exercise 1.1e',
                name: 'exercise 1.1e: pushing the string in thumbpostion (4 fingers)',
                settings: {
                    speed: 1.0,
                    numMountains: 1, // Niet relevant voor flat, maar consistentie
                    includePlateaus: false,
                    numFingers: 4,
                    colorTempo: 40, // BPM
                    fingerColors: [hexColors.red, hexColors.yellow, hexColors.blue, hexColors.purple],
                },
                pathType: 'flat' // 'flat' of 'mountains'
            }, 
        ],     
    },
    {
        parentId: 2,
        lessons: [
            //
        ],
    }
];