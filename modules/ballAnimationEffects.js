// scripts/ballAnimationEffects.js

// Import the ballColorModule to reuse its pulsing logic
import { ballColorModule } from '../elements/ballColorModule.js'; 

// Constants for ball animation
const MOVEMENT_RANGE = 900; // Max pixels to move in any direction (X or Y) from its origin
const SEGMENT_DURATION = 12500; // Milliseconds for each movement segment (e.g., 2.5 seconds)
const PULSE_MAGNITUDE = 0.3; // How much the ball scales up during its pulse (e.g., 30% larger)
const DEFAULT_PULSE_BPM = 40; // Default BPM for the small ball pulse

// Constants for shadow effect
const MAX_SHADOW_BLUR = 10; // Max blur of the shadow in pixels
const MAX_SHADOW_OFFSET_Y = 8; // Max vertical offset of the shadow in pixels
const SHADOW_COLOR = 'rgba(0, 0, 0, 0.4)'; // Color of the shadow with some transparency

// Store animation frame IDs for each ball container to stop them independently
const animationFrames = new Map(); // Maps ballsDiv element to its animationFrameId

// Function to generate random offsets for movement within a given range
function getRandomOffset(range) {
    return (Math.random() - 0.5) * 2 * range; // Generates a value from -range to +range
}

// Easing function for a slow start and slow end (ease-in-out quadratic)
// This makes the movement of each segment start slow, accelerate, and then decelerate.
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Function to animate a single set of balls within a .finger-balls container.
 * @param {HTMLElement} ballsDiv The container element holding the finger balls.
 */
export function animateBalls(ballsDiv) { // EXPORTED
    const balls = ballsDiv.querySelectorAll('.finger-ball');
    
    // Initialize or retrieve ball states if they don't exist for this ballsDiv
    if (!ballsDiv._ballStates) {
        ballsDiv._ballStates = Array.from(balls).map(() => ({
            startX: 0, // Starting X position for the current segment
            startY: 0, // Starting Y position for the current segment
            targetX: getRandomOffset(MOVEMENT_RANGE), // Target X for the current segment
            targetY: getRandomOffset(MOVEMENT_RANGE), // Target Y for the current segment
            // Stagger the initial start time slightly for each ball for more randomness
            startTime: performance.now() + Math.random() * 500,
            // Initial random phase offset for pulsing to avoid perfect sync
            pulsePhaseOffset: Math.random() * Math.PI * 2 
        }));
    }

    const ballStates = ballsDiv._ballStates;

    // Get the current beat interval from the ballColorModule for pulsing
    // We'll use a default if the module isn't initialized or has a 0 BPM
    const pulseBeatIntervalMs = ballColorModule.getCurrentBeatIntervalMs() || (60000 / DEFAULT_PULSE_BPM);

    // The main animation loop for the balls within this container
    function updateBallPositions(currentTime) {
        balls.forEach((ball, index) => {
            const state = ballStates[index];

            // If the ball's segment hasn't started yet (due to initial stagger),
            // ensure it stays at its start position and apply initial pulse scale.
            if (currentTime < state.startTime) {
                const pulseTime = (currentTime + state.pulsePhaseOffset * (pulseBeatIntervalMs / (Math.PI * 2))) % pulseBeatIntervalMs;
                const pulseProgress = (Math.sin((pulseTime / pulseBeatIntervalMs) * Math.PI * 2) + 1) / 2;
                const scale = 1 + (PULSE_MAGNITUDE * pulseProgress);
                
                // Calculate shadow properties based on pulseProgress
                const shadowProgress = pulseProgress; // 0 when smallest, 1 when largest
                const shadowBlur = shadowProgress * MAX_SHADOW_BLUR;
                const shadowOffsetY = shadowProgress * MAX_SHADOW_OFFSET_Y;

                ball.style.transform = `translate(${state.startX}px, ${state.startY}px) scale(${scale})`;
                ball.style.boxShadow = `0 ${shadowOffsetY}px ${shadowBlur}px ${SHADOW_COLOR}`;
                return;
            }

            // Calculate progress through the current movement segment (0 to 1)
            let progress = (currentTime - state.startTime) / SEGMENT_DURATION;

            // If the current movement segment is finished (progress >= 1)
            if (progress >= 1) {
                // Update start positions to the previous target positions
                state.startX = state.targetX;
                state.startY = state.targetY;
                // Generate new random target positions for the next segment
                state.targetX = getRandomOffset(MOVEMENT_RANGE);
                state.targetY = getRandomOffset(MOVEMENT_RANGE);
                // Reset the start time for the new segment
                state.startTime = currentTime;
                progress = 0; // Reset progress for the new segment
            }

            // Apply the easing function to the movement progress for slow start/end
            const easedProgress = easeInOutQuad(progress);

            // Calculate the current position based on eased progress
            const currentX = state.startX + (state.targetX - state.startX) * easedProgress;
            const currentY = state.startY + (state.targetY - state.startY) * easedProgress;

            // Calculate pulse scale
            // Ensure pulseTime accounts for the individual ball's phase offset
            const pulseTime = (currentTime + state.pulsePhaseOffset * (pulseBeatIntervalMs / (Math.PI * 2))) % pulseBeatIntervalMs;
            const pulseProgress = (Math.sin((pulseTime / pulseBeatIntervalMs) * Math.PI * 2) + 1) / 2; 
            const scale = 1 + (PULSE_MAGNITUDE * pulseProgress); 

            // Calculate shadow properties based on pulseProgress
            const shadowProgress = pulseProgress; // This value is 0 when ball is smallest, 1 when largest
            const shadowBlur = shadowProgress * MAX_SHADOW_BLUR;
            const shadowOffsetY = shadowProgress * MAX_SHADOW_OFFSET_Y;

            // Apply both translate (movement) and scale (pulse) transforms
            ball.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
            // Apply dynamic box-shadow
            ball.style.boxShadow = `0 ${shadowOffsetY}px ${shadowBlur}px ${SHADOW_COLOR}`;
        });

        // Continue the animation loop as long as the parent section is in view
        if (ballsDiv.classList.contains('is-in-view')) {
            animationFrames.set(ballsDiv, requestAnimationFrame(updateBallPositions));
        }
    }

    // Start the animation loop for this set of balls
    animationFrames.set(ballsDiv, requestAnimationFrame(updateBallPositions));
}

