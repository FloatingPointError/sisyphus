// oefeningen/scripts/lessonExplanationLoader.js

// Importeer de lesconfiguraties
import { lessonConfigurations } from '../oefeningen/lessonData.js';
// Importeer de animatie-effecten voor de kleine ballen
import { animateBalls, stopAnimatingBalls } from '../modules/ballAnimationEffects.js';
// NIEUW: Importeer de laadindicator module
import { initializeLoadingIndicator, showLoadingIndicator, hideLoadingIndicator } from '../modules/loadingIndicator.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get('lessonId');
    const dynamicLessonContentDiv = document.getElementById('dynamicLessonContent');

    // NIEUW: Initialiseer de laadindicator met de ID van het element
    initializeLoadingIndicator('#loadingIndicator');

    if (lessonId) {
        let foundLesson = null;
        // Loop door de parent lessen om de specifieke les te vinden
        for (const parentConfig of lessonConfigurations) {
            foundLesson = parentConfig.lessons.find(l => l.id === lessonId);
            if (foundLesson) {
                break; // Les gevonden, stop met zoeken
            }
        }

        if (foundLesson && foundLesson.contentPath) {
            // NIEUW: Toon laadindicator voordat de fetch begint
            showLoadingIndicator();
            dynamicLessonContentDiv.innerHTML = ''; // Leeg de content terwijl we laden

            try {
                const response = await fetch(foundLesson.contentPath);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const contentHtml = await response.text();
                dynamicLessonContentDiv.innerHTML = contentHtml;

                // --- AANGEPASTE LOGICA VOOR SCROLLEN NAAR ANKER ---
                const hash = window.location.hash;
                if (hash) {
                    const targetId = hash.substring(1); // Verwijdert de '#'

                    // Voeg een kleine vertraging toe om de DOM te laten renderen
                    setTimeout(() => {
                        const targetElement = dynamicLessonContentDiv.querySelector(`#${targetId}`);
                        if (targetElement) {
                            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } else {
                            console.warn(`Target element with ID "${targetId}" not found in loaded content.`);
                        }
                    }, 100); // 100ms vertraging
                }
                // --- EINDE AANGEPASTE LOGICA ---

                // Nadat de content is geladen, initialiseer de IntersectionObserver voor de ballen
                const sectionsWithBalls = dynamicLessonContentDiv.querySelectorAll('section h2 .finger-balls');
                
                const observerOptions = {
                    root: null, // De viewport
                    rootMargin: '0px',
                    threshold: 0.5 // Trigger wanneer 50% van het element zichtbaar is
                };

                const observer = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        const ballsDiv = entry.target;
                        if (entry.isIntersecting) {
                            ballsDiv.classList.add('is-in-view');
                            animateBalls(ballsDiv); // Start animatie
                        } else {
                            ballsDiv.classList.remove('is-in-view');
                            stopAnimatingBalls(ballsDiv); // Stop animatie
                        }
                    });
                }, observerOptions);

                sectionsWithBalls.forEach(ballsDiv => {
                    observer.observe(ballsDiv);
                });

            } catch (error) {
                console.error('Fout bij het laden van lesinhoud:', error);
                dynamicLessonContentDiv.innerHTML = `<p>Fout bij het laden van de lesinhoud voor ID: ${lessonId}.</p>`;
            } finally {
                // NIEUW: Verberg laadindicator nadat de fetch is voltooid (succes of fout)
                hideLoadingIndicator();
            }
        } else {
            dynamicLessonContentDiv.innerHTML = `<p>Les met ID "${lessonId}" niet gevonden of geen inhoudspad gedefinieerd.</p>`;
        }
    } else {
        dynamicLessonContentDiv.innerHTML = `<p>Geen les-ID opgegeven in de URL.</p>`;
    }
});
