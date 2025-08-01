// app/lessonManager.js

import { lessonConfigurations } from '../oefeningen/lessonData.js';
import { parentLessons } from '../oefeningen/parentLessons.js';

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
        lessonPathContainer,
        parentLessonButtons,
    } = domElements;

    const {
        initializeFlatPathCurves,
        generateMountainPath,
        startAnimationOrCountdown,
        ballColorModule
    } = coreAppFunctions;

    /**
     * Deze functie retourneert alle ids van de childLessons van deze parent.
     * @param {*} parentId 
     * @returns object containing childlesson subids
     */
    function loadChildLessons(parentId) {
        // Vind alle lessen waar de parent id gelijk is aan parentId;
        const parentLesson = lessonConfigurations.find(p => p.parentId === parentId);
        console.log(parentId);

        if (!parentLesson) {
            console.error('Exercise not found', parentId);
            return;
        }

        const childLessons = parentLesson.lessons;
        return childLessons;
    }

    /**
     * Genereert de knoppen voor de parent lessons.
     */
    function generateParentLessonButtons() {
        parentLessons.forEach((parent) => {
            const parentButton = document.createElement('button');
            parentButton.textContent = parent.name;
            parentButton.dataset.parentId = parent.id;
            parentButton.addEventListener('click', () => clearLessonPathContainer());
            parentButton.addEventListener('click', () => generateLessonButtonsAndLinks(parent.id));
            parentLessonButtons.appendChild(parentButton);
        });
    }

    /**
     * Clears the lessonPathContainer
     * @returns none
     */
    function clearLessonPathContainer() {
        // Verwijder alle child elementen van lessonPathContainer
        while (lessonPathContainer.firstChild) {
            lessonPathContainer.removeChild(lessonPathContainer.firstChild);
        }
        // Reset de innerHTML om te voorkomen dat oude data blijft hangen
        lessonPathContainer.innerHTML = "";
    }

    /**
     * Laadt de instellingen voor een specifieke les en start de animatie.
     * @param {object} lesson - De ID van de les die geladen moet worden.
     */
    function loadLesson(lesson) {
        // const lesson = lesson.find(l => l.subid === lessonId);
        if (!lesson) {
            console.error('Exercise not found', lesson);
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

    function generateLessonButtonsAndLinks(parentLessonId) {
        const childLessons = loadChildLessons(parentLessonId);
        console.log(parentLessonId);

        childLessons.forEach(lesson => {
            // Wrapper voor de button en de link
            const divWrapper = document.createElement('div');
            lessonPathContainer.appendChild(divWrapper);
            divWrapper.style = 'display: flex; flex-direction: row; width: 100%';

            // De button creëren en eventlisteners toevoegen
            const button = document.createElement('button');
            button.textContent = lesson.subid; // Gebruik subid als tekst
            button.dataset.lessonId = lesson.subid;
            button.addEventListener('click', () => loadLesson(lesson));
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

    // TODO: verplaatst deze naar de nodige plek.
    generateParentLessonButtons();
    
}
