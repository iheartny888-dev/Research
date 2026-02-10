/**
 * MAIN SURVEY APPLICATION
 * Handles survey flow, rule application, randomization, and data collection
 */

// Global state
const surveyState = {
    participant: {
        name: '',
        timestamp: '',
        sessionId: ''
    },
    currentQuestion: 0,
    totalQuestions: 25,
    responses: [],
    texts: [],
    trials: [],
    selectedText: null,
    selectedConfidence: null,
    rulesApplied: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadTexts();
});

/**
 * Set up all event listeners
 */
function initializeEventListeners() {
    // Consent screen
    document.getElementById('startSurveyBtn').addEventListener('click', validateAndStartSurvey);
    
    // Survey screen
    document.getElementById('selectLeft').addEventListener('click', () => selectText('left'));
    document.getElementById('selectRight').addEventListener('click', () => selectText('right'));
    
    // Likert scale buttons
    document.querySelectorAll('.scale-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            selectConfidence(this.dataset.value);
        });
    });
    
    // Next button
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    
    // Restart button
    document.getElementById('restartBtn').addEventListener('click', restartSurvey);
    document.getElementById('errorRetryBtn').addEventListener('click', retryLoad);
}

/**
 * Load texts from texts.txt file
 */
function loadTexts() {
    fetch('texts.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load texts.txt. Please ensure the file exists in the public folder.');
            }
            return response.text();
        })
        .then(data => {
            surveyState.texts = data.split('\n').filter(line => line.trim().length > 0);
            if (surveyState.texts.length === 0) {
                showError('No texts found in texts.txt file. Please add at least one text per line.');
                return;
            }
            console.log(`Loaded ${surveyState.texts.length} texts for the survey`);
        })
        .catch(error => {
            console.error('Error loading texts:', error);
            showError(`Error loading texts: ${error.message}`);
        });
}

/**
 * Retry loading texts
 */
function retryLoad() {
    loadTexts();
    if (surveyState.texts.length > 0) {
        showScreen('consentScreen');
    }
}

/**
 * Validate consent form and start survey
 */
function validateAndStartSurvey() {
    const name = document.getElementById('participantName').value.trim();
    const englishAbility = document.getElementById('englishAbility').checked;
    const consent = document.getElementById('consentCheckbox').checked;
    
    // Validation
    if (!name) {
        alert('Please enter your name.');
        return;
    }
    
    if (!englishAbility) {
        alert('Please confirm that you can speak English fluently.');
        return;
    }
    
    if (!consent) {
        alert('Please consent to participate in this study.');
        return;
    }
    
    // Check if texts were loaded
    if (surveyState.texts.length === 0) {
        alert('Error: Survey texts could not be loaded. Please refresh the page.');
        return;
    }
    
    // Store participant info
    surveyState.participant.name = name;
    surveyState.participant.timestamp = new Date().toISOString();
    surveyState.participant.sessionId = generateSessionId();
    
    // Generate trials
    generateTrials();
    
    // Start survey
    showScreen('surveyScreen');
    displayQuestion(0);
}

/**
 * Generate 25 trials with random text selections and rule applications
 * CONSTRAINT: Both texts always use rules, but DIFFERENT rules
 * NO unaltered versions are used
 */
function generateTrials() {
    surveyState.trials = [];
    const ruleNames = getRuleNames();
    
    for (let i = 0; i < surveyState.totalQuestions; i++) {
        // Randomly select a text
        const textIndex = Math.floor(Math.random() * surveyState.texts.length);
        const baseText = surveyState.texts[textIndex];
        
        // Select first rule for left side
        const leftRuleIndex = Math.floor(Math.random() * ruleNames.length);
        const leftRule = ruleNames[leftRuleIndex];
        
        // Select second rule for right side (must be different from left)
        let rightRuleIndex;
        do {
            rightRuleIndex = Math.floor(Math.random() * ruleNames.length);
        } while (rightRuleIndex === leftRuleIndex);
        const rightRule = ruleNames[rightRuleIndex];
        
        // Apply both rules - NO unaltered versions
        const leftText = applyRule(baseText, leftRule);
        const rightText = applyRule(baseText, rightRule);
        
        surveyState.trials.push({
            questionNumber: i + 1,
            baseText: baseText,
            textIndex: textIndex,
            leftText: leftText,
            rightText: rightText,
            leftRule: leftRule,
            rightRule: rightRule,
            selectedText: null,
            confidence: null,
            rationale: ''
        });
    }
    
    console.log('Generated 25 trials - both versions modified with different rules');
}

/**
 * Display a question/trial
 */
function displayQuestion(questionIndex) {
    if (questionIndex >= surveyState.totalQuestions) {
        completeSurvey();
        return;
    }
    
    surveyState.currentQuestion = questionIndex;
    const trial = surveyState.trials[questionIndex];
    
    // Update progress
    const progress = ((questionIndex + 1) / surveyState.totalQuestions) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    document.getElementById('progressText').textContent = `Question ${questionIndex + 1} of ${surveyState.totalQuestions}`;
    document.getElementById('currentQuestion').textContent = questionIndex + 1;
    
    // Display texts
    document.getElementById('leftText').textContent = trial.leftText;
    document.getElementById('rightText').textContent = trial.rightText;
    
    // Reset selections
    resetSelections();
    hideRatingSection();
    
    // Hide the next button until a selection is made
    document.getElementById('nextBtn').style.display = 'none';
}

