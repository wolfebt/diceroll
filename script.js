document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const quickRollsContainer = document.getElementById('quickRollsContainer');
    const newRollCreatorForm = document.getElementById('newRollCreatorForm');
    const newRollExpressionInput = document.getElementById('newRollExpression');
    const customRollsList = document.getElementById('customRollsList');
    const executeRollButton = document.getElementById('executeRollButton');
    const resultsDiv = document.getElementById('results');

    // --- State Management ---
    let savedRolls = JSON.parse(localStorage.getItem('diceRoller-savedRolls')) || [];

    // --- Core Functions ---

    /**
     * Parses a dice expression string (e.g., "2d6+3", "d20-1", "3d8") into an object.
     * @param {string} expression - The dice string to parse.
     * @returns {object|null} An object with {numDice, numSides, modifier} or null if invalid.
     */
    const parseExpression = (expression) => {
        const pattern = /^(?:(\d+))?d(\d+)(?:([+-])(\d+))?$/i;
        const match = expression.replace(/\s+/g, '').match(pattern);

        if (!match) return null;

        const [, numDiceStr, numSidesStr, sign, modifierStr] = match;
        
        return {
            numDice: parseInt(numDiceStr || '1', 10),
            numSides: parseInt(numSidesStr, 10),
            modifier: (sign === '-' ? -1 : 1) * parseInt(modifierStr || '0', 10),
        };
    };

    /**
     * Generates a random integer between 1 and the number of sides.
     */
    const rollSingleDie = (sides) => Math.floor(Math.random() * sides) + 1;

    /**
     * Executes a roll based on parsed expression components.
     */
    const createRoll = (rollData, expression) => {
        const { numDice, numSides, modifier } = rollData;

        if (numDice <= 0 || numSides <= 1 || numDice > 100 || numSides > 1000) {
            displayResult({ error: "Invalid dice parameters. Check your expression." });
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
        
        displayResult({ expression, rolls, total });
    };

    /**
     * Displays the formatted result.
     */
    const displayResult = (result) => {
        resultsDiv.innerHTML = ''; // Clear previous results

        if (result.error) {
            resultsDiv.innerHTML = `<p class="error">${result.error}</p>`;
            return;
        }

        const { expression, rolls, total } = result;
        
        const totalEl = document.createElement('p');
        totalEl.className = 'total';
        totalEl.textContent = `Total: ${total}`;

        const breakdownEl = document.createElement('p');
        breakdownEl.className = 'breakdown';
        breakdownEl.textContent = `${expression} (${rolls.join(', ')})`;
        
        resultsDiv.appendChild(totalEl);
        resultsDiv.appendChild(breakdownEl);
    };

    // --- Local Storage and UI Rendering ---

    /**
     * Saves the current `savedRolls` array to Local Storage.
     */
    const saveRollsToStorage = () => {
        localStorage.setItem('diceRoller-savedRolls', JSON.stringify(savedRolls));
    };

    /**
     * Renders the list of saved rolls as radio buttons in the UI.
     */
    const renderCustomRolls = () => {
        customRollsList.innerHTML = ''; // Clear existing list
        if (savedRolls.length === 0) {
            customRollsList.innerHTML = '<p>No custom rolls saved yet.</p>';
            executeRollButton.disabled = true;
            return;
        }
        
        savedRolls.forEach((expression, index) => {
            const id = `custom-roll-${index}`;
            const item = document.createElement('div');
            item.className = 'custom-roll-item';
            item.innerHTML = `
                <input type="radio" id="${id}" name="custom-roll-selection" value="${expression}">
                <label for="${id}">${expression}</label>
                <button class="delete-roll-button" data-index="${index}" aria-label="Delete roll ${expression}">&times;</button>
            `;
            customRollsList.appendChild(item);
        });
        
        // Auto-select the first roll in the list if it exists
        const firstRadio = customRollsList.querySelector('input[type="radio"]');
        if (firstRadio) {
            firstRadio.checked = true;
        }
        executeRollButton.disabled = false;
    };

    // --- Event Handlers ---

    const handleQuickRoll = (event) => {
        const target = event.target;
        if (target.matches('.dice-button')) {
            const sides = parseInt(target.dataset.sides, 10);
            createRoll({ numDice: 1, numSides: sides, modifier: 0 }, `1d${sides}`);
        }
    };

    const handleSaveNewRoll = (event) => {
        event.preventDefault();
        const expression = newRollExpressionInput.value.trim();
        if (!expression) return;
        
        if (parseExpression(expression)) {
            if (!savedRolls.includes(expression)) {
                savedRolls.push(expression);
                saveRollsToStorage();
                renderCustomRolls();
                newRollExpressionInput.value = ''; // Clear input
            } else {
                alert('This expression is already saved.');
            }
        } else {
            alert('Invalid dice expression format. Use "XdY+Z", e.g., "2d6+3".');
        }
    };

    const handleDeleteRoll = (event) => {
        if (event.target.matches('.delete-roll-button')) {
            const indexToDelete = parseInt(event.target.dataset.index, 10);
            savedRolls.splice(indexToDelete, 1);
            saveRollsToStorage();
            renderCustomRolls();
        }
    };
    
    const handleExecuteRoll = () => {
        const selectedRadio = customRollsList.querySelector('input[name="custom-roll-selection"]:checked');
        if (selectedRadio) {
            const expression = selectedRadio.value;
            const rollData = parseExpression(expression);
            if (rollData) {
                createRoll(rollData, expression);
            }
        } else {
            alert('Please select a roll from your list first.');
        }
    };

    // --- Initial Setup ---
    quickRollsContainer.addEventListener('click', handleQuickRoll);
    newRollCreatorForm.addEventListener('submit', handleSaveNewRoll);
    customRollsList.addEventListener('click', handleDeleteRoll);
    executeRollButton.addEventListener('click', handleExecuteRoll);

    renderCustomRolls(); // Initial render on page load
});