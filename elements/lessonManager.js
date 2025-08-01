// app/lessonManager.js

import { lessonConfigurations } from './lessonData.js';

/**
 * Initialiseert de leerpad functionaliteit.
 * Genereert de lesknoppen en beheert het laden van lesinstellingen.
 * @param {object} domElements - Een object met verwijzingen naar DOM-elementen.
 * @param {object} coreAppFunctions - Een object met kernfuncties uit app.js die nodig zijn.
 * @param {function} coreAppFunctions.initializeFlatPathCurves - Functie om het vlakke pad te initialiseren.
 * @param {function} coreAppFunctions.generateMountainPath - Functie om een bergpad te genereren.
 * @param {function} coreAppFunctions.startAnimationOrCountdown - Functie om de animatie te starten/countdown.
 * @param {object} coreAppFunctions.ballColorModule - De ballColorModule om kleuren en tempo bij te werken.
 */
export function initLessonManager(domElements, coreAppFunctions) {
    const {
        speedSlider,
        currentSpeedSpan,
        numMountainsSlider,
        includePlateausCheckbox,
        numFingersSlider,
        currentNumFingersSpan,
        fingerColorInputs,
        colorTempoSlider,
        currentColorTempoSpan,
        lessonPathContainer
    } = domElements;

    const {
        initializeFlatPathCurves,
        generateMountainPath,
        startAnimationOrCountdown,
        ballColorModule
    } = coreAppFunctions;

    /**
     * Laadt de instellingen voor een specifieke les en start de animatie.
     * @param {string} lessonId - De ID van de les die geladen moet worden.
     */
    function loadLesson(lessonId) {
        const lesson = lessonConfigurations.find(l => l.subid === lessonId);
        if (!lesson) {
            console.error('Les niet gevonden:', lessonId);
            return;
        }

        // Pas UI-elementen aan
        speedSlider.value = lesson.settings.speed;
        currentSpeedSpan.textContent = lesson.settings.speed.toFixed(1) + 'x';

        numMountainsSlider.value = lesson.settings.numMountains;

        includePlateausCheckbox.checked = lesson.settings.includePlateaus;

        numFingersSlider.value = lesson.settings.numFingers;
        currentNumFingersSpan.textContent = lesson.settings.numFingers;

        colorTempoSlider.value = lesson.settings.colorTempo;
        currentColorTempoSpan.textContent = lesson.settings.colorTempo + ' BPM';

        // Pas vingerkleuren aan
        fingerColorInputs.forEach((input, index) => {
            if (lesson.settings.fingerColors[index]) {
                input.value = lesson.settings.fingerColors[index];
            } else {
                input.value = '#000000'; // Standaard zwart als er geen kleur is opgegeven
            }
        });
        // Zorg ervoor dat de ballColorModule de nieuwe kleuren ook krijgt
        ballColorModule.updateFingerColors(lesson.settings.fingerColors);


        // Start de animatie met de les-specifieke paden
        let newPathData;
        if (lesson.pathType === 'flat') {
            initializeFlatPathCurves();
            newPathData = coreAppFunctions.flatPath; // Gebruik de flatPath van coreAppFunctions
        } else {
            newPathData = generateMountainPath(lesson.settings.numMountains, lesson.settings.includePlateaus);
        }
        startAnimationOrCountdown(newPathData);
    }

    // Centreer naar animationCanvas
    function focusOnCanvas() {
        domElements.canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Genereer leerpad knoppen
    lessonConfigurations.forEach(lesson => {
        // Wrapper voor de button en de link
        const divWrapper = document.createElement('div');
        lessonPathContainer.appendChild(divWrapper);
        divWrapper.style = 'display: flex; flex-direction: row; width: 100%';

        // De button creëren en eventlisteners toevoegen
        const button = document.createElement('button');
        button.textContent = lesson.subid; // Gebruik subid als tekst
        button.dataset.lessonId = lesson.subid;
        button.addEventListener('click', () => loadLesson(lesson.subid));
        button.addEventListener('click', focusOnCanvas);
        divWrapper.appendChild(button);



        // De link creëren en eventlisteners toevoegen
        const link = document.createElement('a');
        link.href = `oefeningen/${lesson.id}.html`; // Verwijst naar de les pagina
        link.textContent = lesson.name;
        link.target = '_a'; // Open in een nieuw tabblad (maar steeds dezelfde tab)
        divWrapper.appendChild(link);
    });
}
