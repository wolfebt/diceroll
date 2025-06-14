document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const quickRollsContainer = document.getElementById('quickRollsContainer');
    const addNewRollBtn = document.getElementById('addNewRollBtn');
    const customRollsContainer = document.getElementById('customRollsContainer');
    const executeRollBtn = document.getElementById('executeRollBtn');
    const resultsDiv = document.getElementById('results');

    // --- State Management ---
    let savedRolls = JSON.parse(localStorage.getItem('diceRoller-savedRollsV2')) || ['2d6+3', '1d20-1'];
    let selectedRoll = null;

    // --- Core Functions ---
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

    const rollSingleDie = (sides) => Math.floor(Math.random() * sides) + 1;

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

    const displayResult = (result) => {
        resultsDiv.innerHTML = '';
        if (result.error) {
            resultsDiv.innerHTML = `<p class="error">${result.error}</p>`;
            return;
        }
        const { expression, rolls, total } = result;
        resultsDiv.innerHTML = `
            <p class="total">Total: ${total}</p>
            <p class="breakdown">${expression} (${rolls.join(', ')})</p>`;
    };

    // --- Local Storage and UI Rendering ---
    const saveRollsToStorage = () => {
        localStorage.setItem('diceRoller-savedRollsV2', JSON.stringify(savedRolls));
    };

    const renderCustomRolls = () => {
        customRollsContainer.innerHTML = '';
        savedRolls.forEach((expression, index) => {
            const buttonHtml = `
                <div class="custom-roll-wrapper">
                    <button type="button" class="custom-roll-btn" data-index="${index}" contenteditable="false">${expression}</button>
                    <button class="delete-custom-roll-btn" data-index="${index}" aria-label="Delete roll ${expression}">&times;</button>
                </div>`;
            customRollsContainer.insertAdjacentHTML('beforeend', buttonHtml);
        });
        updateSelectionState();
    };

    const updateSelectionState = () => {
        const buttons = customRollsContainer.querySelectorAll('.custom-roll-btn');
        let hasSelection = false;
        buttons.forEach(btn => {
            const index = parseInt(btn.dataset.index, 10);
            if (selectedRoll !== null && selectedRoll.index === index) {
                btn.classList.add('selected');
                executeRollBtn.disabled = false;
                executeRollBtn.textContent = `Roll ${selectedRoll.expression}`;
                hasSelection = true;
            } else {
                btn.classList.remove('selected');
            }
        });

        if (!hasSelection) {
            selectedRoll = null;
            executeRollBtn.disabled = true;
            executeRollBtn.textContent = 'Select a Roll';
        }
    };

    const finishEditing = (button, index) => {
        button.contentEditable = 'false';
        button.classList.remove('editing');
        const newExpression = button.textContent.trim();
        
        if (parseExpression(newExpression)) {
            savedRolls[index] = newExpression;
            saveRollsToStorage();
            if(selectedRoll && selectedRoll.index === index) {
                selectedRoll.expression = newExpression;
            }
            updateSelectionState();
        } else {
            alert(`"${newExpression}" is not a valid roll. Reverting.`);
            button.textContent = savedRolls[index];
        }
    };
    
    // --- Event Handlers ---
    addNewRollBtn.addEventListener('click', () => {
        const newRollExpression = '1d6';
        savedRolls.push(newRollExpression);
        saveRollsToStorage();
        renderCustomRolls();

        const newButtonIndex = savedRolls.length - 1;
        const newButton = customRollsContainer.querySelector(`.custom-roll-btn[data-index="${newButtonIndex}"]`);
        
        // Enter edit mode for the new button immediately
        newButton.classList.add('editing');
        newButton.contentEditable = 'true';
        newButton.focus();

        // *** THIS IS THE FIX ***
        // Use the modern Selection API instead of the deprecated execCommand
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(newButton);
        selection.removeAllRanges(); // Clear any existing selections
        selection.addRange(range);   // Add the new range
    });

    customRollsContainer.addEventListener('click', (e) => {
        if (e.target.matches('.delete-custom-roll-btn')) {
            const indexToDelete = parseInt(e.target.dataset.index, 10);
            savedRolls.splice(indexToDelete, 1);
            saveRollsToStorage();
            if (selectedRoll && selectedRoll.index === indexToDelete) {
                selectedRoll = null;
            }
            renderCustomRolls();
            return;
        }

        if (e.target.matches('.custom-roll-btn')) {
            const button = e.target;
            const index = parseInt(button.dataset.index, 10);
            selectedRoll = { index, expression: savedRolls[index] };
            updateSelectionState();
        }
    });

    customRollsContainer.addEventListener('dblclick', (e) => {
        if (e.target.matches('.custom-roll-btn')) {
            const button = e.target;
            button.classList.add('editing');
            button.contentEditable = 'true';
            button.focus();
        }
    });

    customRollsContainer.addEventListener('keydown', (e) => {
        if (e.target.matches('.custom-roll-btn') && e.key === 'Enter') {
            e.preventDefault();
            const button = e.target;
            const index = parseInt(button.dataset.index, 10);
            finishEditing(button, index);
        }
    });

    customRollsContainer.addEventListener('blur', (e) => {
        if (e.target.matches('.custom-roll-btn') && e.target.isContentEditable) {
            const button = e.target;
            const index = parseInt(button.dataset.index, 10);
            finishEditing(button, index);
        }
    }, true);

    executeRollBtn.addEventListener('click', () => {
        if (selectedRoll) {
            const rollData = parseExpression(selectedRoll.expression);
            if(rollData) {
                createRoll(rollData, selectedRoll.expression);
            }
        }
    });
    
    quickRollsContainer.addEventListener('click', (e) => {
        if (e.target.matches('.dice-button')) {
            const sides = parseInt(e.target.dataset.sides, 10);
            createRoll({ numDice: 1, numSides: sides, modifier: 0 }, `1d${sides}`);
        }
    });

    // --- Initial Setup ---
    renderCustomRolls();
});