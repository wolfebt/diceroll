document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const quickRollsContainer = document.getElementById('quickRollsContainer');
    const customRollForm = document.getElementById('customRollForm');
    const resultsDiv = document.getElementById('results');

    // --- Core Functions ---

    /**
     * Generates a random integer between 1 and the number of sides.
     * @param {number} sides - The number of sides on the die.
     * @returns {number} A random number representing the die roll.
     */
    const rollSingleDie = (sides) => {
        return Math.floor(Math.random() * sides) + 1;
    };

    /**
     * Creates a dice roll based on given parameters.
     * @param {number} numDice - The number of dice to roll.
     * @param {number} numSides - The number of sides on each die.
     * @param {number} modifier - The value to add to the total roll.
     */
    const createRoll = (numDice, numSides, modifier) => {
        if (numDice <= 0 || numSides <= 1) {
            displayResult({ error: "Please enter a valid number of dice and sides." });
            return;
        }

        const rolls = [];
        let total = 0;
        for (let i = 0; i < numDice; i++) {
            const roll = rollSingleDie(numSides);
            rolls.push(roll);
            total += roll;
        }
        total += modifier;
        
        displayResult({ numDice, numSides, modifier, rolls, total });
    };

    /**
     * Displays the formatted result in the results section.
     * @param {object} result - The result object from the roll.
     */
    const displayResult = (result) => {
        resultsDiv.innerHTML = ''; // Clear previous results

        if (result.error) {
            resultsDiv.innerHTML = `<p class="error">${result.error}</p>`;
            return;
        }

        const { numDice, numSides, modifier, rolls, total } = result;
        
        const description = `Rolling ${numDice}d${numSides}${modifier > 0 ? ` + ${modifier}` : ''}${modifier < 0 ? ` - ${Math.abs(modifier)}` : ''}`;
        
        const totalEl = document.createElement('p');
        totalEl.className = 'total';
        totalEl.textContent = `Total: ${total}`;

        const breakdownEl = document.createElement('p');
        breakdownEl.className = 'breakdown';
        breakdownEl.textContent = `${description} (${rolls.join(', ')})`;
        
        resultsDiv.appendChild(totalEl);
        resultsDiv.appendChild(breakdownEl);
    };


    // --- Event Listeners ---

    // Event Delegation for Quick Roll buttons
    quickRollsContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (target.matches('.dice-button')) {
            const sides = parseInt(target.dataset.sides, 10);
            createRoll(1, sides, 0);
        }
    });

    // Event listener for the Custom Roll form
    customRollForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form from reloading the page
        
        const numDice = parseInt(document.getElementById('numDice').value, 10);
        const numSides = parseInt(document.getElementById('numSides').value, 10);
        const modifier = parseInt(document.getElementById('modifier').value, 10);

        // Basic validation
        if (isNaN(numDice) || isNaN(numSides) || isNaN(modifier)) {
            displayResult({ error: "All inputs must be valid numbers." });
            return;
        }

        createRoll(numDice, numSides, modifier);
    });
});