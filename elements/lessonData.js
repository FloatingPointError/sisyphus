/**
 * Configuraties voor de verschillende lessen in het leerpad.
 * Elke les definieert de instellingen voor de animatie.
 * Wordt nog aangepast in de toekomst om meer lessen toe te voegen. Nu in Beta
 */
export const lessonConfigurations = [
    {
        id: 'lesson1-flat-slow',
        name: 'Les 1: Vlak & Langzaam',
        settings: {
            speed: 1.0,
            numMountains: 1, // Niet relevant voor flat, maar consistentie
            includePlateaus: false,
            numFingers: 2,
            colorTempo: 50, // 50 BPM
            fingerColors: ['#FF0000', '#0000FF']
        },
        pathType: 'flat' // 'flat' of 'mountains'
    },
    {
        id: 'lesson2-flat-medium',
        name: 'Les 2: Vlak & Gemiddeld',
        settings: {
            speed: 1.2,
            numMountains: 1,
            includePlateaus: false,
            numFingers: 2,
            colorTempo: 55, // 55 BPM
            fingerColors: ['#FF0000', '#0000FF']
        },
        pathType: 'flat'
    },
    {
        id: 'lesson3-flat-faster',
        name: 'Les 3: Vlak & Sneller',
        settings: {
            speed: 1.5,
            numMountains: 1,
            includePlateaus: false,
            numFingers: 3,
            colorTempo: 60, // 60 BPM
            fingerColors: ['#FF0000', '#0000FF', '#00FF00']
        },
        pathType: 'flat'
    },
    {
        id: 'lesson4-plateaus-complex',
        name: 'Les 4: Complexe Vlaktes',
        settings: {
            speed: 1.6,
            numMountains: 1,
            includePlateaus: true,
            numFingers: 3,
            colorTempo: 65, // 65 BPM
            fingerColors: ['#FF0000', '#0000FF', '#00FF00']
        },
        pathType: 'flat'
    }
];