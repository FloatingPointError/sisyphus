// app/elements/lessonManager.js

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
 * @param {object} coreAppFunctions.state - Het globale state object van de app.
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
        ballColorModule,
        state // Het globale state object is nodig voor canvasWidth/Height
    } = coreAppFunctions;

    /**
     * Deze functie retourneert alle ids van de childLessons van deze parent.
     * @param {*} parentId 
     * @returns object containing childlesson subids
     */
    function loadChildLessons(parentId) {
        // Vind de parent configuratie op basis van parentId
        const parentConfig = lessonConfigurations.find(p => p.parentId === parentId);

        if (!parentConfig) {
            console.error('Parent lesson configuration not found for ID:', parentId);
            return []; // Retourneer een lege array als de parent niet wordt gevonden
        }

        return parentConfig.lessons;
    }

    /**
     * Genereert de knoppen voor de parent lessons.
     */
    function generateParentLessonButtons() {
        parentLessons.forEach((parent) => {
            const parentButton = document.createElement('button');
            parentButton.textContent = parent.name;
            parentButton.dataset.parentId = parent.id;
            // Eerst leegmaken met transitie, dan genereren
            parentButton.addEventListener('click', () => {
                clearLessonPathContainer();
                // Geef een kleine vertraging zodat de 'clear' transitie kan starten
                setTimeout(() => {
                    generateLessonButtonsAndLinks(parent.id);
                }, 500); // Wacht tot de verdwijn-transitie is voltooid (0.5s)
            });
            parentLessonButtons.appendChild(parentButton);
        });
    }

    /**
     * Clears the lessonPathContainer with a smooth transition.
     * @returns none
     */
    function clearLessonPathContainer() {
        // Verwijder eerst de initiële paragraaf als deze bestaat
        const initialParagraph = lessonPathContainer.querySelector('p');
        if (initialParagraph) {
            initialParagraph.remove();
        }

        // Voeg een klasse toe om de overgang te starten voordat elementen worden verwijderd
        Array.from(lessonPathContainer.children).forEach(child => {
            // Zorg ervoor dat we alleen elementen met de 'lesson-entry' klasse animeren
            if (child.classList.contains('lesson-entry')) {
                child.classList.add('lesson-entry--initial'); // Voeg de klasse toe om te verbergen
                // Verwijder het element na de transitie
                child.addEventListener('transitionend', () => child.remove(), { once: true });
            } else {
                // Verwijder direct elementen die geen overgang nodig hebben (zoals de h2 titel als die er zou zijn)
                child.remove();
            }
        });
    }

    /**
     * Laadt de instellingen voor een specifieke les en start de animatie.
     * @param {object} lesson - De les object die geladen moet worden.
     */
    function loadLesson(lesson) {
        if (!lesson) {
            console.error('Exercise not found', lesson);
            return;
        }

        // Pas UI-elementen aan
        speedSlider.value = lesson.settings.speed;
        state.ballSpeed = lesson.settings.speed;
        currentSpeedSpan.textContent = lesson.settings.speed.toFixed(1) + 'x';

        numMountainsSlider.value = lesson.settings.numMountains;

        // Dit is een boolean, direct toewijzen
        includePlateausCheckbox.checked = lesson.settings.includePlateaus;

        numFingersSlider.value = lesson.settings.numFingers;
        currentNumFingersSpan.textContent = lesson.settings.numFingers;

        colorTempoSlider.value = lesson.settings.colorTempo;
        currentColorTempoSpan.textContent = lesson.settings.colorTempo + ' BPM';

        // Pas vingerkleuren aan
        fingerColorInputs.forEach((input, index) => {
            if (lesson.settings.fingerColors && lesson.settings.fingerColors[index]) {
                input.value = lesson.settings.fingerColors[index];
            } else {
                input.value = '#FFFFFF'; // Standaard zwart als er geen kleur is opgegeven
            }
        });
        // Zorg ervoor dat de ballColorModule de nieuwe kleuren ook krijgt
        ballColorModule.updateFingerColors(lesson.settings.fingerColors);


        // Start de animatie met de les-specifieke paden
        let newPathData;
        if (lesson.pathType === 'flat') {
            initializeFlatPathCurves(state.canvasWidth, state.canvasHeight); // Pass canvas dimensions
            newPathData = state.flatPath; // Gebruik de flatPath van state
        } else {
            newPathData = generateMountainPath(lesson.settings.numMountains, lesson.settings.includePlateaus, state.canvasWidth, state.canvasHeight); // Pass canvas dimensions
        }
        state.currentPathData = newPathData; // Update currentPathData in state

        startAnimationOrCountdown(state, coreAppFunctions, newPathData); // Pass state and functions
    }

    // Centreer naar animationCanvas
    function focusOnCanvas() {
        domElements.canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * Genereert de lesknoppen en links voor een specifieke parent.
     * @param {string} parentLessonId - De ID van de parent les.
     */
    function generateLessonButtonsAndLinks(parentLessonId) {
        const childLessons = loadChildLessons(parentLessonId);

        childLessons.forEach((lesson, index) => {
            // Wrapper voor de button en de link
            const divWrapper = document.createElement('div');
            divWrapper.classList.add('lesson-entry');
            divWrapper.classList.add('lesson-entry--initial'); // Voeg initieel verborgen klasse toe
            
            // De button creëren en eventlisteners toevoegen
            const button = document.createElement('button');
            button.textContent = lesson.subid; // Gebruik subid als tekst
            button.dataset.lessonId = lesson.subid;
            button.addEventListener('click', () => loadLesson(lesson));
            button.addEventListener('click', focusOnCanvas);
            divWrapper.appendChild(button);

            // De link creëren en eventlisteners toevoegen
            const link = document.createElement('a');
            // AANGEPAST: Link naar de generieke uitlegpagina met lessonId als query parameter
            link.href = `oefeningen/lesson_explanation.html?lessonId=${lesson.id}#${lesson.subid.replace(/\s+/g, '-')}`; 
            link.textContent = 'Read instructions'; // Aangepaste tekst voor de link
            link.target = '_blank'; // Open in een nieuw tabblad
            link.classList.add('lesson-explanation-link'); // Zorg dat de CSS klasse wordt toegepast
            divWrapper.appendChild(link);

            lessonPathContainer.appendChild(divWrapper);

            // Trigger de transitie na een kleine vertraging
            setTimeout(() => {
                divWrapper.classList.remove('lesson-entry--initial');
            }, 50 + (index * 70)); // Staggered effect: 50ms basis + 70ms per item
        });
    }

    // Genereer de parent lesson knoppen bij initialisatie
    generateParentLessonButtons();
    
}
