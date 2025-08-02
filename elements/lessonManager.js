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
        currentNumMountainsSpan,
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
        ballColorModule,
        state,
    } = coreAppFunctions;

    /**
     * Deze functie retourneert alle ids van de childLessons van deze parent.
     * @param {*} parentId 
     * @returns object containing childlesson subids
     */
    function loadChildLessons(parentId) {
        // Vind alle lessen waar de parent id gelijk is aan parentId;
        const parentLesson = lessonConfigurations.find(p => p.parentId === parentId);

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
     * @param {object} lesson - Het lesobject dat geladen moet worden.
     */
    function loadLesson(lesson) {
        if (!lesson) {
            console.error('Lesobject is ongeldig:', lesson);
            return;
        }

        // Pas UI-elementen aan
        speedSlider.value = lesson.settings.speed;
        currentSpeedSpan.textContent = lesson.settings.speed.toFixed(1) + 'x';
        // BELANGRIJK: Update ook de ballSpeed in de state van de hoofdapplicatie
        state.ballSpeed = lesson.settings.speed; // <-- DEZE REGEL IS NIEUW

        numMountainsSlider.value = lesson.settings.numMountains;
        currentNumMountainsSpan.textContent = lesson.settings.numMountains; // Zorg dat de span ook wordt bijgewerkt

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
                input.value = '#FFFFFF'; // Standaard wit als er geen kleur is opgegeven
            }
        });
        // Zorg ervoor dat de ballColorModule de nieuwe kleuren ook krijgt
        ballColorModule.updateFingerColors(lesson.settings.fingerColors);

        // Start de animatie met de les-specifieke paden
        let newPathData;
        if (lesson.pathType === 'flat') {
            // initializeFlatPathCurves() moet canvasWidth en canvasHeight krijgen
            newPathData = initializeFlatPathCurves(state.canvasWidth, state.canvasHeight); 
            state.flatPath = newPathData; // Update flatPath in state
        } else {
            // generateMountainPath moet canvasWidth en canvasHeight krijgen
            newPathData = generateMountainPath(lesson.settings.numMountains, lesson.settings.includePlateaus, state.canvasWidth, state.canvasHeight);
        }
        state.currentPathData = newPathData; // Update currentPathData in state
        startAnimationOrCountdown(newPathData);
        // Focus op canvas na het starten van de les
        focusOnCanvas();
    }

    // Centreer naar animationCanvas
    function focusOnCanvas() {
        domElements.canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function generateLessonButtonsAndLinks(parentLessonId) {
        const childLessons = loadChildLessons(parentLessonId);

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
            link.href = `oefeningen/${lesson.id}.html#${lesson.subid.replace(/\s+/g, '-')}`; // Link naar de les pagina met anker
            link.textContent = 'Read instructions'; // Aangepaste tekst voor de link
            link.target = '_a'; // Open in een nieuw tabblad
            link.classList.add('lesson-explanation-link'); // Zorg dat de CSS klasse wordt toegepast
            divWrapper.appendChild(link);
        });
    }

    // TODO: verplaatst deze naar de nodige plek.
    generateParentLessonButtons();
    
}
