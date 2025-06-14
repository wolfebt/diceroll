document.addEventListener('DOMContentLoaded', () => {
    // Get references to DOM elements
    const diceElement = document.getElementById('dice');
    const rollButton = document.getElementById('rollButton');
    const resultElement = document.getElementById('result');

    // Function to generate a random number between min and max (inclusive)
    const getRandomNumber = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // Function to update the dice face
    const updateDiceFace = (faceValue) => {
        diceElement.innerHTML = ''; // Clear previous dots
        diceElement.dataset.face = faceValue; // Set data attribute for CSS styling

        for (let i = 0; i < faceValue; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            diceElement.appendChild(dot);
        }
    };

    // Function to handle the dice roll
    const rollDice = () => {
        // 1. Add rolling animation
        diceElement.classList.add('rolling');
        rollButton.disabled = true; // Disable button during animation
        resultElement.textContent = 'Rolling...';

        // 2. Wait for the animation to finish
        setTimeout(() => {
            // 3. Get the random result
            const rollResult = getRandomNumber(1, 6);

            // 4. Update the UI
            updateDiceFace(rollResult);
            resultElement.textContent = `You rolled a ${rollResult}`;
            
            // 5. Remove the animation class and re-enable the button
            diceElement.classList.remove('rolling');
            rollButton.disabled = false;
        }, 700); // This duration should match the animation duration in CSS
    };

    // --- Event Listeners ---
    rollButton.addEventListener('click', rollDice);

    // --- Initial State ---
    // Set the initial state of the dice on page load
    updateDiceFace(6); 
    resultElement.textContent = 'Roll to see the result';
});