/**
 * Handle text selection
 */
function selectText(side) {
    const trial = surveyState.trials[surveyState.currentQuestion];
    
    // Update selected text
    surveyState.selectedText = side;
    trial.selectedText = side;
    
    // Visual feedback
    document.getElementById('leftBox').classList.remove('selected');
    document.getElementById('rightBox').classList.remove('selected');
    document.getElementById('selectLeft').classList.remove('selected');
    document.getElementById('selectRight').classList.remove('selected');
    
    if (side === 'left') {
        document.getElementById('leftBox').classList.add('selected');
        document.getElementById('selectLeft').classList.add('selected');
    } else {
        document.getElementById('rightBox').classList.add('selected');
        document.getElementById('selectRight').classList.add('selected');
    }
    
    // Show rating section
    showRatingSection();
    
    // Reset confidence selection
    resetConfidenceSelection();
}

/**
 * Handle confidence rating selection
 */
function selectConfidence(value) {
    surveyState.selectedConfidence = parseInt(value);
    const trial = surveyState.trials[surveyState.currentQuestion];
    trial.confidence = parseInt(value);
    
    // Visual feedback
    document.querySelectorAll('.scale-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`.scale-btn[data-value="${value}"]`).classList.add('selected');
    
    // Enable next button
    enableNextButton();
}

/**
 * Enable the next button if conditions are met
 */
function enableNextButton() {
    const trial = surveyState.trials[surveyState.currentQuestion];
    if (trial.selectedText && trial.confidence) {
        document.getElementById('nextBtn').disabled = false;
        document.getElementById('nextBtn').style.display = 'block';
    }
}

/**
 * Show the rating section
 */
function showRatingSection() {
    document.getElementById('ratingSection').classList.remove('hidden');
}

/**
 * Hide the rating section
 */
function hideRatingSection() {
    document.getElementById('ratingSection').classList.add('hidden');
}

/**
 * Reset all selections
 */
function resetSelections() {
    surveyState.selectedText = null;
    surveyState.selectedConfidence = null;
    document.getElementById('leftBox').classList.remove('selected');
    document.getElementById('rightBox').classList.remove('selected');
    document.getElementById('selectLeft').classList.remove('selected');
    document.getElementById('selectRight').classList.remove('selected');
}

/**
 * Reset confidence selection
 */
function resetConfidenceSelection() {
    surveyState.selectedConfidence = null;
    document.querySelectorAll('.scale-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.getElementById('nextBtn').disabled = true;
}

/**
 * Move to next question
 */
function nextQuestion() {
    const trial = surveyState.trials[surveyState.currentQuestion];
    const rationale = document.getElementById('rationale').value.trim();
    trial.rationale = rationale;
    
    // Move to next question
    displayQuestion(surveyState.currentQuestion + 1);
    
    // Clear rationale field
    document.getElementById('rationale').value = '';
}

/**
 * Complete survey and save responses
 */
function completeSurvey() {
    // Save responses to server
    saveResponses();
    
    // Show completion screen
    showScreen('completionScreen');
}

/**
 * Save responses to server
 */
function saveResponses() {
    const data = {
        participant: surveyState.participant,
        trials: surveyState.trials
    };
    
    // Try to send to server
    fetch('/save-responses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        timeout: 5000
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save responses');
        }
        return response.json();
    })
    .then(result => {
        console.log('Responses saved successfully:', result);
        // Also save to localStorage as backup
        saveToLocalStorage(data);
    })
    .catch(error => {
        console.error('Error saving responses to server:', error);
        // Fallback: save to localStorage
        console.log('Saving to localStorage as fallback...');
        saveToLocalStorage(data);
    });
}

/**
 * Save responses to browser localStorage as backup
 */
function saveToLocalStorage(data) {
    try {
        const existingResponses = JSON.parse(localStorage.getItem('surveyResponses')) || [];
        existingResponses.push(data);
        localStorage.setItem('surveyResponses', JSON.stringify(existingResponses));
        console.log('Responses backed up to localStorage');
        
        // Also log to console for manual copy if needed
        console.log('Response data (can be copied for manual backup):', data);
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

/**
 * Restart survey
 */
function restartSurvey() {
    // Reset state
    surveyState.currentQuestion = 0;
    surveyState.responses = [];
    surveyState.trials = [];
    surveyState.selectedText = null;
    surveyState.selectedConfidence = null;
    
    // Reset form
    document.getElementById('participantName').value = '';
    document.getElementById('englishAbility').checked = false;
    document.getElementById('consentCheckbox').checked = false;
    document.getElementById('rationale').value = '';
    
    // Show consent screen
    showScreen('consentScreen');
}

/**
 * Show a specific screen
 */
function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected screen
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
    }
}

/**
 * Show error screen
 */
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    showScreen('errorScreen');
}

/**
 * Generate a unique session ID
 */
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
}
