// modules/loadingIndicator.js

let loadingElement = null; // Referentie naar het laadindicator-element

/**
 * Initialiseert de laadindicator door een element te selecteren.
 * Deze functie moet worden aangeroepen wanneer de DOM geladen is.
 * @param {string} selector De CSS-selector voor het laadindicator-element (bijv. '#loadingIndicator').
 */
export function initializeLoadingIndicator(selector) {
    loadingElement = document.querySelector(selector);
    if (!loadingElement) {
        console.warn(`Loading indicator element with selector "${selector}" not found. Please ensure it exists in your HTML.`);
    }
}

/**
 * Toont de laadindicator.
 */
export function showLoadingIndicator() {
    if (loadingElement) {
        loadingElement.classList.remove('hidden');
    }
}

/**
 * Verbergt de laadindicator.
 */
export function hideLoadingIndicator() {
    if (loadingElement) {
        loadingElement.classList.add('hidden');
    }
}
