// fingerColors: ['#f05442', '#ffe064', '#0851bb', '#944dff'] // Standaardkleuren uit HTML
// maak een nieuws object met hex kleuren voor de vingers
export const hexColors = {
    yellow: '#ffe064', // f05442
    red: '#f05442',
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
        name: 'Pressing the String', // Naam voor de parent les
        lessons: [
            {
                id: 'exercise-1-0', // UNIEKE ID
                subid: 'exercise-1-0',
                name: 'oefening 1: pushing the string (1 finger)',
                contentPath: '../oefeningen/content/exercise-1-0.html', // UNIEK PAD
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
                id: 'exercise-1-0', 
                subid: 'exercise-1-1',
                name: 'oefening 1.1: pushing the string (2 fingers)',
                contentPath: '../oefeningen/content/exercise-1-1.html', // UNIEK PAD
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
                id: 'exercise-1-0', // UNIEKE ID
                subid: 'exercise-1-2',
                name: 'exercise 1.2: pushing the string (3 fingers)',
                contentPath: '../oefeningen/content/exercise-1-2.html', // UNIEK PAD
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
                id: 'exercise-1-0', // UNIEKE ID
                subid: 'exercise-1-3',
                name: 'exercise 1.3: pushing the string in thumbpostion (1 finger)',
                contentPath: '../oefeningen/content/exercise-1-3.html', // UNIEK PAD
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
                id: 'exercise-1-0', // UNIEKE ID
                subid: 'exercise 1-4',
                name: 'exercise-1.4: pushing the string in thumbpostion (2 fingers)',
                contentPath: '../oefeningen/content/exercise-1-4.html', // UNIEK PAD
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
                id: 'exercise-1-0', // UNIEKE ID
                subid: 'exercise-1-5',
                name: 'exercise 1.5: pushing the string in thumbpostion (3 fingers)',
                contentPath: '../oefeningen/content/exercise-1-5.html', // UNIEK PAD
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
                id: 'exercise-1-0', // UNIEKE ID
                subid: 'exercise-1-6',
                name: 'exercise 1.6: pushing the string in thumbpostion (4 fingers)',
                contentPath: '../oefeningen/content/exercise-1-6.html', // UNIEK PAD
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
        name: 'Another Learning Path', // Voorbeeld van een andere parent les
        lessons: [
            // Voeg hier lessen toe voor parentId 2
        ],
    }
];