/**
 * Function to stop animating a single set of balls.
 * @param {HTMLElement} ballsDiv The container element holding the finger balls.
 */
export function stopAnimatingBalls(ballsDiv) { // EXPORTED
    if (animationFrames.has(ballsDiv)) {
        // Cancel the ongoing animation frame
        cancelAnimationFrame(animationFrames.get(ballsDiv));
        // Remove the animation frame ID from the map
        animationFrames.delete(ballsDiv);
        // Reset ball positions, scale, and shadow to their origin when stopping
        ballsDiv.querySelectorAll('.finger-ball').forEach(ball => {
            ball.style.transform = `translate(0, 0) scale(1)`; // Reset scale to 1
            ball.style.boxShadow = 'none'; // Remove shadow
        });
        // Clear stored states to ensure a fresh start next time
        ballsDiv._ballStates = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sectionsWithBalls = document.querySelectorAll('section h2 .finger-balls');

    // Options for the Intersection Observer
    const observerOptions = {
        root: null, // The viewport is the root element
        rootMargin: '0px', // No margin around the root
        threshold: 0.5 // Trigger when 50% of the target element is visible
    };

    // Create a new Intersection Observer instance
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            const ballsDiv = entry.target; // The .finger-balls div being observed
            if (entry.isIntersecting) {
                // When the element enters the viewport
                ballsDiv.classList.add('is-in-view'); // Add class to indicate it's in view
                animateBalls(ballsDiv); // Start animating the balls
            } else {
                // When the element leaves the viewport
                ballsDiv.classList.remove('is-in-view'); // Remove class
                stopAnimatingBalls(ballsDiv); // Stop animating the balls
            }
        });
    }, observerOptions);

    // Observe each .finger-balls element found on the page
    sectionsWithBalls.forEach(ballsDiv => {
        observer.observe(ballsDiv);
    });
});
